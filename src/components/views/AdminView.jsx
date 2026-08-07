import React, { useEffect } from 'react';
import { Breadcrumb } from '../ui/Breadcrumb';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  ShieldCheck,
  Database,
  UsersThree,
  Storefront,
  CheckCircle,
  Sparkle,
  User
} from '@phosphor-icons/react';

export const AdminView = ({ setActiveTab }) => {
  const { profiles, currentRole, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('Harap login terlebih dahulu untuk membuka fitur admin.');
      if (setActiveTab) setActiveTab('login');
    } else if (currentRole !== 'admin') {
      toast.error('Akses ditolak: Fitur admin hanya dapat diakses oleh peran Admin.');
      if (setActiveTab) setActiveTab('overview');
    }
  }, [isAuthenticated, currentRole]);

  if (!isAuthenticated || currentRole !== 'admin') {
    return (
      <div className="py-20 text-center glass-card rounded-3xl p-8 space-y-4">
        <ShieldCheck className="w-16 h-16 text-rose-500 mx-auto animate-bounce" />
        <h2 className="text-2xl font-black text-white">Akses Hanya untuk Admin</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Halaman ini khusus untuk administrator platform. Silakan masuk menggunakan akun dengan akses Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Breadcrumb Navigation */}
      <div>
        <Breadcrumb items={[{ label: 'Konsol Admin', icon: ShieldCheck }]} setActiveTab={setActiveTab} />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-3xl glass-card border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Moderasi Platform & Audit Keamanan
          </div>
          <h1 className="text-3xl font-extrabold text-white">Konsol Admin Productify</h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Kelola verifikasi akun pengguna, moderasi konten press release, serta pantau performa ekosistem PR digital.
          </p>
        </div>

        {/* Server Status Badge */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-card border-slate-700">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div className="text-left text-xs">
            <p className="text-slate-400 font-medium">Status Server Cloud:</p>
            <p className="font-bold text-emerald-300">
              {isSupabaseConfigured ? 'Terhubung ke Server Cloud Utama' : 'Mode Simulasi Lokal (Aktif)'}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6 rounded-2xl border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Total Pengguna RBAC</p>
            <p className="text-3xl font-black text-white">{profiles.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
            <UsersThree className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Verifikasi Peran UMKM</p>
            <p className="text-3xl font-black text-white">{profiles.filter(p => p.role === 'umkm').length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Storefront className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Profil Influencer Terverifikasi</p>
            <p className="text-3xl font-black text-white">{profiles.filter(p => p.role === 'influencer').length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Sparkle className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Keamanan Akses Data</p>
            <p className="text-lg font-bold text-emerald-400">TERLINDUG & AMAN</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* User Verification Audit Table */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white">Daftar Pengguna & Verifikasi Peran (RBAC)</h2>
            <p className="text-xs text-slate-400">Pengguna terdaftar dalam sistem verifikasi akun Productify.</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Live Audit
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-bold">Nama Pengguna</th>
                <th className="py-3.5 px-4 font-bold">Peran (Role)</th>
                <th className="py-3.5 px-4 font-bold">Kontak HP</th>
                <th className="py-3.5 px-4 font-bold">Lokasi / Alamat</th>
                <th className="py-3.5 px-4 font-bold text-right">Status Moderasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {profiles.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 font-semibold text-white flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <span>{p.full_name}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="capitalize px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 font-semibold text-purple-300">
                      {p.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">{p.phone_number || '-'}</td>
                  <td className="py-4 px-4">{p.address || '-'}</td>
                  <td className="py-4 px-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Terverifikasi
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
