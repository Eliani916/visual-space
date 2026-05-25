"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Camera, 
  Calendar, 
  CreditCard, 
  Download, 
  Sparkles, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Image as ImageIcon, 
  Heart, 
  Smile, 
  ArrowRight,
  ShieldCheck,
  Clock
} from "lucide-react";

// Dummy Data
const FRAMES = [
  {
    id: "retro",
    name: "Retro Classic",
    category: "Classic",
    image: "/images/retro_frame_strip.png",
    description: "Format 4-strip legendaris yang membawa aura nostalgia klasik tahun 90-an. Cocok untuk seru-seruan bareng sahabat dekat.",
    badge: "Populer"
  },
  {
    id: "pastel",
    name: "Pastel Aesthetic",
    category: "Aesthetic",
    image: "/images/pastel_frame_grid.png",
    description: "Tata letak 2x2 grid dengan warna pastel lembut dan ornamen stiker imut. Pilihan favorit untuk mengekspresikan kedekatan pasangan.",
    badge: "Favorit"
  },
  {
    id: "wedding",
    name: "Elegant Wedding",
    category: "Elegant",
    image: "/images/wedding_frame_print.png",
    description: "Frame mewah berhiaskan ilustrasi floral putih dan emas yang elegan. Menyimpan kenangan romantis hari spesial Anda.",
    badge: "Premium"
  }
];

const PACKAGES = [
  {
    name: "Basic Session",
    price: "150.000",
    description: "Sesi singkat & praktis untuk personal atau berpasangan.",
    features: [
      "15 Menit Sesi Foto Mandiri",
      "Pilihan 1 Frame Desain Eksklusif",
      "2 Lembar Cetak Fisik Berwarna",
      "Semua File Digital via Dashboard",
      "Maksimal 3 Orang"
    ],
    cta: "Pilih Paket Basic",
    popular: false
  },
  {
    name: "Studio Favorite",
    price: "250.000",
    description: "Pilihan paling populer dengan durasi lebih panjang untuk grup.",
    features: [
      "30 Menit Sesi Foto Mandiri",
      "Pilihan 3 Frame Desain Bebas",
      "4 Lembar Cetak Fisik (Berwarna & B/W)",
      "1 Cetak Frame Kolase Kolosal",
      "Semua File Digital Resolusi Tinggi",
      "Maksimal 6 Orang"
    ],
    cta: "Pesan Terpopuler",
    popular: true
  },
  {
    name: "Ultimate Party",
    price: "450.000",
    description: "Pengalaman studio penuh untuk abadikan keseruan tanpa batas.",
    features: [
      "60 Menit Sesi Foto Mandiri",
      "Akses Semua Pilihan Frame Desain",
      "8 Lembar Cetak Fisik + Frame Kayu",
      "Aksesoris Kostum & Properti Lengkap",
      "Folder Google Drive Dedicated",
      "Kapasitas Maksimal Studio (8-10 Orang)"
    ],
    cta: "Booking Sesi Ultimate",
    popular: false
  }
];

const TESTIMONIALS = [
  {
    name: "Clara Septiana",
    role: "Mahasiswi",
    avatar: "CS",
    quote: "Gokil banget sih! Hasil cetaknya cepet terus file fotonya langsung ada di dashboard dalam hitungan menit. Pilihan frame fotonya juga lucu-lucu banget!",
    stars: 5
  },
  {
    name: "Reza Aditama",
    role: "Content Creator",
    avatar: "RA",
    quote: "Sistem booking-nya beneran realtime. Gak perlu ngantre lama di studio karena jadwalnya udah terkunci otomatis pas bayar pake QRIS. Pelayanannya top!",
    stars: 5
  },
  {
    name: "Fani & Danang",
    role: "Pasangan Pengantin",
    avatar: "FD",
    quote: "Sewa untuk acara tunangan kemarin, tamunya pada seneng banget sama frame wedding floral-nya. Kertas cetakannya tebal & warna fotonya tajam banget.",
    stars: 5
  }
];

const FAQS = [
  {
    question: "Apakah saya bisa menjadwalkan ulang (reschedule) booking?",
    answer: "Ya, Anda dapat melakukan penjadwalkan ulang (reschedule) waktu foto maksimal 24 jam sebelum jadwal yang telah dipilih sebelumnya langsung melalui dashboard pelanggan Anda."
  },
  {
    question: "Berapa lama file foto digital tersimpan di dashboard?",
    answer: "File foto digital orisinal Anda akan tersimpan dengan aman di server kami dan dapat diunduh melalui dashboard pelanggan selama 30 hari terhitung sejak tanggal sesi foto dilakukan."
  },
  {
    question: "Apakah pembayaran harus langsung lunas?",
    answer: "Tidak harus langsung lunas. Kami menyediakan opsi pembayaran Down Payment (DP) sebesar 50% via Midtrans untuk mengamankan slot jadwal Anda, atau Anda juga dapat langsung melunasinya."
  },
  {
    question: "Berapa kapasitas maksimal studio untuk satu sesi?",
    answer: "Studio kami dirancang agar muat secara nyaman untuk sesi kelompok kecil hingga sedang, dengan batas ideal berkisar antara 8 hingga 10 orang sekali masuk."
  }
];

export default function Home() {
  const [activeFrameTab, setActiveFrameTab] = useState("all");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const filteredFrames = activeFrameTab === "all" 
    ? FRAMES 
    : FRAMES.filter(f => f.category.toLowerCase() === activeFrameTab.toLowerCase());

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-50 flex flex-col relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute top-[30%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[150px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[130px]" />
      </div>

      {/* Navigation Header */}
      <nav className="relative z-10 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              VISUAL SPACE
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#fitur" className="hover:text-blue-400 transition">Fitur</a>
            <a href="#frames" className="hover:text-blue-400 transition">Pilihan Frame</a>
            <a href="#paket" className="hover:text-blue-400 transition">Paket Harga</a>
            <a href="#testimoni" className="hover:text-blue-400 transition">Testimoni</a>
            <a href="#faq" className="hover:text-blue-400 transition">FAQ</a>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">
              Login
            </Link>
            <Link
              href="/booking"
              className="text-sm font-bold bg-white text-slate-900 px-5 py-2.5 rounded-full hover:bg-slate-200 hover:scale-105 transition duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              Booking Sesi
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-slate-800 bg-slate-900/50 backdrop-blur-md text-xs font-semibold text-blue-300 tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          STUDIO PHOTOBOOTH PREMIUM MANDIRI
        </div>

        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight max-w-5xl leading-tight mb-8">
          Abadikan Momen Seru <br />
          Dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">Frame Estetik</span> Pilihan.
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-3xl mb-12 leading-relaxed">
          Sistem self-photobooth canggih & realtime. Pesan jadwal sesi secara langsung, bayar otomatis via QRIS/Transfer, dan unduh foto resolusi tinggi instan dari dashboard pribadi Anda.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-20">
          <Link
            href="/booking"
            className="group flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-white font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(168,85,247,0.35)]"
          >
            Mulai Booking Jadwal
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-full border border-slate-800 bg-slate-900/40 backdrop-blur-md px-8 py-4 text-slate-300 font-semibold text-lg hover:bg-slate-900/80 transition-all duration-300"
          >
            <ImageIcon className="w-5 h-5 text-slate-400" />
            Galeri Foto Saya
          </Link>
        </div>

        {/* Quick Stat Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm p-6 rounded-3xl">
          <div className="text-center p-2">
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">100%</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Konfirmasi Realtime</p>
          </div>
          <div className="text-center border-l border-slate-900 p-2">
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">20+</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Template Frame Lucu</p>
          </div>
          <div className="text-center border-l border-slate-900 p-2">
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">5 Menit</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Cetak & Unduh Cepat</p>
          </div>
          <div className="text-center border-l border-slate-900 p-2">
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-blue-400">4.9★</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Rating Kepuasan</p>
          </div>
        </div>
      </header>

      {/* Core Features Section */}
      <section id="fitur" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Teknologi Modern</h2>
          <p className="text-3xl md:text-4xl font-extrabold">Sistem Self-Photobooth Serba Praktis</p>
          <p className="text-slate-400 mt-4">Kami merancang alur foto studio mandiri dengan integrasi penuh untuk memberikan kenyamanan maksimal bagi Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-900 hover:border-blue-500/30 transition duration-300">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-6">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Reservasi Waktu Realtime</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Pilih tanggal dan slot jam kosong secara presisi di website. Sistem kami secara instan memblokir jadwal terkonfirmasi, menjamin tidak ada tumpukan jadwal.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-900 hover:border-purple-500/30 transition duration-300">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-6">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Gerbang Pembayaran Instan</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Terintegrasi aman dengan Midtrans. Lakukan pembayaran uang muka (DP) atau pelunasan instan menggunakan QRIS, e-Wallet, atau Transfer Bank pilihan Anda.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-900 hover:border-pink-500/30 transition duration-300">
            <div className="w-12 h-12 bg-pink-500/10 text-pink-400 rounded-xl flex items-center justify-center mb-6">
              <Download className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Unduh File & Cetak Instan</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Setelah selesai memotret, file asli dan hasil cetak frame langsung terunggah ke akun Anda. Unduh dan bagikan foto instan kapan saja tanpa ribet.
            </p>
          </div>
        </div>
      </section>

      {/* Frame Showcase Section */}
      <section id="frames" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-xl">
            <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Galeri Cetak</h2>
            <p className="text-3xl font-extrabold">Pilihan Desain Frame Terpopuler</p>
            <p className="text-slate-400 mt-2 text-sm">Sesuaikan hasil foto Anda dengan berbagai template frame kekinian kami.</p>
          </div>
          
          {/* Frame Category Tabs */}
          <div className="flex flex-wrap gap-2 mt-6 md:mt-0 bg-slate-900/50 p-1.5 rounded-full border border-slate-900">
            {["all", "classic", "aesthetic", "elegant"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFrameTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition duration-200 ${
                  activeFrameTab === tab 
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab === "all" ? "Semua Desain" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Frames Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredFrames.map((frame) => (
            <div key={frame.id} className="group relative rounded-3xl border border-slate-900 bg-slate-950/40 p-4 hover:border-slate-800 hover:bg-slate-900/20 transition duration-300 flex flex-col justify-between">
              {/* Frame Card Header Image */}
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-900/80 flex items-center justify-center p-2 mb-6">
                <img 
                  src={frame.image} 
                  alt={frame.name} 
                  className="max-h-full max-w-full object-contain rounded transition duration-500 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-xs font-semibold text-blue-300 px-3 py-1 rounded-full border border-slate-800">
                  {frame.badge}
                </span>
              </div>

              {/* Frame Info */}
              <div className="px-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{frame.name}</h3>
                  <span className="text-xs bg-purple-500/10 text-purple-400 font-semibold px-2 py-0.5 rounded border border-purple-500/20">{frame.category}</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  {frame.description}
                </p>
                <Link
                  href="/booking"
                  className="w-full py-2.5 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-white hover:text-slate-950 transition duration-300 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  Gunakan Frame Ini
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Packages Section */}
      <section id="paket" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-3">Paket Layanan</h2>
          <p className="text-3xl md:text-4xl font-extrabold">Investasi Terbaik untuk Kenangan Anda</p>
          <p className="text-slate-400 mt-4">Pilih paket sesi foto sesuai kebutuhan Anda. Tarif transparan, tanpa biaya tersembunyi.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PACKAGES.map((pkg, idx) => (
            <div 
              key={idx} 
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                pkg.popular 
                  ? "bg-gradient-to-b from-slate-900 via-indigo-950/20 to-slate-950 border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.15)] scale-105 md:z-10" 
                  : "bg-slate-950/50 border border-slate-900 hover:border-slate-800"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-extrabold px-4 py-1.5 rounded-full border border-indigo-400 tracking-wider uppercase">
                  Paling Laku
                </span>
              )}

              <div>
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">{pkg.description}</p>
                
                <div className="flex items-baseline gap-1.5 mb-8">
                  <span className="text-sm font-semibold text-slate-400">Rp</span>
                  <span className="text-4xl font-extrabold tracking-tight">{pkg.price}</span>
                  <span className="text-sm text-slate-500 font-medium">/sesi</span>
                </div>

                <div className="space-y-4 border-t border-slate-900 pt-6">
                  {pkg.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/booking"
                  className={`w-full py-4 rounded-xl font-bold text-center block transition-all duration-200 ${
                    pkg.popular 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-[1.02] shadow-lg shadow-purple-500/20" 
                      : "bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  {pkg.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Kemudahan Alur</h2>
          <p className="text-3xl font-extrabold">Cara Kerja Self-Photobooth</p>
          <p className="text-slate-400 mt-2 text-sm">Hanya butuh 4 langkah mudah untuk mengabadikan momen berharga Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Step 1 */}
          <div className="relative text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-blue-400 font-bold mb-6 mx-auto md:mx-0">
              1
            </div>
            <h3 className="text-lg font-bold mb-2">Pilih Sesi & Jadwal</h3>
            <p className="text-slate-400 text-sm">Pilih paket layanan foto yang sesuai, lalu pilih tanggal dan jam kosong langsung di kalender web.</p>
          </div>

          {/* Step 2 */}
          <div className="relative text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-purple-400 font-bold mb-6 mx-auto md:mx-0">
              2
            </div>
            <h3 className="text-lg font-bold mb-2">Konfirmasi Pembayaran</h3>
            <p className="text-slate-400 text-sm">Lakukan pembayaran deposit (DP) secara otomatis menggunakan metode pembayaran instan pilihan Anda.</p>
          </div>

          {/* Step 3 */}
          <div className="relative text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-pink-400 font-bold mb-6 mx-auto md:mx-0">
              3
            </div>
            <h3 className="text-lg font-bold mb-2">Datang & Berfoto</h3>
            <p className="text-slate-400 text-sm">Datang ke studio sesuai jadwal, gunakan remote shutter nirkabel untuk berfoto sesuka hati Anda.</p>
          </div>

          {/* Step 4 */}
          <div className="relative text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-emerald-400 font-bold mb-6 mx-auto md:mx-0">
              4
            </div>
            <h3 className="text-lg font-bold mb-2">Cetak & Unduh Foto</h3>
            <p className="text-slate-400 text-sm">Dapatkan kertas cetak fisik premium secara langsung dan unduh semua file digital berkualitas tinggi di dashboard.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimoni" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">Ulasan Pengunjung</h2>
          <p className="text-3xl font-extrabold">Apa Kata Mereka Tentang Kami</p>
          <p className="text-slate-400 mt-2 text-sm">Review jujur dari para pelanggan setia Visual Space Studio.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="p-8 rounded-3xl border border-slate-900 bg-slate-950/40 flex flex-col justify-between hover:border-slate-800 transition">
              <div>
                <div className="flex items-center gap-1 mb-6 text-amber-400">
                  {[...Array(t.stars)].map((_, sIdx) => (
                    <Star key={sIdx} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm italic leading-relaxed mb-8">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-900">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-xs font-extrabold text-white">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">{t.name}</h4>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">FAQ</h2>
          <p className="text-3xl font-extrabold">Pertanyaan yang Sering Diajukan</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx} 
                className="rounded-2xl border border-slate-900 bg-slate-950/40 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between font-bold text-sm md:text-base hover:bg-slate-900/20 transition duration-200"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 border-t border-slate-900/50 text-slate-400 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Booking CTA Banner */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-slate-800 p-12 text-center overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-slate-950/50 backdrop-blur-2xl -z-10" />
          <h2 className="text-3xl md:text-5xl font-black mb-4">Siap untuk Mengabadikan Keseruan?</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8 text-sm md:text-base">
            Amankan sesi Anda hari ini. Proses reservasi instan, pembayaran aman terkonfirmasi otomatis 24/7.
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 rounded-full bg-white text-slate-950 px-8 py-4 font-bold hover:bg-slate-200 hover:scale-105 transition duration-300 shadow-xl"
          >
            Pesan Jadwal Foto Sekarang
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950 py-12 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-300 tracking-tighter">VISUAL SPACE</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400">
            <a href="#fitur" className="hover:text-white transition">Fitur</a>
            <a href="#frames" className="hover:text-white transition">Pilihan Frame</a>
            <a href="#paket" className="hover:text-white transition">Paket Harga</a>
            <a href="#testimoni" className="hover:text-white transition">Testimoni</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </div>

          <p className="text-xs">&copy; {new Date().getFullYear()} Visual Space Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
