import { z } from "zod";

export const photographerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Format email tidak valid"),
  phoneNumber: z.string().optional().or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
});

export type PhotographerInput = z.infer<typeof photographerSchema>;
