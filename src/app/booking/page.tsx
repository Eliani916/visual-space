import BookingForm from "@/features/booking/components/BookingForm";
import { getSettings } from "@/features/booking/actions/settings.actions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Booking Paket Foto | Visual Space",
};

export default async function BookingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const settingsRes = await getSettings();
  const settings = settingsRes.success && settingsRes.data ? settingsRes.data : { dpMinDaysAhead: 7 };

  return (
    <div className="container mx-auto p-8 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Booking Studio</h1>
        <p className="text-gray-600 mt-2">Pilih paket, tentukan tanggal, dan selesaikan pembayaran untuk mengamankan jadwal Anda.</p>
      </div>
      <BookingForm settings={settings} />
    </div>
  );
}
