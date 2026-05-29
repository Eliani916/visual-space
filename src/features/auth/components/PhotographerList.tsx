"use client";

import { useEffect, useState } from "react";
import { getPhotographers, deletePhotographer } from "../actions/photographer.actions";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PhotographerForm from "./PhotographerForm";
import { Plus, Edit2, Trash2, RefreshCw } from "lucide-react";

export default function PhotographerList() {
  const [photographers, setPhotographers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<any>(null);

  const fetchPhotographers = async () => {
    setLoading(true);
    const res = await getPhotographers();
    if (res.success) {
      setPhotographers(res.data || []);
    } else {
      toast.error(res.message || "Gagal memuat daftar fotografer");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPhotographers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun fotografer "${name}"?`)) return;
    
    const res = await deletePhotographer(id);
    if (res.success) {
      toast.success(res.message || "Akun fotografer berhasil dihapus");
      fetchPhotographers();
    } else {
      toast.error(res.message || "Gagal menghapus akun fotografer");
    }
  };

  const handleEdit = (photo: any) => {
    setEditingPhoto(photo);
    setOpen(true);
  };

  const handleAdd = () => {
    setEditingPhoto(null);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* List Action Header */}
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Kelola Fotografer</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Total: {photographers.length} akun fotografer</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchPhotographers} className="h-9 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={
              <Button onClick={handleAdd} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-9 cursor-pointer">
                <Plus className="w-4 h-4 mr-1" />
                Tambah Fotografer
              </Button>
            } />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingPhoto ? "Edit Fotografer" : "Tambah Fotografer Baru"}</DialogTitle>
              </DialogHeader>
              <PhotographerForm
                initialData={editingPhoto}
                onSuccess={() => {
                  setOpen(false);
                  fetchPhotographers();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-slate-200/85 dark:border-zinc-800/85 rounded-xl bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/75 dark:bg-zinc-950/20">
            <TableRow>
              <TableHead className="font-semibold text-slate-700 dark:text-zinc-300">Nama Fotografer</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-zinc-300">Email</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-zinc-300">Nomor Telepon</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-zinc-300 text-right pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500 dark:text-zinc-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                    <span className="text-sm">Memuat data fotografer...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : photographers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500 dark:text-zinc-500">
                  Belum ada fotografer terdaftar. Klik "Tambah Fotografer" untuk membuat akun baru.
                </TableCell>
              </TableRow>
            ) : (
              photographers.map((photo) => (
                <TableRow key={photo.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                  <TableCell className="font-medium text-slate-800 dark:text-zinc-150 py-4.5">
                    {photo.name}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-zinc-400">
                    {photo.email}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-zinc-400">
                    {photo.phoneNumber || "-"}
                  </TableCell>
                  <TableCell className="text-right space-x-1.5 pr-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(photo)}
                      className="h-8 w-8 p-0 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                      title="Edit Fotografer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(photo.id, photo.name)}
                      className="h-8 w-8 p-0 border-red-200 dark:border-red-950/40 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 dark:hover:bg-red-650 dark:hover:border-red-650 cursor-pointer"
                      title="Hapus Fotografer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
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
