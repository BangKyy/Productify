import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { OverviewView } from './components/views/OverviewView';
import { PressReleaseView } from './components/views/PressReleaseView';
import { ProductShowcaseView } from './components/views/ProductShowcaseView';
import { MarketplaceView } from './components/views/MarketplaceView';
import { DashboardCollaborationsView } from './components/views/DashboardCollaborationsView';
import { AdminView } from './components/views/AdminView';
import { LoginView } from './components/views/LoginView';
import { SignupView } from './components/views/SignupView';
import { RoleSelectionView } from './components/views/RoleSelectionView';
import { ForgotPasswordView } from './components/views/ForgotPasswordView';
import { CollaborationActivityView } from './components/views/CollaborationActivityView';
import { AboutView } from './components/views/AboutView';
import { UserProfileView } from './components/views/UserProfileView';
import { TermsView } from './components/views/TermsView';
import { PrivacyView } from './components/views/PrivacyView';
import { FaqView } from './components/views/FaqView';
import { CookieConsentToast } from './components/ui/CookieConsentToast';
import { AppInstallGuideModal } from './components/ui/AppInstallGuideModal';

// Route path mappings
const PATH_TO_TAB = {
  '/': 'overview',
  '/beranda': 'overview',
  '/press-releases': 'press-releases',
  '/influencer': 'influencer',
  '/marketplace-influencer': 'influencer',
  '/login': 'login',
  '/signup': 'signup',
  '/collaboration-status': 'dashboard/collaborations',
  '/collaboration-activity': 'collaboration-activity',
  '/about': 'about',
  '/products': 'products',
  '/admin': 'admin',
  '/profile': 'profile',
  '/terms': 'terms',
  '/privacy': 'privacy',
  '/faq': 'faq',
  '/forgot-password': 'forgot-password',
  '/role-selection': 'role-selection',
  '/onboarding': 'role-selection'
};

const TAB_TO_PATH = {
  'overview': '/beranda',
  'press-releases': '/press-releases',
  'influencer': '/influencer',
  'marketplace': '/influencer',
  'login': '/login',
  'signup': '/signup',
  'collaborations': '/collaboration-status',
  'dashboard/collaborations': '/collaboration-status',
  'collaboration-activity': '/collaboration-activity',
  'about': '/about',
  'products': '/products',
  'admin': '/admin',
  'profile': '/profile',
  'terms': '/terms',
  'privacy': '/privacy',
  'faq': '/faq',
  'forgot-password': '/forgot-password',
  'role-selection': '/role-selection',
  'onboarding': '/role-selection'
};

const getTabFromPath = (path) => {
  if (path && path.startsWith('/influencer/detail/')) {
    return path.replace(/^\//, ''); // e.g. "influencer/detail/sarah-wijaya"
  }
  return PATH_TO_TAB[path] || 'overview';
};

function AppContent() {
  // Derive initial tab from current browser URL path
  const [activeTab, setActiveTabState] = useState(() => {
    return getTabFromPath(window.location.pathname);
  });

  // Centralized navigation handler that syncs active tab state AND browser URL history
  const handleTabChange = (newTab, options = {}) => {
    let targetTab = newTab === 'collaborations' ? 'dashboard/collaborations' : newTab;
    if (targetTab === 'marketplace') targetTab = 'influencer';

    setActiveTabState(targetTab);

    // Scroll page to top on every navigation action
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    let targetPath = TAB_TO_PATH[targetTab];
    if (!targetPath && targetTab.startsWith('influencer/detail/')) {
      targetPath = `/${targetTab}`;
    }
    if (!targetPath) targetPath = '/beranda';

    if (window.location.pathname !== targetPath) {
      if (options.replace) {
        window.history.replaceState({ tab: targetTab }, '', targetPath);
      } else {
        window.history.pushState({ tab: targetTab }, '', targetPath);
      }
    }
  };

  // Scroll to top whenever activeTab changes (e.g. via browser back/forward or route change)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === '/') {
      window.history.replaceState({ tab: 'overview' }, '', '/beranda');
    }

    // Handle browser Back / Forward buttons (popstate)
    const handlePopState = () => {
      const matchedTab = getTabFromPath(window.location.pathname);
      setActiveTabState(matchedTab);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };

    window.addEventListener('popstate', handlePopState);

    // Security Fix: Instantly sanitize & wipe sensitive JWT tokens from browser location bar
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token=') || hash.includes('refresh_token=') || hash.includes('type=recovery'))) {
      if (hash.includes('type=recovery')) {
        handleTabChange('forgot-password', { replace: true });
      }
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const renderView = () => {
    if (activeTab === 'marketplace' || activeTab === 'influencer' || (activeTab || '').startsWith('influencer/detail/')) {
      return <MarketplaceView activeTab={activeTab} setActiveTab={handleTabChange} />;
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewView setActiveTab={handleTabChange} />;
      case 'press-releases':
        return <PressReleaseView setActiveTab={handleTabChange} />;
      case 'products':
        return <ProductShowcaseView setActiveTab={handleTabChange} />;
      case 'collaborations':
      case 'dashboard/collaborations':
        return <DashboardCollaborationsView setActiveTab={handleTabChange} />;
      case 'collaboration-activity':
        return <CollaborationActivityView setActiveTab={handleTabChange} />;
      case 'about':
        return <AboutView setActiveTab={handleTabChange} />;
      case 'admin':
        return <AdminView setActiveTab={handleTabChange} />;
      case 'profile':
        return <UserProfileView setActiveTab={handleTabChange} />;
      case 'terms':
        return <TermsView setActiveTab={handleTabChange} />;
      case 'privacy':
        return <PrivacyView setActiveTab={handleTabChange} />;
      case 'faq':
        return <FaqView setActiveTab={handleTabChange} />;
      case 'login':
        return <LoginView setActiveTab={handleTabChange} />;
      case 'signup':
        return <SignupView setActiveTab={handleTabChange} />;
      case 'forgot-password':
        return <ForgotPasswordView setActiveTab={handleTabChange} />;
      case 'onboarding':
      case 'role-selection':
        return <RoleSelectionView setActiveTab={handleTabChange} />;
      default:
        return <OverviewView setActiveTab={handleTabChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white font-sans">
      <div>
        <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {renderView()}
        </main>
      </div>
      <Footer setActiveTab={handleTabChange} />
      <CookieConsentToast />
      <AppInstallGuideModal />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}
