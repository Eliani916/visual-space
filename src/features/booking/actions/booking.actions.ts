"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { bookingSchema, BookingInput } from "@/validations/booking.schema";
import { createTransaction } from "@/services/midtrans.service";
import { getSettings } from "./settings.actions";

export async function createBooking(data: BookingInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error("Anda harus login untuk melakukan booking");
    }

    const validatedData = bookingSchema.parse(data);

    // Get settings
    const settingsRes = await getSettings();
    if (!settingsRes.success || !settingsRes.data) {
      throw new Error("Gagal memuat pengaturan sistem");
    }
    const settings = settingsRes.data;

    // Validate opening hours
    if (validatedData.bookingTime < settings.openingHour || validatedData.bookingTime > settings.closingHour) {
      throw new Error(`Jam booking harus antara ${settings.openingHour} - ${settings.closingHour}`);
    }

    // Validate Date and calculation
    const bookingDateObj = new Date(`${validatedData.bookingDate}T${validatedData.bookingTime}:00`);
    const now = new Date();
    const diffTime = bookingDateObj.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      throw new Error("Tanggal booking tidak valid (harus di masa depan)");
    }

    // Get all users with role FOTOGRAFER
    const photographers = await prisma.user.findMany({
      where: {
        role: {
          name: "FOTOGRAFER"
        }
      }
    });

    if (photographers.length === 0) {
      throw new Error("Tidak ada fotografer terdaftar di sistem.");
    }

    // Run the booking check, insert, and Midtrans transaction creation in a single database transaction.
    // If Midtrans API call fails, the database inserts are rolled back.
    // Serializable isolation level ensures that concurrent bookings for the same slot serialize, preventing race conditions.
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get bookings on this slot to find busy photographers
      const busyBookings = await tx.booking.findMany({
        where: {
          bookingDate: new Date(validatedData.bookingDate),
          bookingTime: validatedData.bookingTime,
          status: {
            notIn: ["EXPIRED", "CANCELLED"]
          },
          photographerId: {
            not: null
          }
        },
        select: {
          photographerId: true
        }
      });

      const busyPhotographerIds = busyBookings.map(b => b.photographerId);

      // Find a photographer who is free
      const freePhotographer = photographers.find(p => !busyPhotographerIds.includes(p.id));

      if (!freePhotographer) {
        throw new Error("Jadwal ini sudah penuh untuk semua fotografer. Silakan pilih waktu lain.");
      }

      // Check payment method constraints
      if (diffDays >= settings.dpMinDaysAhead && validatedData.paymentMethod === "CASH") {
        throw new Error(`Booking H-${settings.dpMinDaysAhead} atau lebih wajib menggunakan transfer (DP)`);
      }

      // Get package price
      const pkg = await tx.package.findUnique({ where: { id: validatedData.packageId } });
      if (!pkg) throw new Error("Paket tidak ditemukan");

      const packagePrice = Number(pkg.price);

      // Validate promo code from database
      let discountAmount = 0;
      const code = validatedData.promoCode ? validatedData.promoCode.trim().toUpperCase() : "";
      if (code !== "") {
        const dbPromo = await tx.promo.findFirst({
          where: {
            code,
            deletedAt: null,
          },
        });

        if (!dbPromo) {
          throw new Error("Kode promo tidak valid");
        }

        if (!dbPromo.isActive) {
          throw new Error("Kode promo sudah tidak aktif");
        }

        // 1. Validate package suitability
        if (dbPromo.applicablePackageIds) {
          const allowedIds = dbPromo.applicablePackageIds
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean);
          
          if (allowedIds.length > 0 && !allowedIds.includes(validatedData.packageId)) {
            throw new Error("Kode promo tidak berlaku untuk paket ini");
          }
        }

        // 2. Validate usage quota (maxUses)
        if (dbPromo.maxUses !== null && dbPromo.maxUses !== undefined) {
          const usedCount = await tx.booking.count({
            where: {
              promoCode: dbPromo.code,
              status: {
                notIn: ["EXPIRED", "CANCELLED"],
              },
              deletedAt: null,
            },
          });

          if (usedCount >= dbPromo.maxUses) {
            throw new Error("Kuota penggunaan kode promo sudah habis");
          }
        }

        discountAmount = packagePrice * (dbPromo.discountPercent / 100);
      }

      const finalTotalPrice = packagePrice - discountAmount;

      const isDp = validatedData.paymentMethod === "TRANSFER" && validatedData.paymentType === "DP";
      const paymentAmount = isDp ? finalTotalPrice * 0.5 : finalTotalPrice;

      // Create Booking inside transaction
      const newBooking = await tx.booking.create({
        data: {
          userId: session.user.id,
          packageId: pkg.id,
          photographerId: freePhotographer.id,
          bookingDate: new Date(validatedData.bookingDate),
          bookingTime: validatedData.bookingTime,
          totalPrice: finalTotalPrice,
          promoCode: code !== "" ? code : null,
          discountAmount: discountAmount > 0 ? discountAmount : null,
          status: "PENDING",
          payment: {
            create: {
              method: validatedData.paymentMethod,
              amount: paymentAmount,
              status: "PENDING"
            }
          }
        },
        include: {
          payment: true
        }
      });

      // If TRANSFER, generate Midtrans Token
      let token = null;
      let redirectUrl = null;

      if (validatedData.paymentMethod === "TRANSFER" && newBooking.payment) {
        const customerDetails = {
          first_name: session.user.name,
          email: session.user.email,
        };
        
        const itemDetails = [{
          id: pkg.id,
          price: Number(newBooking.payment.amount),
          quantity: 1,
          name: isDp ? `DP (50%): ${pkg.name}` : `Lunas: ${pkg.name}`
        }];

        const midtransTx = await createTransaction(
          newBooking.payment.id, 
          Number(newBooking.payment.amount), 
          customerDetails, 
          itemDetails
        );

        token = midtransTx.token;
        redirectUrl = midtransTx.redirect_url;

        // Save token in proofUrl for later retrieval
        await tx.payment.update({
          where: { id: newBooking.payment.id },
          data: { proofUrl: token }
        });
      }

      return {
        bookingId: newBooking.id,
        token,
        redirectUrl
      };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 15000 // 15 seconds to allow for Midtrans API call
    });

    return { 
      success: true, 
      data: result
    };
  } catch (error: any) {
    console.error("Create Booking Error:", error.message);
    return { success: false, message: error.message || "Gagal membuat booking" };
  }
}

export async function getAvailableTimes(dateStr: string) {
  try {
    const settingsRes = await getSettings();
    if (!settingsRes.success || !settingsRes.data) throw new Error("Gagal load settings");
    const settings = settingsRes.data;
    
    // Generate all hourly slots from openingHour to closingHour
    const startHour = parseInt(settings.openingHour.split(":")[0]);
    const endHour = parseInt(settings.closingHour.split(":")[0]);
    const allSlots = [];
    
    for (let h = startHour; h < endHour; h++) {
      allSlots.push(`${h.toString().padStart(2, "0")}:00`);
    }

    // Get all photographers count
    const photographerCount = await prisma.user.count({
      where: { role: { name: "FOTOGRAFER" } }
    });

    // Get bookings count per time slot for this date
    const bookings = await prisma.booking.findMany({
      where: {
        bookingDate: new Date(dateStr),
        status: { notIn: ["EXPIRED", "CANCELLED"] },
        photographerId: { not: null }
      },
      select: { bookingTime: true },
    });

    // Count bookings per slot
    const slotCounts: Record<string, number> = {};
    bookings.forEach(b => {
      const time = b.bookingTime.substring(0, 5);
      slotCounts[time] = (slotCounts[time] || 0) + 1;
    });

    // A slot is available if its active booking count is less than the total photographer count
    const availableSlots = allSlots.filter(slot => {
      const count = slotCounts[slot] || 0;
      return count < photographerCount;
    });
    return { success: true, data: availableSlots };
  } catch (error) {
    console.error("Get Available Times Error:", error);
    return { success: false, data: [] };
  }
}
