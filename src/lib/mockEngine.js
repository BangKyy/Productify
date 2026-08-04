import { INITIAL_PROFILES, INITIAL_PRODUCTS, INITIAL_PRESS_RELEASES, INITIAL_COLLABORATIONS } from './initialData';

const STORAGE_KEYS = {
  PROFILES: 'productify_profiles_v4',
  PRODUCTS: 'productify_products_v2',
  PRESS_RELEASES: 'productify_press_releases_v2',
  COLLABORATIONS: 'productify_collaborations_v2',
  RATE_CARD_REQUESTS: 'productify_rate_card_requests_v1'
};

const getItem = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Error reading localStorage', e);
    return fallback;
  }
};

const setItem = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error writing to localStorage', e);
  }
};

// Wipe all legacy localStorage keys to ensure pure Supabase data usage
export const clearLegacyStorage = () => {
  try {
    [
      'productify_profiles_v1',
      'productify_profiles_v2',
      'productify_profiles_v3',
      'productify_products_v1',
      'productify_press_releases_v1',
      'productify_collaborations_v1'
    ].forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.warn('localStorage clear warning:', e);
  }
};

export const initMockStorage = () => {
  clearLegacyStorage();

  if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
    setItem(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRESS_RELEASES)) {
    setItem(STORAGE_KEYS.PRESS_RELEASES, INITIAL_PRESS_RELEASES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.COLLABORATIONS)) {
    setItem(STORAGE_KEYS.COLLABORATIONS, INITIAL_COLLABORATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.RATE_CARD_REQUESTS)) {
    setItem(STORAGE_KEYS.RATE_CARD_REQUESTS, []);
  }
};

export const mockEngine = {
  // Profiles
  getProfiles: () => getItem(STORAGE_KEYS.PROFILES, []),
  getProfileById: (id) => {
    const list = getItem(STORAGE_KEYS.PROFILES, []);
    return list.find(p => p.id === id) || null;
  },
  updateProfile: (id, updates) => {
    const list = getItem(STORAGE_KEYS.PROFILES, []);
    const index = list.findIndex(p => p.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      setItem(STORAGE_KEYS.PROFILES, list);
      return list[index];
    }
    const newProfile = { id, ...updates };
    setItem(STORAGE_KEYS.PROFILES, [newProfile, ...list]);
    return newProfile;
  },

  // Products
  getProducts: () => getItem(STORAGE_KEYS.PRODUCTS, []),
  addProduct: (product) => {
    const list = getItem(STORAGE_KEYS.PRODUCTS, []);
    const newProduct = {
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...product
    };
    const updated = [newProduct, ...list];
    setItem(STORAGE_KEYS.PRODUCTS, updated);
    return newProduct;
  },
  deleteProduct: (id) => {
    const list = getItem(STORAGE_KEYS.PRODUCTS, []);
    const updated = list.filter(p => p.id !== id);
    setItem(STORAGE_KEYS.PRODUCTS, updated);
  },
  updateProduct: (id, updates) => {
    const list = getItem(STORAGE_KEYS.PRODUCTS, []);
    const index = list.findIndex(p => p.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      setItem(STORAGE_KEYS.PRODUCTS, list);
      return list[index];
    }
    return null;
  },

  // Press Releases
  getPressReleases: () => getItem(STORAGE_KEYS.PRESS_RELEASES, []),
  addPressRelease: (pr) => {
    const list = getItem(STORAGE_KEYS.PRESS_RELEASES, []);
    const newPR = {
      id: `pr-${Date.now()}`,
      created_at: new Date().toISOString(),
      is_edited: false,
      ...pr
    };
    const updated = [newPR, ...list];
    setItem(STORAGE_KEYS.PRESS_RELEASES, updated);
    return newPR;
  },
  updatePressRelease: (id, updates) => {
    const list = getItem(STORAGE_KEYS.PRESS_RELEASES, []);
    const index = list.findIndex(pr => pr.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates, is_edited: true, created_at: new Date().toISOString() };
      setItem(STORAGE_KEYS.PRESS_RELEASES, list);
      return list[index];
    }
    return null;
  },
  deletePressRelease: (id) => {
    const list = getItem(STORAGE_KEYS.PRESS_RELEASES, []);
    const updated = list.filter(pr => pr.id !== id);
    setItem(STORAGE_KEYS.PRESS_RELEASES, updated);
  },

  // Collaborations
  getCollaborations: () => getItem(STORAGE_KEYS.COLLABORATIONS, []),
  addCollaboration: (collab) => {
    const list = getItem(STORAGE_KEYS.COLLABORATIONS, []);
    const newCollab = {
      id: `collab-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
      ...collab
    };
    const updated = [newCollab, ...list];
    setItem(STORAGE_KEYS.COLLABORATIONS, updated);
    return newCollab;
  },
  updateCollaborationStatus: (id, status) => {
    const list = getItem(STORAGE_KEYS.COLLABORATIONS, []);
    const index = list.findIndex(c => c.id === id);
    if (index !== -1) {
      list[index].status = status;
      setItem(STORAGE_KEYS.COLLABORATIONS, list);
    }
    return list[index];
  },

  // Rate Card Requests
  getRateCardRequests: () => getItem(STORAGE_KEYS.RATE_CARD_REQUESTS, []),
  addRateCardRequest: (req) => {
    const list = getItem(STORAGE_KEYS.RATE_CARD_REQUESTS, []);
    const newReq = {
      id: `rcr-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...req
    };
    const updated = [newReq, ...list];
    setItem(STORAGE_KEYS.RATE_CARD_REQUESTS, updated);
    return newReq;
  },
  updateRateCardRequestStatus: (id, status, kol_response_notes = '') => {
    const list = getItem(STORAGE_KEYS.RATE_CARD_REQUESTS, []);
    const index = list.findIndex(r => r.id === id);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        status,
        kol_response_notes,
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setItem(STORAGE_KEYS.RATE_CARD_REQUESTS, list);
      return list[index];
    }
    return null;
  }
};
