import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dataService } from '../../lib/supabase';
import { 
  Newspaper, 
  Plus, 
  MagnifyingGlass, 
  CalendarBlank, 
  User, 
  X, 
  Megaphone,
  ShareNetwork,
  TrendUp,
  PencilSimple,
  Trash
} from '@phosphor-icons/react';

export const PressReleaseView = ({ setActiveTab }) => {
  const { profiles, currentProfile, currentRole, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [pressReleases, setPressReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);
  const [editingPR, setEditingPR] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tagsInput: 'PeluncuranProduk, Inovasi, PR'
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
    tagsInput: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const fetchPRs = async () => {
    setLoading(true);
    const data = await dataService.getPressReleases();
    setPressReleases(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPRs();
  }, []);

  const checkIsEdited = (pr) => {
    if (!pr) return false;
    return pr.is_edited === true || (Array.isArray(pr.tags) && pr.tags.includes('_edited'));
  };

  const getCleanTags = (tags) => {
    if (!Array.isArray(tags)) return [];
    return tags.filter(t => t && t !== '_edited');
  };

  // Calculate tag quantities / frequency (trending tags first)
  const tagCounts = (pressReleases || []).flatMap(pr => getCleanTags(pr.tags)).reduce((acc, tag) => {
    if (tag) acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});

  const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
  const allTags = ['ALL', ...sortedTags];

  const filteredPRs = pressReleases.filter(pr => {
    const matchesSearch = (pr.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (pr.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    const cleanPRTags = getCleanTags(pr.tags);
    const matchesTag = selectedTag === 'ALL' || cleanPRTags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleOpenCreateModal = () => {
    if (!isAuthenticated) {
      toast.warning('Anda wajib masuk (login) terlebih dahulu untuk menerbitkan Press Release.');
      if (setActiveTab) setActiveTab('login');
      return;
    }

    if (!['agency', 'admin'].includes(currentRole)) {
      toast.error('Hanya akun ber-peran Agency PR atau Admin yang berhak menerbitkan Siaran Pers.');
      return;
    }

    setCreateModalOpen(true);
  };

  const handleCreatePR = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Sesi Anda berakhir. Silakan login kembali.');
      if (setActiveTab) setActiveTab('login');
      return;
    }

    if (!['agency', 'admin'].includes(currentRole)) {
      toast.error('Akses ditolak: Hanya Agency PR atau Admin yang dapat menerbitkan Siaran Pers.');
      return;
    }

    if (!formData.title || !formData.content) return;
    setSubmitting(true);

    try {
      const tagsArray = formData.tagsInput
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(t => t && t !== '_edited');

      await dataService.addPressRelease({
        author_id: currentProfile?.id,
        owner_id: currentProfile?.id,
        title: formData.title,
        content: formData.content,
        tags: tagsArray.length > 0 ? tagsArray : ['General']
      });

      toast.success('Siaran Press Release berhasil diterbitkan ke publik!');
      setFormData({ title: '', content: '', tagsInput: 'PeluncuranProduk, Inovasi, PR' });
      setCreateModalOpen(false);
      fetchPRs();
    } catch (err) {
      toast.error(err.message || 'Gagal menerbitkan Press Release.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (pr, e) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated) {
      toast.warning('Anda wajib masuk (login) terlebih dahulu untuk mengedit Press Release.');
      if (setActiveTab) setActiveTab('login');
      return;
    }

    const isOwner = currentProfile && (currentProfile.id === pr.author_id || currentProfile.id === pr.owner_id);
    const canEdit = currentRole === 'admin' || isOwner;

    if (!canEdit) {
      toast.error('Anda hanya berhak mengedit Press Release karya Anda sendiri.');
      return;
    }

    setEditingPR(pr);
    const userTags = getCleanTags(pr.tags);
    setEditFormData({
      title: pr.title || '',
      content: pr.content || '',
      tagsInput: userTags.join(', ')
    });
    setEditModalOpen(true);
  };

  const handleUpdatePR = async (e) => {
    e.preventDefault();
    if (!editingPR) return;
    setSubmittingEdit(true);

    try {
      const tagsArray = editFormData.tagsInput
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(t => t && t !== '_edited');

      // Add '_edited' marker tag to guarantee persistence in Supabase database
      const finalTags = [...tagsArray, '_edited'];

      await dataService.updatePressRelease(editingPR.id, {
        title: editFormData.title,
        content: editFormData.content,
        tags: finalTags
      });

      toast.success('Press Release dan tanggal rilis berhasil diperbarui!');
      setEditModalOpen(false);
      setEditingPR(null);
      fetchPRs();
    } catch (err) {
      console.error('Failed to update PR:', err);
      toast.error(err.message || 'Gagal memperbarui Press Release.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeletePR = async (pr, e) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated) {
      toast.warning('Anda wajib login untuk menghapus Press Release.');
      if (setActiveTab) setActiveTab('login');
      return;
    }

    const isOwner = currentProfile && (currentProfile.id === pr.author_id || currentProfile.id === pr.owner_id);
    const canDelete = currentRole === 'admin' || isOwner;

    if (!canDelete) {
      toast.error('Anda hanya berhak menghapus Press Release karya Anda sendiri.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus Press Release ini?')) {
      try {
        await dataService.deletePressRelease(pr.id);
        toast.success('Press Release berhasil dihapus.');
        if (selectedPR?.id === pr.id) setSelectedPR(null);
        fetchPRs();
      } catch (err) {
        toast.error('Gagal menghapus Press Release.');
      }
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-3xl glass-card border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Newspaper className="w-4 h-4" /> Direktori Siaran Pers Digital
          </div>
          <h1 className="text-3xl font-extrabold text-white">Press Release Hub</h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Akses rilis media resmi terbaru dari berbagai UMKM, Startup, dan Agensi PR Indonesia.
          </p>
        </div>

        {/* Create Press Release Button (Only for Agency PR & Admin roles) */}
        {isAuthenticated && ['agency', 'admin'].includes(currentRole) && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg hover:shadow-purple-500/20 hover:scale-105 transition-all w-fit cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Publikasikan Press Release</span>
          </button>
        )}
      </div>

      {/* Search & Trending Tag Filters */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full sm:w-96">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kata kunci press release..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
            <TrendUp className="w-4 h-4" />
            <span>Tagar Trending & Frekuensi Penggunaan</span>
          </div>
        </div>

        {/* Tag Pills Container - Clean wrapping layout (no overflow-x) */}
        <div className="flex flex-wrap items-center gap-2 w-full pt-1">
          {allTags.map(tag => {
            const count = tag === 'ALL' ? pressReleases.length : (tagCounts[tag] || 0);
            const isTrending = tag !== 'ALL' && count >= 2;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  selectedTag === tag
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md font-bold glow-purple'
                    : 'glass-card text-slate-300 border-slate-800 hover:text-white hover:border-purple-500/40'
                }`}
              >
                <span>{tag === 'ALL' ? 'Semua Tag' : `#${tag}`}</span>
                
                {/* Tag usage quantity badge */}
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  selectedTag === tag
                    ? 'bg-white/20 text-white'
                    : isTrending
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Press Release Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Memuat rilis media...</div>
      ) : filteredPRs.length === 0 ? (
        <div className="py-20 text-center glass-card rounded-2xl p-8 space-y-3">
          <Newspaper className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Tidak ada press release ditemukan</h3>
          <p className="text-sm text-slate-400">Coba ubah filter tag atau kata kunci pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPRs.map(pr => {
            const ownerProfile = Array.isArray(profiles) ? profiles.find(p => p.id === (pr.owner_id || pr.author_id)) : null;
            const ownerName = ownerProfile?.full_name || pr.author_name || 'Official PR';

            return (
              <div
                key={pr.id}
                onClick={() => setSelectedPR(pr)}
                className="glass-card p-6 rounded-2xl border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="font-semibold text-slate-300 truncate max-w-[140px] sm:max-w-[180px]">{ownerName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Release Date Badge */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800 shrink-0">
                        <CalendarBlank className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>
                          {checkIsEdited(pr) ? 'Diubah pada ' : ''}
                          {pr.created_at
                            ? new Date(pr.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'Rilis Terbaru'}
                        </span>
                      </div>

                      {/* Edit & Delete Actions for Creator or Admin */}
                      {isAuthenticated && (currentRole === 'admin' || (currentProfile && (currentProfile.id === pr.author_id || currentProfile.id === pr.owner_id))) && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => handleOpenEditModal(pr, e)}
                            className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-600 text-purple-300 hover:text-white transition-colors"
                            title="Edit Press Release & Tanggal Rilis"
                          >
                            <PencilSimple className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => handleDeletePR(pr, e)}
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
                            title="Hapus Press Release"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                    {pr.title}
                  </h3>

                  <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                    {pr.content}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {getCleanTags(pr.tags).slice(0, 3).map(tag => (
                      <span key={tag} className="text-[11px] px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Baca Selengkapnya &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail Viewer */}
      {selectedPR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 space-y-6 border-slate-700 relative">
            <button
              onClick={() => setSelectedPR(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                  Official Press Release
                </span>
              </div>

              <h2 className="text-2xl font-black text-white leading-tight">{selectedPR.title}</h2>

              <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-y border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Publisher: <strong>{(Array.isArray(profiles) ? profiles.find(p => p.id === (selectedPR.owner_id || selectedPR.author_id))?.full_name : null) || selectedPR.author_name || 'Official PR'}</strong></span>
                </div>

                <div className="flex items-center gap-1.5 text-amber-400 font-semibold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <CalendarBlank className="w-4 h-4 shrink-0" />
                  <span>{checkIsEdited(selectedPR) ? 'Diubah pada: ' : 'Tanggal Rilis: '}{selectedPR.created_at ? new Date(selectedPR.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Terbaru'}</span>
                </div>
              </div>
            </div>

            <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-line">
              {selectedPR.content}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex flex-wrap gap-2">
                {getCleanTags(selectedPR.tags).map(tag => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-lg bg-slate-800 text-purple-300 border border-slate-700">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => toast.info('Link Press Release berhasil disalin!')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  <ShareNetwork className="w-4 h-4" /> Bagikan Rilis Ini
                </button>

                <button
                  onClick={() => setSelectedPR(null)}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create Press Release */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-xl w-full rounded-3xl p-6 sm:p-8 space-y-6 border-slate-700 relative">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-purple-400" />
                Publikasi Siaran Pers Baru
              </h2>
              <p className="text-xs text-slate-400">
                Siaran pers Anda akan langsung diterbitkan ke direktori PRoductify dan dapat diakses oleh jurnalis media.
              </p>
            </div>

            <form onSubmit={handleCreatePR} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Judul Press Release</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: EcoSpark Resmi Luncurkan Inovasi Hydro Bottle..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Isi Siaran Pers (Lengkap)</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Tuliskan isi berita, latar belakang, serta kutipan pimpinan UMKM/Brand..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tagar / Kategori (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="PeluncuranProduk, RamahLingkungan, UMKM"
                  value={formData.tagsInput}
                  onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-lg hover:shadow-purple-500/20"
                >
                  {submitting ? 'Menerbitkan...' : 'Terbitkan Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Press Release */}
      {editModalOpen && editingPR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="glass-card max-w-xl w-full rounded-3xl p-6 sm:p-8 space-y-6 border-purple-500/40 relative">
            <button
              onClick={() => {
                setEditModalOpen(false);
                setEditingPR(null);
              }}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <PencilSimple className="w-6 h-6 text-purple-400" />
                Edit Press Release & Tanggal Rilis
              </h2>
              <p className="text-xs text-slate-400">
                Memperbarui konten siaran pers akan secara otomatis mengupdate tanggal dan waktu rilis terbaru ke publik di portal berita.
              </p>
            </div>

            {(() => {
              const originalTagsStr = editingPR ? getCleanTags(editingPR.tags).join(', ') : '';
              const isEditFormUnchanged = Boolean(
                editingPR &&
                editFormData.title.trim() === (editingPR.title || '').trim() &&
                editFormData.content.trim() === (editingPR.content || '').trim() &&
                editFormData.tagsInput.trim() === originalTagsStr.trim()
              );

              return (
                <form onSubmit={handleUpdatePR} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Judul Press Release</label>
                    <input
                      type="text"
                      required
                      placeholder="Judul siaran pers..."
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Isi Siaran Pers (Konten)</label>
                    <textarea
                      required
                      rows={6}
                      placeholder="Isi berita siaran pers..."
                      value={editFormData.content}
                      onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tagar / Kategori (Pisahkan dengan koma)</label>
                    <input
                      type="text"
                      placeholder="PeluncuranProduk, Inovasi, PR"
                      value={editFormData.tagsInput}
                      onChange={(e) => setEditFormData({ ...editFormData, tagsInput: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditModalOpen(false);
                        setEditingPR(null);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submittingEdit || isEditFormUnchanged}
                      className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
                        submittingEdit || isEditFormUnchanged
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60 shadow-none'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-purple-500/20 cursor-pointer'
                      }`}
                    >
                      {submittingEdit ? 'Memperbarui...' : isEditFormUnchanged ? 'Tidak Ada Perubahan' : 'Simpan Perubahan & Update Tanggal'}
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
};
