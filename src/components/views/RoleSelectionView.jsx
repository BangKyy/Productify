import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { 
  Storefront, 
  UsersThree, 
  Newspaper, 
  CheckCircle, 
  ArrowRight, 
  Sparkle,
  Phone,
  MapPin,
  FileText,
  Plus,
  Trash,
  TiktokLogo,
  InstagramLogo,
  YoutubeLogo,
  XLogo,
  ThreadsLogo,
  LinkedinLogo
} from '@phosphor-icons/react';

const ROLE_CARDS = [
  {
    id: 'umkm',
    title: 'UMKM / Brand Owner',
    subtitle: 'Pemilik Usaha Mikro, Kecil, Menengah & Startup',
    description: 'Publikasikan siaran pers produk, tampilkan showcase produk profesional, dan cari influencer KOL untuk promosi brand.',
    bg: 'border-purple-500/40 hover:border-purple-500 bg-purple-500/10',
    selectedBg: 'bg-purple-600/30 border-purple-400 ring-2 ring-purple-500',
    icon: Storefront,
    color: 'text-purple-400'
  },
  {
    id: 'influencer',
    title: 'Influencer / KOL',
    subtitle: 'Content Creator, Beauty/Lifestyle Blogger & KOL',
    description: 'Tampilkan portofolio rate card, terima tawaran endorsement dari brand UMKM, dan kelola proyek kolaborasi.',
    bg: 'border-amber-500/40 hover:border-amber-500 bg-amber-500/10',
    selectedBg: 'bg-amber-600/30 border-amber-400 ring-2 ring-amber-500',
    icon: UsersThree,
    color: 'text-amber-400'
  },
  {
    id: 'agency',
    title: 'Agency PR / Media',
    subtitle: 'Agensi Public Relations & Jurnalis Berita',
    description: 'Akses direktori press release UMKM nasional, fasilitasi pendampingan publikasi, dan terbitkan artikel PR.',
    bg: 'border-blue-500/40 hover:border-blue-500 bg-blue-500/10',
    selectedBg: 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-500',
    icon: Newspaper,
    color: 'text-blue-400'
  }
];

export const RoleSelectionView = ({ setActiveTab }) => {
  const { pendingUser, completeRoleOnboarding } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState('umkm');
  const [bio, setBio] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // KOL Specific Profile Fields
  const [category, setCategory] = useState('Beauty & Skincare');
  const [gender, setGender] = useState('female');
  const [followers, setFollowers] = useState('250k');
  const [socialTiktok, setSocialTiktok] = useState('');
  const [socialYoutube, setSocialYoutube] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialX, setSocialX] = useState('');
  const [socialThreads, setSocialThreads] = useState('');
  const [socialLinkedin, setSocialLinkedin] = useState('');

  const [rateCards, setRateCards] = useState([
    { service: 'TikTok Video Review', price: '2500000' },
    { service: 'Instagram Reels / Feed', price: '3500000' }
  ]);

  const handleAddRateCard = () => {
    setRateCards([...rateCards, { service: 'YouTube Dedicated Review', price: '5000000' }]);
  };

  const handleRemoveRateCard = (index) => {
    setRateCards(rateCards.filter((_, i) => i !== index));
  };

  const handleRateCardChange = (index, field, value) => {
    const updated = [...rateCards];
    updated[index][field] = value;
    setRateCards(updated);
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await completeRoleOnboarding({
        role: selectedRole,
        bio: bio || `Profil resmi ${selectedRole.toUpperCase()} di platform PRoductify.`,
        phoneNumber: phoneNumber || '+62 812-3456-7890',
        phone_number: phoneNumber || '+62 812-3456-7890',
        address: address || 'Jakarta, Indonesia',
        category: selectedRole === 'influencer' ? category : '',
        gender: selectedRole === 'influencer' ? gender : 'female',
        followers: selectedRole === 'influencer' ? followers : '250k',
        social_tiktok: selectedRole === 'influencer' ? socialTiktok : '',
        social_youtube: selectedRole === 'influencer' ? socialYoutube : '',
        social_instagram: selectedRole === 'influencer' ? socialInstagram : '',
        social_x: selectedRole === 'influencer' ? socialX : '',
        social_threads: selectedRole === 'influencer' ? socialThreads : '',
        social_linkedin: selectedRole === 'influencer' ? socialLinkedin : '',
        rate_cards: selectedRole === 'influencer' ? rateCards.map(rc => ({ service: rc.service, price: Number(rc.price) || 0 })) : []
      });
      toast.success(`Profil ${selectedRole.toUpperCase()} Anda berhasil disimpan!`);
      setActiveTab('overview');
    } catch (err) {
      console.error('Error completing onboarding:', err);
      toast.error(err.message || 'Gagal menyimpan profil ke database.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* Onboarding Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
          <Sparkle weight="fill" className="w-4 h-4 text-purple-400" />
          <span>Langkah 2 dari 2: Pilih Peran Akun Pengguna</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Selamat Datang, <span className="text-gradient">{pendingUser?.full_name || 'Pengguna Baru'}</span>!
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Pilih peran utama Anda dalam ekosistem PRoductify. Data Anda akan disimpan ke tabel <code className="text-purple-300 bg-slate-800 px-2 py-0.5 rounded">public.profiles</code> Supabase.
        </p>
      </div>

      <form onSubmit={handleComplete} className="space-y-8">
        
        {/* Role Selection Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROLE_CARDS.map(card => {
            const Icon = card.icon;
            const isSelected = selectedRole === card.id;

            return (
              <div
                key={card.id}
                onClick={() => setSelectedRole(card.id)}
                className={`glass-card p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 relative ${
                  isSelected ? card.selectedBg : card.bg
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700 flex items-center justify-center ${card.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs font-bold text-white bg-purple-600 px-3 py-1 rounded-full shadow">
                        <CheckCircle className="w-4 h-4" /> Dipilih
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-white">{card.title}</h3>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{card.subtitle}</p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Profile Info Section */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white">Lengkapi Informasi Profil ({selectedRole.toUpperCase()})</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nomor Telepon / WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="+62 812-3456-7890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kota / Lokasi Domisili</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Jakarta Selatan, Indonesia"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Jenis Kelamin (Gender) <span className="text-purple-400">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="female">Wanita (Female)</option>
                <option value="male">Pria (Male)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bio Ringkas / Deskripsi Perusahaan</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <textarea
                rows={3}
                placeholder="Tuliskan deskripsi singkat mengenai usaha atau portofolio Anda..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* KOL / Influencer Specific Profile Section */}
        {selectedRole === 'influencer' && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border-amber-500/40 bg-amber-950/10 space-y-6 animate-fade-in">
            <div className="space-y-1 border-b border-amber-500/20 pb-4">
              <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                <Sparkle className="w-5 h-5 text-amber-400" />
                Spesialisasi Kategori KOL, Media Sosial & Rate Card
              </h3>
              <p className="text-xs text-slate-400">
                Lengkapi spesialisasi kategori, tautan akun media sosial, serta rincian jenis layanan & harganya agar terlihat menarik di Marketplace KOL.
              </p>
            </div>

            {/* 1. Dropdown Kategori KOL, Gender & Followers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-amber-200 mb-1.5">
                  Kategori Spesialisasi KOL <span className="text-rose-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Beauty & Skincare">Beauty & Skincare</option>
                  <option value="Fashion & Lifestyle">Fashion & Lifestyle</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Tech & Gadgets">Tech & Gadgets</option>
                  <option value="Fitness & Health">Fitness & Health</option>
                  <option value="Travel & Gaming">Travel & Gaming</option>
                  <option value="Parenting & Family">Parenting & Family</option>
                  <option value="Education & Finance">Education & Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-200 mb-1.5">
                  Jenis Kelamin (Gender) <span className="text-rose-400">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="female">Wanita (Female)</option>
                  <option value="male">Pria (Male)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-200 mb-1.5">
                  Estimasi Total Followers (Audience)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 250k / 1.5M"
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* 2. Input Akun Media Sosial */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-amber-200">
                Input Akun Media Sosial Utama (Username / URL Handle)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 mb-1">
                    <TiktokLogo className="w-3.5 h-3.5 text-white" weight="fill" /> TikTok
                  </label>
                  <input
                    type="text"
                    placeholder="@username_tiktok"
                    value={socialTiktok}
                    onChange={(e) => setSocialTiktok(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 mb-1">
                    <YoutubeLogo className="w-3.5 h-3.5 text-red-500" weight="fill" /> YouTube
                  </label>
                  <input
                    type="text"
                    placeholder="@channel_youtube"
                    value={socialYoutube}
                    onChange={(e) => setSocialYoutube(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 mb-1">
                    <InstagramLogo className="w-3.5 h-3.5 text-pink-400" weight="fill" /> Instagram
                  </label>
                  <input
                    type="text"
                    placeholder="@username_ig"
                    value={socialInstagram}
                    onChange={(e) => setSocialInstagram(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 mb-1">
                    <XLogo className="w-3.5 h-3.5 text-white" weight="bold" /> X (Twitter)
                  </label>
                  <input
                    type="text"
                    placeholder="@username_x"
                    value={socialX}
                    onChange={(e) => setSocialX(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 mb-1">
                    <ThreadsLogo className="w-3.5 h-3.5 text-white" weight="fill" /> Threads
                  </label>
                  <input
                    type="text"
                    placeholder="@username_threads"
                    value={socialThreads}
                    onChange={(e) => setSocialThreads(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 mb-1">
                    <LinkedinLogo className="w-3.5 h-3.5 text-blue-400" weight="fill" /> LinkedIn
                  </label>
                  <input
                    type="text"
                    placeholder="in/username_linkedin"
                    value={socialLinkedin}
                    onChange={(e) => setSocialLinkedin(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. Kategori Rate Card & Harga */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-amber-200">
                  Daftar Kategori Rate Card (Jenis Layanan & Harga IDR)
                </label>
                <button
                  type="button"
                  onClick={handleAddRateCard}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Layanan</span>
                </button>
              </div>

              <div className="space-y-2">
                {rateCards.map((rc, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <input
                      type="text"
                      placeholder="Jenis Layanan (misal: TikTok Video Review)"
                      value={rc.service}
                      onChange={(e) => handleRateCardChange(idx, 'service', e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <div className="w-36 relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">Rp</span>
                      <input
                        type="number"
                        placeholder="2500000"
                        value={rc.price}
                        onChange={(e) => handleRateCardChange(idx, 'price', e.target.value)}
                        className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    {rateCards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRateCard(idx)}
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                        title="Hapus Rate Card"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Submit Onboarding Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={submitting}
            size="lg"
            className="glow-purple px-8"
          >
            <span>{submitting ? 'Menyimpan ke Supabase...' : 'Simpan Profil & Masuk ke Dashboard'}</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

      </form>

    </div>
  );
};
