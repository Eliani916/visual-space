"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  CalendarDays,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Camera,
  User,
  Users,
  Clock,
  Tag,
  Sparkles,
} from "lucide-react";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navigation = [
    {
      name: "Dashboard Analitik",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Daftar Booking",
      href: "/admin/bookings",
      icon: CalendarDays,
    },
    {
      name: "Manajemen Antrean",
      href: "/admin/queues",
      icon: Clock,
    },
    {
      name: "Manajemen Paket",
      href: "/admin/packages",
      icon: Package,
    },
    {
      name: "Manajemen Fotografer",
      href: "/admin/photographers",
      icon: Users,
    },
    {
      name: "Manajemen Promo",
      href: "/admin/promos",
      icon: Tag,
    },
    {
      name: "Konten Landing Page",
      href: "/admin/landing-page",
      icon: Sparkles,
    },
    {
      name: "Pengaturan Sistem",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  // Helper to get active page title
  const getPageTitle = () => {
    const activeItem = navigation.find((item) => pathname.startsWith(item.href));
    return activeItem ? activeItem.name : "Admin Panel";
  };

  const handleLogout = async () => {
    // Redirect to the current origin (e.g., port 3001) instead of next-auth's NEXTAUTH_URL (port 3000)
    await signOut({ callbackUrl: window.location.origin + "/login" });
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950 font-sans">
      {/* BACKGROUND DECORATIVE ELEMENTS FOR PREMIUM LOOK */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:shrink-0 bg-slate-900 border-r border-slate-800 text-slate-200">
        {/* Brand header */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/60">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Visual Space
            </h1>
            <p className="text-xs text-indigo-400 font-semibold tracking-wider uppercase">
              Admin Studio
            </p>
          </div>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/10"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          {/* User profile details */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/40 mb-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-sm">
              {getInitials(user?.name)}
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">
                {user?.name || "Super Admin"}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email || "admin@example.com"}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-all border border-slate-800/50"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Gelap</span>
                </>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-red-950/30 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-all border border-red-900/30"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE SIDEBAR DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative flex flex-col w-72 max-w-xs bg-slate-900 text-slate-200 shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Close button inside Drawer */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Brand header */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/60">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                  Visual Space
                </h1>
                <p className="text-xs text-indigo-400 font-semibold tracking-wider uppercase">
                  Admin Studio
                </p>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User card & footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/40 mb-3">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-sm">
                  {getInitials(user?.name)}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 truncate">
                    {user?.name || "Super Admin"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{user?.email || "admin@example.com"}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                {/* Theme Toggle */}
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-all border border-slate-800/50"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>Terang</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <span>Gelap</span>
                    </>
                  )}
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-red-950/30 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-all border border-red-900/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
          {/* Left section: Hamburger (mobile) & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 lg:hidden focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right section: Quick profile + role badge */}
          <div className="flex items-center gap-4">
            {/* Quick theme toggle for desktop navbar */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 hidden sm:block focus:outline-none transition-all"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>

            <div className="flex items-center gap-3">
              <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                {user?.role || "ADMIN"}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-8.5 h-8.5 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {getInitials(user?.name)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-slate-800 dark:text-zinc-150 leading-tight">
                    {user?.name || "Super Admin"}
                  </p>
                  <p className="text-xxs text-slate-400 dark:text-zinc-500 uppercase font-medium tracking-wider">
                    {user?.role?.toLowerCase() || "admin"} account
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* CONTAINER FOR CHILDREN */}
        <main className="flex-1 overflow-y-auto focus:outline-none bg-slate-50 dark:bg-zinc-950/40">
          {children}
        </main>
      </div>
    </div>
  );
}
