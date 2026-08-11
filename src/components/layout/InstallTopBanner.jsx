import React, { useState, useEffect } from 'react';
import { Sparkle, DownloadSimple, X } from '@phosphor-icons/react';
import { useToast } from '../../context/ToastContext';

export const InstallTopBanner = () => {
  const { toast } = useToast();
  const [visible, setVisible] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const inStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(inStandalone);

    const isDismissed = sessionStorage.getItem('productify_top_banner_dismissed');
    if (isDismissed) setVisible(false);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleDirectTrigger = () => {
      handleInstallApp();
    };
    window.addEventListener('productify_trigger_direct_install', handleDirectTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('productify_trigger_direct_install', handleDirectTrigger);
    };
  }, [deferredPrompt, toast]);

  const handleDismiss = () => {
    sessionStorage.setItem('productify_top_banner_dismissed', 'true');
    setVisible(false);
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        if (toast?.success) toast.success('Terima kasih telah mengunduh & memasang aplikasi PRoductify!');
        setVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      if (toast?.info) {
        toast.info('Permintaan unduh aplikasi telah dipicu langsung dari peramban Anda.');
      }
    }
  };

  if (!visible || isStandalone) return null;

  return (
    <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-b border-purple-500/25 py-2 px-3 sm:px-6 text-slate-200 transition-all relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 text-xs">
        
        {/* Banner Info Text */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] sm:text-xs font-black shrink-0 flex items-center gap-1 shadow-sm">
            <Sparkle className="w-3 h-3 text-amber-400 shrink-0" />
            <span>BARU</span>
          </span>
          <p className="text-slate-200 font-semibold text-[11px] sm:text-xs truncate">
            <span className="hidden sm:inline">Dapatkan pengalaman akses cepat & tanpa hambatan. </span>
            <span>Pasang PRoductify di HP atau Laptop Anda.</span>
          </p>
        </div>

        {/* Action Button & Close */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={handleInstallApp}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-[10px] sm:text-[11px] shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <DownloadSimple className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Unduh App</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Tutup Banner"
          >
            <X className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
          </button>
        </div>

      </div>
    </div>
  );
};
