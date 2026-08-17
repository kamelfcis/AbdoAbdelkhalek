import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LandingSectionsProvider } from '../../shared/contexts/LandingSectionsContext';
import TraineeProfileModal from '../../shared/components/TraineeProfileModal';
import RouteGuardLoader from '../../components/RouteGuardLoader';
import { themeIds } from '../../design-system/themes';
import Navbar from '../fitness/sections/Navbar';
import Sidebar from '../fitness/sections/Sidebar';
import Footer from '../fitness/sections/Footer';
import ScrollToTop from '../fitness/sections/ScrollToTop';
import FloatingInstagramButton from '../fitness/sections/FloatingInstagramButton';
import SquashNavbar from '../squash/sections/SquashNavbar';
import SquashSidebar from '../squash/sections/SquashSidebar';
import SquashFooter from '../squash/sections/SquashFooter';
import SquashScrollToTop from '../squash/sections/SquashScrollToTop';
import '../../App.css';
import '../squash/styles/squash-premium.css';

function landingPath(domain, section) {
  if (!section || section === 'home') return `/${domain}`;
  return `/${domain}#${section}`;
}

function WatchLandingChromeInner({ domain, children }) {
  const isSquash = domain === 'squash';
  const navigate = useNavigate();
  const { user, session, isLoading, logout } = useAuth();
  const { currentLanguage } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [pageAlert, setPageAlert] = useState(null);

  const handleNavClick = useCallback(
    (section) => {
      navigate(landingPath(domain, section));
    },
    [domain, navigate]
  );

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

  const fontClass =
    currentLanguage === 'ar'
      ? "font-['Tajawal',_sans-serif]"
      : "font-['Open_Sans',_sans-serif]";

  return (
    <div
      className={`App surface-page ${fontClass}`}
      data-theme={isSquash ? themeIds.SQUASH : undefined}
    >
      <a href="#main-content" className="skip-link">
        {currentLanguage === 'ar' ? 'تخطي إلى المحتوى الرئيسي' : 'Skip to main content'}
      </a>
      {pageAlert && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded z-50">
          {pageAlert}
        </div>
      )}

      {isSquash ? (
        <SquashSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavClick={handleNavClick}
          userSession={session}
          userProfile={user}
          onShowProfile={() => setShowProfileModal(true)}
        />
      ) : (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavClick={handleNavClick}
          userSession={session}
          userProfile={user}
          onShowProfile={() => setShowProfileModal(true)}
        />
      )}

      {isSquash ? (
        <SquashNavbar
          onSidebarToggle={() => setSidebarOpen((open) => !open)}
          onNavClick={handleNavClick}
          userSession={session}
          userProfile={user}
          onShowProfile={() => setShowProfileModal(true)}
        />
      ) : (
        <Navbar
          onSidebarToggle={() => setSidebarOpen((open) => !open)}
          onNavClick={handleNavClick}
          userSession={session}
          userProfile={user}
          onShowProfile={() => setShowProfileModal(true)}
        />
      )}

      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      {isSquash ? <SquashFooter /> : <Footer />}
      {isSquash ? <SquashScrollToTop /> : <ScrollToTop />}
      {!isSquash && <FloatingInstagramButton />}

      <TraineeProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        session={session}
        user={user}
        domain={domain}
        onLogout={handleLogout}
        onError={showAlert}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}

export function WatchLandingChrome({ domain, children }) {
  return (
    <LandingSectionsProvider domain={domain}>
      <WatchLandingChromeInner domain={domain}>{children}</WatchLandingChromeInner>
    </LandingSectionsProvider>
  );
}
