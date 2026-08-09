import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dataService, isSupabaseConfigured, getItemDedupeKey } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  Handshake, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Sparkle, 
  Broadcast, 
  CurrencyDollar, 
  User, 
  Storefront,
  LockKey,
  SignIn,
  UserPlus,
  ArrowDownLeft,
  ArrowUpRight,
  Tray,
  PaperPlaneTilt,
  Lightning
} from '@phosphor-icons/react';
import { Breadcrumb } from '../ui/Breadcrumb';

const STATUS_MAP = {
  pending: { label: 'Menunggu Persetujuan', variant: 'amber', icon: Clock },
  accepted: { label: 'Disetujui / Berjalan', variant: 'emerald', icon: CheckCircle },
  rejected: { label: 'Ditolak', variant: 'rose', icon: XCircle },
  completed: { label: 'Selesai Sempurna', variant: 'blue', icon: Sparkle }
};

export const DashboardCollaborationsView = ({ setActiveTab }) => {
  const { profiles, currentProfile, currentRole, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabDirection, setTabDirection] = useState('ALL'); // 'ALL' | 'INCOMING' | 'OUTGOING'
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [realtimePulse, setRealtimePulse] = useState(false);

  const fetchCollaborations = async () => {
    setLoading(true);
    try {
      const data = await dataService.getCollaborations();
      const rawList = Array.isArray(data) ? data : [];
      const uniqueMap = new Map();
      rawList.forEach(item => {
        if (item) {
          const key = getItemDedupeKey(item);
          if (key && !uniqueMap.has(key)) {
            uniqueMap.set(key, item);
          }
        }
      });
      setCollaborations(Array.from(uniqueMap.values()));
    } catch (err) {
      console.warn('Failed to fetch collaborations:', err);
      setCollaborations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchCollaborations();

    let unsubscribe = () => {};
    if (typeof dataService.subscribeCollaborationsRealtime === 'function') {
      try {
        unsubscribe = dataService.subscribeCollaborationsRealtime((payload) => {
          setRealtimePulse(true);
          setTimeout(() => setRealtimePulse(false), 2000);
          fetchCollaborations();
        }) || (() => {});
      } catch (err) {
        console.warn('Subscription error notice:', err);
      }
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [isAuthenticated]);

  const handleStatusChange = async (collab, newStatus) => {
    if (!isAuthenticated) {
      toast.warning('Anda wajib masuk (login) terlebih dahulu untuk mengubah status kolaborasi.');
      if (setActiveTab) setActiveTab('login');
      return;
    }

    const notes = collab?.notes || '';
    const isAgencyInitiator = notes.includes('[Initiator: agency]');
    const isInfluencerInitiator = notes.includes('[Initiator: influencer]');

    // Determine if current logged-in profile is the Initiator or Target Recipient
    let isAuthorized = currentRole === 'admin';

    if (!isAuthorized && currentProfile) {
      const isInitiator = (isAgencyInitiator || isInfluencerInitiator) 
        ? (currentProfile.id === collab.influencer_id)
        : (currentProfile.id === collab.brand_id);

      if (!isInitiator) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      toast.error('Hanya pihak penerima ajuan kerja sama (yang diajak) yang berhak merespons kolaborasi ini.');
      return;
    }

    try {
      await dataService.updateCollaborationStatus(collab.id, newStatus);
      toast.success(`Status kolaborasi berhasil diperbarui menjadi ${STATUS_MAP[newStatus]?.label || newStatus}!`);
      fetchCollaborations();
    } catch (err) {
      toast.error('Gagal memperbarui status kolaborasi.');
    }
  };

  // Special Access Protection: Only logged-in users can view the collaboration status dashboard
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border-purple-500/30 space-y-6 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-400">
            <LockKey className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <Badge variant="purple" className="gap-1.5 py-1 px-3">
              <Sparkle className="w-3.5 h-3.5" />
              <span>Akses Khusus — Pengguna Terautentikasi</span>
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Status Kolaborasi Ecosystem
            </h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Halaman ini memuat data riil status pengajuan kerja sama antara Brand UMKM dan Influencer KOL. Silakan masuk (login) terlebih dahulu untuk memantau atau mengelola status proyek kolaborasi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              className="glow-purple w-full sm:w-auto font-bold cursor-pointer"
              onClick={() => setActiveTab && setActiveTab('login')}
            >
              <SignIn className="w-4 h-4" />
              <span>Masuk ke Akun Anda</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto font-bold cursor-pointer"
              onClick={() => setActiveTab && setActiveTab('signup')}
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Akun Baru</span>
            </Button>
          </div>

        </div>
      </div>
    );
  }

  const safeList = Array.isArray(collaborations) ? collaborations : [];

  // Strict Privacy Filter: Only display collaboration records where current logged-in profile is directly involved (brand_id or influencer_id), or for Admin role.
  const userCollaborations = safeList.filter(c => {
    if (currentRole === 'admin') return true;
    if (!currentProfile || !currentProfile.id) return false;
    return c.brand_id === currentProfile.id || c.influencer_id === currentProfile.id;
  });

  // Categorize into INCOMING (Diajak) vs OUTGOING (Mengajak)
  const categorizedCollaborations = userCollaborations.map(c => {
    const isAgencyInit = (c.notes || '').includes('[Initiator: agency]');
    const isInfInit = (c.notes || '').includes('[Initiator: influencer]');

    const isInitiatorProposer = currentProfile && (
      (isAgencyInit || isInfInit)
        ? (currentProfile.id === c.influencer_id)
        : (currentProfile.id === c.brand_id)
    );

    const direction = isInitiatorProposer ? 'OUTGOING' : 'INCOMING';

    return {
      ...c,
      direction,
      isInitiatorProposer,
      isTargetRecipient: currentRole === 'admin' || !isInitiatorProposer,
      isAgencyInit,
      isInfInit
    };
  });

  const incomingList = categorizedCollaborations.filter(c => c.direction === 'INCOMING');
  const outgoingList = categorizedCollaborations.filter(c => c.direction === 'OUTGOING');
  const pendingIncomingList = incomingList.filter(c => c.status === 'pending');

  const filteredCollaborations = categorizedCollaborations.filter(c => {
    const matchesDirection = tabDirection === 'ALL' || c.direction === tabDirection;
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    return matchesDirection && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Breadcrumb Navigation */}
      <div>
        <Breadcrumb items={[{ label: 'Status Kolaborasi', icon: Handshake }]} setActiveTab={setActiveTab} />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-8 rounded-3xl glass-card border-slate-800">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <Handshake className="w-4 h-4" /> Monitoring Status Kerjasama Realtime
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Status Kolaborasi Ecosystem</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Pantau dan bedakan ajuan proyek yang Anda ajukan (Mengajak) serta tawaran yang Anda terima (Diajak).
          </p>
        </div>

        {/* Supabase Realtime Sync Badge Indicator */}
        <div className={`flex items-center gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl glass-card border transition-all shrink-0 w-full sm:w-auto justify-center sm:justify-start ${
          realtimePulse ? 'border-emerald-400 bg-emerald-500/20 scale-105' : 'border-slate-700'
        }`}>
          <div className="relative shrink-0">
            <Broadcast className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div className="text-left text-xs">
            <p className="text-slate-400 font-medium">Status Sinkronisasi Sistem:</p>
            <p className="font-bold text-emerald-300">
              {isSupabaseConfigured ? 'Terhubung Langsung (Realtime Live)' : 'Sinkronisasi Otomatis Aktif'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Direction Tabs: DIAJAK vs MENGAJAK */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-3xl glass-card border-slate-800 shadow-lg">
        <button
          onClick={() => setTabDirection('ALL')}
          className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-none ${
            tabDirection === 'ALL'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Handshake className="w-4 h-4 shrink-0" />
          <span>Semua Proyek ({userCollaborations.length})</span>
        </button>

        <button
          onClick={() => setTabDirection('INCOMING')}
          className={`flex items-center justify-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer relative flex-1 sm:flex-none ${
            tabDirection === 'INCOMING'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Tray className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Permintaan Masuk (Diajak)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-extrabold shrink-0">
            {incomingList.length}
          </span>
          {pendingIncomingList.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-black animate-pulse shadow-md flex items-center gap-1 shrink-0">
              <Lightning className="w-3 h-3" />
              <span>{pendingIncomingList.length} Perlu Tanggapan</span>
            </span>
          )}
        </button>

        <button
          onClick={() => setTabDirection('OUTGOING')}
          className={`flex items-center justify-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-none ${
            tabDirection === 'OUTGOING'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <PaperPlaneTilt className="w-4 h-4 text-indigo-300 shrink-0" />
          <span>Pengajuan Keluar (Mengajak)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] bg-indigo-950/60 text-indigo-300 border border-indigo-500/40 font-extrabold shrink-0">
            {outgoingList.length}
          </span>
        </button>
      </div>

      {/* Status Filter Pills & User Role Label */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
          {['ALL', 'pending', 'accepted', 'rejected', 'completed'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                filterStatus === st
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md font-bold'
                  : 'glass-card text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'Semua Status' : STATUS_MAP[st]?.label || st}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-medium self-end sm:self-auto">
          Peran Pengguna Aktif: <strong className="text-purple-300 uppercase">{currentRole}</strong>
        </div>
      </div>

      {/* Collaborations List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Memuat status kolaborasi...</div>
      ) : filteredCollaborations.length === 0 ? (
        <div className="py-20 text-center glass-card rounded-3xl p-8 space-y-3">
          <Handshake className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Tidak Ada Proyek Kolaborasi</h3>
          <p className="text-sm text-slate-400">Belum ada pengajuan kerja sama pada kategori filter ini.</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {filteredCollaborations.map(collab => {
            const stInfo = STATUS_MAP[collab.status] || STATUS_MAP.pending;
            const StatusIcon = stInfo.icon;
            const displayNotes = (collab.notes || '').replace(/\[Initiator:\s*(brand|influencer|agency)\]/gi, '').trim();

            const isTargetRecipient = collab.isTargetRecipient;
            const isIncoming = collab.direction === 'INCOMING';

            let initiatorRoleName = 'Brand UMKM';
            let targetRoleName = 'Influencer KOL';
            let initiatorUserFullName = '';

            if (collab.isAgencyInit) {
              initiatorRoleName = 'Agency PR';
              targetRoleName = 'Mitra Kolaborasi';
              const infProf = Array.isArray(profiles) ? profiles.find(p => p.id === collab.influencer_id) : null;
              if (infProf?.full_name) initiatorUserFullName = ` (${infProf.full_name})`;
            } else if (collab.isInfInit) {
              initiatorRoleName = 'Influencer KOL';
              targetRoleName = 'Brand UMKM';
              const infProf = Array.isArray(profiles) ? profiles.find(p => p.id === collab.influencer_id) : null;
              if (infProf?.full_name) initiatorUserFullName = ` (${infProf.full_name})`;
            } else {
              initiatorRoleName = 'Brand UMKM';
              targetRoleName = 'Influencer KOL';
              const brandProf = Array.isArray(profiles) ? profiles.find(p => p.id === collab.brand_id) : null;
              if (brandProf?.full_name) initiatorUserFullName = ` (${brandProf.full_name})`;
            }

            return (
              <Card 
                key={collab.id} 
                className={`p-4 sm:p-6 space-y-4 sm:space-y-5 transition-all rounded-3xl shadow-xl ${
                  isIncoming && collab.status === 'pending'
                    ? 'border-amber-500/60 bg-gradient-to-r from-amber-950/20 via-slate-900/90 to-slate-900/90 shadow-amber-500/5'
                    : isIncoming
                    ? 'border-emerald-500/40 hover:border-emerald-500/70'
                    : 'border-indigo-500/40 hover:border-indigo-500/70'
                }`}
              >
                {/* Distinct Direction Badge Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs pb-3.5 border-b border-slate-800/80">
                  {isIncoming ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-[11px] sm:text-xs">
                        <ArrowDownLeft className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>PERMINTAAN MASUK (Anda Diajak Kerja Sama)</span>
                      </div>
                      {collab.status === 'pending' && (
                        <span className="bg-rose-500 text-white font-black text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full animate-pulse shadow-md flex items-center gap-1">
                          <Lightning className="w-3 h-3" />
                          <span>Perlu Tanggapan Anda</span>
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-extrabold text-[11px] sm:text-xs">
                      <ArrowUpRight className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>PENGAJUAN KELUAR (Anda Mengajak Kerja Sama)</span>
                    </div>
                  )}

                  <Badge variant={stInfo.variant} className="gap-1.5 py-1 px-3 self-start sm:self-auto shrink-0">
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{stInfo.label}</span>
                  </Badge>
                </div>

                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-400">
                      Diajukan oleh: <strong className="text-purple-300 font-extrabold">{initiatorRoleName}{initiatorUserFullName}</strong>
                    </span>
                    {collab.created_at && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">
                          {new Date(collab.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">{collab.project_title}</h3>

                  {(() => {
                    const brandProf = Array.isArray(profiles) ? profiles.find(p => p.id === collab.brand_id) : null;
                    const infProf = Array.isArray(profiles) ? profiles.find(p => p.id === collab.influencer_id) : null;
                    const brandName = brandProf?.full_name || collab.brand_name || 'Brand UMKM';
                    const influencerName = infProf?.full_name || collab.influencer_name || 'Influencer KOL';

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                          <Storefront className="w-4 h-4 text-purple-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400">Brand UMKM</p>
                            <p className="font-bold text-white truncate">{brandName}</p>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                          <User className="w-4 h-4 text-amber-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400">Influencer KOL</p>
                            <p className="font-bold text-white truncate">{influencerName}</p>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                          <CurrencyDollar className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400">Budget Kampanye</p>
                            <p className="font-bold text-emerald-400 truncate">Rp {Number(collab.budget || 0).toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {displayNotes && (
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 italic">
                      &quot;{displayNotes}&quot;
                    </div>
                  )}
                </div>

                {/* Differentiated Action Controls based on Initiator vs Target Recipient */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 pt-3 border-t border-slate-800/80">
                  
                  {collab.status === 'pending' && (
                    <>
                      {/* Only the Target Recipient (the one being invited) or Admin gets Accept / Reject buttons */}
                      {isTargetRecipient ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer flex-1 sm:flex-none justify-center"
                            onClick={() => handleStatusChange(collab, 'accepted')}
                          >
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            <span>Accept (Terima)</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            className="cursor-pointer flex-1 sm:flex-none justify-center"
                            onClick={() => handleStatusChange(collab, 'rejected')}
                          >
                            <XCircle className="w-4 h-4 shrink-0" />
                            <span>Reject (Tolak)</span>
                          </Button>
                        </div>
                      ) : (
                        /* The Proposer (the one who initiated) only sees status indicator badge without buttons */
                        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-2xl text-xs text-amber-300 font-semibold w-full sm:w-auto justify-center sm:justify-start">
                          <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                          <span>Menunggu Tanggapan {targetRoleName}</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Mark Complete Action Button (Only for Target Recipient or Admin) */}
                  {collab.status === 'accepted' && (
                    isTargetRecipient ? (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer w-full sm:w-auto justify-center"
                        onClick={() => handleStatusChange(collab, 'completed')}
                      >
                        <Sparkle className="w-4 h-4 shrink-0" />
                        <span>Tandai Selesai</span>
                      </Button>
                    ) : (
                      <Badge variant="blue" className="py-1.5 px-3.5 text-xs gap-1.5 font-semibold w-full sm:w-auto justify-center">
                        <Sparkle className="w-4 h-4 text-blue-300 animate-pulse shrink-0" />
                        <span>Proyek Berjalan (Menunggu Penyelesaian oleh {targetRoleName})</span>
                      </Badge>
                    )
                  )}

                  {collab.status === 'completed' && (
                    <Badge variant="emerald" className="py-1 px-3 text-xs gap-1.5 w-full sm:w-auto justify-center">
                      <CheckCircle className="w-4 h-4 shrink-0" /> Proyek Selesai
                    </Badge>
                  )}

                  {collab.status === 'rejected' && (
                    <Badge variant="rose" className="py-1 px-3 text-xs gap-1.5 w-full sm:w-auto justify-center">
                      <XCircle className="w-4 h-4 shrink-0" /> Proyek Ditolak
                    </Badge>
                  )}
                </div>

              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
};
