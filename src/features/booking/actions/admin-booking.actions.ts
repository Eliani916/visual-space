"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getAdminBookings() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        package: true,
        payment: true,
        queue: true,
      },
      orderBy: [
        { bookingDate: 'desc' },
        { bookingTime: 'asc' }
      ],
      take: 100, // For demo, we just take 100
    });

    return { success: true, data: JSON.parse(JSON.stringify(bookings)) };
  } catch (error) {
    console.error("Get Admin Bookings Error:", error);
    return { success: false, data: [] };
  }
}
