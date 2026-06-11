import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { themeIds } from '../../../design-system/themes';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import RouteGuardLoader from '../../../components/RouteGuardLoader';
import TraineeProfileModal from '../../../shared/components/TraineeProfileModal';
import { LandingSectionsProvider, useLandingSectionsContext } from '../../../shared/contexts/LandingSectionsContext';
import { ErrorBoundary } from '../../../app/ErrorBoundary';
import SquashNavbar from '../sections/SquashNavbar';
import SquashSidebar from '../sections/SquashSidebar';
import SquashFooter from '../sections/SquashFooter';
import SquashScrollToTop from '../sections/SquashScrollToTop';
import '../../../App.css';
import '../styles/squash-premium.css';

const SquashHero = lazy(() => import(/* webpackChunkName: "squash-hero" */ '../sections/SquashHero'));
const SquashAbout = lazy(() => import(/* webpackChunkName: "squash-about" */ '../sections/SquashAbout'));
const SquashWhyChooseMe = lazy(() =>
  import(/* webpackChunkName: "squash-why" */ '../sections/SquashWhyChooseMe')
);
const SquashSuccessStories = lazy(() =>
  import(/* webpackChunkName: "squash-stories" */ '../sections/SquashSuccessStories')
);
const SquashReviews = lazy(() => import(/* webpackChunkName: "squash-reviews" */ '../sections/SquashReviews'));
const SquashCategories = lazy(() =>
  import(/* webpackChunkName: "squash-categories" */ '../sections/SquashCategories')
);
const SquashVideos = lazy(() => import(/* webpackChunkName: "squash-videos" */ '../sections/SquashVideos'));
const SquashPackages = lazy(() =>
  import(/* webpackChunkName: "squash-packages" */ '../sections/SquashPackages')
);
const SquashCoaches = lazy(() => import(/* webpackChunkName: "squash-coaches" */ '../sections/SquashCoaches'));
const SquashPrograms = lazy(() =>
  import(/* webpackChunkName: "squash-programs" */ '../sections/SquashPrograms')
);
const SquashFAQ = lazy(() => import(/* webpackChunkName: "squash-faq" */ '../sections/SquashFAQ'));
const SquashContact = lazy(() =>
  import(/* webpackChunkName: "squash-contact" */ '../sections/SquashContact')
);

const ComponentLoader = ({ message }) => (
  <div className="flex items-center justify-center section-py min-h-[200px]" role="status" aria-live="polite">
    <div className="rounded-full h-8 w-8 border-2 border-gray-200 border-t-[var(--color-primary)] animate-spin" />
    {message && <span className="sr-only">{message}</span>}
  </div>
);

function SquashHomeContent({
  pageAlert,
  sidebarOpen,
  handleSidebarClose,
  handleSidebarToggle,
  session,
  user,
  showProfileModal,
  setShowProfileModal,
  handleNavClick,
  showAlert,
  handleLogout,
  currentLanguage,
}) {
  const { isSectionVisible } = useLandingSectionsContext();

  return (
    <div
      className="App font-['Open_Sans',_sans-serif] bg-white"
      data-theme={themeIds.SQUASH}
      role="main"
    >
      {pageAlert && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded z-50">
          {pageAlert}
        </div>
      )}

      <SquashSidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        onNavClick={handleNavClick}
        userSession={session}
        userProfile={user}
        onShowProfile={() => setShowProfileModal(true)}
      />

      <SquashNavbar
        onSidebarToggle={handleSidebarToggle}
        onNavClick={handleNavClick}
        userSession={session}
        userProfile={user}
        onShowProfile={() => setShowProfileModal(true)}
      />

      <main>
        <ErrorBoundary fallbackTitle="Hero" fallbackMessage="Unable to load hero section.">
          <Suspense fallback={<ComponentLoader message="Loading hero..." />}>
            <SquashHero />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallbackTitle="About">
          <Suspense fallback={<ComponentLoader />}>
            <SquashAbout />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallbackTitle="Why Choose">
          <Suspense fallback={<ComponentLoader />}>
            <SquashWhyChooseMe />
          </Suspense>
        </ErrorBoundary>
        {isSectionVisible('success-stories') && (
          <ErrorBoundary fallbackTitle="Success Stories">
            <Suspense fallback={<ComponentLoader />}>
              <SquashSuccessStories />
            </Suspense>
          </ErrorBoundary>
        )}
        {isSectionVisible('reviews') && (
          <ErrorBoundary fallbackTitle="Reviews">
            <Suspense fallback={<ComponentLoader />}>
              <SquashReviews />
            </Suspense>
          </ErrorBoundary>
        )}
        {isSectionVisible('categories') && (
          <ErrorBoundary fallbackTitle="Categories">
            <Suspense fallback={<ComponentLoader />}>
              <SquashCategories />
            </Suspense>
          </ErrorBoundary>
        )}
        {isSectionVisible('videos') && (
          <ErrorBoundary fallbackTitle="Videos">
            <Suspense fallback={<ComponentLoader />}>
              <SquashVideos />
            </Suspense>
          </ErrorBoundary>
        )}
        {isSectionVisible('packages') && (
          <ErrorBoundary fallbackTitle="Packages">
            <Suspense fallback={<ComponentLoader />}>
              <SquashPackages onAlert={showAlert} userSession={session} userProfile={user} />
            </Suspense>
          </ErrorBoundary>
        )}
        {isSectionVisible('coaches') && (
          <ErrorBoundary fallbackTitle="Coaches">
            <Suspense fallback={<ComponentLoader />}>
              <SquashCoaches />
            </Suspense>
          </ErrorBoundary>
        )}
        {isSectionVisible('programs') && (
          <ErrorBoundary fallbackTitle="Programs">
            <Suspense fallback={<ComponentLoader />}>
              <SquashPrograms />
            </Suspense>
          </ErrorBoundary>
        )}
        {isSectionVisible('faq') && (
          <ErrorBoundary fallbackTitle="FAQ">
            <Suspense fallback={<ComponentLoader />}>
              <SquashFAQ />
            </Suspense>
          </ErrorBoundary>
        )}
        <ErrorBoundary fallbackTitle="Contact">
          <Suspense fallback={<ComponentLoader />}>
            <SquashContact />
          </Suspense>
        </ErrorBoundary>
      </main>

      <SquashFooter />
      <SquashScrollToTop />

      <TraineeProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        session={session}
        user={user}
        domain="squash"
        onLogout={handleLogout}
        onError={showAlert}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}

export default function SquashHomePage() {
  const location = useLocation();
  const { user, session, isLoading, logout } = useAuth();
  const { currentLanguage } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageAlert, setPageAlert] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const authMessage = location.state?.authMessage;
    const authMessageAr = location.state?.authMessageAr;
    if (authMessage || authMessageAr) {
      const message =
        currentLanguage === 'ar' && authMessageAr ? authMessageAr : authMessage || authMessageAr;
      setPageAlert(message);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state, currentLanguage]);

  const handleNavClick = useCallback((section) => {
    document.getElementById(section)?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, []);

  const handleSidebarClose = useCallback(() => setSidebarOpen(false), []);
  const handleSidebarToggle = useCallback(() => setSidebarOpen((open) => !open), []);

  const showAlert = useCallback((message) => {
    setPageAlert(message);
    setTimeout(() => setPageAlert(null), 6000);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  if (isLoading) {
    return <RouteGuardLoader message="Loading..." />;
  }

  return (
    <LandingSectionsProvider domain="squash">
      <SquashHomeContent
        pageAlert={pageAlert}
        sidebarOpen={sidebarOpen}
        handleSidebarClose={handleSidebarClose}
        handleSidebarToggle={handleSidebarToggle}
        session={session}
        user={user}
        showProfileModal={showProfileModal}
        setShowProfileModal={setShowProfileModal}
        handleNavClick={handleNavClick}
        showAlert={showAlert}
        handleLogout={handleLogout}
        currentLanguage={currentLanguage}
      />
    </LandingSectionsProvider>
  );
}
