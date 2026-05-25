"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Suspense } from "react";
import { Camera, Eye, EyeOff, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

// Custom Password Input Component with Eye Icon Toggle
interface PasswordInputProps extends React.ComponentProps<typeof Input> {}

function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("bg-slate-950 border-slate-900 focus-visible:border-purple-500 focus-visible:ring-purple-500/20 text-slate-100 py-5 pr-10 rounded-xl placeholder:text-slate-700", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition focus:outline-none"
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [loading, setLoading] = useState(false);
  
  // Auth mode state: login, forgot, reset
  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  
  // Form states
  const [form, setForm] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetForm, setResetForm] = useState({ password: "", confirmPassword: "" });

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
      
      const session = await getSession();
      const role = session?.user?.role;

      let redirectUrl = callbackUrl;
      if (callbackUrl === "/dashboard" || callbackUrl === "/") {
        if (role === "ADMIN") {
          redirectUrl = "/admin/dashboard";
        } else if (role === "FOTOGRAFER") {
          redirectUrl = "/fotografer/dashboard";
        } else {
          redirectUrl = "/dashboard";
        }
      } else {
        if (callbackUrl.startsWith("/admin") && role !== "ADMIN") {
          redirectUrl = role === "FOTOGRAFER" ? "/fotografer/dashboard" : "/dashboard";
        } else if (callbackUrl.startsWith("/fotografer") && role !== "FOTOGRAFER") {
          redirectUrl = role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
        } else if (callbackUrl.startsWith("/dashboard") && role !== "PELANGGAN") {
          redirectUrl = role === "ADMIN" ? "/admin/dashboard" : "/fotografer/dashboard";
        }
      }

      router.push(redirectUrl);
      router.refresh();
    }
    setLoading(false);
  };

  const handleSendResetLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Silakan masukkan email Anda");
      return;
    }
    setLoading(true);
    
    // Simulate API validation
    setTimeout(() => {
      toast.success("Email terverifikasi!", {
        description: "Silakan buat kata sandi baru Anda.",
      });
      setMode("reset");
      setLoading(false);
    }, 1200);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetForm.password || !resetForm.confirmPassword) {
      toast.error("Harap isi semua kolom");
      return;
    }
    if (resetForm.password !== resetForm.confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok");
      return;
    }
    if (resetForm.password.length < 6) {
      toast.error("Kata sandi minimal 6 karakter");
      return;
    }
    setLoading(true);
    
    // Simulate password update
    setTimeout(() => {
      toast.success("Kata sandi berhasil diperbarui!", {
        description: "Silakan masuk kembali dengan kata sandi baru Anda.",
      });
      // reset states
      setResetForm({ password: "", confirmPassword: "" });
      setForgotEmail("");
      setMode("login");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50 relative overflow-hidden dark">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        {/* Form Card */}
        <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-slate-900 shadow-2xl shadow-purple-500/5">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-md shadow-purple-500/20">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              VISUAL SPACE
            </span>
          </div>

          {/* Mode: LOGIN */}
          {mode === "login" && (
            <>
              <h2 className="text-xl font-bold mb-8 text-center text-slate-200">Masuk ke Akun Anda</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Email</label>
                  <Input 
                    type="email" 
                    required 
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})} 
                    placeholder="email@example.com" 
                    className="bg-slate-950 border-slate-900 focus-visible:border-purple-500 focus-visible:ring-purple-500/20 text-slate-100 py-5 rounded-xl placeholder:text-slate-700"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-400 block">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setMode("forgot")}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition hover:underline"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <PasswordInput 
                    required 
                    value={form.password} 
                    onChange={e => setForm({...form, password: e.target.value})} 
                    placeholder="********" 
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full py-5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-[0.98] transition-all font-bold text-sm text-white border-0 mt-6 cursor-pointer" 
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Masuk"}
                </Button>
              </form>

              <p className="mt-8 text-center text-xs text-slate-400">
                Belum punya akun?{" "}
                <Link href="/register" className="text-purple-400 font-semibold hover:text-purple-300 transition hover:underline">
                  Daftar sekarang
                </Link>
              </p>
            </>
          )}

          {/* Mode: FORGOT PASSWORD */}
          {mode === "forgot" && (
            <>
              <h2 className="text-xl font-bold mb-3 text-center text-slate-200">Lupa Kata Sandi</h2>
              <p className="text-xs text-slate-400 text-center mb-8">
                Masukkan alamat email yang terdaftar pada akun Anda untuk memverifikasi kepemilikan.
              </p>
              
              <form onSubmit={handleSendResetLink} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Email Terdaftar</label>
                  <Input 
                    type="email" 
                    required 
                    value={forgotEmail} 
                    onChange={e => setForgotEmail(e.target.value)} 
                    placeholder="email@example.com" 
                    className="bg-slate-950 border-slate-900 focus-visible:border-purple-500 focus-visible:ring-purple-500/20 text-slate-100 py-5 rounded-xl placeholder:text-slate-700"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full py-5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-[0.98] transition-all font-bold text-sm text-white border-0 mt-6 cursor-pointer" 
                  disabled={loading}
                >
                  {loading ? "Memverifikasi..." : "Verifikasi Email"}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition hover:underline"
                >
                  Kembali ke Halaman Login
                </button>
              </div>
            </>
          )}

          {/* Mode: RESET PASSWORD */}
          {mode === "reset" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2 text-center text-slate-200">Buat Kata Sandi Baru</h2>
              <p className="text-xs text-slate-500 text-center mb-8">
                Memulihkan akun untuk: <span className="text-slate-300 font-semibold">{forgotEmail}</span>
              </p>
              
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Kata Sandi Baru</label>
                  <PasswordInput 
                    required 
                    value={resetForm.password} 
                    onChange={e => setResetForm({...resetForm, password: e.target.value})} 
                    placeholder="Min. 6 karakter" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Konfirmasi Kata Sandi Baru</label>
                  <PasswordInput 
                    required 
                    value={resetForm.confirmPassword} 
                    onChange={e => setResetForm({...resetForm, confirmPassword: e.target.value})} 
                    placeholder="Tulis ulang kata sandi baru" 
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full py-5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-[0.98] transition-all font-bold text-sm text-white border-0 mt-6 cursor-pointer" 
                  disabled={loading}
                >
                  {loading ? "Menyimpan..." : "Simpan Kata Sandi"}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail("");
                    setMode("login");
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition hover:underline"
                >
                  Batal & Kembali
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition inline-flex items-center gap-1.5">
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
