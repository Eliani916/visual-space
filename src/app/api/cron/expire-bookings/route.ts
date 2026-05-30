import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSettings } from "@/features/booking/actions/settings.actions";
import { pusherServer } from "@/lib/pusher";

export async function GET() {
  try {
    const settingsRes = await getSettings();
    if (!settingsRes.success || !settingsRes.data) {
      throw new Error("Gagal mengambil pengaturan");
    }
    const settings = settingsRes.data;

    const dpDeadlineHours = settings.dpDeadlineHours;
    const now = new Date();
    
    // Calculate the cut-off time (e.g. 24 hours ago)
    const cutOffTime = new Date(now.getTime() - (dpDeadlineHours * 60 * 60 * 1000));

    // 1. Find all pending TRANSFER bookings created before the cutOffTime (e.g., 24 hours ago)
    const expiredTransferBookings = await prisma.booking.findMany({
      where: {
        status: "PENDING",
        payment: {
          method: "TRANSFER"
        },
        createdAt: {
          lt: cutOffTime,
        },
      },
    });

    // 2. Find all pending CASH bookings where the bookingDate is within dpMinDaysAhead days (e.g., H-7)
    // and was created at least dpDeadlineHours hours ago (cutOffTime) to allow a 24-hour payment/grace window.
    const cashCutOffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + settings.dpMinDaysAhead);
    
    const expiredCashBookings = await prisma.booking.findMany({
      where: {
        status: "PENDING",
        payment: {
          method: "CASH"
        },
        bookingDate: {
          lte: cashCutOffDate
        },
        createdAt: {
          lt: cutOffTime
        }
      }
    });

    const allExpired = [...expiredTransferBookings, ...expiredCashBookings];

    if (allExpired.length > 0) {
      const expiredIds = allExpired.map((b) => b.id);

      await prisma.$transaction([
        prisma.booking.updateMany({
          where: { id: { in: expiredIds } },
          data: { status: "EXPIRED" },
        }),
        prisma.payment.updateMany({
          where: { bookingId: { in: expiredIds } },
          data: { status: "GAGAL" },
        }),
      ]);

      // Trigger Pusher event
      try {
        await pusherServer.trigger("calendar-channel", "calendar-updated", {
          message: "Jadwal booking kedaluwarsa"
        });
      } catch (err) {
        console.error("Failed to trigger Pusher inside Cron:", err);
      }
    }

    return NextResponse.json({ success: true, message: `Expired ${allExpired.length} bookings.` });
  } catch (error: any) {
    console.error("Cron Expire Booking Error:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
