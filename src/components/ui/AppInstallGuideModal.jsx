import React, { useState, useEffect } from 'react';
import LogoWhite from '../../assets/Logo_White.png';
import { 
  DownloadSimple, 
  DeviceMobile, 
  Desktop, 
  Sparkle, 
  X, 
  CheckCircle,
  ShareNetwork,
  DotsThreeVertical,
  PlusCircle,
  Browsers,
  ArrowRight
} from '@phosphor-icons/react';

export const AppInstallGuideModal = () => {
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [activeDeviceTab, setActiveDeviceTab] = useState('mobile'); // 'mobile' | 'desktop'
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already running as standalone PWA
    const inStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(inStandalone);

    // Capture browser PWA install event if available
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for custom trigger to re-open modal anytime (e.g. from navbar/footer)
    const handleOpenCustom = () => setOpen(true);
    window.addEventListener('productify_open_install_modal', handleOpenCustom);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('productify_open_install_modal', handleOpenCustom);
    };
  }, []);

  const handleClose = () => {
    localStorage.setItem('productify_app_install_guided_v1', 'true');
    setOpen(false);
  };

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('productify_app_install_guided_v1', 'true');
        setOpen(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!open || isStandalone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card max-w-xl w-full rounded-3xl p-6 sm:p-8 space-y-6 border-purple-500/30 relative max-h-[92vh] overflow-y-auto shadow-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950/20">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Tutup Petunjuk"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="space-y-3 text-center sm:text-left pt-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold shadow-md">
              <Sparkle className="w-4 h-4 text-amber-400" />
              <span>Pengalaman Aplikasi Terbaik</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              ✓ Cepat & Ringan
            </span>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start pt-1">
            <img src={LogoWhite} alt="PRoductify Logo" className="h-8 sm:h-9 w-auto object-contain" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
            Pasang PRoductify di Perangkat Anda!
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Dapatkan akses secepat kilat ke direktori Press Release, Produk UMKM, dan Marketplace KOL langsung dari layar HP atau Laptop Anda tanpa perlu membuka browser.
          </p>
        </div>

        {/* Native Browser PWA Install Callout (If Browser Supports) */}
        {deferredPrompt && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="space-y-0.5 text-center sm:text-left">
              <p className="text-xs font-extrabold text-white flex items-center gap-1.5 justify-center sm:justify-start">
                <Sparkle className="w-4 h-4 text-amber-400" /> Perangkat Anda Mendukung Instalasi Langsung
              </p>
              <p className="text-[11px] text-slate-300">Klik tombol di samping untuk memasang aplikasi secara otomatis.</p>
            </div>
            <button
              onClick={handleNativeInstall}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <DownloadSimple className="w-4 h-4" />
              <span>⚡ Pasang Sekarang</span>
            </button>
          </div>
        )}

        {/* Device Selection Tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-1">
            <span>PETUNJUK PEMASANGAN MANUAL:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setActiveDeviceTab('mobile')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeDeviceTab === 'mobile'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <DeviceMobile className="w-4 h-4 shrink-0" />
              <span>HP / Mobile</span>
            </button>

            <button
              onClick={() => setActiveDeviceTab('desktop')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeDeviceTab === 'desktop'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Desktop className="w-4 h-4 shrink-0" />
              <span>Laptop / PC</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Instructions Content */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5 text-xs text-slate-300">
          {activeDeviceTab === 'mobile' ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <div>
                  <p className="font-bold text-white">Buka Menu Peramban Browser HP</p>
                  <p className="text-[11px] text-slate-400">
                    Tap ikon <strong className="text-purple-300">Titik Tiga (⋮)</strong> di Android atau ikon <strong className="text-purple-300">Bagikan (Share <ShareNetwork className="inline w-3 h-3 text-purple-400" />)</strong> di iOS Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <div>
                  <p className="font-bold text-white">Pilih "Tambahkan ke Layar Utama"</p>
                  <p className="text-[11px] text-slate-400">
                    Scroll dan pilih opsi <strong className="text-emerald-300">"Tambahkan ke Layar Utama"</strong> (*Add to Home Screen*) atau *"Install App"*.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <div>
                  <p className="font-bold text-white">Buka Langsung dari Home Screen HP</p>
                  <p className="text-[11px] text-slate-400">
                    Ikon aplikasi PRoductify akan muncul di HP Anda dan siap digunakan seperti aplikasi native!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <div>
                  <p className="font-bold text-white">Cari Ikon Install di Address Bar</p>
                  <p className="text-[11px] text-slate-400">
                    Di peramban Chrome/Edge/Brave, perhatikan ikon <strong className="text-purple-300">Install App (⊕)</strong> di sebelah kanan bilah URL web.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <div>
                  <p className="font-bold text-white">Atau Klik Menu `⋮` → "Install PRoductify"</p>
                  <p className="text-[11px] text-slate-400">
                    Buka menu titik tiga di pojok kanan atas browser → pilih <strong className="text-emerald-300">"Install PRoductify..."</strong> atau *"Simpan dan Bagikan"*.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <div>
                  <p className="font-bold text-white">Aplikasi Desktop Siap Digunakan</p>
                  <p className="text-[11px] text-slate-400">
                    PRoductify akan terbuka dalam jendela desktop terpisah tanpa bilah browser.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Tanpa memakan ruang penyimpanan berat</span>
          </div>

          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Lanjutkan ke Website</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
