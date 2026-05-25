import { z } from "zod";

export const packageSchema = z.object({
  name: z.string().min(3, "Nama paket minimal 3 karakter").max(100, "Nama paket maksimal 100 karakter"),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  printCount: z.number().int().min(0, "Jumlah cetak tidak boleh negatif"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter").max(1000, "Deskripsi terlalu panjang"),
  isActive: z.boolean().default(true),
});

export type PackageInput = z.infer<typeof packageSchema>;
