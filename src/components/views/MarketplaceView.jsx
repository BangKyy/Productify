import React, { useState, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { Breadcrumb } from '../ui/Breadcrumb';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dataService } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Avatar, AvatarFallback } from '../ui/Avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { BottomSheetSelect } from '../ui/BottomSheetSelect';
import { 
  UsersThree, 
  MagnifyingGlass, 
  Handshake, 
  Sparkle, 
  MapPin,
  User,
  Funnel,
  ArrowsDownUp,
  ArrowCounterClockwise,
  SlidersHorizontal,
  GenderFemale,
  GenderMale,
  TiktokLogo,
  InstagramLogo,
  YoutubeLogo,
  XLogo,
  ThreadsLogo,
  LinkedinLogo,
  ArrowLeft,
  Phone,
  Envelope,
  CurrencyCircleDollar,
  Tag,
  Check,
  Star
} from '@phosphor-icons/react';

export const slugifyName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const SORT_OPTIONS = [
  { value: 'DEFAULT', label: 'Terbaru (Default)' },
  { value: 'NAME_ASC', label: 'Nama (A - Z)' },
  { value: 'NAME_DESC', label: 'Nama (Z - A)' },
  { value: 'PRICE_DESC', label: 'Harga (Tertinggi)' },
  { value: 'PRICE_ASC', label: 'Harga (Terendah)' },
];

const FOLLOWERS_OPTIONS = [
  { value: 'ALL', label: 'Semua Followers' },
  { value: 'UNDER_50K', label: 'Micro (< 50k)' },
  { value: '50K_250K', label: 'Mid-Tier (50k - 250k)' },
  { value: 'OVER_250K', label: 'Macro / Mega (> 250k)' },
];

const PLATFORM_OPTIONS_FILTER = [
  { value: 'ALL', label: 'Semua Platform' },
  { value: 'tiktok', label: 'TikTok', icon: TiktokLogo, iconColor: 'text-white' },
  { value: 'instagram', label: 'Instagram', icon: InstagramLogo, iconColor: 'text-pink-400' },
  { value: 'youtube', label: 'YouTube', icon: YoutubeLogo, iconColor: 'text-red-500' },
  { value: 'x', label: 'X (Twitter)', icon: XLogo, iconColor: 'text-white' },
  { value: 'threads', label: 'Threads', icon: ThreadsLogo, iconColor: 'text-white' },
  { value: 'linkedin', label: 'LinkedIn', icon: LinkedinLogo, iconColor: 'text-blue-400' },
];

const GENDER_OPTIONS = [
  { value: 'ALL', label: 'Semua Gender' },
  { value: 'Perempuan', label: 'Perempuan', icon: GenderFemale, iconColor: 'text-rose-400' },
  { value: 'Laki-Laki', label: 'Laki-Laki', icon: GenderMale, iconColor: 'text-blue-400' },
];

const CAMPAIGN_OBJECTIVE_OPTIONS = [
  { value: 'Brand Awareness', label: 'Brand Awareness (meningkatkan visibilitas brand)' },
  { value: 'Product Launch', label: 'Product Launch (peluncuran produk baru)' },
  { value: 'Conversion/Sales', label: 'Conversion / Sales (meningkatkan penjualan)' },
  { value: 'Community Building', label: 'Community Building (membangun komunitas)' },
  { value: 'Event Promotion', label: 'Event Promotion (promosi acara)' },
  { value: 'Review/Testimoni', label: 'Review / Testimoni produk' },
  { value: 'Lainnya', label: 'Lainnya' },
];

const CONTENT_TYPE_OPTIONS = [
  { value: 'Video Pendek (Reels/TikTok)', label: 'Video Pendek (Reels / TikTok)' },
  { value: 'Video Panjang (YouTube)', label: 'Video Panjang (YouTube)' },
  { value: 'Foto + Caption', label: 'Foto + Caption' },
  { value: 'Story', label: 'Story (IG / TikTok Story)' },
  { value: 'Live Streaming', label: 'Live Streaming' },
  { value: 'Review Artikel / Thread', label: 'Review Artikel / Thread' },
  { value: 'Kombinasi', label: 'Kombinasi beberapa format' },
];

const TIMELINE_OPTIONS = [
  { value: 'Kurang dari 1 minggu', label: 'Kurang dari 1 minggu' },
  { value: '1–2 minggu', label: '1–2 minggu' },
  { value: '1 bulan', label: '1 bulan' },
  { value: '2–3 bulan', label: '2–3 bulan' },
  { value: 'Lebih dari 3 bulan', label: 'Lebih dari 3 bulan' },
  { value: 'Fleksibel', label: 'Fleksibel / Diskusi lebih lanjut' },
];

const BUDGET_RANGE_OPTIONS = [
  { value: 'Di bawah Rp 1 Juta', label: 'Di bawah Rp 1 Juta' },
  { value: 'Rp 1 – 5 Juta', label: 'Rp 1 – 5 Juta' },
  { value: 'Rp 5 – 15 Juta', label: 'Rp 5 – 15 Juta' },
  { value: 'Rp 15 – 50 Juta', label: 'Rp 15 – 50 Juta' },
  { value: 'Di atas Rp 50 Juta', label: 'Di atas Rp 50 Juta' },
  { value: 'Diskusi lebih lanjut', label: 'Diskusi lebih lanjut' },
];

export const MarketplaceView = ({ activeTab, setActiveTab }) => {
  const { currentProfile, currentRole, isAuthenticated, profiles } = useAuth();
  const { toast } = useToast();
  const [influencers, setInfluencers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Sort & Filter state
  const [sortBy, setSortBy] = useState('DEFAULT'); // 'DEFAULT' | 'NAME_ASC' | 'NAME_DESC' | 'PRICE_DESC' | 'PRICE_ASC'
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCity, setFilterCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterFollowers, setFilterFollowers] = useState('ALL'); // 'ALL' | 'UNDER_50K' | '50K_250K' | 'OVER_250K'
  const [filterPlatform, setFilterPlatform] = useState('ALL'); // 'ALL' | 'tiktok' | 'instagram' | 'youtube' | 'x' | 'threads' | 'linkedin'
  const [filterGender, setFilterGender] = useState('ALL'); // 'ALL' | 'female' | 'male'

  // Proposal Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [formData, setFormData] = useState({
    project_title: '',
    budget: '3500000',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Rate Card Request Dialog State
  const [rateCardDialogOpen, setRateCardDialogOpen] = useState(false);
  const [rateCardTarget, setRateCardTarget] = useState(null); // influencer being requested
  const [rateCardForm, setRateCardForm] = useState({
    brand_name: '',
    product_name: '',
    campaign_objective: '',
    platforms: [],
    content_type: '',
    target_audience: '',
    timeline: '',
    budget_range: '',
    notes: ''
  });
  const [rateCardSubmitting, setRateCardSubmitting] = useState(false);

  // KOL Detail Page state
  const [selectedKOL, setSelectedKOL] = useState(null);

  const [allCollaborations, setAllCollaborations] = useState([]);

  useEffect(() => {
    const loadCollaborations = async () => {
      try {
        const collabs = await dataService.getCollaborations();
        setAllCollaborations(Array.isArray(collabs) ? collabs : []);
      } catch (err) {
        console.warn('Failed to fetch collaborations for count:', err);
      }
    };
    loadCollaborations();
  }, []);

  // Deduplicate raw influencers list by full_name / email / id
  const rawInfluencers = useMemo(() => {
    const safeProfiles = Array.isArray(profiles) ? profiles : [];
    const sourceList = (influencers && influencers.length > 0) ? influencers : safeProfiles.filter(p => p && (p.role === 'influencer' || p.role === 'KOL'));

    const map = new Map();
    sourceList.forEach(inf => {
      if (inf && (inf.full_name || inf.email || inf.id)) {
        const cleanName = (inf.full_name || '').toString().toLowerCase().trim();
        const cleanEmail = (inf.email || '').toString().toLowerCase().trim();
        const key = cleanName ? `name:${cleanName}` : (cleanEmail ? `email:${cleanEmail}` : `id:${inf.id}`);

        if (!map.has(key)) {
          map.set(key, inf);
        } else {
          const prev = map.get(key);
          map.set(key, {
            ...prev,
            ...inf,
            bio: inf.bio || prev.bio,
            phone_number: inf.phone_number || prev.phone_number,
            address: inf.address || prev.address,
            category: inf.category || prev.category,
            gender: inf.gender || prev.gender,
            social_tiktok: inf.social_tiktok || prev.social_tiktok,
            social_instagram: inf.social_instagram || prev.social_instagram,
            social_youtube: inf.social_youtube || prev.social_youtube,
            rate_cards: (Array.isArray(inf.rate_cards) && inf.rate_cards.length > 0) ? inf.rate_cards : prev.rate_cards
          });
        }
      }
    });
    return Array.from(map.values());
  }, [influencers, profiles]);

  useEffect(() => {
    if (activeTab && activeTab.startsWith('influencer/detail/')) {
      const slug = activeTab.replace('influencer/detail/', '');
      const match = rawInfluencers.find(inf => slugifyName(inf.full_name) === slug);
      if (match) {
        setSelectedKOL(match);
      }
    } else if (activeTab === 'influencer' || activeTab === 'marketplace') {
      setSelectedKOL(null);
    }
  }, [activeTab, rawInfluencers]);

  const handleOpenDetail = (inf) => {
    const slug = slugifyName(inf.full_name);
    if (setActiveTab) {
      setActiveTab(`influencer/detail/${slug}`);
    } else {
      setSelectedKOL(inf);
    }
  };

  const handleBackToDirectory = () => {
    if (setActiveTab) {
      setActiveTab('influencer');
    }
    setSelectedKOL(null);
  };

  const getInfluencerCollabCount = (infId) => {
    if (!infId || !Array.isArray(allCollaborations)) return 0;
    return allCollaborations.filter(c => c && c.influencer_id === infId && c.status !== 'rejected').length;
  };

  const formatIndonesianCurrencyShort = (amount) => {
    const num = Number(amount) || 0;
    if (num <= 0) return 'Mulai dari Rp 1 Juta';

    if (num >= 1000000) {
      const millions = num / 1000000;
      const formatted = Number(millions.toFixed(2)).toString();
      return `Mulai dari Rp ${formatted} Juta`;
    }

    if (num >= 1000) {
      const thousands = num / 1000;
      const formatted = Number(thousands.toFixed(2)).toString();
      return `Mulai dari Rp ${formatted} Ribu`;
    }

    return `Mulai dari Rp ${num.toLocaleString('id-ID')}`;
  };

  const formatStartingPrice = (inf) => {
    if (Array.isArray(inf.rate_cards) && inf.rate_cards.length > 0) {
      const prices = inf.rate_cards.map(rc => Number(rc.price) || 0).filter(p => p > 0);
      if (prices.length > 0) {
        const minP = Math.min(...prices);
        return formatIndonesianCurrencyShort(minP);
      }
    }
    return 'Mulai dari Rp 1 Juta';
  };

  useEffect(() => {
    const safeProfiles = Array.isArray(profiles) ? profiles : [];
    const uniqueMap = new Map();

    safeProfiles.forEach(p => {
      if (p && (p.role === 'influencer' || p.role === 'KOL')) {
        const cleanName = (p.full_name || '').toString().toLowerCase().trim();
        const cleanEmail = (p.email || '').toString().toLowerCase().trim();
        const key = cleanName ? `name:${cleanName}` : (cleanEmail ? `email:${cleanEmail}` : `id:${p.id}`);

        if (key && !uniqueMap.has(key)) {
          uniqueMap.set(key, p);
        } else if (key && uniqueMap.has(key)) {
          const existing = uniqueMap.get(key);
          uniqueMap.set(key, { ...existing, ...p });
        }
      }
    });

    setInfluencers(Array.from(uniqueMap.values()));
  }, [profiles]);

  // Categories list
  const categories = [
    'ALL',
    'Beauty & Skincare',
    'Fashion & Lifestyle',
    'Food & Beverage',
    'Tech & Gadgets',
    'Fitness & Health',
    'Travel & Gaming',
    'Parenting & Family',
    'Education & Finance'
  ];

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSortBy('DEFAULT');
    setFilterCity('');
    setMinPrice('');
    setMaxPrice('');
    setFilterFollowers('ALL');
    setFilterPlatform('ALL');
    setFilterGender('ALL');
  };

  const activeFilterCount = (filterCity ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (filterFollowers !== 'ALL' ? 1 : 0) +
    (filterPlatform !== 'ALL' ? 1 : 0) +
    (filterGender !== 'ALL' ? 1 : 0) +
    (selectedCategory !== 'ALL' ? 1 : 0);

  const getMinPrice = (inf) => {
    if (Array.isArray(inf.rate_cards) && inf.rate_cards.length > 0) {
      const prices = inf.rate_cards.map(rc => Number(rc.price) || 0).filter(p => p > 0);
      if (prices.length > 0) return Math.min(...prices);
    }
    return 0;
  };

  const getMaxPrice = (inf) => {
    if (Array.isArray(inf.rate_cards) && inf.rate_cards.length > 0) {
      const prices = inf.rate_cards.map(rc => Number(rc.price) || 0).filter(p => p > 0);
      if (prices.length > 0) return Math.max(...prices);
    }
    return 0;
  };

  const parseFollowersCount = (inf) => {
    const str = (inf.followers || '250k').toLowerCase().trim();
    if (str.includes('m')) return parseFloat(str) * 1000000;
    if (str.includes('k')) return parseFloat(str) * 1000;
    return parseFloat(str) || 250000;
  };

  const filteredInfluencers = rawInfluencers
    .filter(inf => {
      if (!inf) return false;

      // Search Query
      const name = inf.full_name || '';
      const bio = inf.bio || '';
      const addr = inf.address || '';
      const cat = inf.category || '';

      const matchesSearch =
        !searchQuery ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addr.toLowerCase().includes(searchQuery.toLowerCase());

      // Category Filter
      const matchesCat =
        selectedCategory === 'ALL' ||
        cat.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        bio.toLowerCase().includes(selectedCategory.toLowerCase());

      // Domisili (Location Filter)
      const matchesCity =
        !filterCity ||
        addr.toLowerCase().includes(filterCity.toLowerCase().trim());

      // Price Range Filter
      const infLowestPrice = getMinPrice(inf);
      const infHighestPrice = getMaxPrice(inf);
      const minP = minPrice ? Number(minPrice) : 0;
      const maxP = maxPrice ? Number(maxPrice) : Infinity;

      const matchesPrice =
        (!minPrice && !maxPrice) ||
        (infLowestPrice >= minP && (maxP === Infinity || infHighestPrice <= maxP || infLowestPrice <= maxP));

      // Followers Filter
      const fCount = parseFollowersCount(inf);
      let matchesFollowers = true;
      if (filterFollowers === 'UNDER_50K') matchesFollowers = fCount < 50000;
      else if (filterFollowers === '50K_250K') matchesFollowers = fCount >= 50000 && fCount <= 250000;
      else if (filterFollowers === 'OVER_250K') matchesFollowers = fCount > 250000;

      // Social Media Platform Filter
      let matchesPlatform = true;
      if (filterPlatform !== 'ALL') {
        const key = `social_${filterPlatform}`;
        matchesPlatform = Boolean(inf[key]);
      }

      // Gender Filter
      let matchesGender = true;
      if (filterGender !== 'ALL') {
        const g = (inf.gender || '').toLowerCase();
        const target = filterGender.toLowerCase();
        matchesGender = g === target || (target === 'perempuan' && (g === 'female' || g === 'wanita')) || (target === 'laki-laki' && (g === 'male' || g === 'pria'));
      }

      return matchesSearch && matchesCat && matchesCity && matchesPrice && matchesFollowers && matchesPlatform && matchesGender;
    })
    .sort((a, b) => {
      if (sortBy === 'NAME_ASC') {
        return (a.full_name || '').localeCompare(b.full_name || '');
      }
      if (sortBy === 'NAME_DESC') {
        return (b.full_name || '').localeCompare(a.full_name || '');
      }
      if (sortBy === 'PRICE_DESC') {
        return getMaxPrice(b) - getMaxPrice(a);
      }
      if (sortBy === 'PRICE_ASC') {
        return getMinPrice(a) - getMinPrice(b);
      }
      return 0;
    });

  const gridRef = useRef(null);

  // GSAP animation for staggered influencer cards entrance across laptop and mobile
  useEffect(() => {
    if (gridRef.current && filteredInfluencers.length > 0) {
      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        mm.add({
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)"
        }, (context) => {
          const { isMobile } = context.conditions;

          gsap.fromTo(
            '.gsap-marketplace-card',
            { opacity: 0, y: isMobile ? 18 : 30, scale: isMobile ? 0.97 : 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: isMobile ? 0.4 : 0.55,
              stagger: isMobile ? 0.05 : 0.08,
              ease: 'power2.out',
              clearProps: 'transform,opacity'
            }
          );
        });
      }, gridRef);
      return () => ctx.revert();
    }
  }, [filteredInfluencers]);

  const handleOpenPropose = (influencer) => {
    if (!isAuthenticated) {
      toast.warning('Anda wajib masuk (login) terlebih dahulu untuk mengajukan kerja sama.');
      if (setActiveTab) setActiveTab('login');
      return;
    }

    if (currentRole === 'influencer') {
      toast.warning('Akun dengan peran Influencer tidak dapat mengajukan kerja sama ke sesama Influencer. Kolaborasi di Marketplace KOL hanya dapat diajukan oleh Brand UMKM atau Agency.');
      return;
    }

    if (!['umkm', 'agency', 'admin'].includes(currentRole)) {
      toast.error('Pengajuan kolaborasi KOL hanya dapat dikirim oleh peran UMKM / Brand, Agency, atau Admin.');
      return;
    }

    setSelectedInfluencer(influencer);
    setDialogOpen(true);
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Sesi Anda berakhir. Silakan login kembali.');
      if (setActiveTab) setActiveTab('login');
      return;
    }

    if (currentRole === 'influencer') {
      toast.error('Akses ditolak: Sesama Influencer tidak dapat mengajukan kerja sama.');
      return;
    }

    if (!['umkm', 'agency', 'admin'].includes(currentRole)) {
      toast.error('Akses ditolak: Hanya akun UMKM, Agency, atau Admin yang dapat mengirim ajuan kolaborasi.');
      return;
    }

    if (!selectedInfluencer || !formData.project_title) return;
    setSubmitting(true);

    try {
      const initiatorTag = currentRole === 'agency' ? 'agency' : 'brand';
      await dataService.addCollaboration({
        initiator: initiatorTag,
        brand_id: currentProfile?.id,
        influencer_id: selectedInfluencer.id,
        project_title: formData.project_title,
        budget: Number(formData.budget) || 0,
        status: 'pending',
        notes: `[Initiator: ${initiatorTag}] ${formData.notes || ''}`.trim()
      });

      toast.success(`Pengajuan kolaborasi dengan ${selectedInfluencer.full_name} berhasil dikirim!`);
      setDialogOpen(false);
      setFormData({ project_title: '', budget: '3500000', notes: '' });
    } catch (err) {
      console.error('Failed to save collaboration proposal:', err);
      toast.error(err.message || 'Gagal mengirim pengajuan kolaborasi. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPriceExact = (amount) => {
    const num = Number(amount) || 0;
    if (num <= 0) return 'Hubungi Langsung';
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  const socialPlatforms = (inf) => [
    { key: 'social_tiktok', icon: TiktokLogo, color: 'text-white', label: 'TikTok', value: inf?.social_tiktok },
    { key: 'social_instagram', icon: InstagramLogo, color: 'text-pink-400', label: 'Instagram', value: inf?.social_instagram },
    { key: 'social_youtube', icon: YoutubeLogo, color: 'text-red-500', label: 'YouTube', value: inf?.social_youtube },
    { key: 'social_x', icon: XLogo, color: 'text-white', label: 'X (Twitter)', value: inf?.social_x },
    { key: 'social_threads', icon: ThreadsLogo, color: 'text-white', label: 'Threads', value: inf?.social_threads },
    { key: 'social_linkedin', icon: LinkedinLogo, color: 'text-blue-400', label: 'LinkedIn', value: inf?.social_linkedin },
  ].filter(p => p.value);

  // --- Rate Card Handlers ---
  const PLATFORM_OPTIONS = [
    { key: 'tiktok', label: 'TikTok', icon: TiktokLogo, color: 'text-white' },
    { key: 'instagram', label: 'Instagram', icon: InstagramLogo, color: 'text-pink-400' },
    { key: 'youtube', label: 'YouTube', icon: YoutubeLogo, color: 'text-red-500' },
    { key: 'x', label: 'X (Twitter)', icon: XLogo, color: 'text-white' },
    { key: 'threads', label: 'Threads', icon: ThreadsLogo, color: 'text-white' },
    { key: 'linkedin', label: 'LinkedIn', icon: LinkedinLogo, color: 'text-blue-400' },
  ];

  const handleOpenRateCard = (influencer) => {
    if (!isAuthenticated) {
      toast.warning('Anda wajib login terlebih dahulu untuk request rate card.');
      if (setActiveTab) setActiveTab('login');
      return;
    }
    if (currentRole === 'influencer') {
      toast.warning('Akun dengan peran Influencer / KOL tidak dapat mengajukan request rate card ke sesama Influencer.');
      return;
    }
    setRateCardTarget(influencer);
    setRateCardForm({
      brand_name: currentProfile?.full_name || '',
      product_name: '',
      campaign_objective: '',
      platforms: [],
      content_type: '',
      target_audience: '',
      timeline: '',
      budget_range: '',
      notes: ''
    });
    setRateCardDialogOpen(true);
  };

  const toggleRateCardPlatform = (key) => {
    setRateCardForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(key)
        ? prev.platforms.filter(p => p !== key)
        : [...prev.platforms, key]
    }));
  };

  const handleSubmitRateCard = async (e) => {
    e.preventDefault();
    if (!rateCardForm.brand_name || !rateCardForm.campaign_objective) {
      toast.warning('Mohon isi nama brand dan tujuan kampanye terlebih dahulu.');
      return;
    }
    setRateCardSubmitting(true);
    try {
      await dataService.createRateCardRequest({
        requester_id:       currentProfile?.id,
        requester_name:     currentProfile?.full_name || 'Brand / Agency',
        influencer_id:      rateCardTarget?.id,
        influencer_name:    rateCardTarget?.full_name || '',
        brand_name:         rateCardForm.brand_name,
        product_name:       rateCardForm.product_name,
        campaign_objective: rateCardForm.campaign_objective,
        platforms:          rateCardForm.platforms,
        content_type:       rateCardForm.content_type,
        target_audience:    rateCardForm.target_audience,
        timeline:           rateCardForm.timeline,
        budget_range:       rateCardForm.budget_range,
        notes:              rateCardForm.notes
      });

      toast.success(`Request Rate Card berhasil dikirim ke ${rateCardTarget?.full_name}! Influencer akan segera merespons.`);
      setRateCardDialogOpen(false);
      // Reset form
      setRateCardForm({
        brand_name: '',
        product_name: '',
        campaign_objective: '',
        platforms: [],
        content_type: '',
        target_audience: '',
        timeline: '',
        budget_range: '',
        notes: ''
      });
    } catch (err) {
      console.error('Rate card request failed:', err);
      toast.error(err.message || 'Gagal mengirim permintaan rate card. Silakan coba lagi.');
    } finally {
      setRateCardSubmitting(false);
    }
  };

  // --- KOL DETAIL VIEW ---
  if (selectedKOL) {
    const kol = selectedKOL;
    const collabCount = getInfluencerCollabCount(kol.id);
    const platforms = socialPlatforms(kol);

    return (
      <div className="space-y-6 pb-12 animate-fade-in">
        
        {/* Breadcrumb Navigation */}
        <div>
          <Breadcrumb
            items={[
              { label: 'Marketplace KOL', icon: UsersThree, tab: 'influencer' },
              { label: kol.full_name, icon: User }
            ]}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* Hero Profile Card */}
        <div className="glass-card rounded-3xl p-5 sm:p-8 border-amber-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/10 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            
            {/* Avatar */}
            <div className="relative shrink-0">
              {kol.avatar_url ? (
                <img
                  src={kol.avatar_url}
                  alt={kol.full_name}
                  onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-amber-500/40 shadow-xl shadow-amber-500/10"
                />
              ) : null}
              <Avatar
                className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-amber-500/40 bg-amber-500/10 text-amber-300 font-black text-2xl shadow-xl rounded-3xl"
                style={{ display: kol.avatar_url ? 'none' : 'flex' }}
              >
                <AvatarFallback className="rounded-3xl text-xl">{(kol.full_name || 'KOL').substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {/* Active indicator */}
              <span className="absolute -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" weight="bold" />
              </span>
            </div>

            {/* Core Info */}
            <div className="flex-1 space-y-3 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl font-black text-white truncate">{kol.full_name}</h1>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{kol.address || 'Indonesia'}</span>
                    </span>
                    {kol.gender && (
                      <span className="flex items-center gap-1">
                        {((kol.gender || '').toLowerCase() === 'perempuan' || (kol.gender || '').toLowerCase() === 'female')
                          ? <><GenderFemale className="w-3.5 h-3.5 text-rose-400 shrink-0" /><span className="text-rose-300 font-semibold">Perempuan</span></>
                          : <><GenderMale className="w-3.5 h-3.5 text-blue-400 shrink-0" /><span className="text-blue-300 font-semibold">Laki-Laki</span></>
                        }
                      </span>
                    )}
                    {kol.followers && (
                      <span className="flex items-center gap-1.5 font-semibold">
                        <UsersThree className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="text-purple-300">{kol.followers} Followers</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1 sm:pt-0">
                  {kol.category && (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold shrink-0">
                      {kol.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-bold shrink-0">
                    <Handshake className="w-3.5 h-3.5" />
                    {collabCount} Kolaborasi
                  </span>
                </div>
              </div>

              {/* Bio */}
              {kol.bio && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl bg-slate-900/50 p-3.5 sm:p-4 rounded-2xl border border-slate-800">
                  {kol.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Left: Social Media + Contact */}
          <div className="space-y-4">
            
            {/* Social Media Handles */}
            {platforms.length > 0 && (
              <div className="glass-card rounded-3xl p-4 sm:p-5 border-slate-800 space-y-3">
                <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                  Media Sosial
                </h3>
                <div className="space-y-2.5">
                  {platforms.map(({ icon: Icon, color, label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0 text-xs">
                      <span className="flex items-center gap-2 text-slate-400 font-medium truncate mr-2">
                        <Icon className={`w-4 h-4 ${color} shrink-0`} weight="fill" />
                        <span className="truncate">{label}</span>
                      </span>
                      <span className="text-amber-300 font-bold shrink-0">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="glass-card rounded-3xl p-4 sm:p-5 border-slate-800 space-y-3">
              <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                Informasi Kontak
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-800/60 gap-2">
                  <span className="flex items-center gap-2 text-slate-400 shrink-0"><Phone className="w-3.5 h-3.5 text-emerald-400" />WhatsApp</span>
                  <span className="text-slate-200 font-semibold truncate">{kol.phone_number || 'Tersedia via Ajuan Proyek'}</span>
                </div>
                <div className="flex items-center justify-between py-2 gap-2">
                  <span className="flex items-center gap-2 text-slate-400 shrink-0"><Envelope className="w-3.5 h-3.5 text-blue-400" />Email</span>
                  <span className="text-slate-200 font-semibold truncate">{kol.email || 'Via Pengajuan'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Rate Card + CTA */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Rate Card Services */}
            <div className="glass-card rounded-3xl p-5 sm:p-6 border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                  <CurrencyCircleDollar className="w-5 h-5 text-emerald-400 shrink-0" />
                  Daftar Layanan & Rate Card
                </h3>
                <span className="text-[11px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700 w-fit">
                  {formatStartingPrice(kol)}
                </span>
              </div>

              {Array.isArray(kol.rate_cards) && kol.rate_cards.length > 0 ? (
                <div className="space-y-2">
                  {kol.rate_cards.map((rc, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/70 p-3.5 sm:px-4 sm:py-3.5 rounded-2xl border border-slate-800 hover:border-amber-500/30 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                          <Star className="w-4 h-4 text-amber-400" weight="fill" />
                        </div>
                        <span className="text-xs sm:text-sm text-white font-semibold">{rc.service}</span>
                      </div>
                      <span className="font-black text-emerald-400 text-xs sm:text-sm self-end sm:self-auto">
                        {formatPriceExact(rc.price)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-sm">
                  <CurrencyCircleDollar className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                  <p>Rate Card belum tersedia.</p>
                  <p className="text-xs mt-1">Kirim permintaan rate card untuk informasi harga.</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="glass-card rounded-3xl p-4 sm:p-5 border-amber-500/20 bg-amber-950/5 space-y-3">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Tertarik Bekerja Sama?</h3>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Request Rate Card — Hanya untuk bukan influencer */}
                {currentRole !== 'influencer' && (
                  <button
                    onClick={() => handleOpenRateCard(kol)}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold hover:bg-amber-500/10 hover:border-amber-400 transition-all cursor-pointer"
                  >
                    <CurrencyCircleDollar className="w-4 h-4 shrink-0" />
                    <span>Request Rate Card</span>
                  </button>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* Rate Card Request Dialog */}
        <Dialog open={rateCardDialogOpen} onOpenChange={setRateCardDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CurrencyCircleDollar className="w-5 h-5 text-amber-400" />
                Request Rate Card — {rateCardTarget?.full_name}
              </DialogTitle>
              <DialogDescription>
                Isi formulir berikut agar influencer dapat menyiapkan rate card yang sesuai dengan kebutuhan kampanye Anda.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitRateCard} className="space-y-4 pt-1 max-h-[65vh] overflow-y-auto pr-1">
              
              {/* Brand & Produk */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-amber-300 mb-1">Nama Brand / Perusahaan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kopi Nusantara"
                    value={rateCardForm.brand_name}
                    onChange={(e) => setRateCardForm(p => ({ ...p, brand_name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Produk / Layanan yang Dipromosikan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kopi Arabica Premium"
                    value={rateCardForm.product_name}
                    onChange={(e) => setRateCardForm(p => ({ ...p, product_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Tujuan Kampanye */}
              <div>
                <label className="block text-[11px] font-semibold text-amber-300 mb-1">Tujuan / Objektif Kampanye</label>
                <select
                  value={rateCardForm.campaign_objective}
                  onChange={(e) => setRateCardForm(p => ({ ...p, campaign_objective: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Pilih Tujuan --</option>
                  <option value="Brand Awareness">Brand Awareness (meningkatkan visibilitas brand)</option>
                  <option value="Product Launch">Product Launch (peluncuran produk baru)</option>
                  <option value="Conversion/Sales">Conversion / Sales (meningkatkan penjualan)</option>
                  <option value="Community Building">Community Building (membangun komunitas)</option>
                  <option value="Event Promotion">Event Promotion (promosi acara)</option>
                  <option value="Review/Testimoni">Review / Testimoni produk</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* Platform */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-2">Platform yang Diinginkan</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORM_OPTIONS.map(({ key, label, icon: Icon, color }) => {
                    const selected = rateCardForm.platforms.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleRateCardPlatform(key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                          selected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${selected ? 'text-amber-400' : color}`} weight="fill" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Jenis Konten & Target Audiens */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Jenis Konten</label>
                  <select
                    value={rateCardForm.content_type}
                    onChange={(e) => setRateCardForm(p => ({ ...p, content_type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Pilih Jenis --</option>
                    <option value="Video Pendek (Reels/TikTok)">Video Pendek (Reels / TikTok)</option>
                    <option value="Video Panjang (YouTube)">Video Panjang (YouTube)</option>
                    <option value="Foto + Caption">Foto + Caption</option>
                    <option value="Story">Story (IG / TikTok Story)</option>
                    <option value="Live Streaming">Live Streaming</option>
                    <option value="Review Artikel / Thread">Review Artikel / Thread</option>
                    <option value="Kombinasi">Kombinasi beberapa format</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Audiens</label>
                  <input
                    type="text"
                    placeholder="Contoh: Wanita 18–30 tahun"
                    value={rateCardForm.target_audience}
                    onChange={(e) => setRateCardForm(p => ({ ...p, target_audience: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Timeline & Anggaran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Estimasi Timeline</label>
                  <BottomSheetSelect
                    title="Pilih Estimasi Timeline Kampanye"
                    options={TIMELINE_OPTIONS}
                    value={rateCardForm.timeline}
                    onChange={(val) => setRateCardForm(p => ({ ...p, timeline: val }))}
                    placeholder="-- Pilih Timeline --"
                    triggerClassName="w-full bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Estimasi Anggaran</label>
                  <BottomSheetSelect
                    title="Pilih Estimasi Anggaran Kampanye"
                    options={BUDGET_RANGE_OPTIONS}
                    value={rateCardForm.budget_range}
                    onChange={(val) => setRateCardForm(p => ({ ...p, budget_range: val }))}
                    placeholder="-- Pilih Range --"
                    triggerClassName="w-full bg-slate-900 border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Catatan Tambahan */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Catatan / Permintaan Khusus</label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan detail tambahan, gaya konten, referensi, atau hal spesifik yang ingin Anda sampaikan..."
                  value={rateCardForm.notes}
                  onChange={(e) => setRateCardForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <DialogFooter className="pt-2 sticky bottom-0 bg-transparent">
                <Button type="button" variant="ghost" size="sm" onClick={() => setRateCardDialogOpen(false)}>Batal</Button>
                <Button
                  type="submit"
                  variant="gradientAmber"
                  size="sm"
                  disabled={rateCardSubmitting || !rateCardForm.brand_name || !rateCardForm.campaign_objective}
                >
                  <CurrencyCircleDollar className="w-4 h-4" />
                  {rateCardSubmitting ? 'Mengirim...' : 'Kirim Request Rate Card'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Breadcrumb Navigation */}
      <div>
        <Breadcrumb items={[{ label: 'Marketplace KOL', icon: UsersThree }]} setActiveTab={setActiveTab} />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-8 rounded-3xl glass-card border-slate-800 shadow-2xl">
        <div className="space-y-1.5 sm:space-y-2 min-w-0">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <UsersThree className="w-4 h-4 shrink-0" /> Direktori Influencer & Content Creator
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Direktori Influencer</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Temukan Influencer & Content Creator terbaik untuk mempromosikan produk UMKM Anda secara profesional.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 p-2.5 sm:p-3 rounded-2xl border border-slate-800 text-xs text-slate-300 shrink-0 w-fit">
          <Sparkle weight="fill" className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
          <span>Tersedia <strong>{filteredInfluencers.length} Influencer</strong> Terverifikasi</span>
        </div>
      </div>

      {/* Search, Sort, and Filter Controls Bar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 sm:gap-4">
          
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari nama influencer, bio, atau kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-11 pr-4 py-2.5 rounded-2xl glass-card text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all shadow-inner"
            />
          </div>

          {/* Action Controls: Sort Dropdown & Filter Toggle Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            
            {/* Dropdown Sortir dengan Popup Bottom Sheet */}
            <div className="w-full sm:w-64 shrink-0">
              <BottomSheetSelect
                title="Urutkan Direktori Influencer"
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                labelPrefix="Sortir:"
                icon={ArrowsDownUp}
                triggerClassName="w-full bg-slate-900/90 border-slate-800 text-white hover:border-amber-500/40"
              />
            </div>

            {/* Filter Toggle & Reset Buttons Group */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              {/* Filter Toggle Button */}
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer whitespace-nowrap ${
                  filterOpen || activeFilterCount > 0
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'glass-card text-slate-300 border-slate-800 hover:border-amber-500/40 hover:text-white'
                }`}
              >
                <Funnel className="w-4 h-4 shrink-0" />
                <span>Filter Spesifikasi</span>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950 text-amber-300 border border-amber-400/40 font-black shrink-0">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Reset Filter Button */}
              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer shrink-0"
                  title="Reset Semua Filter"
                >
                  <ArrowCounterClockwise className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Categories Pills - Horizontal Scroll with Hidden Scrollbar */}
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                  : 'glass-card text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>

        {/* Expandable Filter Panel (Domisili, Range Harga, Followers, Platform, Gender) */}
        {filterOpen && (
          <div className="glass-card rounded-3xl p-4 sm:p-6 border-amber-500/30 bg-slate-900/90 space-y-5 sm:space-y-6 animate-fade-in shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-amber-300">
                <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                <span>Filter Pencarian KOL Spesifik</span>
              </div>
              
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-bold cursor-pointer shrink-0"
              >
                <ArrowCounterClockwise className="w-3.5 h-3.5 shrink-0" />
                <span>Bersihkan Filter</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 text-xs">
              
              {/* 1. Domisili / Kota */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Domisili / Kota</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Contoh: Jakarta, Bandung..."
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              {/* 2. Range Harga (IDR) */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Range Harga (IDR)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 3. Total Followers */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Jumlah Followers</label>
                <BottomSheetSelect
                  title="Filter Jumlah Followers"
                  options={FOLLOWERS_OPTIONS}
                  value={filterFollowers}
                  onChange={(val) => setFilterFollowers(val)}
                  triggerClassName="w-full bg-slate-950 border-slate-700 text-white"
                />
              </div>

              {/* 4. Media Sosial Platform */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Media Sosial Platform</label>
                <BottomSheetSelect
                  title="Filter Platform Media Sosial"
                  options={PLATFORM_OPTIONS_FILTER}
                  value={filterPlatform}
                  onChange={(val) => setFilterPlatform(val)}
                  triggerClassName="w-full bg-slate-950 border-slate-700 text-white"
                />
              </div>

              {/* 5. Gender / Jenis Kelamin */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Gender</label>
                <BottomSheetSelect
                  title="Filter Jenis Kelamin / Gender"
                  options={GENDER_OPTIONS}
                  value={filterGender}
                  onChange={(val) => setFilterGender(val)}
                  triggerClassName="w-full bg-slate-950 border-slate-700 text-white"
                />
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Influencers Grid List */}
      {filteredInfluencers.length === 0 ? (
        <div className="py-16 sm:py-20 text-center glass-card rounded-3xl p-6 sm:p-8 space-y-3">
          <UsersThree className="w-10 h-10 sm:w-12 sm:h-12 text-slate-500 mx-auto" />
          <h3 className="text-base sm:text-lg font-bold text-white">Influencer Tidak Ditemukan</h3>
          <p className="text-xs sm:text-sm text-slate-400">Coba atur ulang kata kunci pencarian atau spesifikasi filter Anda.</p>
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredInfluencers.map(inf => (
            <Card
              key={inf.id}
              className="gsap-marketplace-card flex flex-col justify-between group hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer p-4 sm:p-6 rounded-3xl"
              onClick={() => handleOpenDetail(inf)}
            >
              
              <CardHeader className="space-y-3.5 p-0">
                {/* 1. Image Profil & 2. Nama & 3. Lokasi */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* 1. Image Profil */}
                    <div className="relative shrink-0">
                      {inf.avatar_url ? (
                        <img
                          src={inf.avatar_url}
                          alt={inf.full_name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover border border-amber-500/40 shadow-md group-hover:scale-105 transition-transform"
                        />
                      ) : null}
                      <Avatar
                        className="w-11 h-11 sm:w-12 sm:h-12 border border-amber-500/40 bg-amber-500/10 text-amber-300 font-black text-sm shadow-md group-hover:scale-105 transition-transform"
                        style={{ display: inf.avatar_url ? 'none' : 'flex' }}
                      >
                        <AvatarFallback>{(inf.full_name || 'KOL').substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="min-w-0">
                      {/* 2. Nama */}
                      <CardTitle className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                        {inf.full_name}
                      </CardTitle>
                      
                      {/* 3. Lokasi & Gender */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <div className="flex items-center gap-1 font-medium truncate">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{inf.address || 'Indonesia'}</span>
                        </div>

                        {inf.gender && (
                          <div className="flex items-center gap-1 font-semibold text-[11px] shrink-0">
                            {((inf.gender || '').toLowerCase() === 'perempuan' || (inf.gender || '').toLowerCase() === 'female') ? (
                              <span className="inline-flex items-center gap-1 text-rose-300">
                                <GenderFemale className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                <span>Perempuan</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-blue-300">
                                <GenderMale className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                <span>Laki-Laki</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {inf.category && (
                    <Badge variant="amber" className="shrink-0 font-bold text-[10px] sm:text-xs">
                      {inf.category}
                    </Badge>
                  )}
                </div>

                {/* 4. Sosial Media (Max 2 displayed + quantity label e.g. "+1") */}
                {(() => {
                  const activeSocials = [
                    { key: 'tiktok', icon: TiktokLogo, color: 'text-white', val: inf.social_tiktok },
                    { key: 'instagram', icon: InstagramLogo, color: 'text-pink-400', val: inf.social_instagram },
                    { key: 'youtube', icon: YoutubeLogo, color: 'text-red-500', val: inf.social_youtube },
                    { key: 'x', icon: XLogo, color: 'text-white', val: inf.social_x },
                    { key: 'threads', icon: ThreadsLogo, color: 'text-white', val: inf.social_threads },
                    { key: 'linkedin', icon: LinkedinLogo, color: 'text-blue-400', val: inf.social_linkedin }
                  ].filter(s => Boolean(s.val));

                  if (activeSocials.length === 0) return null;

                  const visibleSocials = activeSocials.slice(0, 2);
                  const remainingCount = activeSocials.length - 2;

                  return (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {visibleSocials.map(s => {
                        const IconComponent = s.icon;
                        return (
                          <span key={s.key} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] sm:text-xs text-slate-300 font-medium">
                            <IconComponent className={`w-3.5 h-3.5 ${s.color} shrink-0`} weight={s.key === 'x' ? 'bold' : 'fill'} />
                            <strong className="text-amber-300">{s.val}</strong>
                          </span>
                        );
                      })}
                      {remainingCount > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-black" title={`${remainingCount} akun sosial media lainnya`}>
                          +{remainingCount}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </CardHeader>

              <CardContent className="space-y-2.5 pt-3 px-0 pb-0">
                {/* 5. Total collab */}
                <div className="flex items-center justify-between text-xs bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Handshake className="w-4 h-4 text-purple-400 shrink-0" />
                    Total Collab:
                  </span>
                  <span className="font-extrabold text-amber-300 text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                    {getInfluencerCollabCount(inf.id)} Proyek
                  </span>
                </div>

                {/* 6. Total harga layanan (Mulai dari Rp1 Juta) */}
                <div className="flex items-center justify-between text-xs bg-emerald-950/20 px-3 py-2 rounded-xl border border-emerald-500/30">
                  <span className="text-slate-300 font-medium">Harga Layanan:</span>
                  <span className="font-black text-emerald-400 text-xs">
                    {formatStartingPrice(inf)}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="pt-4 px-0 pb-0 flex flex-col sm:flex-row gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center gap-1.5 text-xs text-amber-300 border-slate-700 hover:border-amber-500/50 hover:bg-amber-500/10 font-semibold"
                  onClick={() => handleOpenDetail(inf)}
                >
                  <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Lihat Detail Profil</span>
                </Button>

                {currentRole !== 'influencer' && (
                  <Button
                    variant="gradientAmber"
                    size="sm"
                    className="w-full justify-center gap-1.5 text-xs font-extrabold shadow-md hover:shadow-amber-500/20"
                    onClick={() => handleOpenRateCard(inf)}
                  >
                    <CurrencyCircleDollar className="w-3.5 h-3.5 shrink-0" />
                    <span>Request Rate Card</span>
                  </Button>
                )}
              </CardFooter>

            </Card>
          ))}
        </div>
      )}

      {/* Collaboration Proposal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="w-6 h-6 text-amber-400" />
              Ajukan Proyek Kerjasama
            </DialogTitle>
            <DialogDescription>
              Tawaran kampanye ini akan dikirim langsung ke influencer KOL terkait.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitProposal} className="space-y-4">
            
            {selectedInfluencer && (
              <div className="flex items-center gap-3 p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
                <Avatar className="w-10 h-10 border border-amber-500/50 bg-amber-500/10 text-amber-300 font-extrabold text-xs">
                  <AvatarFallback>{(selectedInfluencer.full_name || 'KOL').substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-bold text-white">{selectedInfluencer.full_name}</p>
                  <p className="text-[10px] text-amber-400">Target Influencer KOL</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Judul Proyek / Kampanye</label>
              <input
                type="text"
                required
                placeholder="Contoh: Endorsement Instagram Reels Unboxing Hydro Bottle..."
                value={formData.project_title}
                onChange={(e) => setFormData({ ...formData, project_title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Budget Kerjasama (IDR)</label>
              <input
                type="number"
                required
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Catatan Brief Proyek & Deliverables</label>
              <textarea
                rows={4}
                placeholder="Tuliskan kebutuhan postingan, tenggat waktu, dan pesan utama brand..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="gradientAmber"
                disabled={submitting}
              >
                {submitting ? 'Mengirim pengajuan...' : 'Kirim Ajuan Kerja Sama'}
              </Button>
            </DialogFooter>

          </form>

        </DialogContent>
      </Dialog>

      {/* Rate Card Request Dialog (accessible from grid list too) */}
      <Dialog open={rateCardDialogOpen} onOpenChange={setRateCardDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CurrencyCircleDollar className="w-5 h-5 text-amber-400" />
              Request Rate Card — {rateCardTarget?.full_name}
            </DialogTitle>
            <DialogDescription>
              Isi formulir berikut agar influencer dapat menyiapkan rate card yang sesuai dengan kebutuhan kampanye Anda.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitRateCard} className="space-y-4 pt-1 max-h-[65vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-amber-300 mb-1">Nama Brand / Perusahaan</label>
                <input type="text" placeholder="Contoh: Kopi Nusantara" value={rateCardForm.brand_name}
                  onChange={(e) => setRateCardForm(p => ({ ...p, brand_name: e.target.value }))} required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Produk / Layanan</label>
                <input type="text" placeholder="Contoh: Kopi Arabica Premium" value={rateCardForm.product_name}
                  onChange={(e) => setRateCardForm(p => ({ ...p, product_name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-amber-300 mb-1">Tujuan Kampanye</label>
              <BottomSheetSelect
                title="Pilih Tujuan / Objektif Kampanye"
                options={CAMPAIGN_OBJECTIVE_OPTIONS}
                value={rateCardForm.campaign_objective}
                onChange={(val) => setRateCardForm(p => ({ ...p, campaign_objective: val }))}
                placeholder="-- Pilih Tujuan --"
                triggerClassName="w-full bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-2">Platform yang Diinginkan</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_OPTIONS.map(({ key, label, icon: Icon, color }) => {
                  const selected = rateCardForm.platforms.includes(key);
                  return (
                    <button key={key} type="button" onClick={() => toggleRateCardPlatform(key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                        selected ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}>
                      <Icon className={`w-3.5 h-3.5 ${selected ? 'text-amber-400' : color}`} weight="fill" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Jenis Konten</label>
                <BottomSheetSelect
                  title="Pilih Format Jenis Konten"
                  options={CONTENT_TYPE_OPTIONS}
                  value={rateCardForm.content_type}
                  onChange={(val) => setRateCardForm(p => ({ ...p, content_type: val }))}
                  placeholder="-- Pilih Jenis --"
                  triggerClassName="w-full bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Audiens</label>
                <input type="text" placeholder="Contoh: Wanita 18–30 tahun" value={rateCardForm.target_audience}
                  onChange={(e) => setRateCardForm(p => ({ ...p, target_audience: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Estimasi Timeline</label>
                <BottomSheetSelect
                  title="Pilih Estimasi Timeline Kampanye"
                  options={TIMELINE_OPTIONS}
                  value={rateCardForm.timeline}
                  onChange={(val) => setRateCardForm(p => ({ ...p, timeline: val }))}
                  placeholder="-- Pilih Timeline --"
                  triggerClassName="w-full bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Estimasi Anggaran</label>
                <BottomSheetSelect
                  title="Pilih Estimasi Anggaran Kampanye"
                  options={BUDGET_RANGE_OPTIONS}
                  value={rateCardForm.budget_range}
                  onChange={(val) => setRateCardForm(p => ({ ...p, budget_range: val }))}
                  placeholder="-- Pilih Range --"
                  triggerClassName="w-full bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Catatan / Permintaan Khusus</label>
              <textarea rows={3} placeholder="Jelaskan detail tambahan, gaya konten, referensi, atau hal spesifik lainnya..."
                value={rateCardForm.notes} onChange={(e) => setRateCardForm(p => ({ ...p, notes: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 resize-none" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setRateCardDialogOpen(false)}>Batal</Button>
              <Button type="submit" variant="gradientAmber" size="sm"
                disabled={rateCardSubmitting || !rateCardForm.brand_name || !rateCardForm.campaign_objective}>
                <CurrencyCircleDollar className="w-4 h-4" />
                {rateCardSubmitting ? 'Mengirim...' : 'Kirim Request Rate Card'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};
