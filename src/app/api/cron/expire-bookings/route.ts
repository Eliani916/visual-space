import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSettings } from "@/features/booking/actions/settings.actions";

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

    // Find all pending bookings created before the cutOffTime
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: "PENDING",
        createdAt: {
          lt: cutOffTime,
        },
      },
    });

    if (expiredBookings.length > 0) {
      const expiredIds = expiredBookings.map((b) => b.id);

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
    }

    return NextResponse.json({ success: true, message: `Expired ${expiredBookings.length} bookings.` });
  } catch (error: any) {
    console.error("Cron Expire Booking Error:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
