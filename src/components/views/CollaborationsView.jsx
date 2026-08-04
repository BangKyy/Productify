import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/supabase';
import { 
  UsersThree, 
  Handshake, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  CurrencyDollar, 
  Sparkle, 
  X,
  InstagramLogo,
  ChatCircleText,
  User,
  ArrowsClockwise,
  ArrowUpRight,
  EnvelopeSimple
} from '@phosphor-icons/react';

const STATUS_CONFIG = {
  pending: { label: 'Menunggu Persetujuan', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: Clock },
  accepted: { label: 'Disetujui / Berjalan', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: CheckCircle },
  rejected: { label: 'Ditolak', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: XCircle },
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

export const CollaborationsView = () => {
  const { currentProfile, currentRole, profiles } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('directory'); // 'directory' | 'tracker'
  
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Propose collaboration modal state
  const [proposeModalOpen, setProposeModalOpen] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [formData, setFormData] = useState({
    project_title: '',
    budget: '3500000',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCollaborations = async () => {
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

          // Dedicated Rate Card Form Fields
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

      // Combine both sources
      const combined = [...(Array.isArray(collabs) ? collabs : []), ...formattedRequests];

      // Remove duplicates by ID
      const uniqueMap = new Map();
      combined.forEach(item => {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      });
      const uniqueList = Array.from(uniqueMap.values());

      // Filter based on logged-in user with total precision
      const userFiltered = uniqueList.filter(item => {
        if (!currentProfile) return true;
        if (currentRole === 'admin') return true;

        const currentIdStr = String(currentProfile.id || '').toLowerCase();
        const currentNameStr = String(currentProfile.full_name || '').toLowerCase().trim();

        if (currentRole === 'influencer') {
          const itemInfId = String(item.influencer_id || '').toLowerCase();
          const matchId = itemInfId && (itemInfId === currentIdStr);

          const itemInfName = String(item.influencer_name || '').toLowerCase().trim();
          const matchName = itemInfName && currentNameStr && (
            itemInfName === currentNameStr ||
            itemInfName.includes(currentNameStr) ||
            currentNameStr.includes(itemInfName)
          );

          const isUnbound = !item.influencer_id && (!item.influencer_name || item.influencer_name === 'Influencer KOL');

          return Boolean(matchId || matchName || isUnbound);
        } else {
          // Requester (UMKM / Agency)
          const itemBrandId = String(item.brand_id || item.requester_id || '').toLowerCase();
          const matchId = itemBrandId && (itemBrandId === currentIdStr);

          const itemBrandName = String(item.brand_name || '').toLowerCase().trim();
          const itemReqName = String(item.requester_name || '').toLowerCase().trim();

          const matchName = currentNameStr && (
            (itemReqName && (itemReqName === currentNameStr || itemReqName.includes(currentNameStr) || currentNameStr.includes(itemReqName))) ||
            (itemBrandName && (itemBrandName === currentNameStr || itemBrandName.includes(currentNameStr) || currentNameStr.includes(itemBrandName)))
          );

          // Always display requests made by non-influencers
          const isUnbound = !itemBrandId && (!item.brand_name || item.brand_name === 'Brand UMKM');

          return Boolean(matchId || matchName || isUnbound);
        }
      });

      // Sort newest first
      userFiltered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      setCollaborations(userFiltered);
    } catch (err) {
      console.warn('Error fetching dashboard collaborations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborations();
  }, [currentProfile?.id, currentRole]);

  const influencersList = Array.isArray(profiles) ? profiles.filter(p => p.role === 'influencer') : [];

  const handlePropose = async (e) => {
    e.preventDefault();
    if (!selectedInfluencer || !formData.project_title) return;
    setSubmitting(true);

    await dataService.addCollaboration({
      brand_id: currentProfile?.id || 'user-umkm-1',
      brand_name: currentProfile?.full_name || 'Brand UMKM',
      influencer_id: selectedInfluencer.id,
      influencer_name: selectedInfluencer.full_name,
      project_title: formData.project_title,
      budget: Number(formData.budget) || 0,
      notes: formData.notes
    });

    setFormData({ project_title: '', budget: '3500000', notes: '' });
    setProposeModalOpen(false);
    setSelectedInfluencer(null);
    setSubmitting(false);
    setActiveSubTab('tracker');
    fetchCollaborations();
  };

  const handleStatusChange = async (collab, newStatus) => {
    if (collab.isRateCardRequest) {
      await dataService.updateRateCardRequestStatus(collab.id, newStatus);
    } else {
      await dataService.updateCollaborationStatus(collab.id, newStatus);
    }
    fetchCollaborations();
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-3xl glass-card border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <UsersThree className="w-4 h-4" /> Marketplace Influencer & Campaign Tracker
          </div>
          <h1 className="text-3xl font-extrabold text-white">Kolaborasi Influencer / KOL</h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Jajaki peluang kerja sama endorsement produk UMKM secara transparan dengan pelacakan status proyek riil.
          </p>
        </div>

        {/* Sub-Tab Navigation & Refresh Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-900/80 p-1.5 rounded-full border border-slate-800 w-fit">
            <button
              onClick={() => setActiveSubTab('directory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeSubTab === 'directory'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UsersThree className="w-4 h-4" />
              <span>Katalog Influencer ({influencersList.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('tracker')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeSubTab === 'tracker'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Handshake className="w-4 h-4" />
              <span>Status Proyek ({collaborations.length})</span>
            </button>
          </div>

          <button
            onClick={() => fetchCollaborations()}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-slate-800 transition-all cursor-pointer shadow-sm group"
            title="Refresh Data Kolaborasi & Rate Card"
          >
            <ArrowsClockwise className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Influencer Directory */}
      {activeSubTab === 'directory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {influencersList.map(inf => (
              <div
                key={inf.id}
                className="glass-card p-6 rounded-3xl border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={inf.avatar_url}
                      alt={inf.full_name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/40 group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                        {inf.full_name}
                      </h3>
                      <p className="text-xs text-amber-400 font-semibold">{inf.address || 'Indonesia'}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                    {inf.bio}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    <span>Telepon/WA: </span>
                    <strong className="text-slate-300">{inf.phone_number}</strong>
                  </div>

                  {/* Propose Collaboration Button */}
                  <button
                    onClick={() => {
                      setSelectedInfluencer(inf);
                      setProposeModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-lg hover:scale-105 transition-all"
                  >
                    <Handshake className="w-4 h-4" />
                    <span>Ajukan Kerja Sama</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Collaboration Tracker Dashboard */}
      {activeSubTab === 'tracker' && (
        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center text-slate-400">Memuat status kolaborasi...</div>
          ) : collaborations.length === 0 ? (
            <div className="py-20 text-center glass-card rounded-2xl p-8 space-y-3">
              <Handshake className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">Belum Ada Pengajuan Kolaborasi</h3>
              <p className="text-sm text-slate-400">Pilih Influencer dari Katalog untuk mengajukan kerja sama kampanye baru.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {collaborations.map(collab => {
                const statusInfo = STATUS_CONFIG[collab.status] || STATUS_CONFIG.pending;
                const StatusIcon = statusInfo.icon;
                const rateDetails = parseRateCardDetails(collab);

                const isOutgoing = currentRole !== 'influencer';

                return (
                  <div
                    key={collab.id}
                    className="glass-card p-6 sm:p-7 rounded-3xl border-slate-800 space-y-5 hover:border-purple-500/30 transition-all bg-gradient-to-br from-slate-950 via-slate-900/90 to-slate-950 shadow-xl"
                  >
                    {/* Header Row: Role Indicator Tag & Status Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          isOutgoing 
                            ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' 
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}>
                          {isOutgoing ? (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
                              <span>PENGAJUAN KELUAR (Anda Mengajak Kerja Sama)</span>
                            </>
                          ) : (
                            <>
                              <EnvelopeSimple className="w-3.5 h-3.5 text-amber-400" />
                              <span>PERMINTAAN MASUK (Rate Card Request)</span>
                            </>
                          )}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 font-medium">
                          Diajukan oleh: <strong className="text-slate-200">{collab.brand_name || 'Brand UMKM'}</strong>
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">
                          {new Date(collab.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold ${statusInfo.bg}`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">{collab.project_title}</h3>
                    </div>

                    {/* SUB-CARDS / BOXES GRID (Replaces generic 3 boxes for Rate Card Requests) */}
                    {rateDetails.isRateCard ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                        
                        {/* Box 1: Parties (Brand & KOL) */}
                        <div className="glass-card p-3.5 rounded-2xl border-slate-800/90 bg-slate-900/60 flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Influencer KOL</span>
                            <span className="text-sm font-extrabold text-amber-300">{collab.influencer_name}</span>
                          </div>
                        </div>

                        {/* Box 2: Tujuan Kampanye */}
                        <div className="glass-card p-3.5 rounded-2xl border-slate-800/90 bg-slate-900/60 flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            <Sparkle className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tujuan Kampanye</span>
                            <span className="text-sm font-extrabold text-purple-300">{rateDetails.objective || 'Promosi Kampanye'}</span>
                          </div>
                        </div>

                        {/* Box 3: Estimasi Anggaran */}
                        <div className="glass-card p-3.5 rounded-2xl border-slate-800/90 bg-slate-900/60 flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <CurrencyDollar className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimasi Anggaran</span>
                            <span className="text-sm font-extrabold text-emerald-400">{rateDetails.budgetRange || formatBudgetDisplay(collab.budget)}</span>
                          </div>
                        </div>

                        {/* Box 4: Platform Diinginkan */}
                        <div className="glass-card p-3.5 rounded-2xl border-slate-800/90 bg-slate-900/60 flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            <InstagramLogo className="w-5 h-5" />
                          </div>
                          <div>
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
                        <div className="glass-card p-3.5 rounded-2xl border-slate-800/90 bg-slate-900/60 flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                            <ChatCircleText className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Jenis Konten</span>
                            <span className="text-xs font-bold text-slate-200">{rateDetails.contentType || 'Video Pendek / Reels'}</span>
                          </div>
                        </div>

                        {/* Box 6: Estimasi Timeline */}
                        <div className="glass-card p-3.5 rounded-2xl border-slate-800/90 bg-slate-900/60 flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimasi Timeline</span>
                            <span className="text-xs font-bold text-slate-200">{rateDetails.timeline || '1-2 Minggu'}</span>
                          </div>
                        </div>

                      </div>
                    ) : (
                      /* Standard Collaboration 3 Boxes Fallback */
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="glass-card p-3.5 rounded-2xl border-slate-800/90 bg-slate-900/60">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Brand UMKM</span>
                          <strong className="text-sm font-extrabold text-purple-300">{collab.brand_name || 'Brand UMKM'}</strong>
                        </div>
                        <div className="glass-card p-3.5 rounded-2xl border-slate-800/90 bg-slate-900/60">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Influencer KOL</span>
                          <strong className="text-sm font-extrabold text-amber-300">{collab.influencer_name}</strong>
                        </div>
                        <div className="glass-card p-3.5 rounded-2xl border-slate-800/90 bg-slate-900/60">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Budget Kampanye</span>
                          <strong className="text-sm font-extrabold text-emerald-400">{formatBudgetDisplay(collab.budget)}</strong>
                        </div>
                      </div>
                    )}

                    {/* Catatan Masukan Box */}
                    {rateDetails.userNotes && (
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                          <ChatCircleText className="w-3.5 h-3.5 text-amber-400" /> Catatan Masukan / Instruksi Khusus:
                        </span>
                        <p className="text-xs text-slate-300 italic">"{rateDetails.userNotes}"</p>
                      </div>
                    )}

                    {/* Footer Actions Row */}
                    <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Status Saat Ini: <strong className="text-slate-200">{statusInfo.label}</strong></span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {collab.status === 'pending' && ['influencer', 'admin'].includes(currentRole) && (
                          <>
                            <button
                              onClick={() => handleStatusChange(collab, 'accepted')}
                              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
                            >
                              <CheckCircle className="w-4 h-4" /> Terima Ajuan
                            </button>

                            <button
                              onClick={() => handleStatusChange(collab, 'rejected')}
                              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" /> Tolak
                            </button>
                          </>
                        )}

                        {collab.status === 'accepted' && (
                          <button
                            onClick={() => handleStatusChange(collab, 'completed')}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
                          >
                            <Sparkle className="w-4 h-4" /> Tandai Selesai
                          </button>
                        )}

                        {collab.status === 'completed' && (
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                            <CheckCircle className="w-4 h-4" /> Kampanye Berhasil Selesai
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Propose Collaboration */}
      {proposeModalOpen && selectedInfluencer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 border-slate-700 relative">
            <button
              onClick={() => setProposeModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Handshake className="w-6 h-6 text-amber-400" />
                Ajukan Proyek Kerjasama
              </h2>
              <p className="text-xs text-slate-400">
                Mengajukan tawaran kampanye untuk <strong>{selectedInfluencer.full_name}</strong>
              </p>
            </div>

            <form onSubmit={handlePropose} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Proyek / Kampanye</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Endorsement Video Reels Unboxing Hydro Bottle..."
                  value={formData.project_title}
                  onChange={(e) => setFormData({ ...formData, project_title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Alokasi Budget Kerjasama (IDR)</label>
                <input
                  type="number"
                  required
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Catatan Brief Proyek & Deliverables</label>
                <textarea
                  rows={4}
                  placeholder="Jelaskan kebutuhan postingan, tenggat waktu, serta pesan utama kampanye..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProposeModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-bold shadow-lg hover:scale-105"
                >
                  {submitting ? 'Kirim...' : 'Kirim Ajuan Kerja Sama'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
