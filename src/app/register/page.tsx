"use client";

import { useState } from "react";
import { registerUser } from "@/features/auth/actions/register.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await registerUser(form);
    if (res.success) {
      toast.success("Registrasi berhasil, silakan login.");
      router.push("/login");
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-lg border w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Daftar Akun Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nama Lengkap</label>
            <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium">Nomor HP</label>
            <Input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="0812xxxxxx" />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="********" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Memproses..." : "Daftar Sekarang"}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun? <Link href="/login" className="text-blue-600 hover:underline">Login di sini</Link>
        </p>
      </div>
    </div>
  );
}
