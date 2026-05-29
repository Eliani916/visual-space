import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CustomerLayoutClient from "./CustomerLayoutClient";

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "PELANGGAN") {
    redirect("/login");
  }

  return (
    <CustomerLayoutClient user={session.user}>
      {children}
    </CustomerLayoutClient>
  );
}
