"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, BookingInput } from "@/validations/booking.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createBooking, getAvailableTimes } from "../actions/booking.actions";
import { getPackages } from "@/features/package/actions/package.actions";
import { toast } from "sonner";
import Script from "next/script";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    snap: any;
  }
}

export default function BookingForm({ settings }: { settings: any }) {
  const router = useRouter();
  const [packages, setPackages] = useState<any[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTransferRequired, setIsTransferRequired] = useState(false);

  const form = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      packageId: "",
      bookingDate: "",
      bookingTime: "",
      paymentMethod: "TRANSFER",
    },
  });

  const selectedDate = form.watch("bookingDate");
  const selectedMethod = form.watch("paymentMethod");

  useEffect(() => {
    // Fetch packages
    getPackages(false).then((res) => {
      if (res.success) setPackages(res.data || []);
    });
  }, []);

  useEffect(() => {
    if (selectedDate) {
      // Check available times
      getAvailableTimes(selectedDate).then((res) => {
        if (res.success) setAvailableTimes(res.data || []);
      });

      // Check DP constraints
      const bookingDateObj = new Date(`${selectedDate}T00:00:00`);
      const now = new Date();
      now.setHours(0,0,0,0);
      const diffTime = bookingDateObj.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= settings.dpMinDaysAhead) {
        setIsTransferRequired(true);
        form.setValue("paymentMethod", "TRANSFER");
      } else {
        setIsTransferRequired(false);
      }
    } else {
      setAvailableTimes([]);
      setIsTransferRequired(false);
    }
  }, [selectedDate, settings.dpMinDaysAhead, form]);

  const onSubmit = async (data: BookingInput) => {
    setLoading(true);
    const res = await createBooking(data);
    if (res.success) {
      toast.success("Booking berhasil dibuat");
      
      if (data.paymentMethod === "TRANSFER" && res.data?.token) {
        // Trigger midtrans snap
        window.snap.pay(res.data.token, {
          onSuccess: function(result: any){
            toast.success("Pembayaran berhasil!");
            router.push("/dashboard");
          },
          onPending: function(result: any){
            toast.info("Menunggu pembayaran Anda!");
            router.push("/dashboard");
          },
          onError: function(result: any){
            toast.error("Pembayaran gagal!");
            router.push("/dashboard");
          },
          onClose: function(){
            toast.warning("Anda menutup popup pembayaran.");
            router.push("/dashboard");
          }
        });
      } else {
        router.push("/dashboard");
      }
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <>
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} 
        strategy="lazyOnload" 
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto bg-white p-6 shadow rounded-md">
          <FormField
            control={form.control}
            name="packageId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pilih Paket</FormLabel>
                <FormControl>
                  <select 
                    {...field} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">-- Pilih Paket --</option>
                    {packages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>{pkg.name} - Rp {parseFloat(pkg.price).toLocaleString('id-ID')}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bookingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal</FormLabel>
                  <FormControl>
                    <Input type="date" min={new Date().toISOString().split("T")[0]} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bookingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jam</FormLabel>
                  <FormControl>
                    <select 
                      {...field} 
                      disabled={!selectedDate || availableTimes.length === 0}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="">-- Pilih Jam --</option>
                      {availableTimes.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metode Pembayaran (Wajib DP 50%)</FormLabel>
                <FormControl>
                  <select 
                    {...field} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="TRANSFER">Transfer (Midtrans)</option>
                    {!isTransferRequired && <option value="CASH">Cash di Studio</option>}
                  </select>
                </FormControl>
                {isTransferRequired && <p className="text-xs text-blue-500">Booking H-{settings.dpMinDaysAhead} atau lebih wajib via Transfer.</p>}
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Memproses..." : "Booking Sekarang"}
          </Button>
        </form>
      </Form>
    </>
  );
}
