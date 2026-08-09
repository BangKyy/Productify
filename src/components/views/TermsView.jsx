import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Scales, 
  Gavel, 
  LockKey, 
  ArrowsClockwise, 
  ArrowLeft,
  Sparkle,
  CheckCircle,
  Storefront,
  UsersThree,
  Newspaper
} from '@phosphor-icons/react';

import { Breadcrumb } from '../ui/Breadcrumb';

export const TermsView = ({ setActiveTab }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Breadcrumb Navigation & Header Banner */}
      <div className="space-y-4">
        <div>
          <Breadcrumb items={[{ label: 'Syarat & Ketentuan', icon: Scales }]} setActiveTab={setActiveTab} />
        </div>

        <div className="glass-card p-8 rounded-3xl border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/30 relative overflow-hidden shadow-2xl">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
              <Scales className="w-3.5 h-3.5 text-purple-400" />
              <span>Dokumen Hukum Resmi</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white">Syarat & Ketentuan Layanan</h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Harap baca syarat dan ketentuan ini secara cermat sebelum menggunakan platform ekosistem PRoductify. Dengan mengakses atau mendaftar, Anda menyetujui seluruh aturan yang tercantum di bawah ini.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs text-slate-500 font-medium">
              <span>Terakhir Diperbarui: <strong>7 Agustus 2026</strong></span>
              <span>•</span>
              <span>Versi Dokumen: <strong>2.1 (Terverifikasi)</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6">
        
        {/* Section 1 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-purple-400" />
            <span>1. Ketentuan Umum & Pendaftaran Akun</span>
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              1.1. Platform **PRoductify** merupakan ekosistem Digital Public Relations terpadu yang menghubungkan pemilik UMKM/Brand, Content Creator/Influencer, dan Agency Media PR di Indonesia.
            </p>
            <p>
              1.2. Pengguna wajib berusia minimal 17 tahun atau memiliki legalitas badan usaha/izin usaha resmi yang diakui di wilayah Hukum Republik Indonesia saat mendaftar akun.
            </p>
            <p>
              1.3. Pengguna bertanggung jawab penuh atas kerahasiaan kata sandi akun dan seluruh aktivitas yang terjadi di bawah kredensial terdaftar.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Newspaper className="w-5 h-5 text-blue-400" />
            <span>2. Publikasi Siaran Pers (Press Release)</span>
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              2.1. Seluruh materi press release yang diunggah ke PRoductify harus memuat fakta akurat, bebas dari unsur ujaran kebencian, pencemaran nama baik, atau materi yang melanggar Undang-Undang ITE.
            </p>
            <p>
              2.2. Pengunggah memberikan lisensi non-eksklusif kepada PRoductify untuk mendistribusikan dan merelay siaran pers kepada jaringan mitra agency media PR terverifikasi.
            </p>
            <p>
              2.3. PRoductify berhak meninjau, menangguhkan, atau menghapus siaran pers yang terindikasi memuat informasi palsu (hoaks) atau melanggar hak cipta pihak ketiga.
            </p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <UsersThree className="w-5 h-5 text-amber-400" />
            <span>3. Etika Kolaborasi & Marketplace KOL</span>
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              3.1. Influencer dan UMKM yang terlibat dalam pengajuan kolaborasi melalui Marketplace PRoductify sepakat untuk menghormati tenggat waktu pengiriman konten dan kesepakatan Rate Card yang telah disetujui.
            </p>
            <p>
              3.2. Rate Card yang tercantum pada profil Influencer bersifat estimasi transparan dan dapat disesuaikan berdasarkan brief kampanye khusus yang disepakati kedua belah pihak.
            </p>
            <p>
              3.3. Dilarang keras melakukan manipulasi klaim followers, klaim engagement rate palsu, atau menggunakan layanan bot otomasi yang merugikan pihak kolaborator.
            </p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <LockKey className="w-5 h-5 text-emerald-400" />
            <span>4. Perlindungan Data & Keamanan Profil</span>
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              4.1. Data profil pengguna yang tersimpan dalam basis data `public.profiles` dilindungi menggunakan standar enkripsi keamanan modern dan akses terotorisasi berbasis peran (RBAC).
            </p>
            <p>
              4.2. Pengguna memiliki hak penuh untuk memperbarui data kontak, bio, serta tautan media sosial resmi melalui halaman Manajemen Profil Saya.
            </p>
          </div>
        </div>

        {/* Section 5 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Gavel className="w-5 h-5 text-rose-400" />
            <span>5. Hukum yang Berlaku & Perubahan Ketentuan</span>
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              5.1. Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum yang berlaku di Negara Kesatuan Republik Indonesia.
            </p>
            <p>
              5.2. PRoductify berhak memperbarui dokumen ketentuan ini sewaktu-waktu. Perubahan material akan diberitahukan melalui portal platform atau email resmi terdaftar.
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Contact Callout */}
      <div className="p-6 rounded-3xl bg-purple-950/20 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
            <Sparkle className="w-4 h-4 text-purple-400" /> Ada Pertanyaan Seputar Legalitas?
          </h3>
          <p className="text-xs text-slate-400">Tim hukum dan dukungan PRoductify siap membantu Anda 24/7.</p>
        </div>
        <button
          onClick={() => setActiveTab('faq')}
          className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-all cursor-pointer shrink-0 shadow-lg"
        >
          Buka Halaman FAQ
        </button>
      </div>

    </div>
  );
};
