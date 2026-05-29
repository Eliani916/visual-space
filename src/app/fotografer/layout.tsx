import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import FotograferLayoutClient from "./FotograferLayoutClient";

export default async function FotograferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // If not authenticated or not a photographer, redirect to login
  if (!session || session.user.role !== "FOTOGRAFER") {
    redirect("/login");
  }

  return (
    <FotograferLayoutClient user={session.user}>
      {children}
    </FotograferLayoutClient>
  );
}
