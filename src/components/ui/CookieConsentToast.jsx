import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X, Check } from '@phosphor-icons/react';
import { getCookieConsent, setCookieConsent } from '../../lib/cookies';
import { useToast } from '../../context/ToastContext';

export const CookieConsentToast = () => {
  const [visible, setVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if consent has already been given
    const consent = getCookieConsent();
    if (!consent) {
      // Small delay for smooth pop-in animation
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setCookieConsent('accepted');
    setVisible(false);
    toast.success('Persetujuan cookies telah berhasil diizinkan!');
  };

  const handleDismiss = () => {
    setCookieConsent('essential');
    setVisible(false);
    toast.info('Hanya cookies sesi penting 24 jam yang diaktifkan.');
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-purple-950/40 text-slate-100 flex flex-col gap-3 relative overflow-hidden group">
        {/* Top Accent Gradient Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide">
                Izinkan Cookies Sesi (24 Jam)
              </h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 mt-0.5">
                <ShieldCheck className="w-3 h-3" /> Privasi & Sesi Aman
              </span>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Tutup banner cookies"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed">
          Kami menggunakan cookies untuk menjaga keamanan akun Anda. Sesi login akan disimpan selama{' '}
          <strong className="text-purple-300 font-semibold">24 Jam</strong> dan akun akan otomatis logout setelahnya demi keamanan data Anda.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleAccept}
            className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Izinkan Cookies
          </button>
          
          <button
            onClick={handleDismiss}
            className="py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-all cursor-pointer"
          >
            Hanya Sesi
          </button>
        </div>
      </div>
    </div>
  );
};
