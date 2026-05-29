"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Hanya Admin yang dapat mengakses fitur ini.");
  }
}

export async function getPromos() {
  try {
    await requireAdmin();

    const promos = await prisma.promo.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Count active bookings for each promo code
    const activeBookings = await prisma.booking.groupBy({
      by: ["promoCode"],
      where: {
        promoCode: { not: null },
        status: { notIn: ["EXPIRED", "CANCELLED"] },
        deletedAt: null,
      },
      _count: {
        promoCode: true,
      },
    });

    const activeCounts = activeBookings.reduce((acc, curr) => {
      if (curr.promoCode) {
        acc[curr.promoCode.toUpperCase()] = curr._count.promoCode;
      }
      return acc;
    }, {} as Record<string, number>);

    const formattedPromos = promos.map((promo) => ({
      ...promo,
      usedCount: activeCounts[promo.code.toUpperCase()] || 0,
    }));

    return { success: true, data: formattedPromos };
  } catch (error: any) {
    console.error("Get Promos Error:", error.message);
    return { success: false, message: error.message || "Gagal memuat daftar promo" };
  }
}

export async function createPromo(data: {
  code: string;
  discountPercent: number;
  isActive?: boolean;
  maxUses?: number | null;
  applicablePackageIds?: string | null;
}) {
  try {
    await requireAdmin();

    const { code, discountPercent, isActive, maxUses, applicablePackageIds } = data;

    if (!code || code.trim() === "") {
      throw new Error("Kode promo wajib diisi.");
    }

    if (!discountPercent || discountPercent < 1 || discountPercent > 100) {
      throw new Error("Persentase diskon harus bernilai antara 1 sampai 100.");
    }

    const formattedCode = code.trim().toUpperCase();

    // Check if exists
    const existingPromo = await prisma.promo.findUnique({
      where: { code: formattedCode },
    });

    if (existingPromo) {
      if (existingPromo.deletedAt === null) {
        throw new Error("Kode promo sudah terdaftar.");
      } else {
        // Reactivate soft deleted promo
        const reactivated = await prisma.promo.update({
          where: { id: existingPromo.id },
          data: {
            discountPercent,
            maxUses: maxUses !== undefined ? maxUses : null,
            applicablePackageIds: applicablePackageIds !== undefined ? applicablePackageIds : null,
            isActive: isActive !== undefined ? isActive : true,
            deletedAt: null,
          },
        });
        revalidatePath("/admin/promos");
        return { success: true, data: reactivated };
      }
    }

    const promo = await prisma.promo.create({
      data: {
        code: formattedCode,
        discountPercent,
        maxUses: maxUses !== undefined ? maxUses : null,
        applicablePackageIds: applicablePackageIds !== undefined ? applicablePackageIds : null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    revalidatePath("/admin/promos");
    return { success: true, data: promo };
  } catch (error: any) {
    console.error("Create Promo Error:", error.message);
    return { success: false, message: error.message || "Gagal membuat promo baru" };
  }
}

export async function updatePromo(
  id: string,
  data: {
    code: string;
    discountPercent: number;
    isActive: boolean;
    maxUses?: number | null;
    applicablePackageIds?: string | null;
  }
) {
  try {
    await requireAdmin();

    const { code, discountPercent, isActive, maxUses, applicablePackageIds } = data;

    if (!code || code.trim() === "") {
      throw new Error("Kode promo wajib diisi.");
    }

    if (!discountPercent || discountPercent < 1 || discountPercent > 100) {
      throw new Error("Persentase diskon harus bernilai antara 1 sampai 100.");
    }

    const formattedCode = code.trim().toUpperCase();

    // Check code uniqueness
    const existingPromo = await prisma.promo.findFirst({
      where: {
        code: formattedCode,
        NOT: { id },
        deletedAt: null,
      },
    });

    if (existingPromo) {
      throw new Error("Kode promo sudah digunakan oleh promo lain.");
    }

    const updateData: any = {
      code: formattedCode,
      discountPercent,
      isActive,
    };
    if (maxUses !== undefined) updateData.maxUses = maxUses;
    if (applicablePackageIds !== undefined) updateData.applicablePackageIds = applicablePackageIds;

    const promo = await prisma.promo.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/promos");
    return { success: true, data: promo };
  } catch (error: any) {
    console.error("Update Promo Error:", error.message);
    return { success: false, message: error.message || "Gagal memperbarui promo" };
  }
}

export async function deletePromo(id: string) {
  try {
    await requireAdmin();

    // Soft delete promo
    await prisma.promo.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    revalidatePath("/admin/promos");
    return { success: true, message: "Kode promo berhasil dihapus." };
  } catch (error: any) {
    console.error("Delete Promo Error:", error.message);
    return { success: false, message: error.message || "Gagal menghapus promo" };
  }
}

export async function validatePromoCode(code: string, packageId: string) {
  try {
    if (!code || code.trim() === "") {
      return { success: false, message: "Kode promo kosong" };
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Silakan login terlebih dahulu untuk menggunakan promo" };
    }

    const formattedCode = code.trim().toUpperCase();

    const promo = await prisma.promo.findFirst({
      where: {
        code: formattedCode,
        deletedAt: null,
      },
    });

    if (!promo) {
      return { success: false, message: "Kode promo tidak valid" };
    }

    if (!promo.isActive) {
      return { success: false, message: "Kode promo sudah tidak aktif" };
    }

    // 1. Validate package suitability
    if (promo.applicablePackageIds) {
      const allowedIds = promo.applicablePackageIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      
      if (allowedIds.length > 0 && !allowedIds.includes(packageId)) {
        return { success: false, message: "Kode promo tidak berlaku untuk paket ini" };
      }
    }

    // 2. Validate usage quota (maxUses)
    if (promo.maxUses !== null && promo.maxUses !== undefined) {
      const usedCount = await prisma.booking.count({
        where: {
          promoCode: promo.code,
          status: {
            notIn: ["EXPIRED", "CANCELLED"],
          },
          deletedAt: null,
        },
      });

      if (usedCount >= promo.maxUses) {
        return { success: false, message: "Kuota penggunaan kode promo sudah habis" };
      }
    }

    return {
      success: true,
      message: `Diskon ${promo.discountPercent}% berhasil diterapkan!`,
      discountPercent: promo.discountPercent,
    };
  } catch (error: any) {
    console.error("Validate Promo Code Error:", error.message);
    return { success: false, message: "Gagal memvalidasi kode promo" };
  }
}
