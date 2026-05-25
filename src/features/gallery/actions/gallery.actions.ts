"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getGallery(bookingId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        package: true,
        payment: true,
        galleries: true,
      }
    });

    if (!booking) throw new Error("Booking tidak ditemukan");

    // Only allow Admin, Fotografer, or the owner of the booking
    if (session.user.role === "PELANGGAN" && booking.userId !== session.user.id) {
      throw new Error("Forbidden");
    }

    const isFullyPaid = booking.payment?.status === "LUNAS";

    // Format galleries based on payment status
    const formattedGalleries = booking.galleries.map(g => ({
      id: g.id,
      url: isFullyPaid || session.user.role !== "PELANGGAN" ? g.originalUrl : g.watermarkedUrl,
      isSelected: g.isSelected,
    }));

    return { 
      success: true, 
      data: {
        bookingId: booking.id,
        isFullyPaid,
        printLimit: booking.package.printCount,
        galleries: formattedGalleries
      } 
    };
  } catch (error: any) {
    console.error("Get Gallery Error:", error.message);
    return { success: false, message: error.message };
  }
}

export async function togglePrintSelection(galleryId: string, isSelected: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
      include: { booking: { include: { package: true } } }
    });

    if (!gallery) throw new Error("Foto tidak ditemukan");

    if (session.user.role === "PELANGGAN" && gallery.booking.userId !== session.user.id) {
      throw new Error("Forbidden");
    }

    // Check limit if trying to select
    if (isSelected) {
      const selectedCount = await prisma.gallery.count({
        where: { bookingId: gallery.bookingId, isSelected: true }
      });

      if (selectedCount >= gallery.booking.package.printCount) {
        throw new Error(`Limit cetak paket Anda adalah ${gallery.booking.package.printCount} foto`);
      }
    }

    const updated = await prisma.gallery.update({
      where: { id: galleryId },
      data: { isSelected }
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Toggle Print Selection Error:", error.message);
    return { success: false, message: error.message };
  }
}
