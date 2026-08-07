import React, { useState } from 'react';
import { UserPlus } from '@phosphor-icons/react';
import { Breadcrumb } from '../ui/Breadcrumb';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { sanitizeInput, validatePasswordStrength } from '../../lib/security';
import { Button } from '../ui/Button';
import LogoWhite from '../../assets/Logo_White.png';
import { User, Envelope, Lock, ArrowRight, WarningCircle, Eye, EyeSlash, CheckCircle, XCircle } from '@phosphor-icons/react';

export const SignupView = ({ setActiveTab }) => {
  const { signupUser } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const pwdStatus = validatePasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // SQL Injection Sanitization
    const cleanFullName = sanitizeInput(fullName);
    const cleanEmail = sanitizeInput(email);
    const cleanPassword = sanitizeInput(password);

    // Empty field toast callback
    if (!cleanFullName || !cleanEmail || !cleanPassword) {
      const missing = [];
      if (!cleanFullName) missing.push('Nama Lengkap');
      if (!cleanEmail) missing.push('Alamat Email');
      if (!cleanPassword) missing.push('Kata Sandi');
      
      const msg = `Silakan lengkapi kolom yang masih kosong: ${missing.join(', ')}.`;
      setErrorMsg(msg);
      toast.warning(msg);
      return;
    }

    if (!pwdStatus.isValid) {
      const msg = 'Kata sandi belum memenuhi syarat (minimal 6 karakter, 1 huruf besar, dan 1 angka).';
      setErrorMsg(msg);
      toast.warning(msg);
      return;
    }

    setLoading(true);

    try {
      await signupUser(cleanEmail, cleanPassword, cleanFullName);
      toast.success('Pendaftaran akun berhasil! Silakan pilih role profil Anda.');
      setActiveTab('onboarding');
    } catch (err) {
      const msg = err.message || 'Gagal mendaftar. Silakan gunakan email lain.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6">
      <div className="flex justify-center">
        <Breadcrumb items={[{ label: 'Daftar Akun Baru', icon: UserPlus }]} setActiveTab={setActiveTab} />
      </div>
      <div className="glass-card rounded-3xl p-8 border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center space-y-3">
          <img 
            src={LogoWhite} 
            alt="Productify Logo" 
            className="h-12 w-auto object-contain mx-auto" 
          />
          <h1 className="text-2xl font-black text-white">Buat Akun Productify</h1>
          <p className="text-xs text-slate-400">
            Bergabunglah dengan ribuan UMKM, Agency, dan Influencer di Indonesia.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
            <WarningCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Lengkap / Perusahaan</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Masukan Nama Kamu atau Perusahaan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Alamat Email</label>
            <div className="relative">
              <Envelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors lowercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                minLength={6}
                placeholder="Minimal 6 karakter, 1 huruf besar, 1 angka"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border text-sm text-white focus:outline-none transition-colors ${
                  password.length === 0
                    ? 'border-slate-700 focus:border-indigo-500'
                    : pwdStatus.isValid
                      ? 'border-emerald-500/70 focus:border-emerald-400'
                      : 'border-rose-500/70 focus:border-rose-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
              >
                {showPassword ? <EyeSlash className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Always-visible Password Requirements List Checklist */}
            <div className="mt-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-1.5 text-[11px]">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">Syarat Kata Sandi:</p>
              
              <div className={`flex items-center gap-1.5 transition-colors ${pwdStatus.hasMinLength ? 'text-emerald-400 font-semibold' : 'text-rose-400'}`}>
                {pwdStatus.hasMinLength ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />}
                <span>Minimal 6 karakter</span>
              </div>

              <div className={`flex items-center gap-1.5 transition-colors ${pwdStatus.hasUppercase ? 'text-emerald-400 font-semibold' : 'text-rose-400'}`}>
                {pwdStatus.hasUppercase ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />}
                <span>Mengandung minimal 1 huruf besar (A-Z)</span>
              </div>

              <div className={`flex items-center gap-1.5 transition-colors ${pwdStatus.hasNumber ? 'text-emerald-400 font-semibold' : 'text-rose-400'}`}>
                {pwdStatus.hasNumber ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />}
                <span>Mengandung minimal 1 angka (0-9)</span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full justify-center glow-purple mt-2"
          >
            <span>{loading ? 'Mendaftarkan...' : 'Lanjut ke Pilihan Role'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
          <span>Sudah punya akun? </span>
          <button
            onClick={() => setActiveTab('login')}
            className="text-indigo-400 font-bold hover:underline ml-1"
          >
            Masuk di sini
          </button>
        </div>

      </div>
    </div>
  );
};
