import React from 'react';
import { 
  Sparkle, 
  Target, 
  RocketLaunch, 
  ShieldCheck, 
  UsersThree, 
  Package, 
  Newspaper, 
  CurrencyDollar, 
  Clock, 
  Lightning, 
  CheckCircle, 
  TrendUp, 
  Heart, 
  Handshake, 
  Globe, 
  Quotes,
  Star
} from '@phosphor-icons/react';

export const AboutView = ({ setActiveTab }) => {
  return (
    <div className="space-y-12 pb-12">
      
      {/* 🚀 Hero Banner Section */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 glass-card border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/40">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-extrabold uppercase tracking-wider">
            <Sparkle className="w-4 h-4 text-amber-400" /> Platform Kolaborasi Terpadu Indonesia
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Tentang <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-amber-300 to-indigo-400">PRoductify</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            PRoductify adalah ekosistem digital perintis yang dirancang untuk menjembatani **Brand UMKM**, **Agency Public Relations**, dan **Influencer KOL** di seluruh Indonesia. Kami merevolusi cara kerja kolaborasi promosi menjadi lebih terstruktur, transparan, dan efisien.
          </p>

          {/* Core Vision & Mission Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="glass-card p-6 rounded-2xl border-slate-800/90 bg-slate-900/70 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase tracking-wider">
                <Target className="w-5 h-5 text-amber-400" /> Visi Utama
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Menjadi platform akselerasi pemasaran nomor #1 di Indonesia yang mempromosikan produk lokal UMKM hingga tingkat nasional melalui strategi kolaborasi KOL dan publikasi PR digital.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border-slate-800/90 bg-slate-900/70 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-extrabold text-sm uppercase tracking-wider">
                <RocketLaunch className="w-5 h-5 text-purple-400" /> Misi Kami
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Menyediakan alur kerja pengajuan rate card yang tanpa hambatan, memberikan transparansi riwayat kolaborasi publik, serta membuka akses promosi yang adil bagi seluruh skala usaha.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🏛️ SECTION 1: Apa Itu PRoductify? (3 Pilar Utama) */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">Ekosistem 3-in-1</span>
          <h2 className="text-3xl font-black text-white tracking-tight">Apa Saja yang Disediakan PRoductify?</h2>
          <p className="text-xs text-slate-400">
            Tiga pilar layanan utama yang terintegrasi secara lancar dalam satu sistem dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pilar 1: Showcase Produk UMKM */}
          <div className="glass-card p-7 rounded-3xl border-slate-800 space-y-4 hover:border-amber-500/40 transition-all bg-gradient-to-b from-slate-900/80 to-slate-950 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">1. Showcase Produk UMKM</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Katalog digital publik tempat pemilik brand UMKM memajang produk unggulan mereka, lengkap dengan spesifikasi, harga, dan ketersediaan sampel untuk ulasan konten.
              </p>
            </div>
          </div>

          {/* Pilar 2: Marketplace & Rate Card KOL */}
          <div className="glass-card p-7 rounded-3xl border-slate-800 space-y-4 hover:border-purple-500/40 transition-all bg-gradient-to-b from-slate-900/80 to-slate-950 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <UsersThree className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">2. Marketplace & Rate Card KOL</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Direktori tempat kreator konten dan Influencer KOL menyajikan profil, media kit, serta opsi pengajuan Request Rate Card langsung dengan form parameter yang terstruktur.
              </p>
            </div>
          </div>

          {/* Pilar 3: Publikasi Digital Press Release */}
          <div className="glass-card p-7 rounded-3xl border-slate-800 space-y-4 hover:border-blue-500/40 transition-all bg-gradient-to-b from-slate-900/80 to-slate-950 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Newspaper className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">3. Publikasi Rilis Pers Digital</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Fasilitas rilis pers terpadu bagi Agency PR dan Brand untuk menerbitkan pengumuman peluncuran produk, berita korporat, dan kampanye media ke khalayak luas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🏆 SECTION 2: Mengapa Memilih PRoductify? (Keunggulan Utama) */}
      <div className="space-y-8 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest block">Keunggulan Platform</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Mengapa Memilih PRoductify?</h2>
          <p className="text-xs text-slate-400">
            6 alasan utama mengapa ribuan Brand UMKM, Agency, dan Influencer memilih PRoductify sebagai mitra pertumbuhan bisnis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Alasan 1: Form Rate Card Pintar */}
          <div className="glass-card p-6 rounded-2xl border-slate-800 bg-slate-900/60 space-y-3 hover:border-purple-500/30 transition-all">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit">
              <Lightning className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">1. Form Request Rate Card Pintar</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pengajuan tidak lagi berbelit-belit. Form pintar kami menangkap tujuan kampanye, platform pilihan, jenis konten, target audiens, estimasi timeline, dan budget secara otomatis.
            </p>
          </div>

          {/* Alasan 2: Transparansi & Rekapan Komunitas */}
          <div className="glass-card p-6 rounded-2xl border-slate-800 bg-slate-900/60 space-y-3 hover:border-amber-500/30 transition-all">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2. Transparansi Rekapan Publik</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Halaman Aktivitas Kolaborasi mencatat seluruh jejak rekam kerja sama yang sedang berjalan maupun selesai sempurna sebagai referensi kredibilitas komunitas.
            </p>
          </div>

          {/* Alasan 3: Ramah Anggaran UMKM */}
          <div className="glass-card p-6 rounded-2xl border-slate-800 bg-slate-900/60 space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit">
              <CurrencyDollar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">3. Ramah Anggaran Semua Skala</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tidak ada batasan minimum yang kaku. Dukungan rentang anggaran fleksibel mulai dari di bawah Rp 1 Juta hingga skala besar sesuai kesepakatan bersama.
            </p>
          </div>

          {/* Alasan 4: Penargetan Niche Presisi */}
          <div className="glass-card p-6 rounded-2xl border-slate-800 bg-slate-900/60 space-y-3 hover:border-blue-500/30 transition-all">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 w-fit">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">4. Penargetan Influencer Presisi</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cari influencer berdasarkan kategori niche (Kuliner, Fashion, Beauty, Gadget, Lifestyle) dan platform utama seperti TikTok, Instagram Reels, dan YouTube Shorts.
            </p>
          </div>

          {/* Alasan 5: Notifikasi & Tracking Real-Time */}
          <div className="glass-card p-6 rounded-2xl border-slate-800 bg-slate-900/60 space-y-3 hover:border-rose-500/30 transition-all">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 w-fit">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">5. Tracking Status Real-Time</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pantau perjalanan ajuan masuk dan ajuan keluar secara langsung melalui Dashboard Status Kolaborasi yang dilengkapi notifikasi pendar otomatis di Navbar.
            </p>
          </div>

          {/* Alasan 6: Tanpa Biaya Tersembunyi */}
          <div className="glass-card p-6 rounded-2xl border-slate-800 bg-slate-900/60 space-y-3 hover:border-indigo-500/30 transition-all">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-fit">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">6. Bebas Biaya Komisi Tersembunyi</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pendaftaran akun, penjelajahan katalog, pengunggahan produk, hingga pembuatan Request Rate Card dapat diakses 100% secara langsung oleh pengguna.
            </p>
          </div>

        </div>
      </div>

      {/* 👥 Keuntungan Berdasarkan Peran Pengguna */}
      <div className="glass-card p-8 rounded-3xl border-slate-800 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 space-y-6">
        <h3 className="text-2xl font-extrabold text-white text-center">Manfaat Khusus untuk Setiap Peran</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">Untuk Brand UMKM</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tingkatkan omzet usaha dengan menjangkau ribuan audiens baru melalui ulasan jujur dari Influencer KOL yang relevan.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Untuk Influencer / KOL</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sajikan rate card profesional, terima tawaran endorsement dari brand terpercaya, dan kembangkan portofolio kampanye Anda.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block">Untuk Agency PR</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Kelola kampanye rilis pers digital, koordinasikan talent KOL, dan dapatkan laporan perkembangan secara terstruktur.
            </p>
          </div>
        </div>
      </div>

      {/* 📣 Call-To-Action Banner Footer */}
      <div className="glass-card p-8 sm:p-10 rounded-3xl border-slate-800 bg-gradient-to-r from-purple-900/60 via-slate-900 to-indigo-900/60 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-black text-white">Siap Memulai Kolaborasi di PRoductify?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Bergabunglah dengan komunitas pengusaha dan kreator konten Indonesia. Daftarkan akun Anda atau jelajahi marketplace sekarang!
          </p>
        </div>

        {setActiveTab && (
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('marketplace')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              <UsersThree className="w-4 h-4" /> Marketplace KOL
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
            >
              <Package className="w-4 h-4" /> Produk UMKM
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
