"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { photographerSchema, PhotographerInput } from "@/validations/photographer.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { createPhotographer, updatePhotographer } from "../actions/photographer.actions";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  initialData?: any;
  onSuccess?: () => void;
};

export default function PhotographerForm({ initialData, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const form = useForm<PhotographerInput>({
    resolver: zodResolver(photographerSchema) as any,
    defaultValues: initialData
      ? {
          name: initialData.name || "",
          email: initialData.email || "",
          phoneNumber: initialData.phoneNumber || "",
          password: "",
        }
      : {
          name: "",
          email: "",
          phoneNumber: "",
          password: "",
        },
  });

  const onSubmit = async (data: PhotographerInput) => {
    // Validation check for new photographer password
    if (!initialData?.id && (!data.password || data.password.trim() === "")) {
      form.setError("password", {
        type: "manual",
        message: "Kata sandi wajib diisi untuk fotografer baru",
      });
      return;
    }

    if (!initialData?.id && data.password && data.password.length < 6) {
      form.setError("password", {
        type: "manual",
        message: "Kata sandi minimal 6 karakter",
      });
      return;
    }

    setLoading(true);
    let res;
    if (initialData?.id) {
      res = await updatePhotographer(initialData.id, data);
    } else {
      res = await createPhotographer(data);
    }

    if (res.success) {
      toast.success(initialData?.id ? "Akun fotografer berhasil diperbarui" : "Akun fotografer berhasil dibuat");
      if (onSuccess) onSuccess();
    } else {
      toast.error(res.message || "Gagal menyimpan akun");
    }
    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="Misal: Ahmad Fotografer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="ahmad@visualspace.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Telepon (Opsional)</FormLabel>
              <FormControl>
                <Input placeholder="08123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{initialData?.id ? "Kata Sandi Baru (Opsional)" : "Kata Sandi"}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              {initialData?.id && (
                <FormDescription>
                  Kosongkan jika Anda tidak ingin mengubah kata sandi fotografer ini.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} className="w-full mt-2 cursor-pointer">
          {loading ? "Menyimpan..." : initialData?.id ? "Perbarui Fotografer" : "Tambah Fotografer"}
        </Button>
      </form>
    </Form>
  );
}
