"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { packageSchema, PackageInput } from "@/validations/package.schema";
import { revalidatePath } from "next/cache";

// Helper for auth check
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function createPackage(data: PackageInput) {
  try {
    await checkAdminAuth();
    
    // Validate input
    const validatedData = packageSchema.parse(data);

    const newPackage = await prisma.package.create({
      data: {
        name: validatedData.name,
        price: validatedData.price,
        printCount: validatedData.printCount,
        description: validatedData.description,
        isActive: validatedData.isActive,
      },
    });

    revalidatePath("/admin/packages");
    return { success: true, data: newPackage };
  } catch (error: any) {
    console.error("Create Package Error:", error.message);
    return { success: false, message: error.message || "Gagal membuat paket" };
  }
}

export async function getPackages(includeInactive = false) {
  try {
    // Both ADMIN and PELANGGAN can read packages. But PELANGGAN only sees active ones.
    const where = includeInactive ? { deletedAt: null } : { isActive: true, deletedAt: null };
    const packages = await prisma.package.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: packages };
  } catch (error) {
    console.error("Get Packages Error", error);
    return { success: false, message: "Gagal mengambil daftar paket" };
  }
}

export async function updatePackage(id: string, data: PackageInput) {
  try {
    await checkAdminAuth();
    
    const validatedData = packageSchema.parse(data);

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        name: validatedData.name,
        price: validatedData.price,
        printCount: validatedData.printCount,
        description: validatedData.description,
        isActive: validatedData.isActive,
      },
    });

    revalidatePath("/admin/packages");
    return { success: true, data: updatedPackage };
  } catch (error: any) {
    console.error("Update Package Error", error.message);
    return { success: false, message: error.message || "Gagal mengupdate paket" };
  }
}

export async function deletePackage(id: string) {
  try {
    await checkAdminAuth();
    
    // Soft delete
    await prisma.package.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/admin/packages");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Package Error", error.message);
    return { success: false, message: "Gagal menghapus paket" };
  }
}
