"use client";

import { useEffect, useState } from "react";
import { getGallery, togglePrintSelection } from "../actions/gallery.actions";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { submitBookingReview } from "@/features/booking/actions/review.actions";
import { Button } from "@/components/ui/button";

export default function CustomerGallery({ bookingId }: { bookingId: string }) {
  const [galleryData, setGalleryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

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

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Silakan pilih rating bintang");
      return;
    }
    if (!comment.trim()) {
      toast.error("Silakan masukkan komentar ulasan");
      return;
    }
    setSubmittingReview(true);
    const res = await submitBookingReview(bookingId, rating, comment);
    if (res.success) {
      toast.success(res.message);
      fetchGallery();
    } else {
      toast.error(res.message);
    }
    setSubmittingReview(false);
  };

  if (loading) return <div className="p-4 text-center">Memuat galeri...</div>;
  if (!galleryData) return <div className="p-4 text-center">Gagal memuat galeri.</div>;

  const { galleries, isFullyPaid, printLimit, gdriveLink, reviewRating, reviewComment } = galleryData;
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

      {/* GOOGLE DRIVE ACCESS GATE */}
      {gdriveLink && (
        <div className="p-6 border rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Akses Unduh Google Drive (Tanpa Watermark)</h3>
          </div>

          {reviewComment ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-900/30 space-y-3">
              <p className="text-sm text-emerald-800 dark:text-emerald-400 font-medium">
                Terima kasih atas ulasan Anda! Anda sekarang dapat mengakses dan mengunduh seluruh foto resolusi tinggi tanpa watermark di Google Drive.
              </p>
              <a href={gdriveLink} target="_blank" rel="noopener noreferrer" className="inline-block">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer">
                  Buka Folder Google Drive Sesi Foto
                </Button>
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
                <p className="text-sm text-amber-800 dark:text-amber-400 font-semibold">
                  Tautan Google Drive Sesi Foto Anda Telah Siap!
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-1 leading-relaxed">
                  Demi meningkatkan kualitas layanan kami, silakan berikan ulasan singkat (rating bintang & komentar) mengenai pengalaman Anda. Tautan Google Drive akan langsung terbuka otomatis setelah ulasan dikirimkan.
                </p>
              </div>

              {/* REVIEW FORM */}
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Rating Sesi Foto</label>
                  <div className="flex space-x-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating
                              ? "fill-amber-400 text-amber-400 filter drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]"
                              : "text-slate-300 dark:text-zinc-700"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Komentar Ulasan</label>
                  <textarea
                    rows={3}
                    placeholder="Tulis ulasan Anda tentang pelayanan fotografer dan studio kami..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800 dark:text-zinc-200 placeholder:text-slate-400"
                  />
                </div>

                <Button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || rating === 0 || !comment.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer w-full sm:w-auto"
                >
                  {submittingReview ? "Mengirim..." : "Kirim Ulasan & Buka Tautan"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

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
