"use client";

import { useEffect, useState } from "react";
import { getAdminBookings } from "../actions/admin-booking.actions";
import { checkInCustomer } from "@/features/queue/actions/queue.actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminBookingList() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    const res = await getAdminBookings();
    if (res.success) {
      setBookings(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCheckIn = async (bookingId: string) => {
    if (!confirm("Check-in pelanggan ini ke antrean?")) return;
    const res = await checkInCustomer(bookingId);
    if (res.success) {
      toast.success(res.message);
      fetchBookings();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Daftar Booking</h2>
        <Button onClick={fetchBookings} variant="outline">Refresh Data</Button>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tgl / Jam</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Status Booking</TableHead>
              <TableHead>Pembayaran</TableHead>
              <TableHead className="text-right">Aksi (Antrean)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Belum ada booking.</TableCell>
              </TableRow>
            ) : (
              bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    {new Date(b.bookingDate).toLocaleDateString('id-ID')} <br/>
                    <span className="font-semibold">{b.bookingTime}</span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {b.user.name} <br/>
                    <span className="text-xs text-gray-500">{b.user.email}</span>
                  </TableCell>
                  <TableCell>{b.package.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      b.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      b.status === 'ON_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      b.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {b.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {b.payment ? (
                      <div>
                        {b.payment.method} - <span className={`font-bold ${b.payment.status === 'LUNAS' ? 'text-green-600' : 'text-orange-500'}`}>{b.payment.status}</span>
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {b.status === 'CONFIRMED' && !b.queue ? (
                      <Button size="sm" onClick={() => handleCheckIn(b.id)}>Check-In</Button>
                    ) : b.queue ? (
                      <span className="text-sm font-semibold text-blue-600 border px-2 py-1 rounded">Dalam Antrean ({b.queue.status})</span>
                    ) : (
                      <span className="text-xs text-gray-400">Tidak tersedia</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
