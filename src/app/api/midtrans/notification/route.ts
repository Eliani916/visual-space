import { NextResponse } from "next/server";
import { coreApi } from "@/services/midtrans.service";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const notificationJson = await req.json();

    // Verify signature key
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const signatureKey = crypto.createHash('sha512').update(
      `${notificationJson.order_id}${notificationJson.status_code}${notificationJson.gross_amount}${serverKey}`
    ).digest('hex');

    if (signatureKey !== notificationJson.signature_key) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    const transactionStatus = notificationJson.transaction_status;
    const fraudStatus = notificationJson.fraud_status;
    const paymentId = notificationJson.order_id; // we used payment.id as order_id

    let newStatus = "PENDING";
    let bookingStatus = "PENDING";

    if (transactionStatus == 'capture'){
      if (fraudStatus == 'challenge'){
        // TODO: set transaction status on your databaase to 'challenge'
        newStatus = "PENDING";
      } else if (fraudStatus == 'accept'){
        newStatus = "DP"; // or LUNAS depending on amount, but we'll assume DP for now, or check amount
        bookingStatus = "CONFIRMED";
      }
    } else if (transactionStatus == 'settlement'){
      newStatus = "DP"; 
      bookingStatus = "CONFIRMED";
    } else if (transactionStatus == 'cancel' ||
      transactionStatus == 'deny' ||
      transactionStatus == 'expire'){
      newStatus = "GAGAL";
      bookingStatus = "EXPIRED";
    } else if (transactionStatus == 'pending'){
      newStatus = "PENDING";
    }

    // Check actual amount to determine DP vs LUNAS if needed.
    // For now we will update the payment status based on transactionStatus.
    
    // We get the payment to see if it's full or DP
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: { include: { package: true } } }
    });

    if (payment) {
      // Determine if it's LUNAS or DP based on amount vs total
      if (newStatus === "DP") {
        if (Number(payment.amount) >= Number(payment.booking.totalPrice)) {
          newStatus = "LUNAS";
        }
      }

      await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentId },
          data: { status: newStatus as any },
        }),
        prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: bookingStatus as any },
        }),
      ]);
    }

    return NextResponse.json({ success: true, message: "OK" });
  } catch (error: any) {
    console.error("Midtrans Notification Error:", error.message);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
