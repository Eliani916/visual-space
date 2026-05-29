"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { packageSchema, PackageInput } from "@/validations/package.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createPackage, updatePackage } from "../actions/package.actions";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  initialData?: any;
  onSuccess?: () => void;
};

export default function PackageForm({ initialData, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  
  const form = useForm<PackageInput>({
    resolver: zodResolver(packageSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.price ? Number(initialData.price) : 0,
      printCount: initialData?.printCount ? Number(initialData.printCount) : 0,
      description: initialData?.description || "",
      features: initialData?.features || "",
      isPopular: initialData?.isPopular || false,
      ctaText: initialData?.ctaText || "Pilih Paket",
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    },
  });

  const onSubmit = async (data: PackageInput) => {
    setLoading(true);
    let res;
    if (initialData?.id) {
      res = await updatePackage(initialData.id, data);
    } else {
      res = await createPackage(data);
    }

    if (res.success) {
      toast.success("Berhasil menyimpan paket");
      if (onSuccess) onSuccess();
    } else {
      toast.error(res.message);
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
              <FormLabel>Nama Paket</FormLabel>
              <FormControl>
                <Input placeholder="Misal: Paket Prewedding" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga (Rp)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="500000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="printCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah Cetak</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi Singkat</FormLabel>
              <FormControl>
                <Textarea placeholder="Detail singkat mengenai paket..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Daftar Fitur Paket</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="15 Menit Sesi Foto Mandiri&#10;Pilihan 1 Frame Desain Eksklusif&#10;2 Lembar Cetak Fisik Berwarna" 
                  value={field.value || ""} 
                  onChange={field.onChange}
                  className="min-h-[100px]"
                />
              </FormControl>
              <p className="text-xxs text-slate-500">Tuliskan setiap fitur pada baris baru (tekan Enter untuk memisahkan).</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ctaText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teks Tombol CTA</FormLabel>
                <FormControl>
                  <Input placeholder="Pilih Paket Basic" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col justify-center space-y-2 pt-5">
            <FormField
              control={form.control}
              name="isPopular"
              render={({ field }) => (
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={e => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Tandai Sebagai Paling Laku (Popular)</span>
                </label>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={e => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Aktifkan Paket</span>
                </label>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
          {loading ? "Menyimpan..." : "Simpan Paket"}
        </Button>
      </form>
    </Form>
  );
}
