"use client";

import { useEffect, useState } from "react";
import { getGallery, togglePrintSelection } from "../actions/gallery.actions";
import { toast } from "sonner";

export default function CustomerGallery({ bookingId }: { bookingId: string }) {
  const [galleryData, setGalleryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchGallery = async () => {
    setLoading(true);
    const res = await getGallery(bookingId);
    if (res.success) {
      setGalleryData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGallery();
  }, [bookingId]);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const res = await togglePrintSelection(id, !currentStatus);
    if (res.success) {
      fetchGallery();
    } else {
      toast.error(res.message);
    }
  };

  if (loading) return <div className="p-4 text-center">Memuat galeri...</div>;
  if (!galleryData) return <div className="p-4 text-center">Gagal memuat galeri.</div>;

  const { galleries, isFullyPaid, printLimit } = galleryData;
  const selectedCount = galleries.filter((g: any) => g.isSelected).length;

  return (
    <div className="space-y-6 mt-6">
      <div className="bg-blue-50 p-4 rounded border border-blue-200 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-blue-900">Galeri Foto Anda</h3>
          {!isFullyPaid && (
            <p className="text-sm text-red-600 font-semibold">
              Anda belum melunasi pembayaran. Foto ditampilkan dengan watermark dan tidak dapat diunduh tanpa watermark.
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Jatah Cetak Fisik:</p>
          <p className="text-xl font-bold">
            <span className={selectedCount >= printLimit ? "text-green-600" : "text-blue-600"}>{selectedCount}</span> 
            / {printLimit}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {galleries.length === 0 ? (
          <p className="col-span-4 text-center py-8 text-gray-500">Belum ada foto yang diunggah oleh fotografer.</p>
        ) : (
          galleries.map((img: any) => (
            <div key={img.id} className={`relative border rounded overflow-hidden group ${img.isSelected ? 'ring-4 ring-green-500' : ''}`}>
              <img src={img.url} alt="Gallery" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleToggle(img.id, img.isSelected)}
                  className={`px-4 py-2 rounded font-bold text-sm ${img.isSelected ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                >
                  {img.isSelected ? "Batal Cetak" : "Pilih untuk Cetak"}
                </button>
              </div>
              {img.isSelected && (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
