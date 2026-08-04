import { createClient } from '@supabase/supabase-js';
import { mockEngine, initMockStorage } from './mockEngine';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initialize local storage mock data on module load
initMockStorage();

export const dataService = {
  // Profiles
  async getProfiles() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && Array.isArray(data)) {
          const uniqueMap = new Map();
          
          // First load mockEngine local profiles (e.g. newly registered / updated locally)
          const localProfiles = mockEngine.getProfiles();
          if (Array.isArray(localProfiles)) {
            localProfiles.forEach(p => {
              if (p && (p.id || p.full_name)) {
                const key = (p.id || p.email || p.full_name).toString().toLowerCase().trim();
                uniqueMap.set(key, p);
              }
            });
          }

          // Overlay Supabase profiles
          data.forEach(p => {
            if (p && (p.id || p.full_name)) {
              const key = (p.id || p.email || p.full_name).toString().toLowerCase().trim();
              const existing = uniqueMap.get(key);
              uniqueMap.set(key, existing ? { ...existing, ...p } : p);
            }
          });

          return Array.from(uniqueMap.values());
        }
      } catch (err) {
        console.warn('Supabase fetch profiles warning:', err);
      }
    }
    return mockEngine.getProfiles();
  },

  async getAdminProfiles() {
    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Check dedicated 'admin' table in Supabase
        const { data: adminData, error: adminErr } = await supabase.from('admin').select('*');
        if (!adminErr && adminData && adminData.length > 0) return adminData;

        // 2. Fallback to 'profiles' table with role = 'admin'
        const { data: profileData, error: profErr } = await supabase.from('profiles').select('*').eq('role', 'admin');
        if (!profErr && profileData && profileData.length > 0) return profileData;
      } catch (err) {
        console.warn('Supabase fetch admin profiles warning:', err);
      }
    }
    const all = mockEngine.getProfiles();
    return all.filter(p => p.role === 'admin');
  },

  async getProfileById(id) {
    if (isSupabaseConfigured && supabase && id) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id);
        if (!error && data && data.length > 0) return data[0];
      } catch (err) {
        console.warn('Supabase fetch profile by ID warning:', err);
      }
    }
    return mockEngine.getProfileById(id);
  },

  async updateProfile(id, updates) {
    const isUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    const targetId = isUuid(id) ? id : (isUuid(updates?.id) ? updates.id : null);

    const validRoles = ['umkm', 'influencer', 'agency', 'admin'];
    const assignedRole = validRoles.includes(updates?.role) ? updates.role : 'umkm';

    const profilePayload = {
      id: id || updates?.id || targetId || `user-${Date.now()}`,
      full_name: updates.full_name || 'Pengguna PRoductify',
      role: assignedRole,
      avatar_url: updates.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      bio: updates.bio || '',
      phone_number: updates.phone_number || (updates.phoneNumber || ''),
      address: updates.address || '',
      category: updates.category || updates.kol_category || '',
      gender: updates.gender || 'female',
      followers: updates.followers || '250k',
      social_tiktok: updates.social_tiktok || '',
      social_youtube: updates.social_youtube || '',
      social_instagram: updates.social_instagram || '',
      social_x: updates.social_x || '',
      social_threads: updates.social_threads || '',
      social_linkedin: updates.social_linkedin || '',
      rate_cards: Array.isArray(updates.rate_cards) ? updates.rate_cards : []
    };

    if (isSupabaseConfigured && supabase && targetId) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert([profilePayload], { onConflict: 'id' })
          .select();

        if (!error && data && data.length > 0) {
          mockEngine.updateProfile(profilePayload.id, { ...updates, ...data[0] });
          return data[0];
        }

        if (error) {
          console.error('Supabase profile upsert error:', error);
          throw new Error(`Gagal menyimpan ke database: ${error.message || error.details || 'Akses ditolak oleh RLS Policy'}`);
        }
      } catch (err) {
        console.error('Supabase updateProfile catch error:', err);
        throw err;
      }
    }
    return mockEngine.updateProfile(profilePayload.id, { ...updates, ...profilePayload });
  },

  // Products
  async getProducts() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && Array.isArray(data)) return data;
      } catch (err) {
        console.warn('Supabase fetch products warning:', err);
      }
    }
    return mockEngine.getProducts();
  },

  async addProduct(product) {
    const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const userId = isUuid(product.owner_id) ? product.owner_id : null;

    const productPayload = {
      title: product.title,
      description: product.description,
      category: product.category,
      image_url: product.image_url
    };
    if (userId) {
      productPayload.owner_id = userId;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert([productPayload])
          .select();

        if (error) {
          console.error('Supabase add product error:', error);
          throw new Error(error.message || 'Gagal menyimpan produk ke Supabase.');
        }

        if (data && data.length > 0) {
          mockEngine.addProduct(data[0]);
          return data[0];
        }
      } catch (err) {
        console.error('Supabase add product catch error:', err);
        throw err;
      }
    }
    return mockEngine.addProduct(productPayload);
  },

  async deleteProduct(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete product error:', err);
      }
    }
    mockEngine.deleteProduct(id);
  },

  async updateProduct(id, product) {
    const productPayload = {
      title: product.title,
      description: product.description,
      category: product.category,
      image_url: product.image_url
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', id)
          .select();

        if (error) {
          console.error('Supabase update product error:', error);
          throw new Error(error.message || 'Gagal memperbarui produk di Supabase.');
        }

        if (data && data.length > 0) {
          mockEngine.updateProduct(id, data[0]);
          return data[0];
        }

        throw new Error('Gagal memperbarui produk di Supabase. Pastikan RLS Policy (UPDATE) pada tabel products telah diaktifkan di Supabase SQL Editor.');
      } catch (err) {
        console.error('Supabase update product catch error:', err);
        throw err;
      }
    }
    return mockEngine.updateProduct(id, productPayload);
  },

  // Press Releases
  async getPressReleases() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('press_releases')
          .select('*');
        if (!error && data && Array.isArray(data)) {
          return data.map(item => ({
            ...item,
            owner_id: item.owner_id || item.author_id,
            author_id: item.author_id || item.owner_id
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch press releases warning:', err);
      }
    }
    return mockEngine.getPressReleases();
  },

  async addPressRelease(pr) {
    const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const userId = isUuid(pr.author_id) ? pr.author_id : (isUuid(pr.owner_id) ? pr.owner_id : null);

    const prPayload = {
      title: pr.title,
      content: pr.content,
      tags: Array.isArray(pr.tags) ? pr.tags : []
    };

    if (userId) {
      prPayload.author_id = userId;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('press_releases')
          .insert([prPayload])
          .select();

        if (error) {
          console.error('Supabase add press release error:', error);
          if (error.message && error.message.includes('author_id')) {
            delete prPayload.author_id;
            if (userId) prPayload.owner_id = userId;
            const retryRes = await supabase.from('press_releases').insert([prPayload]).select();
            if (!retryRes.error && retryRes.data && retryRes.data.length > 0) {
              mockEngine.addPressRelease(retryRes.data[0]);
              return retryRes.data[0];
            }
          }
          throw new Error(error.message || 'Gagal menyimpan siaran pers ke Supabase.');
        }

        if (data && data.length > 0) {
          mockEngine.addPressRelease(data[0]);
          return data[0];
        }
      } catch (err) {
        console.error('Supabase add press release catch error:', err);
        throw err;
      }
    }
    return mockEngine.addPressRelease(prPayload);
  },

  async updatePressRelease(id, pr) {
    const prPayload = {
      title: pr.title,
      content: pr.content,
      tags: Array.isArray(pr.tags) ? pr.tags : [],
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('press_releases')
          .update(prPayload)
          .eq('id', id)
          .select();

        if (error) {
          console.error('Supabase update press release error:', error);
          throw new Error(error.message || 'Gagal memperbarui siaran pers di Supabase.');
        }

        if (data && data.length > 0) {
          const updatedItem = { ...data[0], is_edited: true };
          mockEngine.updatePressRelease(id, updatedItem);
          return updatedItem;
        }

        // If Supabase returned data: [] (0 rows modified due to missing RLS UPDATE policy or invalid ID)
        throw new Error('Gagal memperbarui siaran pers di Supabase. Silakan pastikan Anda telah mengaktifkan RLS Policy (UPDATE) pada tabel press_releases di Supabase SQL Editor.');
      } catch (err) {
        console.error('Supabase update press release catch error:', err);
        throw err;
      }
    }
    return mockEngine.updatePressRelease(id, prPayload);
  },

  async deletePressRelease(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('press_releases').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete press release error:', err);
      }
    }
    mockEngine.deletePressRelease(id);
  },

  // Collaborations
  async getCollaborations() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('collaborations')
          .select('id, brand_id, influencer_id, project_title, budget, status, notes, created_at')
          .order('created_at', { ascending: false });
        if (!error && data && Array.isArray(data)) return data;
      } catch (err) {
        console.warn('Supabase fetch collaborations warning:', err);
      }
    }
    return mockEngine.getCollaborations() || [];
  },

  async addCollaboration(collab) {
    const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const brandUuid = isUuid(collab.brand_id) ? collab.brand_id : null;
    const influencerUuid = isUuid(collab.influencer_id) ? collab.influencer_id : null;

    const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
    const collabStatus = validStatuses.includes(collab.status) ? collab.status : 'pending';

    const initiatorRole = ['agency', 'influencer', 'brand'].includes(collab.initiator) ? collab.initiator : 'brand';
    const initiatorTag = `[Initiator: ${initiatorRole}]`;
    let rawNotes = (collab.notes || '').trim();
    if (!rawNotes.includes('[Initiator:')) {
      rawNotes = `${initiatorTag} ${rawNotes}`.trim();
    }

    const collabPayload = {
      project_title: collab.project_title,
      budget: Number(collab.budget) || 0,
      status: collabStatus,
      notes: rawNotes
    };

    if (brandUuid) collabPayload.brand_id = brandUuid;
    if (influencerUuid) collabPayload.influencer_id = influencerUuid;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('collaborations')
          .insert([collabPayload])
          .select();

        if (error) {
          console.error('Supabase add collaboration error:', error);
          throw new Error(error.message || 'Gagal menyimpan pengajuan kolaborasi ke Supabase.');
        }

        if (data && data.length > 0) {
          mockEngine.addCollaboration(data[0]);
          return data[0];
        }
      } catch (err) {
        console.error('Supabase add collaboration catch error:', err);
        throw err;
      }
    }
    return mockEngine.addCollaboration({
      ...collab,
      ...collabPayload
    });
  },

  async updateCollaborationStatus(id, status) {
    const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
    const cleanStatus = validStatuses.includes(status) ? status : 'pending';

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('collaborations')
          .update({ status: cleanStatus })
          .eq('id', id)
          .select();

        if (error) {
          console.error('Supabase update collaboration status error:', error);
          throw new Error(error.message || 'Gagal mengubah status kolaborasi.');
        }

        if (data && data.length > 0) {
          mockEngine.updateCollaborationStatus(id, cleanStatus);
          return data[0];
        }
      } catch (err) {
        console.error('Supabase update collaboration status catch error:', err);
        throw err;
      }
    }
    return mockEngine.updateCollaborationStatus(id, cleanStatus);
  },

  subscribeCollaborationsRealtime(callback) {
    if (isSupabaseConfigured && supabase) {
      try {
        const channel = supabase
          .channel('collaborations-realtime-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'collaborations' }, (payload) => {
            if (callback) callback(payload);
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        console.warn('Realtime subscription error:', err);
      }
    }
    return () => {};
  },

  // ────────────────────────────────────────────────
  // Rate Card Requests
  // ────────────────────────────────────────────────

  async createRateCardRequest(req) {
    const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const requesterUuid    = isUuid(req.requester_id)   ? req.requester_id   : null;
    const influencerUuid   = isUuid(req.influencer_id)  ? req.influencer_id  : null;

    const payload = {
      brand_name:          req.brand_name          || '',
      product_name:        req.product_name         || '',
      campaign_objective:  req.campaign_objective   || '',
      platforms:           Array.isArray(req.platforms) ? req.platforms : [],
      content_type:        req.content_type         || '',
      target_audience:     req.target_audience      || '',
      timeline:            req.timeline             || '',
      budget_range:        req.budget_range         || '',
      notes:               req.notes                || '',
      status:              'pending'
    };

    if (requesterUuid)   payload.requester_id  = requesterUuid;
    if (influencerUuid)  payload.influencer_id = influencerUuid;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('rate_card_requests')
          .insert([payload])
          .select();

        if (error) {
          console.error('Supabase createRateCardRequest error:', error);
          throw new Error(error.message || 'Gagal menyimpan request rate card ke Supabase.');
        }

        if (data && data.length > 0) {
          mockEngine.addRateCardRequest(data[0]);
          return data[0];
        }
      } catch (err) {
        console.error('Supabase createRateCardRequest catch:', err);
        throw err;
      }
    }

    // Fallback: simpan ke localStorage mock
    return mockEngine.addRateCardRequest(payload);
  },

  async getRateCardRequests({ influencer_id, requester_id } = {}) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('rate_card_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (influencer_id) query = query.eq('influencer_id', influencer_id);
        if (requester_id)  query = query.eq('requester_id',  requester_id);

        const { data, error } = await query;
        if (!error && Array.isArray(data)) return data;
      } catch (err) {
        console.warn('Supabase getRateCardRequests warning:', err);
      }
    }

    // Fallback mock
    let list = mockEngine.getRateCardRequests();
    if (influencer_id) list = list.filter(r => r.influencer_id === influencer_id);
    if (requester_id)  list = list.filter(r => r.requester_id  === requester_id);
    return list;
  },

  async updateRateCardRequestStatus(id, status, kol_response_notes = '') {
    const validStatuses = ['pending', 'responded', 'accepted', 'declined'];
    const cleanStatus   = validStatuses.includes(status) ? status : 'pending';

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('rate_card_requests')
          .update({
            status:             cleanStatus,
            kol_response_notes: kol_response_notes,
            responded_at:       new Date().toISOString()
          })
          .eq('id', id)
          .select();

        if (error) {
          console.error('Supabase updateRateCardRequestStatus error:', error);
          throw new Error(error.message || 'Gagal mengupdate status rate card request.');
        }

        if (data && data.length > 0) {
          mockEngine.updateRateCardRequestStatus(id, cleanStatus, kol_response_notes);
          return data[0];
        }
      } catch (err) {
        console.error('Supabase updateRateCardRequestStatus catch:', err);
        throw err;
      }
    }

    return mockEngine.updateRateCardRequestStatus(id, cleanStatus, kol_response_notes);
  }
};
