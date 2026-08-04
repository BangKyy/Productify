import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { sanitizeInput, validatePasswordStrength } from '../../lib/security';
import { Button } from '../ui/Button';
import LogoWhite from '../../assets/Logo_White.png';
import { User, EnvelopeSimple, Lock, ArrowRight, WarningCircle, Eye, EyeSlash, CheckCircle, XCircle } from '@phosphor-icons/react';

export const LoginView = ({ setActiveTab }) => {
  const { loginUser, loginAdminUser } = useAuth();
  const { toast } = useToast();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const pwdStatus = validatePasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // SQL Injection Sanitization
    const cleanIdentifier = sanitizeInput(identifier);
    const cleanPassword = sanitizeInput(password);

    // Empty field validation matching SignupView format
    if (!cleanIdentifier || !cleanPassword) {
      const missing = [];
      if (!cleanIdentifier) missing.push(isAdminMode ? 'Nama Lengkap Admin' : 'Alamat Email');
      if (!cleanPassword) missing.push('Kata Sandi');
      
      const msg = `Silakan lengkapi kolom yang masih kosong: ${missing.join(', ')}.`;
      setErrorMsg(msg);
      toast.warning(msg);
      return;
    }

    if (!isAdminMode && !cleanIdentifier.includes('@')) {
      const msg = 'Format email tidak valid (harus mengandung @).';
      setErrorMsg(msg);
      toast.warning(msg);
      return;
    }

    if (!isAdminMode && !pwdStatus.isValid) {
      const msg = 'Kata sandi belum memenuhi syarat (minimal 6 karakter, 1 huruf besar, dan 1 angka).';
      setErrorMsg(msg);
      toast.warning(msg);
      return;
    }

    setLoading(true);

    try {
      if (isAdminMode) {
        // Authenticate Admin strictly by full_name & password column matching in admin profiles table
        const adminProfile = await loginAdminUser(cleanIdentifier, cleanPassword);
        toast.success(`Berhasil masuk sebagai Administrator (${adminProfile.full_name})!`);
        if (setActiveTab) setActiveTab('admin');
      } else {
        const loggedInProfile = await loginUser(cleanIdentifier, cleanPassword);
        toast.success(`Berhasil masuk! Selamat datang kembali, ${loggedInProfile?.full_name || 'Pengguna'}.`);
        if (setActiveTab) setActiveTab('overview');
      }
    } catch (err) {
      const msg = err.message || 'Alamat email atau kata sandi yang Anda masukkan salah. Silakan periksa kembali.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminMode = () => {
    setIsAdminMode(prev => !prev);
    setErrorMsg('');
    setIdentifier('');
    setPassword('');

    if (!isAdminMode) {
      toast.info('Mode Login Admin Diaktifkan. Masukkan Nama Lengkap Admin terdaftar.');
    } else {
      toast.info('Mode Login Pengguna Biasa Diaktifkan.');
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
          <h1 className="text-2xl font-black text-white">
            {isAdminMode ? 'Masuk Sebagai Admin' : 'Masuk Akun PRoductify'}
          </h1>
          <p className="text-xs text-slate-400">
            {isAdminMode 
              ? 'Akses konsol verifikasi administrator platform PRoductify.' 
              : 'Akses dashboard ekosistem PR digital dan kelola portofolio akun kamu.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
            <WarningCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email / Username Input Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAdminMode ? 'Nama Lengkap Admin' : 'Alamat Email'}
            </label>

            <div className="relative">
              {isAdminMode ? (
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              ) : (
                <EnvelopeSimple className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              )}
              <input
                type={isAdminMode ? 'text' : 'email'}
                placeholder={isAdminMode ? 'Nama Lengkap Admin' : 'nama@email.com'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            {!isAdminMode && (
              <p className="text-[10px] text-slate-500 mt-1">
                Masukkan alamat email terdaftar akun PRoductify kamu.
              </p>
            )}
          </div>

          {/* Password Input Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Kata Sandi</label>
              {!isAdminMode && (
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot-password')}
                  className="text-[11px] text-purple-400 hover:text-purple-300 hover:underline font-semibold cursor-pointer"
                >
                  Lupa Kata Sandi?
                </button>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={isAdminMode ? 'Masukkan kata sandi Admin' : 'Minimal 6 karakter, 1 huruf besar, 1 angka'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
              >
                {showPassword ? <EyeSlash className="w-4 h-4 text-purple-400" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Requirements List Checklist (Hidden in Admin Mode) */}
            {!isAdminMode && (
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
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full justify-center glow-purple mt-2 cursor-pointer"
          >
            <span>{loading ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Clean Footer Text Links Matching UI Structure */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2 text-center text-xs text-slate-400">
          {!isAdminMode && (
            <div>
              <span>Belum memiliki akun? </span>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className="text-purple-400 font-bold hover:underline ml-1 cursor-pointer"
              >
                Daftar Akun Baru
              </button>
            </div>
          )}

          <div>
            <span>{isAdminMode ? 'Ingin masuk akun pengguna biasa? ' : 'Atau ingin mengelola platform? '}</span>
            <button
              type="button"
              onClick={toggleAdminMode}
              className={`font-bold hover:underline ml-1 cursor-pointer ${isAdminMode ? 'text-purple-400' : 'text-emerald-400'}`}
            >
              {isAdminMode ? 'Masuk Pengguna Biasa' : 'Masuk sebagai Admin'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
