import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { dataService } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Avatar, AvatarFallback } from '../ui/Avatar';
import { 
  Sparkle, 
  ArrowRight, 
  Storefront, 
  Newspaper, 
  UsersThree, 
  Megaphone,
  Handshake,
  MapPin,
  GenderFemale,
  GenderMale,
  TiktokLogo,
  InstagramLogo,
  YoutubeLogo,
  XLogo,
  ThreadsLogo,
  LinkedinLogo,
  CalendarBlank,
  User,
  Tag,
  Star
} from '@phosphor-icons/react';

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600',
];

const ROLE_WORKFLOWS = {
  umkm: [
    {
      title: '1. Registrasi Profil UMKM',
      desc: 'Buat akun bisnis Anda secara gratis, lengkapi identitas brand, sektor industri, dan lokasi usaha.',
      action: 'Akses Form Registrasi UMKM'
    },
    {
      title: '2. Pajang Product Showcase',
      desc: 'Unggah katalog produk unggulan lengkap dengan foto beresolusi tinggi & deskripsi penawaran.',
      action: 'Tampilkan Produk di Showcase'
    },
    {
      title: '3. Request Rate Card KOL',
      desc: 'Jelajahi Marketplace KOL, filter sesuai domisili & spesialisasi, lalu kirimkan Request Rate Card resmi.',
      action: 'Request Rate Card Influencer'
    },
    {
      title: '4. Pantau Status Kolaborasi',
      desc: 'Kelola persetujuan rate card, negosiasi layanan, dan progres kampanye pada menu Status Kolaborasi.',
      action: 'Kelola Dashboard Kolaborasi'
    }
  ],
  influencer: [
    {
      title: '1. Registrasi Profil KOL',
      desc: 'Daftar sebagai Influencer, pilih kategori spesialisasi (Beauty, Tech, Fashion) & tautkan akun media sosial.',
      action: 'Akses Form Registrasi KOL'
    },
    {
      title: '2. Kelola Rate Card Resmi',
      desc: 'Daftarkan jenis postingan (TikTok Video, IG Reels, Story, YouTube) beserta tarif harga resminya.',
      action: 'Atur Paket Rate Card'
    },
    {
      title: '3. Terima Request Rate Card',
      desc: 'Dapatkan notifikasi permintaan rate card & penawaran kolaborasi masuk dari brand UMKM & Agency PR.',
      action: 'Respon Request Rate Card'
    },
    {
      title: '4. Eksekusi Konten & Kampanye',
      desc: 'Kerjakan konten sesuai kesepakatan rate card, cantumkan bukti tayang, dan selesaikan kerja sama.',
      action: 'Selesaikan Project Kolaborasi'
    }
  ],
  agency: [
    {
      title: '1. Registrasi Agency PR',
      desc: 'Daftarkan entitas agency PR atau media resmi Anda untuk mengelola publisitas & klien brand.',
      action: 'Akses Form Agency PR'
    },
    {
      title: '2. Terbitkan Press Release',
      desc: 'Publikasikan siaran pers digital resmi untuk peluncuran produk atau pengumuman penting brand.',
      action: 'Rilis Press Release Digital'
    },
    {
      title: '3. Request Rate Card & Kurasi KOL',
      desc: 'Jelajahi direktori Product Showcase & Marketplace KOL untuk mengirimkan Request Rate Card skala besar.',
      action: 'Request Rate Card & Kurasi KOL'
    },
    {
      title: '4. Moderasi & Evaluasi PR',
      desc: 'Gunakan fitur moderasi dan analitik laporan kampanye untuk memastikan jangkauan berita terbit maksimal.',
      action: 'Evaluasi Jangkauan Media'
    }
  ]
};

export const OverviewView = ({ setActiveTab }) => {
  const { t } = useLanguage();
  const { profiles, isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [pressReleases, setPressReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoleWorkflow, setActiveRoleWorkflow] = useState('umkm');

  useEffect(() => {
    const loadHomeContent = async () => {
      setLoading(true);
      try {
        const [prods, profs, prs] = await Promise.all([
          dataService.getProducts(),
          dataService.getProfiles(),
          dataService.getPressReleases()
        ]);

        setProducts(Array.isArray(prods) ? prods.slice(0, 4) : []);

        const kolList = Array.isArray(profs) ? profs.filter(p => p && p.role === 'influencer') : [];
        setInfluencers(kolList.slice(0, 3));

        setPressReleases(Array.isArray(prs) ? prs.slice(0, 4) : []);
      } catch (err) {
        console.warn('Failed to load landing page preview data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeContent();
  }, []);

  const formatStartingPrice = (inf) => {
    if (Array.isArray(inf?.rate_cards) && inf.rate_cards.length > 0) {
      const prices = inf.rate_cards.map(rc => Number(rc.price) || 0).filter(p => p > 0);
      if (prices.length > 0) {
        const minP = Math.min(...prices);
        if (minP >= 1000000) {
          const millions = minP / 1000000;
          const formatted = Number(millions.toFixed(2)).toString();
          return `Mulai dari Rp ${formatted} Juta`;
        }
        if (minP >= 1000) {
          const thousands = minP / 1000;
          const formatted = Number(thousands.toFixed(2)).toString();
          return `Mulai dari Rp ${formatted} Ribu`;
        }
        return `Mulai dari Rp ${minP.toLocaleString('id-ID')}`;
      }
    }
    return 'Mulai dari Rp 1 Juta';
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Banner Section */}
      <section className="relative pt-12 pb-20 overflow-hidden rounded-3xl bg-gradient-glow border border-slate-800/80 px-6 sm:px-12 text-center">
        
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wide">
            <Sparkle weight="fill" className="w-4 h-4 text-purple-400" />
            <span>{t('hero.badge')}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            {t('hero.title1')} <span className="text-gradient">{t('hero.title2')}</span>, {t('hero.title3')} <span className="text-gradient">{t('hero.title4')}</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              onClick={() => setActiveTab('press-releases')}
              size="lg"
              className="glow-purple"
            >
              <Megaphone className="w-5 h-5" />
              <span>{t('hero.publishBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              onClick={() => setActiveTab('marketplace')}
              variant="outline"
              size="lg"
            >
              <UsersThree className="w-5 h-5 text-indigo-400" />
              <span>{t('hero.exploreKolBtn')}</span>
            </Button>
          </div>

        </div>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6 rounded-2xl border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
            <Storefront className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">1.250+</p>
            <p className="text-xs text-slate-400 font-medium">UMKM & Startup Terdaftar</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <UsersThree className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">500+</p>
            <p className="text-xs text-slate-400 font-medium">Influencer & KOL</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">3.400+</p>
            <p className="text-xs text-slate-400 font-medium">Siaran Press Release</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">98.4%</p>
            <p className="text-xs text-slate-400 font-medium">Tingkat Penjajakan Kolaborasi</p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1: PRODUCT SHOWCASE (Urutan Pertama)                            */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Storefront className="w-4 h-4" /> Showcase Produk Unggulan
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Product Showcase Terpilih</h2>
            <p className="text-sm text-slate-400 max-w-xl">
              Jelajahi inovasi produk dari UMKM & Brand Indonesia yang siap berkolaborasi.
            </p>
          </div>

          <Button
            onClick={() => setActiveTab('products')}
            variant="outline"
            size="sm"
            className="gap-2 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400 w-fit"
          >
            <span>Lihat Semua Produk</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Memuat daftar produk unggulan...</div>
        ) : products.length === 0 ? (
          <div className="glass-card p-8 rounded-3xl text-center text-slate-400 text-sm">
            Belum ada produk showcase yang ditampilkan.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, idx) => {
              const ownerProfile = Array.isArray(profiles) ? profiles.find(p => p.id === product.owner_id) : null;
              const ownerName = ownerProfile?.full_name || 'UMKM Partner';

              return (
                <div
                  key={product.id || idx}
                  onClick={() => setActiveTab('products')}
                  className="glass-card rounded-3xl overflow-hidden border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={product.image_url || PRESET_IMAGES[idx % PRESET_IMAGES.length]}
                      alt={product.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = PRESET_IMAGES[idx % PRESET_IMAGES.length];
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700 text-[10px] font-bold text-indigo-300">
                      {product.category || 'General'}
                    </div>
                  </div>

                  <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {ownerName}
                      </p>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-300 font-semibold group-hover:text-indigo-200">
                      <span>Detail Produk</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: MARKETPLACE KOL (Urutan Kedua)                                 */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <UsersThree className="w-4 h-4" /> Marketplace Influencer
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Influencer & KOL Pilihan</h2>
            <p className="text-sm text-slate-400 max-w-xl">
              Temukan kreator konten berbakat untuk mempromosikan brand dan kampanye Anda.
            </p>
          </div>

          <Button
            onClick={() => setActiveTab('marketplace')}
            variant="outline"
            size="sm"
            className="gap-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 w-fit"
          >
            <span>Lihat Semua KOL</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Memuat profil influencer pilihan...</div>
        ) : influencers.length === 0 ? (
          <div className="glass-card p-8 rounded-3xl text-center text-slate-400 text-sm">
            Belum ada influencer yang ditampilkan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {influencers.map(inf => (
              <div
                key={inf.id}
                onClick={() => setActiveTab('marketplace')}
                className="glass-card rounded-3xl p-6 border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between group cursor-pointer space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {inf.avatar_url ? (
                        <img
                          src={inf.avatar_url}
                          alt={inf.full_name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                          }}
                          className="w-12 h-12 rounded-2xl object-cover border border-amber-500/40 shadow-md group-hover:scale-105 transition-transform"
                        />
                      ) : null}
                      <Avatar
                        className="w-12 h-12 border border-amber-500/40 bg-amber-500/10 text-amber-300 font-black text-sm shadow-md group-hover:scale-105 transition-transform"
                        style={{ display: inf.avatar_url ? 'none' : 'flex' }}
                      >
                        <AvatarFallback>{(inf.full_name || 'KOL').substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                          {inf.full_name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            {inf.address || 'Indonesia'}
                          </span>
                          {inf.gender && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                              • {((inf.gender || '').toLowerCase() === 'perempuan' || (inf.gender || '').toLowerCase() === 'female')
                                  ? <GenderFemale className="w-3 h-3 text-rose-400" />
                                  : <GenderMale className="w-3 h-3 text-blue-400" />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {inf.category && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold shrink-0">
                        {inf.category}
                      </span>
                    )}
                  </div>

                  {/* Social Handles Icons */}
                  {(inf.social_tiktok || inf.social_instagram || inf.social_youtube || inf.social_x || inf.social_threads || inf.social_linkedin) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {inf.social_tiktok && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-medium">
                          <TiktokLogo className="w-3 h-3 text-white shrink-0" weight="fill" />
                          <strong className="text-amber-300">{inf.social_tiktok}</strong>
                        </span>
                      )}
                      {inf.social_instagram && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-medium">
                          <InstagramLogo className="w-3 h-3 text-pink-400 shrink-0" weight="fill" />
                          <strong className="text-amber-300">{inf.social_instagram}</strong>
                        </span>
                      )}
                      {inf.social_youtube && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-medium">
                          <YoutubeLogo className="w-3 h-3 text-red-500 shrink-0" weight="fill" />
                          <strong className="text-amber-300">{inf.social_youtube}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Harga Layanan:</span>
                  <span className="font-extrabold text-emerald-400">
                    {formatStartingPrice(inf)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: PRESS RELEASES (Urutan Ketiga)                                 */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
              <Newspaper className="w-4 h-4" /> Publisitas & Rilis Media
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Direktori Press Release Terkini</h2>
            <p className="text-sm text-slate-400 max-w-xl">
              Simak berita resmi, peluncuran produk, dan perkembangan terbaru dari berbagai brand Indonesia.
            </p>
          </div>

          <Button
            onClick={() => setActiveTab('press-releases')}
            variant="outline"
            size="sm"
            className="gap-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 w-fit"
          >
            <span>Lihat Semua Press Release</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Memuat siaran press release terbaru...</div>
        ) : pressReleases.length === 0 ? (
          <div className="glass-card p-8 rounded-3xl text-center text-slate-400 text-sm">
            Belum ada siaran press release yang dirilis.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pressReleases.map(pr => {
              const ownerProfile = Array.isArray(profiles) ? profiles.find(p => p.id === (pr.owner_id || pr.author_id)) : null;
              const ownerName = ownerProfile?.full_name || pr.author_name || 'Official PR';

              return (
                <div
                  key={pr.id}
                  onClick={() => setActiveTab('press-releases')}
                  className="glass-card p-6 rounded-3xl border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-400 shrink-0" />
                        <span className="font-semibold text-slate-300 truncate max-w-[180px]">{ownerName}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
                        <CalendarBlank className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>
                          {pr.created_at
                            ? new Date(pr.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'Rilis Terbaru'}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                      {pr.title}
                    </h3>

                    <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
                      {pr.content}
                    </p>
                  </div>

                  {Array.isArray(pr.tags) && pr.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                      {pr.tags.slice(0, 3).map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: ALUR KOLABORASI 3 PENGGUNA (UMKM, Influencer, Agency PR)       */}
      {/* ========================================================================= */}
      <section className="space-y-8 pt-6 border-t border-slate-800/80">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20 shadow-sm">
            <Sparkle className="w-4 h-4 text-amber-400" /> Alur kerja & kolaborasi platform
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Cara Mudah Berkolaborasi Sesuai Peran Anda
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Temukan panduan langkah demi langkah untuk memanfaatkan layanan PRoductify secara maksimal, baik sebagai pemilik bisnis UMKM, Kreator Konten/KOL, maupun Agency PR & Jurnalis Media.
          </p>
        </div>

        {/* Dynamic Role Tab Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {/* Tab 1: UMKM & Brand */}
          <button
            onClick={() => setActiveRoleWorkflow('umkm')}
            className={`glass-card p-5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-4 ${
              activeRoleWorkflow === 'umkm'
                ? 'border-purple-500 bg-purple-950/20 shadow-lg glow-purple scale-[1.02]'
                : 'border-slate-800 hover:border-purple-500/40 hover:bg-slate-900/60'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              activeRoleWorkflow === 'umkm' ? 'bg-purple-600 text-white' : 'bg-purple-500/20 text-purple-400'
            }`}>
              <Storefront className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Peran 01</p>
              <h3 className="text-base font-bold text-white">UMKM & Brand</h3>
              <p className="text-[11px] text-slate-400">Promosi produk & kolaborasi KOL</p>
            </div>
          </button>

          {/* Tab 2: Influencer & KOL */}
          <button
            onClick={() => setActiveRoleWorkflow('influencer')}
            className={`glass-card p-5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-4 ${
              activeRoleWorkflow === 'influencer'
                ? 'border-amber-500 bg-amber-950/20 shadow-lg glow-amber scale-[1.02]'
                : 'border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/60'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              activeRoleWorkflow === 'influencer' ? 'bg-amber-600 text-white' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <UsersThree className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Peran 02</p>
              <h3 className="text-base font-bold text-white">Influencer & KOL</h3>
              <p className="text-[11px] text-slate-400">Monetisasi rate card & endorsement</p>
            </div>
          </button>

          {/* Tab 3: Agency PR / Media */}
          <button
            onClick={() => setActiveRoleWorkflow('agency')}
            className={`glass-card p-5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-4 ${
              activeRoleWorkflow === 'agency'
                ? 'border-blue-500 bg-blue-950/20 shadow-lg glow-blue scale-[1.02]'
                : 'border-slate-800 hover:border-blue-500/40 hover:bg-slate-900/60'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              activeRoleWorkflow === 'agency' ? 'bg-blue-600 text-white' : 'bg-blue-500/20 text-blue-400'
            }`}>
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Peran 03</p>
              <h3 className="text-base font-bold text-white">Agency PR & Media</h3>
              <p className="text-[11px] text-slate-400">Publikasi siaran pers & kampanye PR</p>
            </div>
          </button>
        </div>

        {/* 4-Step Cards Grid for Selected Role */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-slate-800 bg-slate-900/40 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full border ${
                activeRoleWorkflow === 'umkm' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                activeRoleWorkflow === 'influencer' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-blue-500/20 text-blue-300 border-blue-500/40'
              }`}>
                Alur Kerja {activeRoleWorkflow === 'umkm' ? 'UMKM / Brand' : activeRoleWorkflow === 'influencer' ? 'Influencer / KOL' : 'Agency PR / Media'}
              </span>
              <h3 className="text-xl font-bold text-white mt-2">
                {activeRoleWorkflow === 'umkm' && '4 Langkah Mudah Promosikan Bisnis & Gaet Influencer'}
                {activeRoleWorkflow === 'influencer' && '4 Langkah Dapatkan Tawaran Endorsement & Monetisasi Profil'}
                {activeRoleWorkflow === 'agency' && '4 Langkah Kelola Publisitas Media & Kampanye Brand'}
              </h3>
            </div>

            {!isAuthenticated && (
              <Button
                onClick={() => setActiveTab('signup')}
                size="sm"
                className={`gap-2 ${
                  activeRoleWorkflow === 'umkm' ? 'bg-purple-600 hover:bg-purple-500' :
                  activeRoleWorkflow === 'influencer' ? 'bg-amber-600 hover:bg-amber-500' :
                  'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                <span>Daftar {activeRoleWorkflow.toUpperCase()} Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(ROLE_WORKFLOWS[activeRoleWorkflow] || ROLE_WORKFLOWS.umkm).map((stepItem, idx) => (
              <div
                key={idx}
                className="glass-card p-5 rounded-2xl border-slate-800/80 bg-slate-950/60 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                      activeRoleWorkflow === 'umkm' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      activeRoleWorkflow === 'influencer' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      0{idx + 1}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Langkah {idx + 1}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {stepItem.title}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {stepItem.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-900 text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Handshake className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">{stepItem.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
