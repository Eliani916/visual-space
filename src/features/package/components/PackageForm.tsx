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
    defaultValues: initialData || {
      name: "",
      price: 0,
      printCount: 0,
      description: "",
      isActive: true,
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
                  <Input type="number" placeholder="500000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                  <Input type="number" placeholder="10" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
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
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea placeholder="Detail paket..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Menyimpan..." : "Simpan Paket"}
        </Button>
      </form>
    </Form>
  );
}
