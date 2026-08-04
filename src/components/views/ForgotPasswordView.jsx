import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { sanitizeInput, validatePasswordStrength } from '../../lib/security';
import { Button } from '../ui/Button';
import LogoWhite from '../../assets/Logo_White.png';
import { User, Lock, ArrowRight, ArrowLeft, WarningCircle, Eye, EyeSlash, CheckCircle, XCircle } from '@phosphor-icons/react';

export const ForgotPasswordView = ({ setActiveTab }) => {
  const { directResetPassword } = useAuth();
  const { toast } = useToast();
  
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const pwdStatus = validatePasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // SQL Injection Sanitization
    const cleanIdentifier = sanitizeInput(identifier);
    const cleanNewPassword = sanitizeInput(newPassword);
    const cleanConfirmPassword = sanitizeInput(confirmPassword);

    // Empty field toast callback
    if (!cleanIdentifier || !cleanNewPassword || !cleanConfirmPassword) {
      const missing = [];
      if (!cleanIdentifier) missing.push('Email / Nama Akun');
      if (!cleanNewPassword) missing.push('Kata Sandi Baru');
      if (!cleanConfirmPassword) missing.push('Konfirmasi Kata Sandi');

      const msg = `Silakan lengkapi kolom yang masih kosong: ${missing.join(', ')}.`;
      setErrorMsg(msg);
      toast.warning(msg);
      return;
    }

    if (!pwdStatus.isValid) {
      const msg = 'Kata sandi baru belum memenuhi syarat (minimal 6 karakter, 1 huruf besar, dan 1 angka).';
      setErrorMsg(msg);
      toast.warning(msg);
      return;
    }

    if (cleanNewPassword !== cleanConfirmPassword) {
      const msg = 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const updatedUser = await directResetPassword(cleanIdentifier, cleanNewPassword);
      toast.success(`Kata sandi akun ${updatedUser.full_name} berhasil diperbarui! Silakan masuk.`);
      setActiveTab('login');
    } catch (err) {
      const msg = err.message || 'Gagal memperbarui kata sandi. Silakan coba lagi.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="glass-card rounded-3xl p-8 border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center space-y-3">
          <img 
            src={LogoWhite} 
            alt="PRoductify Logo" 
            className="h-12 w-auto object-contain mx-auto" 
          />
          <h1 className="text-2xl font-black text-white">Ubah Kata Sandi Akun</h1>
          <p className="text-xs text-slate-400">
            Perbarui kata sandi akun Anda secara langsung dan aman.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
            <WarningCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email or Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email atau Nama Akun Terdaftar</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="nama@email.com atau Nama Lengkap"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kata Sandi Baru</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                minLength={6}
                placeholder="Minimal 6 karakter, 1 huruf besar, 1 angka"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border text-sm text-white focus:outline-none transition-colors ${
                  newPassword.length === 0 
                    ? 'border-slate-700 focus:border-purple-500' 
                    : pwdStatus.isValid 
                      ? 'border-emerald-500/70 focus:border-emerald-400' 
                      : 'border-rose-500/70 focus:border-rose-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeSlash className="w-4 h-4 text-purple-400" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Always-visible Password Requirements List Checklist */}
            <div className="mt-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-1.5 text-[11px]">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">Syarat Kata Sandi Baru:</p>
              
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

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Konfirmasi Kata Sandi Baru</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                minLength={6}
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full justify-center glow-purple mt-2"
          >
            <span>{loading ? 'Memperbarui Kata Sandi...' : 'Simpan & Perbarui Kata Sandi'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
          <button
            onClick={() => setActiveTab('login')}
            className="text-purple-400 font-bold hover:underline inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Masuk</span>
          </button>
        </div>

      </div>
    </div>
  );
};
