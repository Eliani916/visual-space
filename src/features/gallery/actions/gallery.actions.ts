"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getGallery(bookingId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        package: true,
        payment: true,
        gallery: {
          include: {
            images: {
              include: {
                printSelection: true
              }
            }
          }
        },
      }
    });

    if (!booking) throw new Error("Booking tidak ditemukan");

    // Only allow Admin, Fotografer, or the owner of the booking
    if (session.user.role === "PELANGGAN" && booking.userId !== session.user.id) {
      throw new Error("Forbidden");
    }

    const isFullyPaid = booking.payment?.status === "LUNAS";

    const images = booking.gallery?.images || [];

    // Format galleries based on payment status
    const formattedGalleries = images.map(img => {
      const originalUrl = `/uploads/${bookingId}/original/${img.fileName}`;
      const watermarkedUrl = `/uploads/${bookingId}/watermarked/${img.fileName}`;
      return {
        id: img.id,
        url: isFullyPaid || session.user.role !== "PELANGGAN" ? originalUrl : watermarkedUrl,
        isSelected: img.printSelection?.isPrinted || false,
      };
    });

    return { 
      success: true, 
      data: {
        bookingId: booking.id,
        isFullyPaid,
        printLimit: booking.package.printCount,
        galleries: formattedGalleries,
        gdriveLink: booking.gdriveLink,
        reviewRating: booking.reviewRating,
        reviewComment: booking.reviewComment,
      } 
    };
  } catch (error: any) {
    console.error("Get Gallery Error:", error.message);
    return { success: false, message: error.message };
  }
}

export async function togglePrintSelection(galleryImageId: string, isSelected: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const galleryImage = await prisma.galleryImage.findUnique({
      where: { id: galleryImageId },
      include: {
        gallery: {
          include: {
            booking: {
              include: {
                package: true
              }
            }
          }
        },
        printSelection: true
      }
    });

    if (!galleryImage) throw new Error("Foto tidak ditemukan");

    if (session.user.role === "PELANGGAN" && galleryImage.gallery.booking.userId !== session.user.id) {
      throw new Error("Forbidden");
    }

    // Check limit if trying to select
    if (isSelected) {
      const selectedCount = await prisma.printSelection.count({
        where: {
          isPrinted: true,
          galleryImage: {
            gallery: {
              bookingId: galleryImage.gallery.bookingId
            }
          }
        }
      });

      if (selectedCount >= galleryImage.gallery.booking.package.printCount) {
        throw new Error(`Limit cetak paket Anda adalah ${galleryImage.gallery.booking.package.printCount} foto`);
      }
    }

    const updated = await prisma.printSelection.upsert({
      where: { galleryImageId: galleryImage.id },
      update: { isPrinted: isSelected },
      create: { galleryImageId: galleryImage.id, isPrinted: isSelected }
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Toggle Print Selection Error:", error.message);
    return { success: false, message: error.message };
  }
}
