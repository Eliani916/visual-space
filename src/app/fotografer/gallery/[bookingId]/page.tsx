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
    <div className="container mx-auto p-8">
      <div className="mb-6 bg-blue-50 dark:bg-indigo-950/40 p-4 rounded border border-blue-200 dark:border-indigo-900/40">
        <p><strong>Pelanggan:</strong> {booking.user.name}</p>
        <p><strong>Paket:</strong> {booking.package.name}</p>
        <p><strong>Status:</strong> {booking.status}</p>
      </div>

      <UploadGallery bookingId={params.bookingId} initialGDriveLink={booking.gdriveLink || ""} />
    </div>
  );
}
