"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { sendGDriveLink } from "@/features/booking/actions/review.actions";

export default function UploadGallery({ 
  bookingId, 
  initialGDriveLink = "", 
  onSuccess 
}: { 
  bookingId: string; 
  initialGDriveLink?: string; 
  onSuccess?: () => void; 
}) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [gdriveLink, setGdriveLink] = useState(initialGDriveLink);
  const [sendingGDrive, setSendingGDrive] = useState(false);

  const handleUpload = async () => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("bookingId", bookingId);
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/gallery/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Berhasil mengunggah ${data.data.length} foto`);
        setFiles(null);
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || "Gagal mengunggah foto");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    }
    setUploading(false);
  };

  const handleSendGDrive = async () => {
    if (!gdriveLink.trim()) {
      toast.error("Tulis link Google Drive terlebih dahulu");
      return;
    }
    setSendingGDrive(true);
    const res = await sendGDriveLink(bookingId, gdriveLink);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
    setSendingGDrive(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 border rounded bg-gray-50 dark:bg-zinc-900/50 dark:border-zinc-800">
        <h3 className="font-semibold text-lg">Upload Hasil Foto (Bulk)</h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400">Pilih beberapa foto sekaligus. Sistem akan otomatis memasang watermark untuk pelanggan yang belum lunas.</p>
        
        <div className="flex items-center space-x-2">
          <Input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={(e) => setFiles(e.target.files)} 
            disabled={uploading}
          />
          <Button onClick={handleUpload} disabled={uploading || !files || files.length === 0} className="cursor-pointer">
            {uploading ? "Mengunggahkan..." : "Upload Sekarang"}
          </Button>
        </div>
      </div>

      {/* GDRIVE LINK SECTION */}
      <div className="p-4 border rounded bg-gray-50 dark:bg-zinc-900/50 dark:border-zinc-800 space-y-4">
        <h3 className="font-semibold text-lg">Kirim Link Google Drive Dedicated</h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Masukkan tautan folder Google Drive hasil foto. Pelanggan wajib mengisi ulasan/komentar sebelum link ini aktif di halaman mereka.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input 
            type="text" 
            placeholder="https://drive.google.com/drive/folders/..." 
            value={gdriveLink}
            onChange={(e) => setGdriveLink(e.target.value)}
            disabled={sendingGDrive}
          />
          <Button onClick={handleSendGDrive} disabled={sendingGDrive || !gdriveLink.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer whitespace-nowrap">
            {sendingGDrive ? "Mengirim..." : "Kirim Link GDrive"}
          </Button>
        </div>
      </div>
    </div>
  );
}
