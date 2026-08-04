import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
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
  Handshake
} from '@phosphor-icons/react';

const ROLE_BADGE_STYLE = {
  umkm: { label: 'UMKM / Brand', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  influencer: { label: 'Influencer / KOL', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  agency: { label: 'Agency PR', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  admin: { label: 'Admin', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' }
};

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { currentProfile, currentRole, isAuthenticated, logoutUser } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Main navigation items (Status Kolaborasi is now in User Dropdown Menu)
  const navItems = [
    { id: 'overview', label: t('nav.home') },
    { id: 'press-releases', label: t('nav.pressReleases') },
    { id: 'products', label: t('nav.products') },
    { id: 'marketplace', label: 'Marketplace KOL' },
    ...(currentRole === 'admin' ? [{ id: 'admin', label: t('nav.admin') }] : [])
  ];

  const roleStyle = ROLE_BADGE_STYLE[currentRole] || ROLE_BADGE_STYLE.umkm;

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
              alt="PRoductify Logo" 
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" 
            />
          </div>

          {/* Clean Desktop Links Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/60 p-1.5 rounded-full border border-slate-700/60">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md glow-purple'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
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
                  <span className="text-base mr-1">🇮🇩</span>
                  <span className="flex-1">Bahasa Indonesia</span>
                  {lang === 'id' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang('en')} active={lang === 'en'}>
                  <span className="text-base mr-1">🇬🇧</span>
                  <span className="flex-1">English (US)</span>
                  {lang === 'en' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Logged In User Profile - Dropdown Badge */}
            {isAuthenticated && currentProfile ? (
              <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2.5 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/90 px-3.5 py-1.5 rounded-full shadow transition-all cursor-pointer group">
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

                  <DropdownMenuContent align="right" className="w-56 p-2 space-y-1">
                    <DropdownMenuLabel className="pb-2 border-b border-slate-800">
                      <p className="text-xs font-extrabold text-white truncate">{currentProfile.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-medium capitalize mt-0.5">Peran: {roleStyle.label}</p>
                    </DropdownMenuLabel>

                    {/* Status Kolaborasi Navigation */}
                    <DropdownMenuItem 
                      onClick={() => setActiveTab('dashboard/collaborations')}
                      active={activeTab === 'dashboard/collaborations'}
                      className="cursor-pointer font-semibold text-slate-200 hover:text-purple-300 py-2.5"
                    >
                      <Handshake className="w-4.5 h-4.5 text-purple-400 mr-2 shrink-0" />
                      <span>Status Kolaborasi</span>
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
          
          {isAuthenticated && currentProfile ? (
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

              {/* Mobile quick actions for Status Kolaborasi and Logout */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setActiveTab('dashboard/collaborations'); setMobileMenuOpen(false); }}
                  className="text-xs font-bold gap-1 text-purple-300 border-purple-500/30"
                >
                  <Handshake className="w-4 h-4" />
                  <span>Kolaborasi</span>
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

          <div className="border-t border-slate-800 pt-3 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-purple-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
