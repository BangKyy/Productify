import React, { createContext, useContext, useState } from 'react';

const TRANSLATIONS = {
  id: {
    nav: {
      home: 'Beranda',
      featuresServices: 'Fitur & Layanan',
      pressReleases: 'Press Release',
      products: 'Product Showcase',
      collaborations: 'Marketplace KOL',
      admin: 'Moderasi Admin',
      selectRole: 'Simulasi Peran RBAC',
      language: 'Bahasa'
    },
    roles: {
      umkm: 'UMKM / Brand',
      influencer: 'Influencer / KOL',
      agency: 'Agency / Media',
      admin: 'Admin Moderasi'
    },
    hero: {
      badge: 'Ekosistem PR & Influencer Marketing Terintegrasi',
      title1: 'Hubungkan',
      title2: 'Brand UMKM',
      title3: 'Jurnalis Media, &',
      title4: 'Influencer',
      subtitle: 'PRoductify mempermudah publikasi press release digital, pembuatan showcase produk profesional, serta kolaborasi kampanye dengan KOL secara transparan.',
      publishBtn: 'Publikasikan Press Release',
      exploreKolBtn: 'Jelajahi Influencer KOL',
      rbacTest: 'AKSES SIMULASI PERAN:'
    },
    common: {
      search: 'Cari kata kunci...',
      all: 'Semua',
      cancel: 'Batal',
      submit: 'Kirim',
      close: 'Tutup',
      propose: 'Ajukan Kerja Sama',
      addProduct: 'Tambah Produk Baru',
      publishPR: 'Publikasikan Press Release Baru',
      status: 'Status',
      budget: 'Budget',
      notes: 'Catatan Brief'
    }
  },
  en: {
    nav: {
      home: 'Home',
      featuresServices: 'Features & Services',
      pressReleases: 'Press Releases',
      products: 'Product Showcase',
      collaborations: 'KOL Marketplace',
      admin: 'Admin Console',
      selectRole: 'Simulate Role Access',
      language: 'Language'
    },
    roles: {
      umkm: 'SMB / Brand',
      influencer: 'Influencer / KOL',
      agency: 'Agency / Media',
      admin: 'Admin Moderator'
    },
    hero: {
      badge: 'All-in-One Digital PR & Influencer Marketing Platform',
      title1: 'Connect',
      title2: 'SMB Brands',
      title3: 'Media Journalists, &',
      title4: 'Influencers',
      subtitle: 'PRoductify streamlines digital press release publishing, professional product showcases, and transparent influencer marketing collaborations.',
      publishBtn: 'Publish Press Release',
      exploreKolBtn: 'Explore KOL Influencers',
      rbacTest: 'TEST ACCESS CONTROL MATRIX (RBAC):'
    },
    common: {
      search: 'Search keywords...',
      all: 'All',
      cancel: 'Cancel',
      submit: 'Submit',
      close: 'Close',
      propose: 'Propose Collaboration',
      addProduct: 'Add New Product',
      publishPR: 'Publish New Press Release',
      status: 'Status',
      budget: 'Budget',
      notes: 'Brief Notes'
    }
  }
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('id'); // 'id' | 'en'

  const t = (path) => {
    const keys = path.split('.');
    let current = TRANSLATIONS[lang];
    for (const k of keys) {
      if (!current || !current[k]) return path;
      current = current[k];
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
