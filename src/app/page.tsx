import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-50 flex flex-col relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          VISUAL SPACE
        </div>
        <div className="space-x-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">
            Login
          </Link>
          <Link
            href="/booking"
            className="text-sm font-bold bg-white text-slate-900 px-5 py-2.5 rounded-full hover:bg-slate-200 transition shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            Booking Sekarang
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-slate-700 bg-slate-800/50 backdrop-blur-md text-xs font-medium text-blue-300 tracking-wider">
          STUDIO FOTO PREMIUM
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight mb-8">
          Abadikan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Momen Terbaik</span> <br className="hidden md:block" />Dalam Hidup Anda.
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          Sistem manajemen photobooth terintegrasi. Pesan jadwal secara realtime, bayar otomatis, dan dapatkan foto beresolusi tinggi langsung di dashboard Anda.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/booking"
            className="group relative flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-white font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
          >
            Mulai Booking Sesi
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800/30 backdrop-blur-md px-8 py-4 text-slate-300 font-semibold text-lg hover:bg-slate-800/60 transition-all duration-300"
          >
            Lihat Galeri Saya
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto w-full text-left">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Realtime Booking</h3>
            <p className="text-slate-400 text-sm">Pilih jadwal kosong secara instan dengan sistem sinkronisasi otomatis yang mencegah bentrokan waktu.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Payment Otomatis</h3>
            <p className="text-slate-400 text-sm">Terintegrasi dengan Midtrans. Bayar DP atau Lunas secara instan, jadwal Anda langsung terkunci.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Galeri Digital</h3>
            <p className="text-slate-400 text-sm">Akses foto orisinal tanpa watermark langsung dari dashboard pribadi Anda dan pilih mana yang mau dicetak fisik.</p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 text-center py-8 text-slate-500 text-sm border-t border-slate-800 mt-20">
        &copy; {new Date().getFullYear()} Visual Space Studio. All rights reserved.
      </footer>
    </div>
  );
}
