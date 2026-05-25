import UploadGallery from "@/features/gallery/components/UploadGallery";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function FotograferGalleryPage({ params }: { params: { bookingId: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "FOTOGRAFER") {
    redirect("/login");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: { user: true, package: true }
  });

  if (!booking) {
    return <div>Booking tidak ditemukan</div>;
  }

  return (
    <div className="container mx-auto p-8 bg-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Manajemen Galeri</h2>
      <div className="mb-6 bg-blue-50 p-4 rounded border">
        <p><strong>Pelanggan:</strong> {booking.user.name}</p>
        <p><strong>Paket:</strong> {booking.package.name}</p>
        <p><strong>Status:</strong> {booking.status}</p>
      </div>

      <UploadGallery bookingId={params.bookingId} />
    </div>
  );
}
