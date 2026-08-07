import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dataService } from '../../lib/supabase';
import { sanitizeInput } from '../../lib/security';
import { compressImageFile } from '../../lib/imageCompressor';
import { Avatar, AvatarFallback } from '../ui/Avatar';
import { 
  User, 
  Envelope, 
  Phone, 
  MapPin, 
  Briefcase, 
  TiktokLogo, 
  InstagramLogo, 
  YoutubeLogo, 
  XLogo, 
  ThreadsLogo, 
  LinkedinLogo, 
  FloppyDisk, 
  Sparkle, 
  CheckCircle,
  Storefront,
  UsersThree,
  Newspaper,
  ShieldCheck,
  PencilSimple,
  UploadSimple,
  Trash
} from '@phosphor-icons/react';

// Exactly 2 default photo template presets: 1 Male (Cowo) and 1 Female (Cewe)
const PRESET_AVATARS = [
  {
    id: 'male',
    label: 'Laki-Laki',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'female',
    label: 'Perempuan',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  }
];

export const formatIndonesianPhone = (input) => {
  if (!input) return '';
  let cleaned = input.replace(/\D/g, '');
  if (cleaned.startsWith('62')) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  cleaned = cleaned.slice(0, 12);
  const part1 = cleaned.slice(0, 3);
  const part2 = cleaned.slice(3, 7);
  const part3 = cleaned.slice(7, 12);
  if (cleaned.length > 7) return `${part1}-${part2}-${part3}`;
  if (cleaned.length > 3) return `${part1}-${part2}`;
  return part1;
};

import { Breadcrumb } from '../ui/Breadcrumb';

export const UserProfileView = ({ setActiveTab }) => {
  const { currentProfile, isAuthenticated, updateCurrentProfile } = useAuth();
  const { toast } = useToast();

  // Per-section edit toggle states
  const [editingSections, setEditingSections] = useState({
    section1: false, // Identitas Utama & Kontak
    section2: false, // Peran RBAC & Bio
    section3: false  // Tautan Media Sosial
  });

  const toggleEditSection = (sectionKey) => {
    setEditingSections(prev => {
      const nextState = !prev[sectionKey];
      if (nextState) {
        toast.info('Mode edit diaktifkan untuk section ini.');
      } else {
        toast.success("Perubahan section diterapkan pada tampilan. Tekan 'Simpan Perubahan' di paling bawah untuk menyimpan ke database.");
      }
      return {
        ...prev,
        [sectionKey]: nextState
      };
    });
  };

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('umkm');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadedImageInfo, setUploadedImageInfo] = useState(null);

  const [bio, setBio] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('Perempuan');
  const [followers, setFollowers] = useState('250k');

  // Social handles
  const [socialTiktok, setSocialTiktok] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialYoutube, setSocialYoutube] = useState('');
  const [socialX, setSocialX] = useState('');
  const [socialThreads, setSocialThreads] = useState('');
  const [socialLinkedin, setSocialLinkedin] = useState('');

  const [saving, setSaving] = useState(false);
  const hasLoadedRef = React.useRef(false);

  const populateFormWithProfile = (profile) => {
    if (!profile) return;
    setFullName(profile.full_name || '');
    setEmail(profile.email || '');
    
    const rawPhone = profile.phone_number || '';
    setPhoneInput(formatIndonesianPhone(rawPhone));

    setAddress(profile.address || '');
    setRole(profile.role || 'umkm');
    
    const initialAvatar = profile.avatar_url || PRESET_AVATARS[1].url;
    setAvatarUrl(initialAvatar);
    if (initialAvatar.startsWith('data:')) {
      setUploadedImageInfo({ name: 'Foto Profil Unggahan', size: 'Data File' });
    } else {
      setUploadedImageInfo(null);
    }

    setBio(profile.bio || '');
    setCategory(profile.category || '');
    setGender(profile.gender || 'Perempuan');
    setFollowers(profile.followers || '250k');

    setSocialTiktok(profile.social_tiktok || '');
    setSocialInstagram(profile.social_instagram || '');
    setSocialYoutube(profile.social_youtube || '');
    setSocialX(profile.social_x || '');
    setSocialThreads(profile.social_threads || '');
    setSocialLinkedin(profile.social_linkedin || '');
  };

  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('Silakan login terlebih dahulu untuk mengakses manajemen profil.');
      if (setActiveTab) setActiveTab('login');
      return;
    }

    if (currentProfile && !hasLoadedRef.current) {
      populateFormWithProfile(currentProfile);
      hasLoadedRef.current = true;
    }
  }, [currentProfile, isAuthenticated, setActiveTab, toast]);

  const handlePhoneChange = (e) => {
    if (!editingSections.section1) return;
    const formatted = formatIndonesianPhone(e.target.value);
    setPhoneInput(formatted);
  };

  // Image Upload Handler
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingSections.section1) return;

    const allowedTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error('Format berkas tidak didukung. Harap unggah berkas gambar bertipe WebP, JPG, JPEG, atau PNG.');
      e.target.value = '';
      return;
    }

    try {
      toast.info('Mengompresi foto profil secara otomatis...');
      const { dataUrl, originalSizeKB, compressedSizeKB } = await compressImageFile(file, 100, 400);

      setAvatarUrl(dataUrl);
      setUploadedImageInfo({
        name: file.name,
        originalSizeKB,
        compressedSizeKB
      });
      toast.success(`Foto profil berhasil diunggah & dikompresi (${originalSizeKB} KB → ${compressedSizeKB} KB)!`);
    } catch (err) {
      console.error('Error compressing avatar:', err);
      toast.error(err.message || 'Gagal mengompresi foto profil. Silakan coba lagi.');
    } finally {
      e.target.value = '';
    }
  };

  // Remove uploaded image handler
  const handleRemoveUploadedPhoto = () => {
    setUploadedImageInfo(null);
    setAvatarUrl(PRESET_AVATARS[1].url);
    toast.info('Foto terunggah dibatalkan. Tampilan unggah berkas gambar dikembalikan.');
  };

  // Check if form data has been modified compared to loaded profile
  const rawCurrentPhone = currentProfile?.phone_number || '';
  const currentPhoneFormatted = formatIndonesianPhone(rawCurrentPhone);

  const isFormChanged = Boolean(
    currentProfile && (
      (fullName || '').trim() !== (currentProfile.full_name || '').trim() ||
      (phoneInput || '').trim() !== currentPhoneFormatted.trim() ||
      (address || '').trim() !== (currentProfile.address || '').trim() ||
      (role || 'umkm') !== (currentProfile.role || 'umkm') ||
      (avatarUrl || '') !== (currentProfile.avatar_url || '') ||
      (bio || '').trim() !== (currentProfile.bio || '').trim() ||
      (category || '') !== (currentProfile.category || '') ||
      (gender || 'Perempuan') !== (currentProfile.gender || 'Perempuan') ||
      (followers || '250k') !== (currentProfile.followers || '250k') ||
      (socialTiktok || '').trim() !== (currentProfile.social_tiktok || '').trim() ||
      (socialInstagram || '').trim() !== (currentProfile.social_instagram || '').trim() ||
      (socialYoutube || '').trim() !== (currentProfile.social_youtube || '').trim() ||
      (socialX || '').trim() !== (currentProfile.social_x || '').trim() ||
      (socialThreads || '').trim() !== (currentProfile.social_threads || '').trim() ||
      (socialLinkedin || '').trim() !== (currentProfile.social_linkedin || '').trim()
    )
  );

  // Is any section currently open in edit mode?
  const isAnySectionEditing = editingSections.section1 || editingSections.section2 || editingSections.section3;

  // The bottom save button is only enabled when data is changed AND no section is actively in edit mode (user pressed "Selesai Edit")
  const isSaveEnabled = isFormChanged && !isAnySectionEditing;

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!isAuthenticated || !currentProfile || !isSaveEnabled) return;

    if (!fullName.trim()) {
      toast.warning('Nama Lengkap tidak boleh kosong.');
      return;
    }

    setSaving(true);

    try {
      const cleanPhoneDigits = phoneInput.replace(/\D/g, '');
      const fullPhoneSubmitted = cleanPhoneDigits ? `+62 ${phoneInput}` : '';

      const profilePayload = {
        id: currentProfile.id,
        full_name: sanitizeInput(fullName),
        email: email,
        phone_number: fullPhoneSubmitted,
        address: sanitizeInput(address),
        role: role,
        avatar_url: avatarUrl,
        bio: sanitizeInput(bio),
        category: sanitizeInput(category),
        gender: gender,
        followers: followers,
        social_tiktok: sanitizeInput(socialTiktok),
        social_instagram: sanitizeInput(socialInstagram),
        social_youtube: sanitizeInput(socialYoutube),
        social_x: sanitizeInput(socialX),
        social_threads: sanitizeInput(socialThreads),
        social_linkedin: sanitizeInput(socialLinkedin),
        rate_cards: currentProfile.rate_cards || []
      };

      // Directly update Supabase database public.profiles table
      const updated = await dataService.updateProfile(currentProfile.id, profilePayload);
      const mergedProfile = { ...currentProfile, ...profilePayload, ...(updated || {}) };
      updateCurrentProfile(mergedProfile);

      // Close all section edit modes after saving
      setEditingSections({ section1: false, section2: false, section3: false });

      toast.success('Data profil berhasil disimpan dan otomatis terupdate di tabel public.profiles!');
    } catch (err) {
      console.error('Failed to update profile to public.profiles:', err);
      toast.error(err.message || 'Gagal menyimpan perubahan profil ke database.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) return null;

  const roleLabels = {
    umkm: { label: 'UMKM / Brand', icon: Storefront, badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    influencer: { label: 'Influencer', icon: UsersThree, badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    agency: { label: 'Agency', icon: Newspaper, badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    admin: { label: 'Admin', icon: ShieldCheck, badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' }
  };

  const currentRoleInfo = roleLabels[role] || roleLabels.umkm;
  const RoleIcon = currentRoleInfo.icon;

  const hasUploadedPhoto = Boolean(uploadedImageInfo || avatarUrl.startsWith('data:'));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Breadcrumb Navigation */}
      <div>
        <Breadcrumb items={[{ label: 'Manajemen Profil Saya', icon: User }]} setActiveTab={setActiveTab} />
      </div>

      {/* Header Profile Banner */}
      <div className="glass-card p-8 rounded-3xl border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10 text-center sm:text-left">
          {/* Avatar Preview */}
          <div className="relative group shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
                className="w-24 h-24 rounded-3xl object-cover border-2 border-purple-500/40 shadow-xl"
              />
            ) : null}
            <Avatar
              className="w-24 h-24 border-2 border-purple-500/40 bg-purple-500/10 text-purple-300 font-black text-2xl shadow-xl"
              style={{ display: avatarUrl ? 'none' : 'flex' }}
            >
              <AvatarFallback>{(fullName || 'User').substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-purple-600 text-white shadow-md">
              <Sparkle className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border ${currentRoleInfo.badge}`}>
                <RoleIcon className="w-3.5 h-3.5" />
                <span>{currentRoleInfo.label}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">{fullName || 'Profil Pengguna'}</h1>
            <p className="text-xs text-slate-400 max-w-md">
              {email || 'Kelola identitas akun, informasi kontak, peran RBAC, serta tautan media sosial Anda.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* SECTION 1: Identitas Utama & Kontak */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" /> Identitas Utama & Kontak
              </h2>
              <p className="text-xs text-slate-400">
                Informasi dasar profil akun yang terhubung dengan tabel public.profiles.
              </p>
            </div>

            {/* Per-Section Edit / Selesai Edit Button */}
            <button
              type="button"
              onClick={() => toggleEditSection('section1')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                editingSections.section1
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20'
              }`}
            >
              {editingSections.section1 ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Selesai Edit</span>
                </>
              ) : (
                <>
                  <PencilSimple className="w-4 h-4 text-purple-400" />
                  <span>Edit Section</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Lengkap / Nama Bisnis</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  disabled={!editingSections.section1}
                  placeholder="Masukan nama lengkap Anda..."
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-colors ${
                    !editingSections.section1
                      ? 'bg-slate-950 border border-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500'
                  }`}
                />
              </div>
            </div>

            {/* Email (Read-Only Registered Email) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Alamat Email (Terdaftar)</label>
              <div className="relative">
                <Envelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  readOnly
                  disabled
                  value={email}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Nomor Telepon (+62 Badge) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nomor Telepon (WhatsApp)</label>
              <div className={`flex items-center rounded-xl overflow-hidden transition-colors ${
                !editingSections.section1
                  ? 'bg-slate-950 border border-slate-800'
                  : 'bg-slate-900 border border-slate-700 focus-within:border-purple-500'
              }`}>
                <div className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-800/80 border-r border-slate-700 text-xs font-bold text-slate-300 shrink-0">
                  <Phone className="w-4 h-4 text-purple-400" />
                  <span>+62</span>
                </div>
                <input
                  type="text"
                  disabled={!editingSections.section1}
                  placeholder="821-4062-7334"
                  value={phoneInput}
                  onChange={handlePhoneChange}
                  className={`w-full px-3 py-2.5 text-sm bg-transparent focus:outline-none ${
                    !editingSections.section1 ? 'text-slate-400 cursor-not-allowed' : 'text-white'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Otomatis terformat 3-4-4 digit (contoh: 821-4062-7334)</p>
            </div>

            {/* Alamat / Domisili */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Alamat / Kota Domisili</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  disabled={!editingSections.section1}
                  placeholder="Contoh: Jakarta Selatan, DKI Jakarta"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-colors ${
                    !editingSections.section1
                      ? 'bg-slate-950 border border-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Profile Picture Upload & Preset Selection Area */}
          <div className="space-y-4 pt-4 border-t border-slate-800/80">
            <label className="block text-xs font-semibold text-slate-300">Foto Profil (Unggah Berkas atau Pilih Template Default)</label>
            
            {hasUploadedPhoto ? (
              /* Preview Card of Uploaded Image (Hides Dropzone input) */
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/40 flex items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={avatarUrl}
                    alt="Foto profil terunggah"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/50 shadow-md shrink-0 bg-slate-950"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ✓ Foto Terunggah
                      </span>
                      {uploadedImageInfo?.compressedSizeKB && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({uploadedImageInfo.compressedSizeKB} KB)
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-white truncate">
                      {uploadedImageInfo?.name || 'Berkas Foto Profil Custom'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Foto ini akan disimpan sebagai foto profil Anda saat menekan Simpan Perubahan.
                    </p>
                  </div>
                </div>

                {/* Hapus Foto Button */}
                {editingSections.section1 && (
                  <button
                    type="button"
                    onClick={handleRemoveUploadedPhoto}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-bold transition-all cursor-pointer shrink-0"
                    title="Hapus / Batal Unggah Foto"
                  >
                    <Trash className="w-4 h-4 text-rose-400" />
                    <span>Hapus Foto</span>
                  </button>
                )}
              </div>
            ) : (
              /* File Upload Dropzone (Displayed when NO uploaded photo exists) */
              <div className={`p-5 rounded-2xl bg-slate-900/90 border border-dashed transition-all text-center space-y-2.5 ${
                !editingSections.section1 
                  ? 'border-slate-800 opacity-60 cursor-not-allowed' 
                  : 'border-purple-500/40 hover:border-purple-500 cursor-pointer bg-slate-900'
              }`}>
                <UploadSimple className={`w-8 h-8 mx-auto ${!editingSections.section1 ? 'text-slate-600' : 'text-purple-400 animate-bounce'}`} />
                <div className="text-xs text-slate-300">
                  {editingSections.section1 ? (
                    <label htmlFor="avatar-file-upload" className="font-extrabold text-purple-400 hover:text-purple-300 cursor-pointer underline mr-1">
                      Pilih & Unggah Berkas Foto Profil
                    </label>
                  ) : (
                    <span className="font-extrabold text-slate-500 mr-1">Unggah Berkas Foto Profil (Aktifkan Edit Section)</span>
                  )}
                  <span>dari perangkat Anda</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Format: <strong>WebP, PNG, JPG</strong> • <strong className="text-emerald-400">✨ Auto-Kompresi System</strong>
                </p>
                <input
                  id="avatar-file-upload"
                  type="file"
                  disabled={!editingSections.section1}
                  accept="image/webp, image/jpeg, image/jpg, image/png"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Exactly 2 Preset Avatars: 1 Male (Cowo) and 1 Female (Cewe) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRESET_AVATARS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  disabled={!editingSections.section1}
                  onClick={() => {
                    setUploadedImageInfo(null);
                    setAvatarUrl(preset.url);
                  }}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-3.5 ${
                    !editingSections.section1 ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:border-purple-400'
                  } ${
                    avatarUrl === preset.url
                      ? 'border-purple-500 bg-purple-950/30 ring-2 ring-purple-500/50'
                      : 'border-slate-800 bg-slate-900/60'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-12 h-12 rounded-xl object-cover border border-purple-500/30 shrink-0" />
                  <div className="text-left flex-1">
                    <p className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{preset.label}</span>
                      {avatarUrl === preset.url && <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />}
                    </p>
                    <p className="text-[11px] text-slate-400">Template Foto Resmi</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: Peran RBAC & Bio */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-400" /> Peran RBAC & Deskripsi Profil
              </h2>
              <p className="text-xs text-slate-400">
                Opsi peran akun utama Anda yang tersimpan di public.profiles.
              </p>
            </div>

            {/* Per-Section Edit / Selesai Edit Button */}
            <button
              type="button"
              onClick={() => toggleEditSection('section2')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                editingSections.section2
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              {editingSections.section2 ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Selesai Edit</span>
                </>
              ) : (
                <>
                  <PencilSimple className="w-4 h-4 text-amber-400" />
                  <span>Edit Section</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Peran UMKM (Permanently Locked) */}
            <button
              type="button"
              disabled={true}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-not-allowed opacity-80 ${
                role === 'umkm'
                  ? 'border-purple-500 bg-purple-950/30 ring-1 ring-purple-500'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <Storefront className={`w-6 h-6 ${role === 'umkm' ? 'text-purple-400' : 'text-slate-400'}`} />
                {role === 'umkm' && <CheckCircle className="w-5 h-5 text-purple-400" />}
              </div>
              <div>
                <p className="text-sm font-bold text-white flex items-center justify-between">
                  <span>UMKM / Brand</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Terkunci</span>
                </p>
                <p className="text-[11px] text-slate-400">Pemilik Usaha & Startup</p>
              </div>
            </button>

            {/* Peran Influencer (Permanently Locked) */}
            <button
              type="button"
              disabled={true}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-not-allowed opacity-80 ${
                role === 'influencer'
                  ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <UsersThree className={`w-6 h-6 ${role === 'influencer' ? 'text-amber-400' : 'text-slate-400'}`} />
                {role === 'influencer' && <CheckCircle className="w-5 h-5 text-amber-400" />}
              </div>
              <div>
                <p className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Influencer</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Terkunci</span>
                </p>
                <p className="text-[11px] text-slate-400">Content Creator & KOL</p>
              </div>
            </button>

            {/* Peran Agency (Permanently Locked) */}
            <button
              type="button"
              disabled={true}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-not-allowed opacity-80 ${
                role === 'agency'
                  ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <Newspaper className={`w-6 h-6 ${role === 'agency' ? 'text-blue-400' : 'text-slate-400'}`} />
                {role === 'agency' && <CheckCircle className="w-5 h-5 text-blue-400" />}
              </div>
              <div>
                <p className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Agency</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Terkunci</span>
                </p>
                <p className="text-[11px] text-slate-400">Agensi PR & Jurnalis Media</p>
              </div>
            </button>
          </div>

          {/* Opsi Tambahan untuk Influencer */}
          {role === 'influencer' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">Kategori Spesialisasi</label>
                <select
                  disabled={!editingSections.section2}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs ${
                    !editingSections.section2
                      ? 'bg-slate-950 border border-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500'
                  }`}
                >
                  <option value="">-- Pilih Kategori --</option>
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
                <label className="block text-xs font-semibold text-amber-300 mb-1">Jenis Kelamin (Terkunci)</label>
                <select
                  disabled={true}
                  value={gender}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-slate-400 cursor-not-allowed"
                >
                  <option value="Perempuan">Perempuan</option>
                  <option value="Laki-Laki">Laki-Laki</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">Estimasi Total Followers</label>
                <input
                  type="text"
                  disabled={!editingSections.section2}
                  placeholder="Contoh: 250k"
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs ${
                    !editingSections.section2
                      ? 'bg-slate-950 border border-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Bio / Deskripsi Profil */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bio / Deskripsi Profil Ringkas</label>
            <textarea
              rows={4}
              disabled={!editingSections.section2}
              placeholder="Tuliskan gambaran singkat mengenai brand Anda, spesialisasi konten, atau pencapaian usaha..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl text-sm resize-none transition-colors ${
                !editingSections.section2
                  ? 'bg-slate-950 border border-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500'
              }`}
            />
          </div>
        </div>

        {/* SECTION 3: Media Sosial */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TiktokLogo className="w-5 h-5 text-indigo-400" /> Tautan Media Sosial Resmi
              </h2>
              <p className="text-xs text-slate-400">
                Tautan media sosial resmi yang tersimpan di public.profiles.
              </p>
            </div>

            {/* Per-Section Edit / Selesai Edit Button */}
            <button
              type="button"
              onClick={() => toggleEditSection('section3')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                editingSections.section3
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20'
              }`}
            >
              {editingSections.section3 ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Selesai Edit</span>
                </>
              ) : (
                <>
                  <PencilSimple className="w-4 h-4 text-blue-400" />
                  <span>Edit Section</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TikTok */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <TiktokLogo className="w-4 h-4 text-white" /> TikTok Username
              </label>
              <input
                type="text"
                disabled={!editingSections.section3}
                placeholder="@username_tiktok"
                value={socialTiktok}
                onChange={(e) => setSocialTiktok(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  !editingSections.section3
                    ? 'bg-slate-950 border border-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500'
                }`}
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <InstagramLogo className="w-4 h-4 text-pink-400" /> Instagram Username
              </label>
              <input
                type="text"
                disabled={!editingSections.section3}
                placeholder="@username_instagram"
                value={socialInstagram}
                onChange={(e) => setSocialInstagram(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  !editingSections.section3
                    ? 'bg-slate-950 border border-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500'
                }`}
              />
            </div>

            {/* YouTube */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <YoutubeLogo className="w-4 h-4 text-red-500" /> YouTube Channel
              </label>
              <input
                type="text"
                disabled={!editingSections.section3}
                placeholder="Nama Channel YouTube"
                value={socialYoutube}
                onChange={(e) => setSocialYoutube(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  !editingSections.section3
                    ? 'bg-slate-950 border border-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500'
                }`}
              />
            </div>

            {/* X (Twitter) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <XLogo className="w-4 h-4 text-white" /> X (Twitter) Username
              </label>
              <input
                type="text"
                disabled={!editingSections.section3}
                placeholder="@username_x"
                value={socialX}
                onChange={(e) => setSocialX(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  !editingSections.section3
                    ? 'bg-slate-950 border border-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500'
                }`}
              />
            </div>

            {/* Threads */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ThreadsLogo className="w-4 h-4 text-white" /> Threads Username
              </label>
              <input
                type="text"
                disabled={!editingSections.section3}
                placeholder="@username_threads"
                value={socialThreads}
                onChange={(e) => setSocialThreads(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  !editingSections.section3
                    ? 'bg-slate-950 border border-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500'
                }`}
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <LinkedinLogo className="w-4 h-4 text-blue-400" /> LinkedIn Profile
              </label>
              <input
                type="text"
                disabled={!editingSections.section3}
                placeholder="URL atau nama profil LinkedIn"
                value={socialLinkedin}
                onChange={(e) => setSocialLinkedin(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  !editingSections.section3
                    ? 'bg-slate-950 border border-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Sole Bottom CTA Save Button Representing All Sections */}
        <div className="flex flex-col items-end gap-2 pt-2">
          <button
            type="submit"
            disabled={saving || !isSaveEnabled}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all ${
              saving || !isSaveEnabled
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60 shadow-none'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-emerald-500/25 hover:scale-105 cursor-pointer'
            }`}
          >
            <FloppyDisk className="w-5 h-5" />
            <span>
              {saving 
                ? 'Menyimpan ke Database...' 
                : isAnySectionEditing && isFormChanged
                  ? 'Selesaikan Edit Section Terlebih Dahulu'
                  : !isFormChanged 
                    ? 'Tidak Ada Perubahan' 
                    : 'Simpan Perubahan (Tabel public.profiles)'}
            </span>
          </button>

          {isAnySectionEditing && isFormChanged && (
            <p className="text-[11px] font-medium text-amber-400/90 animate-pulse">
              * Harap tekan tombol &quot;Selesai Edit&quot; pada section terlebih dahulu untuk mengaktifkan tombol simpan.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
