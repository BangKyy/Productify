import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { dataService, getItemDedupeKey } from '../../lib/supabase';
import { Button } from '../ui/Button';
import LogoWhite from '../../assets/Logo_White.png';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel 
} from '../ui/DropdownMenu';
import { 
  List, 
  X, 
  CaretDown,
  Globe,
  Check,
  SignIn,
  UserPlus,
  SignOut,
  User,
  Handshake,
  Package,
  UsersThree,
  Newspaper,
  House,
  ShieldCheck,
  Sparkle,
  ClockCounterClockwise,
  Info
} from '@phosphor-icons/react';

const ROLE_BADGE_STYLE = {
  umkm: { label: 'UMKM / Brand', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  influencer: { label: 'Influencer', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  agency: { label: 'Agency', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  admin: { label: 'Admin', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' }
};

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { currentProfile, currentRole, isAuthenticated, pendingUser, logoutUser } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(true);
  const [pendingNotificationCount, setPendingNotificationCount] = useState(0);

  const isFullyOnboarded = Boolean(
    isAuthenticated && 
    currentProfile && 
    !pendingUser && 
    activeTab !== 'onboarding' && 
    activeTab !== 'role-selection'
  );

  // Auto-check for pending collaboration requests directed to the user (Incoming pending requests)
  useEffect(() => {
    if (!isAuthenticated || !currentProfile?.id) {
      setPendingNotificationCount(0);
      return;
    }

    const checkPendingNotifications = async () => {
      try {
        const [collabs, rateRequests] = await Promise.all([
          dataService.getCollaborations(),
          dataService.getRateCardRequests()
        ]);

        const formattedRequests = (Array.isArray(rateRequests) ? rateRequests : []).map(r => ({
          ...r,
          brand_id: r.requester_id || r.brand_id,
          isRateCardRequest: true
        }));

        const combined = [...(Array.isArray(collabs) ? collabs : []), ...formattedRequests];

        const uniqueMap = new Map();
        combined.forEach(p => {
          if (p) {
            const key = getItemDedupeKey(p);
            if (key && !uniqueMap.has(key)) {
              uniqueMap.set(key, p);
            }
          }
        });

        const myPendingCollabs = Array.from(uniqueMap.values()).filter(c => {
          if (!c || c.status !== 'pending') return false;

          const isUserInvolved = 
            c.influencer_id === currentProfile.id || 
            c.brand_id === currentProfile.id || 
            c.requester_id === currentProfile.id;

          return isUserInvolved;
        });

        setPendingNotificationCount(myPendingCollabs.length);
      } catch (err) {
        console.warn('Error checking pending notifications:', err);
      }
    };

    checkPendingNotifications();
    const interval = setInterval(checkPendingNotifications, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, currentProfile]);

  const serviceSubItems = [
    { 
      id: 'products', 
      label: t('nav.products'), 
      desc: 'Katalog produk unggulan UMKM & Brand',
      icon: Package, 
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20' 
    },
    { 
      id: 'marketplace', 
      label: 'Influencer', 
      desc: 'Direktori & pengajuan kolaborasi influencer',
      icon: UsersThree, 
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20' 
    },
    { 
      id: 'press-releases', 
      label: t('nav.pressReleases'), 
      desc: 'Publikasi & rilis berita pers digital',
      icon: Newspaper, 
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20' 
    }
  ];

  const roleStyle = ROLE_BADGE_STYLE[currentRole] || ROLE_BADGE_STYLE.umkm;
  const isServicesActive = serviceSubItems.some(sub => sub.id === activeTab) || activeTab === 'influencer' || (activeTab || '').startsWith('influencer/detail/');

  const handleLogout = () => {
    logoutUser();
    setActiveTab('overview');
  };

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setActiveTab('overview')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img 
              src={LogoWhite} 
              alt="Productify Logo" 
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" 
            />
          </div>

          {/* Clean Desktop Links Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-800/60 p-1.5 rounded-full border border-slate-700/60">
            {/* 1. Beranda */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md glow-purple'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>{t('nav.home')}</span>
            </button>

            {/* 2. Dropdown Menu: Fitur & Layanan (Product Showcase, Marketplace KOL, Press Release) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isServicesActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md glow-purple'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <span>{t('nav.featuresServices') || 'Fitur & Layanan'}</span>
                  <CaretDown className="w-3 h-3 text-slate-400" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="center" className="w-72 p-2 space-y-1 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl">
                <DropdownMenuLabel className="px-3 py-1.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Layanan Terpadu Productify
                </DropdownMenuLabel>

                {serviceSubItems.map((sub) => {
                  const Icon = sub.icon;
                  const isSubActive = activeTab === sub.id;
                  return (
                    <DropdownMenuItem
                      key={sub.id}
                      onClick={() => setActiveTab(sub.id)}
                      active={isSubActive}
                      className="flex items-start gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-slate-800/80 transition-all group"
                    >
                      <div className={`p-2 rounded-lg border ${sub.bgColor} group-hover:scale-105 transition-transform shrink-0`}>
                        <Icon className={`w-4 h-4 ${sub.color}`} />
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-xs font-bold ${isSubActive ? 'text-purple-300' : 'text-white group-hover:text-purple-200'}`}>
                          {sub.label}
                        </p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {sub.desc}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 3. Aktivitas & Riwayat Kolaborasi Publik */}
            <button
              onClick={() => setActiveTab('collaboration-activity')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'collaboration-activity'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md glow-purple'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>Aktivitas Kolaborasi</span>
            </button>

            {/* 4. Tentang Productify (Tentang & Mengapa Memilih Productify) */}
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md glow-purple'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>Tentang</span>
            </button>

            {/* 5. Moderasi Admin (hanya tampil untuk role admin) */}
            {currentRole === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span>{t('nav.admin')}</span>
              </button>
            )}
          </nav>

          {/* Right Side Controls: Language & Logged In User Dropdown Menu */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 px-3">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span className="uppercase text-xs font-bold">{lang}</span>
                  <CaretDown className="w-3 h-3 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="right">
                <DropdownMenuLabel>{t('nav.language')}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setLang('id')} active={lang === 'id'}>
                  <Globe className="w-4 h-4 text-purple-400 mr-2" />
                  <span className="flex-1">Bahasa Indonesia</span>
                  {lang === 'id' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang('en')} active={lang === 'en'}>
                  <Globe className="w-4 h-4 text-blue-400 mr-2" />
                  <span className="flex-1">English (US)</span>
                  {lang === 'en' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Logged In User Profile - Dropdown Badge (Only displayed AFTER completing onboarding profile) */}
            {isFullyOnboarded ? (
              <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2.5 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/90 px-3.5 py-1.5 rounded-full shadow transition-all cursor-pointer group relative">
                      {pendingNotificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white animate-pulse shadow-lg ring-2 ring-slate-950">
                          {pendingNotificationCount}
                        </span>
                      )}

                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-extrabold text-white max-w-[120px] truncate">
                          {currentProfile.full_name.split(' ')[0]}
                        </p>
                      </div>

                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${roleStyle.bg}`}>
                        {currentRole}
                      </span>

                      <CaretDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="right" className="w-64 p-2 space-y-1">
                    <DropdownMenuLabel className="pb-2 border-b border-slate-800">
                      <p className="text-xs font-extrabold text-white truncate">{currentProfile.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-medium capitalize mt-0.5">Peran: {roleStyle.label}</p>
                    </DropdownMenuLabel>

                    {/* Manajemen Profil Saya Navigation */}
                    <DropdownMenuItem 
                      onClick={() => setActiveTab('profile')}
                      active={activeTab === 'profile'}
                      className="cursor-pointer font-semibold text-slate-200 hover:text-purple-300 py-2.5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4.5 h-4.5 text-purple-400 shrink-0" />
                        <span>Manajemen Profil Saya</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        Profil
                      </span>
                    </DropdownMenuItem>

                    {/* Status Kolaborasi Navigation with Notification Badge */}
                    <DropdownMenuItem 
                      onClick={() => setActiveTab('dashboard/collaborations')}
                      active={activeTab === 'dashboard/collaborations'}
                      className="cursor-pointer font-semibold text-slate-200 hover:text-purple-300 py-2.5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Handshake className="w-4.5 h-4.5 text-purple-400 shrink-0" />
                        <span>Status Kolaborasi</span>
                      </div>

                      {pendingNotificationCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse shadow-md">
                          {pendingNotificationCount} Baru
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Dashboard
                        </span>
                      )}
                    </DropdownMenuItem>

                    {/* Logout Option */}
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 py-2.5 border-t border-slate-800/80 mt-1"
                    >
                      <SignOut className="w-4.5 h-4.5 text-rose-400 mr-2 shrink-0" />
                      <span>Keluar (Logout)</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>
            ) : (pendingUser || activeTab === 'onboarding' || activeTab === 'role-selection') ? (
              <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
                <span className="text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full animate-pulse">
                  Menyelesaikan Profil...
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('login')}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <SignIn className="w-4 h-4" />
                  <span>Masuk</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => setActiveTab('signup')}
                  className="gap-1.5 text-xs font-bold"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar</span>
                </Button>
              </div>
            )}

          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 animate-fade-in">
          
          {isFullyOnboarded ? (
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <User className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-xs font-extrabold text-white">{currentProfile.full_name}</p>
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase mt-0.5 ${roleStyle.bg}`}>
                      {currentRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile quick actions for Profil, Status Kolaborasi and Logout */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                  className="text-xs font-bold gap-1 text-slate-200 border-slate-700"
                >
                  <User className="w-4 h-4 text-purple-400" />
                  <span>Profil</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setActiveTab('dashboard/collaborations'); setMobileMenuOpen(false); }}
                  className="text-xs font-bold gap-1 text-purple-300 border-purple-500/30 relative"
                >
                  <Handshake className="w-4 h-4" />
                  <span>Kolaborasi</span>
                  {pendingNotificationCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                      {pendingNotificationCount}
                    </span>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="text-xs font-bold gap-1"
                >
                  <SignOut className="w-4 h-4" />
                  <span>Keluar</span>
                </Button>
              </div>
            </div>
          ) : (pendingUser || activeTab === 'onboarding' || activeTab === 'role-selection') ? (
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <span className="text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full inline-block animate-pulse">
                Menyelesaikan Pengisian Profil...
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => { setActiveTab('login'); setMobileMenuOpen(false); }} className="w-full text-xs">
                <SignIn className="w-4 h-4 mr-1" /> Masuk
              </Button>
              <Button size="sm" onClick={() => { setActiveTab('signup'); setMobileMenuOpen(false); }} className="w-full text-xs font-bold">
                <UserPlus className="w-4 h-4 mr-1" /> Daftar Akun
              </Button>
            </div>
          )}

          <div className="border-t border-slate-800 pt-3 space-y-2">
            {/* 1. Mobile Beranda */}
            <button
              onClick={() => {
                setActiveTab('overview');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium ${
                activeTab === 'overview' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{t('nav.home')}</span>
            </button>

            {/* 2. Mobile Dropdown / Sub-menu: Fitur & Layanan */}
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <button
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer"
              >
                <span>{t('nav.featuresServices') || 'Fitur & Layanan'}</span>
                <CaretDown className={`w-3.5 h-3.5 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileServicesOpen && (
                <div className="space-y-1 pl-2 border-l border-slate-800 mt-1">
                  {serviceSubItems.map(sub => {
                    const Icon = sub.icon;
                    const isSubActive = activeTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveTab(sub.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                          isSubActive ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${sub.color}`} />
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Mobile Aktivitas Kolaborasi */}
            <button
              onClick={() => {
                setActiveTab('collaboration-activity');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium ${
                activeTab === 'collaboration-activity' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>Aktivitas Kolaborasi</span>
            </button>

            {/* 4. Mobile Tentang Productify */}
            <button
              onClick={() => {
                setActiveTab('about');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium ${
                activeTab === 'about' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>Tentang Productify</span>
            </button>

            {/* 5. Mobile Moderasi Admin */}
            {currentRole === 'admin' && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  activeTab === 'admin' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{t('nav.admin')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
