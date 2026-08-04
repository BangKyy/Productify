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
  User
} from '@phosphor-icons/react';

const STATUS_CONFIG = {
  pending: { label: 'Menunggu Persetujuan', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: Clock },
  accepted: { label: 'Disetujui / Berjalan', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: CheckCircle },
  rejected: { label: 'Ditolak', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: XCircle },
  completed: { label: 'Selesai Sempurna', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: Sparkle }
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
    const data = await dataService.getCollaborations();
    setCollaborations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const influencersList = profiles.filter(p => p.role === 'influencer');

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

  const handleStatusChange = async (collabId, newStatus) => {
    await dataService.updateCollaborationStatus(collabId, newStatus);
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

        {/* Sub-Tab Navigation Toggle */}
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

                return (
                  <div
                    key={collab.id}
                    className="glass-card p-6 rounded-2xl border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-2 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${statusInfo.bg}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusInfo.label}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">
                          {new Date(collab.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white">{collab.project_title}</h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                        <div>Brand: <strong className="text-purple-300">{collab.brand_name || 'Brand UMKM'}</strong></div>
                        <div>KOL: <strong className="text-amber-300">{collab.influencer_name}</strong></div>
                        <div>Budget: <strong className="text-emerald-400">Rp {Number(collab.budget).toLocaleString('id-ID')}</strong></div>
                      </div>

                      {collab.notes && (
                        <p className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800 italic mt-2">
                          "{collab.notes}"
                        </p>
                      )}
                    </div>

                    {/* Dynamic Action Buttons based on Role & Status */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                      
                      {/* Influencer or Admin can Accept / Reject */}
                      {collab.status === 'pending' && ['influencer', 'admin'].includes(currentRole) && (
                        <>
                          <button
                            onClick={() => handleStatusChange(collab.id, 'accepted')}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                          >
                            <CheckCircle className="w-4 h-4" /> Terima Ajuan
                          </button>

                          <button
                            onClick={() => handleStatusChange(collab.id, 'rejected')}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-all"
                          >
                            <XCircle className="w-4 h-4" /> Tolak
                          </button>
                        </>
                      )}

                      {/* Complete action */}
                      {collab.status === 'accepted' && (
                        <button
                          onClick={() => handleStatusChange(collab.id, 'completed')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
                        >
                          <Sparkle className="w-4 h-4" /> Tandai Selesai
                        </button>
                      )}

                      {collab.status === 'completed' && (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                          <CheckCircle className="w-4 h-4" /> Kampanye Berhasil Selesai
                        </span>
                      )}
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
