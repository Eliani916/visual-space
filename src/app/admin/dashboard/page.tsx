import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Admin Analytics | Photobooth",
};

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // 1. Total Revenue (LUNAS / DP)
  const payments = await prisma.payment.findMany({
    where: { status: { in: ["LUNAS", "DP"] } },
    select: { amount: true }
  });
  
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  // 2. Booking Stats
  const totalBookings = await prisma.booking.count();
  const completedBookings = await prisma.booking.count({ where: { status: "COMPLETED" } });
  const pendingBookings = await prisma.booking.count({ where: { status: "PENDING" } });

  // 3. Recent Bookings
  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true, package: true }
  });

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Dashboard Analitik</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-semibold mb-1">Total Pendapatan</p>
          <h3 className="text-2xl font-bold text-gray-800">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-semibold mb-1">Total Booking</p>
          <h3 className="text-2xl font-bold text-gray-800">{totalBookings} Sesi</h3>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <p className="text-sm text-gray-500 font-semibold mb-1">Sesi Selesai</p>
          <h3 className="text-2xl font-bold text-gray-800">{completedBookings} Sesi</h3>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 font-semibold mb-1">Menunggu Pembayaran</p>
          <h3 className="text-2xl font-bold text-gray-800">{pendingBookings} Booking</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-xl font-bold mb-4">Booking Terbaru</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2">Pelanggan</th>
              <th className="py-2">Paket</th>
              <th className="py-2">Tanggal</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.map(b => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3">{b.user.name}</td>
                <td className="py-3">{b.package.name}</td>
                <td className="py-3">{new Date(b.bookingDate).toLocaleDateString('id-ID')} {b.bookingTime}</td>
                <td className="py-3 text-sm font-semibold text-blue-600">{b.status}</td>
              </tr>
            ))}
            {recentBookings.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">Belum ada data booking.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
