import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LogoWhite from '../../assets/Logo_White.png';
import {
  InstagramLogo,
  EnvelopeSimple
} from '@phosphor-icons/react';

export const Footer = ({ setActiveTab }) => {
  const { isAuthenticated } = useAuth();
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 mt-20 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

          {/* Col 1: Brand Info with Logo_White.png */}
          <div className="space-y-4 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src={LogoWhite}
                alt="PRoductify Logo"
                className="h-9 w-auto object-contain"
              />
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Ekosistem Digital Public Relations terpadu yang memberdayakan UMKM, Startup, Agency Media, dan Influencer/KOL Indonesia.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Navigasi Utama</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setActiveTab('overview')} className="hover:text-purple-400 transition-colors cursor-pointer text-left">
                  Beranda / Overview
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('press-releases')} className="hover:text-purple-400 transition-colors cursor-pointer text-left">
                  Direktori Press Release
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('products')} className="hover:text-purple-400 transition-colors cursor-pointer text-left">
                  Product Showcase
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('marketplace')} className="hover:text-purple-400 transition-colors cursor-pointer text-left">
                  Marketplace KOL
                </button>
              </li>
              {isAuthenticated && (
                <li>
                  <button onClick={() => setActiveTab('dashboard/collaborations')} className="hover:text-purple-400 transition-colors cursor-pointer text-left">
                    Status Kolaborasi
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Bantuan & Legal (NEW SECTION) */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Bantuan & Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setActiveTab('terms')} className="hover:text-purple-400 transition-colors cursor-pointer text-left flex items-center gap-1.5">
                  <span>Syarat & Ketentuan</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('privacy')} className="hover:text-purple-400 transition-colors cursor-pointer text-left flex items-center gap-1.5">
                  <span>Kebijakan Privasi</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('faq')} className="hover:text-purple-400 transition-colors cursor-pointer text-left flex items-center gap-1.5">
                  <span>FAQ (Tanya Jawab)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Social Media PRoductify (Hanya Icon) */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Sosial Media PRoductify</h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Ikuti kabar dan siaran pers terbaru melalui saluran komunikasi resmi kami:
            </p>
            <div className="flex items-center gap-3">
              <a
                href="mailto:productify.pr@gmail.com"
                className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 hover:scale-105 transition-all shadow-md cursor-pointer"
                title="Email: productify.pr@gmail.com"
              >
                <EnvelopeSimple className="w-5 h-5" />
              </a>

              <a
                href="https://instagram.com/productify.pr"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-pink-400 hover:border-pink-500/50 hover:scale-105 transition-all shadow-md cursor-pointer"
                title="Instagram: @productify.pr"
              >
                <InstagramLogo className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800/60 pt-8 text-center sm:text-left text-xs text-slate-500">
          <p>© 2026 PRoductify. Seluruh Hak Cipta Dilindungi.</p>
        </div>

      </div>
    </footer>
  );
};
