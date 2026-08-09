import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../ui/Breadcrumb';
import { useAuth } from '../../context/AuthContext';
import { dataService, getItemDedupeKey } from '../../lib/supabase';
import { 
  UsersThree, 
  Handshake, 
  Sparkle, 
  CheckCircle, 
  Clock, 
  CurrencyDollar, 
  MagnifyingGlass, 
  Funnel, 
  ArrowsClockwise, 
  InstagramLogo, 
  ChatCircleText, 
  User, 
  TrendUp, 
  ShieldCheck,
  Package,
  Newspaper,
  CalendarBlank,
  RocketLaunch,
  Lightning
} from '@phosphor-icons/react';

const STATUS_CONFIG = {
  pending: { label: 'Menunggu Persetujuan', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: Clock },
  accepted: { label: 'Disetujui / Berjalan', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: CheckCircle },
  rejected: { label: 'Ditolak', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: Clock },
  completed: { label: 'Selesai Sempurna', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: Sparkle }
};

const formatBudgetDisplay = (budgetVal) => {
  if (!budgetVal || budgetVal === '0') return 'Diskusi Lebih Lanjut';
  if (typeof budgetVal === 'number') {
    return `Rp ${budgetVal.toLocaleString('id-ID')}`;
  }
  const strVal = String(budgetVal).trim();
  if (!isNaN(strVal) && !isNaN(parseFloat(strVal))) {
    const num = Number(strVal);
    if (num > 0) return `Rp ${num.toLocaleString('id-ID')}`;
  }
  return strVal;
};

const parseRateCardDetails = (item) => {
  const titleStr = String(item.project_title || '').toLowerCase();
  const notesStr = String(item.raw_notes || item.notes || '');

  const isRateCard = Boolean(
    item.isRateCardRequest ||
    titleStr.includes('rate card') ||
    notesStr.toLowerCase().includes('rate card') ||
    item.campaign_objective ||
    item.budget_range ||
    (Array.isArray(item.platforms) && item.platforms.length > 0)
  );

  if (!isRateCard) {
    return { isRateCard: false };
  }

  let objective = item.campaign_objective || '';
  let platforms = Array.isArray(item.platforms) && item.platforms.length > 0 
    ? item.platforms 
    : (typeof item.platforms === 'string' && item.platforms ? item.platforms.split(',').map(s => s.trim()) : []);
  let contentType = item.content_type || '';
  let targetAudience = item.target_audience || '';
  let timeline = item.timeline || '';
  let budgetRange = item.budget_range || '';
  let userNotes = notesStr;

  if (notesStr.toLowerCase().includes('rate card')) {
    const objMatch = notesStr.match(/Objektif:\s*([^.]+)/i);
    const platMatch = notesStr.match(/Platform:\s*([^.]+)/i);
    const budgetMatch = notesStr.match(/Anggaran:\s*([^.]+)/i);

    if (!objective && objMatch) objective = objMatch[1].trim();
    if ((!platforms || platforms.length === 0) && platMatch) {
      platforms = platMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    }
    if (!budgetRange && budgetMatch) budgetRange = budgetMatch[1].trim();

    userNotes = notesStr
      .replace(/"/g, '')
      .replace(/\[Rate Card Request\]/gi, '')
      .replace(/Brand:\s*[^.]+\./gi, '')
      .replace(/Objektif:\s*[^.]+\./gi, '')
      .replace(/Platform:\s*[^.]+\./gi, '')
      .replace(/Anggaran:\s*[^.]+\./gi, '')
      .trim();
  }

  return {
    isRateCard: true,
    objective: objective || 'Promosi Brand & Request Rate Card',
    platforms: platforms,
    contentType: contentType || 'Foto / Video Endorsement',
    targetAudience: targetAudience || 'Target Sesuai Niche Influencer',
    timeline: timeline || '1-2 Minggu',
    budgetRange: budgetRange || formatBudgetDisplay(item.budget),
    userNotes: userNotes
  };
};

export const CollaborationActivityView = ({ setActiveTab }) => {
  const { profiles } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'accepted' | 'completed'

  const fetchAllActivities = async () => {
    setLoading(true);
    try {
      const [collabs, rateRequests] = await Promise.all([
        dataService.getCollaborations(),
        dataService.getRateCardRequests()
      ]);

      const formattedRequests = (Array.isArray(rateRequests) ? rateRequests : []).map(r => {
        const foundKol = Array.isArray(profiles) ? profiles.find(p => p.id === r.influencer_id) : null;
        const foundReq = Array.isArray(profiles) ? profiles.find(p => p.id === r.requester_id) : null;
        return {
          id: r.id,
          project_title: `Request Rate Card: ${r.product_name || r.brand_name || 'Kampanye Brand'}`,
          brand_name: r.brand_name || r.requester_name || foundReq?.full_name || 'Brand UMKM / Agency',
          requester_name: r.requester_name || foundReq?.full_name || r.brand_name || 'Brand UMKM / Agency',
          influencer_name: r.influencer_name || foundKol?.full_name || 'Influencer KOL',
          brand_id: r.requester_id,
          requester_id: r.requester_id,
          influencer_id: r.influencer_id,
          budget: r.budget_range || r.budget || 'Diskusi Lebih Lanjut',
          status: r.status || 'pending',
          created_at: r.created_at || new Date().toISOString(),
          campaign_objective: r.campaign_objective || '',
          platforms: Array.isArray(r.platforms) ? r.platforms : (typeof r.platforms === 'string' ? r.platforms.split(',').map(s => s.trim()) : []),
          content_type: r.content_type || '',
          target_audience: r.target_audience || '',
          timeline: r.timeline || '',
          budget_range: r.budget_range || '',
          raw_notes: r.notes || '',
          notes: r.notes || `[Rate Card Request] Brand: ${r.brand_name || '-'}. Objektif: ${r.campaign_objective || '-'}. Platform: ${(r.platforms || []).join(', ') || '-'}. Anggaran: ${r.budget_range || '-'}`.trim(),
          isRateCardRequest: true
        };
      });

      const combined = [...(Array.isArray(collabs) ? collabs : []), ...formattedRequests];

      // Remove duplicates using getItemDedupeKey
      const uniqueMap = new Map();
      combined.forEach(item => {
        if (item) {
          const key = getItemDedupeKey(item);
          if (key && !uniqueMap.has(key)) {
            uniqueMap.set(key, item);
          }
        }
      });

      const uniqueList = Array.from(uniqueMap.values());

      // Sort newest created_at first
      uniqueList.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      setActivities(uniqueList);
    } catch (err) {
      console.warn('Failed fetching public collaboration activity history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllActivities();
  }, []);

  // Filter activities by Search Query & Status Filter
  const filteredActivities = activities.filter(act => {
    const matchesStatus = statusFilter === 'all' || act.status === statusFilter;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    const matchTitle = String(act.project_title || '').toLowerCase().includes(q);
    const matchBrand = String(act.brand_name || '').toLowerCase().includes(q);
    const matchInfluencer = String(act.influencer_name || '').toLowerCase().includes(q);
    const matchObj = String(act.campaign_objective || '').toLowerCase().includes(q);
    const matchNotes = String(act.notes || '').toLowerCase().includes(q);

    return matchesStatus && (matchTitle || matchBrand || matchInfluencer || matchObj || matchNotes);
  });

  // Calculate statistics
  const totalCount = activities.length;
  const completedCount = activities.filter(a => a.status === 'completed').length;
  const activeCount = activities.filter(a => a.status === 'accepted').length;
  const pendingCount = activities.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-8">
      
      {/* Breadcrumb Navigation */}
      <div>
        <Breadcrumb items={[{ label: 'Aktivitas Komunitas', icon: Clock }]} setActiveTab={setActiveTab} />
      </div>

      {/* 🚀 Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-10 glass-card border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/40">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" /> Transparansi Komunitas PRoductify
            </div>

            <button
              onClick={() => fetchAllActivities()}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-slate-800 text-xs font-bold transition-all cursor-pointer group w-full sm:w-auto"
              title="Refresh Aktivitas Terkini"
            >
              <ArrowsClockwise className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-500 shrink-0 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Aktivitas</span>
            </button>
          </div>

          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Aktivitas & Riwayat Kolaborasi Publik
            </h1>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
              Jejak transparansi publik yang mencatat seluruh kronologi pengajuan kampanye, request rate card, dan proyek kerja sama yang sedang berjalan maupun selesai sempurna antara <strong className="text-purple-300">Brand UMKM</strong>, <strong className="text-blue-300">Agency PR</strong>, dan <strong className="text-amber-300">Influencer KOL</strong>.
            </p>
          </div>

          {/* Stat Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
            <div className="glass-card p-3 sm:p-4 rounded-2xl border-slate-800 bg-slate-900/70 space-y-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Aktivitas</span>
              <div className="flex items-center gap-2">
                <Handshake className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
                <span className="text-xl sm:text-2xl font-black text-white">{totalCount}</span>
              </div>
            </div>

            <div className="glass-card p-3 sm:p-4 rounded-2xl border-slate-800 bg-slate-900/70 space-y-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Selesai Sempurna</span>
              <div className="flex items-center gap-2">
                <Sparkle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
                <span className="text-xl sm:text-2xl font-black text-blue-300">{completedCount}</span>
              </div>
            </div>

            <div className="glass-card p-3 sm:p-4 rounded-2xl border-slate-800 bg-slate-900/70 space-y-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sedang Berjalan</span>
              <div className="flex items-center gap-2">
                <RocketLaunch className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                <span className="text-xl sm:text-2xl font-black text-emerald-300">{activeCount}</span>
              </div>
            </div>

            <div className="glass-card p-3 sm:p-4 rounded-2xl border-slate-800 bg-slate-900/70 space-y-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Menunggu Respons</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                <span className="text-xl sm:text-2xl font-black text-amber-300">{pendingCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔎 Filter & Search Controls Bar */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 sm:gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 w-full md:max-w-lg">
          <MagnifyingGlass className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama brand, influencer, judul kampanye..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 w-full md:w-auto overflow-x-auto no-scrollbar gap-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap text-center ${
              statusFilter === 'all' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua ({activities.length})
          </button>

          <button
            onClick={() => setStatusFilter('accepted')}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
              statusFilter === 'accepted' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lightning className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>Berjalan ({activeCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('completed')}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
              statusFilter === 'completed' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-blue-300 shrink-0" />
            <span>Selesai ({completedCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
              statusFilter === 'pending' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Menunggu ({pendingCount})</span>
          </button>
        </div>
      </div>

      {/* 📋 Activity Feed List */}
      {loading ? (
        <div className="py-24 text-center glass-card rounded-3xl p-8 space-y-3">
          <ArrowsClockwise className="w-10 h-10 text-purple-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Memuat jejak riwayat aktivitas kolaborasi...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="py-20 text-center glass-card rounded-3xl p-8 space-y-3 border-slate-800">
          <Handshake className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Tidak Ada Aktivitas Ditemukan</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {searchQuery 
              ? `Tidak ada riwayat kolaborasi yang cocok dengan kata kunci "${searchQuery}".` 
              : 'Belum ada aktivitas kolaborasi tercatat di platform.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {filteredActivities.map((act) => {
            const statusInfo = STATUS_CONFIG[act.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusInfo.icon;
            const rateDetails = parseRateCardDetails(act);

            return (
              <div
                key={act.id}
                className="glass-card p-4 sm:p-7 rounded-3xl border-slate-800 space-y-4 sm:space-y-5 hover:border-purple-500/30 transition-all bg-gradient-to-br from-slate-950 via-slate-900/90 to-slate-950 shadow-xl"
              >
                {/* Header Row: Public Indicator & Status */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-slate-800/80 pb-3.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Terverifikasi System
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 font-medium">
                      Diajukan oleh: <strong className="text-slate-200">{act.brand_name || 'Brand UMKM'}</strong>
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">
                      {new Date(act.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border text-xs font-bold shrink-0 ${statusInfo.bg}`}>
                    <StatusIcon className="w-4 h-4 shrink-0" />
                    {statusInfo.label}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">{act.project_title}</h3>
                </div>

                {/* SUB-CARDS GRID (6 Sub-Card Parameter Boxes) */}
                {rateDetails.isRateCard ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
                    
                    {/* Box 1: Influencer KOL Target */}
                    <div className="glass-card p-3 sm:p-3.5 rounded-2xl border-slate-800/90 bg-slate-900/60 flex items-center gap-3">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Influencer KOL</span>
                        <span className="text-xs sm:text-sm font-extrabold text-amber-300 truncate block">{act.influencer_name || 'Influencer KOL'}</span>
                      </div>
                    </div>

                    {/* Box 2: Tujuan Kampanye */}
                    <div className="glass-card p-3 sm:p-3.5 rounded-2xl border-slate-800/90 bg-slate-900/60 flex items-center gap-3">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                        <Sparkle className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tujuan Kampanye</span>
                        <span className="text-xs sm:text-sm font-extrabold text-purple-300 truncate block">{rateDetails.objective || 'Promosi Kampanye'}</span>
                      </div>
                    </div>

                    {/* Box 3: Estimasi Anggaran */}
                    <div className="glass-card p-3 sm:p-3.5 rounded-2xl border-slate-800/90 bg-slate-900/60 flex items-center gap-3">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                        <CurrencyDollar className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimasi Anggaran</span>
                        <span className="text-xs sm:text-sm font-extrabold text-emerald-400 truncate block">{rateDetails.budgetRange || formatBudgetDisplay(act.budget)}</span>
                      </div>
                    </div>

                    {/* Box 4: Platform Diinginkan */}
                    <div className="glass-card p-3 sm:p-3.5 rounded-2xl border-slate-800/90 bg-slate-900/60 flex items-center gap-3">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                        <InstagramLogo className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Platform Diinginkan</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {rateDetails.platforms && rateDetails.platforms.length > 0 ? (
                            rateDetails.platforms.map(plat => (
                              <span key={plat} className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold capitalize">
                                {plat}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-300 font-semibold">Semua Platform</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Box 5: Jenis Konten */}
                    <div className="glass-card p-3 sm:p-3.5 rounded-2xl border-slate-800/90 bg-slate-900/60 flex items-center gap-3">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shrink-0">
                        <ChatCircleText className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Jenis Konten</span>
                        <span className="text-xs font-bold text-slate-200 truncate block">{rateDetails.contentType || 'Video Pendek / Reels'}</span>
                      </div>
                    </div>

                    {/* Box 6: Estimasi Timeline */}
                    <div className="glass-card p-3 sm:p-3.5 rounded-2xl border-slate-800/90 bg-slate-900/60 flex items-center gap-3">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimasi Timeline</span>
                        <span className="text-xs font-bold text-slate-200 truncate block">{rateDetails.timeline || '1-2 Minggu'}</span>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Standard Collaboration 3 Boxes Fallback */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
                    <div className="glass-card p-3 sm:p-3.5 rounded-2xl border-slate-800/90 bg-slate-900/60">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Brand UMKM</span>
                      <strong className="text-xs sm:text-sm font-extrabold text-purple-300 truncate block">{act.brand_name || 'Brand UMKM'}</strong>
                    </div>
                    <div className="glass-card p-3 sm:p-3.5 rounded-2xl border-slate-800/90 bg-slate-900/60">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Influencer KOL</span>
                      <strong className="text-xs sm:text-sm font-extrabold text-amber-300 truncate block">{act.influencer_name}</strong>
                    </div>
                    <div className="glass-card p-3 sm:p-3.5 rounded-2xl border-slate-800/90 bg-slate-900/60">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Budget Kampanye</span>
                      <strong className="text-xs sm:text-sm font-extrabold text-emerald-400 truncate block">{formatBudgetDisplay(act.budget)}</strong>
                    </div>
                  </div>
                )}

                {/* Catatan Masukan Box */}
                {rateDetails.userNotes && (
                  <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                      <ChatCircleText className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Catatan Masukan / Instruksi Khusus:
                    </span>
                    <p className="text-xs text-slate-300 italic">&quot;{rateDetails.userNotes}&quot;</p>
                  </div>
                )}

                {/* Footer Action Links */}
                <div className="pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Status Aktivitas: <strong className="text-slate-200">{statusInfo.label}</strong></span>
                  </div>

                  {setActiveTab && (
                    <button
                      onClick={() => setActiveTab('marketplace')}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all cursor-pointer w-full sm:w-auto"
                    >
                      <UsersThree className="w-4 h-4 shrink-0" />
                      <span>Ajukan Kerja Sama Terkait</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🌟 Community Call to Action Footer Banner */}
      <div className="glass-card p-5 sm:p-8 rounded-3xl border-slate-800 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 text-center md:text-left">
        <div className="space-y-1.5 sm:space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-white">Ingin Memulai Kolaborasi Baru?</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
            Temukan Influencer KOL berbakat, promosikan produk unggulan UMKM Anda, atau terbitkan Rilis Pers digital di PRoductify.
          </p>
        </div>

        {setActiveTab && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setActiveTab('marketplace')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg hover:scale-105 transition-all cursor-pointer w-full sm:w-auto"
            >
              <UsersThree className="w-4 h-4 shrink-0" /> Marketplace KOL
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer w-full sm:w-auto"
            >
              <Package className="w-4 h-4 shrink-0" /> Produk UMKM
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
