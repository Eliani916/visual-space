import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "PELANGGAN") {
    redirect("/login");
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { package: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto p-8 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Dashboard Saya</h2>
      
      <div className="grid gap-4">
        {bookings.length === 0 ? (
          <p className="text-gray-500 bg-white p-6 rounded shadow text-center">Anda belum memiliki riwayat booking.</p>
        ) : (
          bookings.map(b => (
            <Link key={b.id} href={`/dashboard/${b.id}`}>
              <div className="bg-white p-6 rounded shadow border hover:border-blue-500 transition cursor-pointer flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{b.package.name}</h3>
                  <p className="text-sm text-gray-500">{new Date(b.bookingDate).toLocaleDateString('id-ID')} jam {b.bookingTime}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{b.status}</p>
                  <p className="text-xs text-gray-400">Total: Rp {Number(b.totalPrice).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
