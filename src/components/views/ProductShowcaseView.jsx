import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dataService } from '../../lib/supabase';
import { 
  Storefront, 
  Plus, 
  MagnifyingGlass, 
  Handshake, 
  X, 
  Trash,
  UploadSimple,
  PencilSimple
} from '@phosphor-icons/react';

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=600'
];

export const ProductShowcaseView = ({ setActiveTab }) => {
  const { profiles, currentProfile, currentRole, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal State Add Product
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Sustainable Lifestyle',
    description: '',
    image_url: PRESET_IMAGES[0]
  });
  const [submitting, setSubmitting] = useState(false);

  // Modal State Edit Product
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    category: 'Sustainable Lifestyle',
    description: '',
    image_url: PRESET_IMAGES[0]
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error('Format berkas tidak didukung. Harap unggah berkas gambar bertipe WebP, JPG, JPEG, atau PNG.');
      e.target.value = '';
      return;
    }

    const maxSizeBytes = 100 * 1024; // 100 KB
    if (file.size > maxSizeBytes) {
      const sizeInKB = (file.size / 1024).toFixed(1);
      toast.error(`Ukuran gambar terlalu besar (${sizeInKB} KB). Ukuran maksimal gambar yang diizinkan adalah 100 KB.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setFormData(prev => ({ ...prev, image_url: dataUrl }));
      toast.success('Gambar produk berhasil diunggah!');
    };
    reader.readAsDataURL(file);
  };

  // Influencer Collaboration Pitch Modal State
  const [collabModalOpen, setCollabModalOpen] = useState(false);
  const [selectedCollabProduct, setSelectedCollabProduct] = useState(null);
  const [collabFormData, setCollabFormData] = useState({
    project_title: '',
    budget: '2500000',
    notes: ''
  });
  const [submittingCollab, setSubmittingCollab] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const data = await dataService.getProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = ['ALL', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    if (!isAuthenticated) {
      toast.warning('Anda wajib masuk (login) terlebih dahulu untuk menambahkan produk baru.');
      if (setActiveTab) setActiveTab('login');
      return;
    }

    if (!['umkm', 'admin'].includes(currentRole)) {
      toast.error('Hanya peran UMKM / Brand atau Admin yang berhak menambahkan produk baru.');
      return;
    }

    setModalOpen(true);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Sesi Anda berakhir. Silakan login kembali.');
      if (setActiveTab) setActiveTab('login');
      return;
    }

    if (!['umkm', 'admin'].includes(currentRole)) {
      toast.error('Akses ditolak: Hanya akun UMKM atau Admin yang berhak menambah produk.');
      return;
    }

    if (!formData.title || !formData.description) return;
    setSubmitting(true);

    try {
      await dataService.addProduct({
        owner_id: currentProfile?.id || 'user-umkm-1',
        title: formData.title,
        category: formData.category,
        description: formData.description,
        image_url: formData.image_url || PRESET_IMAGES[0]
      });

      toast.success('Produk baru berhasil ditambahkan ke Showcase!');
      setFormData({
        title: '',
        category: 'Sustainable Lifestyle',
        description: '',
        image_url: PRESET_IMAGES[0]
      });
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error('Gagal menyimpan produk. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (product) => {
    if (!isAuthenticated) {
      toast.warning('Anda wajib masuk (login) terlebih dahulu untuk mengedit produk.');
      if (setActiveTab) setActiveTab('login');
      return;
    }

    const isOwner = currentProfile && currentProfile.id === product.owner_id;
    const canEdit = currentRole === 'admin' || isOwner;

    if (!canEdit) {
      toast.error('Anda hanya berhak mengedit produk milik Anda sendiri.');
      return;
    }

    setEditingProduct(product);
    setEditFormData({
      title: product.title || '',
      category: product.category || 'Sustainable Lifestyle',
      description: product.description || '',
      image_url: product.image_url || PRESET_IMAGES[0]
    });
    setEditModalOpen(true);
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error('Format berkas tidak didukung. Harap unggah berkas gambar bertipe WebP, JPG, JPEG, atau PNG.');
      e.target.value = '';
      return;
    }

    const maxSizeBytes = 100 * 1024; // 100 KB
    if (file.size > maxSizeBytes) {
      const sizeInKB = (file.size / 1024).toFixed(1);
      toast.error(`Ukuran gambar terlalu besar (${sizeInKB} KB). Ukuran maksimal gambar yang diizinkan adalah 100 KB.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setEditFormData(prev => ({ ...prev, image_url: dataUrl }));
      toast.success('Gambar produk berhasil diperbarui!');
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSubmittingEdit(true);

    try {
      await dataService.updateProduct(editingProduct.id, {
        title: editFormData.title,
        category: editFormData.category,
        description: editFormData.description,
        image_url: editFormData.image_url || PRESET_IMAGES[0]
      });

      toast.success('Informasi produk berhasil diperbarui!');
      setEditModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error('Failed to update product:', err);
      toast.error(err.message || 'Gagal memperbarui informasi produk.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDelete = async (id, ownerId) => {
    if (!isAuthenticated) {
      toast.warning('Anda wajib login untuk menghapus produk.');
      if (setActiveTab) setActiveTab('login');
      return;
    }

    const canDelete = currentRole === 'admin' || (currentProfile && currentProfile.id === ownerId);
    if (!canDelete) {
      toast.error('Anda hanya berhak menghapus produk milik Anda sendiri.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      await dataService.deleteProduct(id);
      toast.success('Produk berhasil dihapus.');
      fetchProducts();
    }
  };

  const handleOpenCollabModal = (product) => {
    if (!isAuthenticated) {
      toast.warning('Anda wajib masuk (login) terlebih dahulu untuk mengajukan kolaborasi.');
      if (setActiveTab) setActiveTab('login');
      return;
    }

    if (currentRole === 'umkm') {
      toast.warning('Akun dengan peran Brand UMKM tidak dapat mengajukan kolaborasi ke sesama Brand UMKM. Kolaborasi produk hanya dapat diajukan oleh Influencer / KOL atau Agency PR.');
      return;
    }

    setSelectedCollabProduct(product);
    setCollabFormData({
      project_title: `Penawaran Endorsement KOL - ${product.title}`,
      budget: '2500000',
      notes: `Halo Brand Owner! Saya berkeinginan untuk mempromosikan produk "${product.title}" melalui konten kreatif (Reels / TikTok / Story)...`
    });
    setCollabModalOpen(true);
  };

  const handleSubmitCollab = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Sesi Anda berakhir. Silakan login kembali.');
      if (setActiveTab) setActiveTab('login');
      return;
    }

    if (currentRole === 'umkm') {
      toast.error('Akses ditolak: Sesama Brand UMKM tidak dapat mengajukan kolaborasi.');
      return;
    }

    if (!selectedCollabProduct || !collabFormData.project_title) return;
    setSubmittingCollab(true);

    try {
      const initiatorTag = currentRole === 'agency' ? 'agency' : 'influencer';
      await dataService.addCollaboration({
        initiator: initiatorTag,
        brand_id: selectedCollabProduct.owner_id,
        influencer_id: currentProfile?.id,
        project_title: collabFormData.project_title,
        budget: Number(collabFormData.budget) || 0,
        status: 'pending',
        notes: `[Initiator: ${initiatorTag}] ${collabFormData.notes || ''}`.trim()
      });

      toast.success(`Pengajuan kolaborasi untuk produk "${selectedCollabProduct.title}" berhasil dikirim!`);
      setCollabModalOpen(false);

      if (setActiveTab) {
        setActiveTab('dashboard/collaborations');
      }
    } catch (err) {
      console.error('Error submitting influencer collaboration pitch:', err);
      toast.error(err.message || 'Gagal mengirim pengajuan kolaborasi. Silakan coba lagi.');
    } finally {
      setSubmittingCollab(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-3xl glass-card border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <Storefront className="w-4 h-4" /> Portofolio & Brand Showcase
          </div>
          <h1 className="text-3xl font-extrabold text-white">Product Showcase</h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Tampilkan keunggulan produk UMKM Anda, cerita inovasi, dan ajukan peluang endorsement dengan Influencer.
          </p>
        </div>

        {/* Add Product Button (Only for UMKM & Admin roles) */}
        {isAuthenticated && ['umkm', 'admin'].includes(currentRole) && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg hover:shadow-indigo-500/20 hover:scale-105 transition-all w-fit cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Produk Baru</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama produk / deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                  : 'glass-card text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Showcase Cards */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Memuat katalog produk...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center glass-card rounded-2xl p-8 space-y-3">
          <Storefront className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Belum ada produk terdaftar</h3>
          <p className="text-sm text-slate-400">Klik "Tambah Produk Baru" untuk mendaftarkan inovasi produk UMKM Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const ownerProfile = Array.isArray(profiles) ? profiles.find(p => p.id === product.owner_id) : null;
            const ownerName = ownerProfile?.full_name || product.owner_name || 'Brand UMKM';

            return (
              <div
                key={product.id}
                className="glass-card rounded-3xl overflow-hidden border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
              >
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img
                    src={product.image_url || PRESET_IMAGES[0]}
                    alt={product.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PRESET_IMAGES[0];
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-[11px] font-semibold text-indigo-300">
                    {product.category || 'General'}
                  </div>

                  {/* Action Buttons (Edit & Delete) if logged in owner or admin */}
                  {isAuthenticated && (currentRole === 'admin' || (currentProfile && currentProfile.id === product.owner_id)) && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="p-2 rounded-full bg-purple-600/80 text-white hover:bg-purple-600 transition-colors shadow-md cursor-pointer"
                        title="Edit Informasi Produk"
                      >
                        <PencilSimple className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(product.id, product.owner_id)}
                        className="p-2 rounded-full bg-rose-600/80 text-white hover:bg-rose-600 transition-colors shadow-md cursor-pointer"
                        title="Hapus Produk"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {ownerName}
                    </p>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-2">
                    {currentRole === 'umkm' ? (
                      <button
                        disabled
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-500 border border-slate-700/50 text-xs font-semibold cursor-not-allowed"
                        title="Sesama Brand UMKM tidak dapat saling mengajukan kolaborasi produk"
                      >
                        <Handshake className="w-4 h-4 opacity-50" />
                        <span>Sesama Brand UMKM</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenCollabModal(product)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30 text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <Handshake className="w-4 h-4" />
                        <span>Ajukan Kolaborasi</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add Product */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 border-slate-700 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Storefront className="w-6 h-6 text-indigo-400" />
                Tambah Produk Ke Showcase
              </h2>
              <p className="text-xs text-slate-400">
                Lengkapi rincian produk unggulan UMKM Anda agar menarik minat influencer dan mitra media.
              </p>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Produk / Layanan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: EcoSpark Smart Bottle..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kategori Produk</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Sustainable Lifestyle">Sustainable Lifestyle</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Beauty & Skincare">Beauty & Skincare</option>
                  <option value="Tech & Smart Gadget">Tech & Smart Gadget</option>
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">Gambar Sampul Produk</label>

                {/* Upload File Input Area */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-dashed border-indigo-500/40 hover:border-indigo-500 transition-all text-center space-y-2">
                  <UploadSimple className="w-7 h-7 text-indigo-400 mx-auto" />
                  <div className="text-xs text-slate-300">
                    <label htmlFor="file-upload" className="font-extrabold text-indigo-400 hover:text-indigo-300 cursor-pointer underline mr-1">
                      Pilih & Unggah Berkas Gambar
                    </label>
                    <span>dari perangkat Anda</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Format: <strong>WebP, PNG, JPG</strong> • Ukuran Maksimal: <strong className="text-amber-400">100 KB</strong>
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/webp, image/jpeg, image/jpg, image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Optional URL Input */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Atau tempelkan URL Gambar (Opsional):
                  </label>
                  <input
                    type="text"
                    placeholder="https://... (Opsional)"
                    value={formData.image_url.startsWith('data:') ? '' : formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value.trim() })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Live Image Preview & Source Badge */}
                {formData.image_url && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <img
                        src={formData.image_url}
                        alt="Pratinjau"
                        className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0 bg-slate-950"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = PRESET_IMAGES[0];
                        }}
                      />
                      <div className="text-[11px] text-slate-300 space-y-0.5">
                        <p className="font-bold text-white">Pratinjau Gambar Produk</p>
                        <p className="text-[10px] text-emerald-400 font-semibold">
                          {formData.image_url.startsWith('data:') ? '✓ Berkas Gambar Diunggah (<=100KB)' : '✓ Link URL / Sample Gambar'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: PRESET_IMAGES[0] })}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition-colors"
                      title="Kembalikan ke sampel awal"
                    >
                      Reset
                    </button>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 font-medium">Atau pilih gambar sampel cepat:</p>
                <div className="flex gap-2 mt-1">
                  {PRESET_IMAGES.map((imgUrl, idx) => (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt="Sample"
                      onClick={() => setFormData({ ...formData, image_url: imgUrl })}
                      className={`w-12 h-12 rounded-lg object-cover cursor-pointer border-2 transition-all ${
                        formData.image_url === imgUrl ? 'border-indigo-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Deskripsi Keunggulan Produk</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Jelaskan fitur unik, bahan baku, sertifikasi, atau manfaat produk..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg hover:shadow-indigo-500/20"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajukan Kolaborasi Influencer / KOL */}
      {collabModalOpen && selectedCollabProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="glass-card max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 border-amber-500/40 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setCollabModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                <Handshake className="w-4 h-4 text-amber-400" />
                <span>Form Pengajuan Kolaborasi Influencer</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">
                Ajukan Penawaran KOL Ke Brand
              </h2>
              <p className="text-xs text-slate-400">
                Kirim proposal penawaran endorsement atau promosi produk ini langsung ke pemilik brand UMKM. Data akan disimpan ke tabel <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded">public.collaborations</code> Supabase.
              </p>
            </div>

            {/* Target Product Summary Card */}
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800">
              <img
                src={selectedCollabProduct.image_url}
                alt={selectedCollabProduct.title}
                className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div className="space-y-0.5 overflow-hidden">
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Produk Sasaran</p>
                <h4 className="text-sm font-extrabold text-white truncate">{selectedCollabProduct.title}</h4>
                <p className="text-[11px] text-slate-400 truncate">
                  Pemilik Brand: <strong className="text-slate-200">{Array.isArray(profiles) ? (profiles.find(p => p.id === selectedCollabProduct.owner_id)?.full_name || 'Brand UMKM') : 'Brand UMKM'}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitCollab} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Judul Proposal / Penawaran Kampanye</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Penawaran Endorsement Instagram Reels..."
                  value={collabFormData.project_title}
                  onChange={(e) => setCollabFormData({ ...collabFormData, project_title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Penawaran Rate / Budget Kerjasama (IDR)</label>
                <input
                  type="number"
                  required
                  placeholder="2500000"
                  value={collabFormData.budget}
                  onChange={(e) => setCollabFormData({ ...collabFormData, budget: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Rencana Konten & Catatan Brief (Deliverables)</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Jelaskan jenis konten, konsep promosi, estimasi audience reach, dan kesediaan mengirimkan sampel produk..."
                  value={collabFormData.notes}
                  onChange={(e) => setCollabFormData({ ...collabFormData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCollabModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingCollab}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-extrabold shadow-lg hover:shadow-amber-500/20"
                >
                  {submittingCollab ? 'Mengirim Proposal...' : 'Kirim Pengajuan Kolaborasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Produk */}
      {editModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="glass-card max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 border-indigo-500/40 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setEditModalOpen(false);
                setEditingProduct(null);
              }}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <PencilSimple className="w-6 h-6 text-indigo-400" />
                Edit Informasi Produk
              </h2>
              <p className="text-xs text-slate-400">
                Perbarui detail rincian produk unggulan UMKM Anda pada database <code className="text-indigo-300 bg-slate-900 px-1.5 py-0.5 rounded">public.products</code>.
              </p>
            </div>

            {(() => {
              const isEditFormUnchanged = Boolean(
                editingProduct &&
                editFormData.title.trim() === (editingProduct.title || '').trim() &&
                editFormData.category === (editingProduct.category || 'Sustainable Lifestyle') &&
                editFormData.description.trim() === (editingProduct.description || '').trim() &&
                editFormData.image_url === (editingProduct.image_url || PRESET_IMAGES[0])
              );

              return (
                <form onSubmit={handleUpdateProduct} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Produk / Layanan</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: EcoSpark Smart Bottle..."
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kategori Produk</label>
                    <select
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Sustainable Lifestyle">Sustainable Lifestyle</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Beauty & Skincare">Beauty & Skincare</option>
                      <option value="Tech & Smart Gadget">Tech & Smart Gadget</option>
                      <option value="Fashion & Apparel">Fashion & Apparel</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-300">Gambar Sampul Produk</label>

                    {/* Upload File Input Area */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-dashed border-indigo-500/40 hover:border-indigo-500 transition-all text-center space-y-2">
                      <UploadSimple className="w-7 h-7 text-indigo-400 mx-auto" />
                      <div className="text-xs text-slate-300">
                        <label htmlFor="edit-file-upload" className="font-extrabold text-indigo-400 hover:text-indigo-300 cursor-pointer underline mr-1">
                          Ganti Berkas Gambar
                        </label>
                        <span>dari perangkat Anda</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Format: <strong>WebP, PNG, JPG</strong> • Ukuran Maksimal: <strong className="text-amber-400">100 KB</strong>
                      </p>
                      <input
                        id="edit-file-upload"
                        type="file"
                        accept="image/webp, image/jpeg, image/jpg, image/png"
                        onChange={handleEditImageUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Optional URL Input */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Atau tempelkan URL Gambar (Opsional):
                      </label>
                      <input
                        type="text"
                        placeholder="https://... (Opsional)"
                        value={editFormData.image_url.startsWith('data:') ? '' : editFormData.image_url}
                        onChange={(e) => setEditFormData({ ...editFormData, image_url: e.target.value.trim() })}
                        className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Live Image Preview & Source Badge */}
                    {editFormData.image_url && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                        <div className="flex items-center gap-3">
                          <img
                            src={editFormData.image_url}
                            alt="Pratinjau Edit"
                            className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0 bg-slate-950"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = PRESET_IMAGES[0];
                            }}
                          />
                          <div className="text-[11px] text-slate-300 space-y-0.5">
                            <p className="font-bold text-white">Pratinjau Gambar</p>
                            <p className="text-[10px] text-emerald-400 font-semibold">
                              {editFormData.image_url.startsWith('data:') ? '✓ Berkas Gambar Baru (<=100KB)' : '✓ Link URL Gambar'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, image_url: PRESET_IMAGES[0] })}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 font-medium">Atau pilih sampel cepat:</p>
                    <div className="flex gap-2 mt-1">
                      {PRESET_IMAGES.map((imgUrl, idx) => (
                        <img
                          key={idx}
                          src={imgUrl}
                          alt="Sample"
                          onClick={() => setEditFormData({ ...editFormData, image_url: imgUrl })}
                          className={`w-12 h-12 rounded-lg object-cover cursor-pointer border-2 transition-all ${
                            editFormData.image_url === imgUrl ? 'border-indigo-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Deskripsi Keunggulan Produk</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Jelaskan fitur unik, bahan baku, sertifikasi, atau manfaat produk..."
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditModalOpen(false);
                        setEditingProduct(null);
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
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-500/20 cursor-pointer'
                      }`}
                    >
                      {submittingEdit ? 'Memperbarui...' : isEditFormUnchanged ? 'Tidak Ada Perubahan' : 'Simpan Perubahan Produk'}
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
