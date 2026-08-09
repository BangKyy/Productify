import React, { useState } from 'react';
import { 
  Question, 
  MagnifyingGlass, 
  CaretDown, 
  CaretUp, 
  Storefront, 
  UsersThree, 
  Newspaper, 
  Sparkle,
  ArrowLeft,
  ChatCircleText
} from '@phosphor-icons/react';

const FAQ_ITEMS = [
  // Category: Umum
  {
    id: 'gen-1',
    category: 'umum',
    categoryLabel: 'Umum & Akun',
    question: 'Apa itu PRoductify?',
    answer: 'PRoductify adalah ekosistem Digital Public Relations terpadu di Indonesia yang memberdayakan UMKM, Startup, Content Creator/Influencer, dan Agency Media PR untuk berkolaborasi, mempublikasikan siaran pers, dan memamerkan produk secara transparan.'
  },
  {
    id: 'gen-2',
    category: 'umum',
    categoryLabel: 'Umum & Akun',
    question: 'Apakah pendaftaran akun di PRoductify gratis?',
    answer: 'Ya! Pendaftaran akun untuk seluruh peran (UMKM, Influencer, maupun Agency Media) sepenuhnya gratis tanpa biaya tersembunyi.'
  },
  {
    id: 'gen-3',
    category: 'umum',
    categoryLabel: 'Umum & Akun',
    question: 'Bagaimana cara mengubah informasi profil saya?',
    answer: 'Anda dapat memperbarui nama, nomor WhatsApp, domisili, bio, foto profil, dan akun media sosial resmi kapan saja melalui menu Manajemen Profil Saya yang dapat diakses via dropdown profil di pojok kanan atas navbar.'
  },

  // Category: UMKM
  {
    id: 'umkm-1',
    category: 'umkm',
    categoryLabel: 'UMKM & Produk',
    question: 'Bagaimana cara menambah produk baru ke Product Showcase?',
    answer: 'Setelah login sebagai peran UMKM, navigasi ke halaman Product Showcase dan klik tombol "+ Tambah Produk Baru". Anda dapat mengisi judul produk, deskripsi, kategori, harga, serta mengunggah foto sampul produk dengan kompresi otomatis.'
  },
  {
    id: 'umkm-2',
    category: 'umkm',
    categoryLabel: 'UMKM & Produk',
    question: 'Bagaimana cara UMKM mengajukan ajakan kolaborasi ke Influencer?',
    answer: 'Buka halaman Marketplace Influencer, pilih profil KOL yang sesuai dengan spesialisasi produk Anda, lalu klik "Ajukan Kolaborasi". Pilih produk yang ingin dipromosikan dan kirimkan pitch singkat secara langsung.'
  },

  // Category: Influencer
  {
    id: 'inf-1',
    category: 'influencer',
    categoryLabel: 'Influencer / KOL',
    question: 'Bagaimana cara menambahkan Paket Rate Card jasa saya?',
    answer: 'Masuk ke halaman profil atau Marketplace KOL, lalu klik tombol "Kelola Rate Card". Anda dapat menetapkan tarif jasa endorsement untuk TikTok Video, Instagram Feed/Reels, Story, atau YouTube Review.'
  },
  {
    id: 'inf-2',
    category: 'influencer',
    categoryLabel: 'Influencer / KOL',
    question: 'Apakah jenis kelamin dan peran akun saya bisa diubah?',
    answer: 'Untuk menjaga integritas data direktori KOL, peran akun dan jenis kelamin dikunci secara permanen setelah dipilih. Namun, Anda tetap bebas mengupdate kategori spesialisasi dan estimasi jumlah followers.'
  },

  // Category: Press Release & Agency
  {
    id: 'pr-1',
    category: 'pr',
    categoryLabel: 'Siaran Pers & PR',
    question: 'Bagaimana cara menerbitkan Press Release resmi?',
    answer: 'Navigasi ke halaman Direktori Press Release, klik "+ Buat Press Release Baru", isi formulir judul, kategori media, isi siaran pers, serta kontak media (Media Contact). Siaran pers Anda akan langsung tayang pada direktori terbuka.'
  },
  {
    id: 'pr-2',
    category: 'pr',
    categoryLabel: 'Siaran Pers & PR',
    question: 'Siapa saja yang dapat membaca siaran pers di PRoductify?',
    answer: 'Direktori Press Release bersifat publik dan diindeks secara cepat sehingga dapat dibaca oleh wartawan, jurnalis media agency, konsumen, dan calon investor secara terbuka.'
  }
];

import { Breadcrumb } from '../ui/Breadcrumb';

export const FaqView = ({ setActiveTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openIds, setOpenIds] = useState(['gen-1', 'umkm-1']);

  const toggleAccordion = (id) => {
    setOpenIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Breadcrumb Navigation & Header Banner */}
      <div className="space-y-4">
        <div>
          <Breadcrumb items={[{ label: 'Pusat Bantuan & FAQ', icon: Question }]} setActiveTab={setActiveTab} />
        </div>

        <div className="glass-card p-8 rounded-3xl border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/30 relative overflow-hidden shadow-2xl">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
              <Question className="w-3.5 h-3.5 text-purple-400" />
              <span>Pusat Bantuan & FAQ</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white">Pertanyaan Sering Diajukan</h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Temukan jawaban cepat mengenai penggunaan fitur PRoductify, publikasi siaran pers, kerja sama KOL, dan manajemen profil akun Anda.
            </p>

            {/* Search Input Box */}
            <div className="pt-2 relative max-w-xl">
              <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pertanyaan atau kata kunci (contoh: Rate Card, Press Release, Profil)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            selectedCategory === 'all'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          ✨ Semua Pertanyaan ({FAQ_ITEMS.length})
        </button>

        <button
          onClick={() => setSelectedCategory('umum')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            selectedCategory === 'umum'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          <Question className="w-3.5 h-3.5 text-purple-400" /> Umum & Akun
        </button>

        <button
          onClick={() => setSelectedCategory('umkm')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            selectedCategory === 'umkm'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          <Storefront className="w-3.5 h-3.5 text-purple-400" /> UMKM & Produk
        </button>

        <button
          onClick={() => setSelectedCategory('influencer')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            selectedCategory === 'influencer'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          <UsersThree className="w-3.5 h-3.5 text-amber-400" /> Influencer / KOL
        </button>

        <button
          onClick={() => setSelectedCategory('pr')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            selectedCategory === 'pr'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          <Newspaper className="w-3.5 h-3.5 text-blue-400" /> Siaran Pers & PR
        </button>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-3xl border-slate-800 space-y-3">
            <Question className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
            <p className="text-sm font-bold text-slate-300">Tidak ada pertanyaan yang sesuai dengan kata kunci pencarian.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="text-xs text-purple-400 underline font-semibold hover:text-purple-300"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div
                key={faq.id}
                className={`glass-card rounded-2xl border transition-all overflow-hidden ${
                  isOpen ? 'border-purple-500/40 bg-slate-900/90' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                      {faq.categoryLabel}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate sm:whitespace-normal">
                      {faq.question}
                    </h3>
                  </div>
                  {isOpen ? (
                    <CaretUp className="w-5 h-5 text-purple-400 shrink-0" />
                  ) : (
                    <CaretDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still Have Questions Box */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
            <ChatCircleText className="w-4 h-4 text-purple-400" /> Belum Menemukan Jawaban yang Dicari?
          </h3>
          <p className="text-xs text-slate-400">Tim bantuan resmi PRoductify siap membantu kebutuhan PR dan kolaborasi Anda.</p>
        </div>
        <a
          href="mailto:support@productify.id"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer shrink-0 shadow-lg"
        >
          Hubungi Tim Support
        </a>
      </div>

    </div>
  );
};
