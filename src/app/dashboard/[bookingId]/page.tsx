import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CustomerGallery from "@/features/gallery/components/CustomerGallery";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CustomerBookingDetailPage({ params }: { params: { bookingId: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "PELANGGAN") {
    redirect("/login");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: { package: true, payment: true },
  });

  if (!booking || booking.userId !== session.user.id) {
    return <div className="text-center p-8">Booking tidak ditemukan.</div>;
  }

  return (
    <div className="container mx-auto p-8 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Detail Booking</h2>
        <Link href="/dashboard">
          <Button variant="outline">Kembali ke Dashboard</Button>
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded shadow border">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Paket Foto</p>
            <p className="font-semibold text-lg">{booking.package.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Jadwal</p>
            <p className="font-semibold text-lg">{new Date(booking.bookingDate).toLocaleDateString('id-ID')} | {booking.bookingTime}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status Booking</p>
            <p className="font-semibold text-lg">{booking.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pembayaran</p>
            <p className="font-semibold text-lg">{booking.payment?.status || '-'}</p>
          </div>
        </div>
      </div>

      {booking.status === "COMPLETED" && (
        <CustomerGallery bookingId={booking.id} />
      )}
      
      {booking.status !== "COMPLETED" && (
        <div className="mt-6 text-center text-gray-500">
          Galeri foto akan tersedia setelah sesi foto selesai (Status: COMPLETED).
        </div>
      )}
    </div>
  );
}
