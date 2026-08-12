import React from 'react';
import { 
  ShieldCheck, 
  LockKey, 
  Eye, 
  Database, 
  Cookie, 
  UserCheck, 
  ArrowLeft,
  Sparkle,
  EnvelopeSimple
} from '@phosphor-icons/react';

import { Breadcrumb } from '../ui/Breadcrumb';

export const PrivacyView = ({ setActiveTab }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Breadcrumb Navigation & Header Banner */}
      <div className="space-y-4">
        <div>
          <Breadcrumb items={[{ label: 'Kebijakan Privasi', icon: ShieldCheck }]} setActiveTab={setActiveTab} />
        </div>

        <div className="glass-card p-8 rounded-3xl border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/30 relative overflow-hidden shadow-2xl">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Privasi & Keamanan Data</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white">Kebijakan Privasi</h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Komitmen utama PRoductify dalam melindungi privasi, data pribadi, dan informasi kontak bisnis seluruh pengguna ekosistem digital kami.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs text-slate-500 font-medium">
              <span>Terakhir Diperbarui: <strong>7 Agustus 2026</strong></span>
              <span>•</span>
              <span>Standar Keamanan: <strong>AES-256 & RLS Supabase</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6">
        
        {/* Section 1 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-indigo-400" />
            <span>1. Informasi yang Kami Kumpulkan</span>
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              Saat Anda mendaftar atau mengelola profil di PRoductify, kami mengumpulkan informasi terbatas yang diperlukan untuk pengoperasian platform:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Identitas Akun: Nama Lengkap / Nama Bisnis, Alamat Email terdaftar.</li>
              <li>Informasi Kontak: Nomor WhatsApp (terformat otomatis +62) dan Alamat / Kota Domisili.</li>
              <li>Informasi Peran & Spesialisasi: Peran akun (UMKM, Influencer, Agency), Kategori spesialisasi, dan Estimasi Followers.</li>
              <li>Tautan Resmi Media Sosial: Username TikTok, Instagram, YouTube, X, Threads, dan LinkedIn yang Anda inputkan secara sukarela.</li>
            </ul>
          </div>
        </div>

        {/* Section 2 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Database className="w-5 h-5 text-purple-400" />
            <span>2. Pengolahan & Penggunaan Informasi</span>
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              Data pribadi Anda digunakan secara eksklusif untuk tujuan-tujuan berikut:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Menghubungkan UMKM dengan KOL/Influencer yang tepat dalam fitur Marketplace Kolaborasi.</li>
              <li>Memverifikasi keabsahan pengirim siaran pers pada direktori Press Release.</li>
              <li>Memfasilitasi komunikasi langsung antara kolaborator melalui nomor WhatsApp terformat.</li>
              <li>Memperbarui status sesi autentikasi dan otorisasi profil pada tabel `public.profiles`.</li>
            </ul>
          </div>
        </div>

        {/* Section 3 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <LockKey className="w-5 h-5 text-emerald-400" />
            <span>3. Keamanan & Proteksi Database Supabase</span>
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              3.1. Seluruh data pengguna disimpan dalam infrastruktur basis data PostgreSQL Supabase yang dilengkapi dengan Row Level Security (RLS) dan enkripsi SSL/TLS.
            </p>
            <p>
              3.2. Kami tidak pernah menjual, menyewakan, atau memperjualbelikan data pribadi Anda kepada pihak ketiga manapun di luar ekosistem PRoductify.
            </p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Cookie className="w-5 h-5 text-amber-400" />
            <span>4. Penggunaan Cookie & Sesi Lokal</span>
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              PRoductify menggunakan `localStorage` browser dan cookie sesi aman untuk menyimpan token autentikasi (JWT) dan preferensi bahasa pengguna. Sesi ini otomatis kadaluarsa secara aman untuk mencegah akses tanpa izin.
            </p>
          </div>
        </div>

        {/* Section 5 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-blue-400" />
            <span>5. Hak Pengguna Atas Data Pribadi</span>
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              Anda berhak mengakses, memperbarui, atau menghapus informasi akun Anda kapan saja melalui halaman Manajemen Profil Saya (`/profile`). Jika Anda membutuhkan bantuan penghapusan total akun, Anda dapat menghubungi tim privasi kami.
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Contact Callout */}
      <div className="p-6 rounded-3xl bg-indigo-950/20 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
            <EnvelopeSimple className="w-4 h-4 text-indigo-400" /> Memiliki Pertanyaan Privasi Khusus?
          </h3>
          <p className="text-xs text-slate-400">Hubungi Data Protection Officer kami melalui email <strong>productify.pr@gmail.com</strong>.</p>
        </div>
        <button
          onClick={() => setActiveTab('faq')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-all cursor-pointer shrink-0 shadow-lg"
        >
          Lihat Pertanyaan Umum (FAQ)
        </button>
      </div>

    </div>
  );
};
