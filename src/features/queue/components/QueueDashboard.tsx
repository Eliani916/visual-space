"use client";

import { useEffect, useState } from "react";
import { getActiveQueue, updateQueueStatus } from "../actions/queue.actions";
import { getPusherClient } from "@/lib/pusher";
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

export default function QueueDashboard() {
  const [queues, setQueues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueues = async () => {
    const res = await getActiveQueue();
    if (res.success) {
      setQueues(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQueues();

    const pusher = getPusherClient();
    const channel = pusher.subscribe("photographer-dashboard");

    channel.bind("queue-updated", (data: any) => {
      // Re-fetch everything to ensure consistency
      fetchQueues();
      toast.info("Update Antrean: " + (data.customerName || "Perubahan status"));
    });

    return () => {
      pusher.unsubscribe("photographer-dashboard");
    };
  }, []);

  const handleStatusChange = async (queueId: string, status: "WAITING" | "IN_PROGRESS" | "FINISHED") => {
    const res = await updateQueueStatus(queueId, status);
    if (res.success) {
      toast.success(`Status berhasil diubah menjadi ${status}`);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Antrean Realtime</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => window.location.href = '/fotografer/history'}>Riwayat Sesi</Button>
          <Button variant="default" onClick={fetchQueues}>Refresh</Button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu Check-In</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi Fotografer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Loading antrean...</TableCell>
              </TableRow>
            ) : queues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">Tidak ada antrean saat ini.</TableCell>
              </TableRow>
            ) : (
              queues.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>{new Date(q.checkInTime).toLocaleTimeString('id-ID')}</TableCell>
                  <TableCell className="font-medium">{q.booking.user.name}</TableCell>
                  <TableCell>{q.booking.package.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      q.status === 'WAITING' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {q.status === 'WAITING' ? "MENUNGGU" : "SEDANG FOTO"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {q.status === 'WAITING' && (
                      <Button size="sm" onClick={() => handleStatusChange(q.id, "IN_PROGRESS")}>Mulai Sesi</Button>
                    )}
                    {q.status === 'IN_PROGRESS' && (
                      <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(q.id, "FINISHED")}>Selesai Foto</Button>
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
