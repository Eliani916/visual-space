import PromoList from "@/features/booking/components/PromoList";

export const metadata = {
  title: "Manajemen Promo | Photobooth Admin",
};

export default function AdminPromosPage() {
  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <PromoList />
    </div>
  );
}
