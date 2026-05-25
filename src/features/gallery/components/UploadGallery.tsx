"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function UploadGallery({ bookingId, onSuccess }: { bookingId: string, onSuccess?: () => void }) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

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

  return (
    <div className="space-y-4 p-4 border rounded bg-gray-50">
      <h3 className="font-semibold text-lg">Upload Hasil Foto (Bulk)</h3>
      <p className="text-sm text-gray-500">Pilih beberapa foto sekaligus. Sistem akan otomatis memasang watermark untuk pelanggan yang belum lunas.</p>
      
      <div className="flex items-center space-x-2">
        <Input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={(e) => setFiles(e.target.files)} 
          disabled={uploading}
        />
        <Button onClick={handleUpload} disabled={uploading || !files || files.length === 0}>
          {uploading ? "Mengunggah..." : "Upload Sekarang"}
        </Button>
      </div>
    </div>
  );
}
