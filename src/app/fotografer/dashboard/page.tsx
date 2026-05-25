import QueueDashboard from "@/features/queue/components/QueueDashboard";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard Fotografer | Visual Space",
};

export default async function FotograferDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "FOTOGRAFER") {
    redirect("/login");
  }

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <QueueDashboard />
    </div>
  );
}
