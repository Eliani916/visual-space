import prisma from "@/lib/prisma";
import HomeClient from "./HomeClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Visual Space - Studio Photobooth Premium Mandiri",
  description: "Abadikan Momen Seru Dengan Frame Estetik Pilihan. Reservasi realtime, cetak & unduh cepat.",
};

export default async function Home() {
  // Fetch session
  const session = await getServerSession(authOptions);

  // 1. Fetch dynamic features
  const features = await prisma.landingFeature.findMany({
    orderBy: { order: "asc" },
  });

  // 2. Fetch dynamic steps
  const steps = await prisma.landingStep.findMany({
    orderBy: { stepNumber: "asc" },
  });

  // 3. Fetch dynamic FAQs
  const faqs = await prisma.landingFaq.findMany({
    orderBy: { order: "asc" },
  });

  // 4. Fetch dynamic packages (active and not deleted)
  const packages = await prisma.package.findMany({
    where: {
      isActive: true,
      deletedAt: null,
    },
    include: {
      images: true,
    },
    orderBy: { price: "asc" },
  });

  // 5. Fetch dynamic reviews (completed bookings with rating & comment)
  const reviews = await prisma.booking.findMany({
    where: {
      status: "COMPLETED",
      reviewRating: { not: null },
      reviewComment: { not: null },
      deletedAt: null,
    },
    include: {
      user: {
        select: {
          name: true,
          images: {
            take: 1,
            select: {
              url: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  });

  // Map reviews to testimonials structure
  const testimonials = reviews.map((r) => ({
    name: r.user.name,
    role: "Pelanggan Terverifikasi",
    avatar: r.user.name ? r.user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "CS",
    avatarUrl: r.user.images?.[0]?.url || null,
    quote: r.reviewComment || "",
    stars: r.reviewRating || 5,
  }));

  return (
    <HomeClient
      features={features}
      steps={steps}
      faqs={faqs}
      packages={packages.map(p => ({
        ...p,
        price: p.price.toString() // Convert Decimal to string/number for client component serialization
      }))}
      testimonials={testimonials}
      session={session}
    />
  );
}
