"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Login berhasil!");
      router.push(callbackUrl);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-lg border w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login Visual Space</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email Anda" />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="********" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Memproses..." : "Masuk"}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Belum punya akun? <Link href="/register" className="text-blue-600 hover:underline">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
