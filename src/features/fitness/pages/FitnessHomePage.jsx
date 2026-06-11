import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { getTranslation } from '../../../utils/translations';
import RouteGuardLoader from '../../../components/RouteGuardLoader';
import TraineeProfileModal from '../../../shared/components/TraineeProfileModal';
import Navbar from '../sections/Navbar';
import Sidebar from '../sections/Sidebar';
import Footer from '../sections/Footer';
import ScrollToTop from '../sections/ScrollToTop';
import FloatingInstagramButton from '../sections/FloatingInstagramButton';
import { ErrorBoundary } from '../../../app/ErrorBoundary';
import '../../../App.css';

const Hero = lazy(() => import(/* webpackChunkName: "hero" */ '../sections/Hero'));
const Categories = lazy(() => import(/* webpackChunkName: "content-components" */ '../sections/Categories'));
const Videos = lazy(() => import(/* webpackChunkName: "content-components" */ '../sections/Videos'));
const Packages = lazy(() => import(/* webpackChunkName: "content-components" */ '../sections/Packages'));
const AboutMe = lazy(() => import(/* webpackChunkName: "about-components" */ '../sections/About'));
const AboutCoach = lazy(() => import(/* webpackChunkName: "about-components" */ '../sections/AboutCoach'));
const WhyChooseMe = lazy(() => import(/* webpackChunkName: "about-components" */ '../sections/WhyChooseMe'));
const SuccessStories = lazy(() => import(/* webpackChunkName: "social-components" */ '../sections/SuccessStories'));
const Reviews = lazy(() => import(/* webpackChunkName: "social-components" */ '../sections/Reviews'));
const FAQ = lazy(() => import(/* webpackChunkName: "support-components" */ '../sections/FAQ'));
const Contact = lazy(() => import(/* webpackChunkName: "support-components" */ '../sections/Contact'));

const ComponentLoader = ({ message }) => (
  <div className="flex items-center justify-center section-py min-h-[200px]" role="status" aria-live="polite" aria-label={message || 'Loading content'}>
    <div className="rounded-full h-8 w-8 border-2 border-gray-200 border-t-[var(--color-primary)] animate-spin" aria-hidden="true" />
    {message && <span className="sr-only">{message}</span>}
  </div>
);
export default function FitnessHomePage() {
  const location = useLocation();
  const { user, session, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageAlert, setPageAlert] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { currentLanguage } = useLanguage();

  const handleNavClick = (section) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const showAlert = (message) => {
    setPageAlert(message);
    setTimeout(() => setPageAlert(null), 6000);
  };

  useEffect(() => {
    const authMessage = location.state?.authMessage;
    const authMessageAr = location.state?.authMessageAr;
    if (authMessage || authMessageAr) {
      const message =
        currentLanguage === 'ar' && authMessageAr ? authMessageAr : authMessage || authMessageAr;
      showAlert(message);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state, currentLanguage]);

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileModal(false);
      showAlert(getTranslation('profile.logoutSuccess', currentLanguage));
    } catch (error) {
      console.error('Error during logout:', error);
      setShowProfileModal(false);
    }
  };

  if (isLoading) {
    return <RouteGuardLoader message="Loading..." />;
  }

  return (
    <div className="App font-['Open_Sans',_sans-serif] bg-white scroll-smooth" role="main">
      {pageAlert && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded z-50">
          {pageAlert}
        </div>
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavClick={handleNavClick}
        userSession={session}
        userProfile={user}
        onShowProfile={() => setShowProfileModal(true)}
      />

      <Navbar
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        onNavClick={handleNavClick}
        userSession={session}
        userProfile={user}
        onShowProfile={() => setShowProfileModal(true)}
      />

      <main>
        <ErrorBoundary fallbackTitle="Hero" fallbackMessage="Unable to load hero section.">
          <Suspense fallback={<ComponentLoader message="Loading hero..." />}>
            <Hero />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallbackTitle="About Section" fallbackMessage="Unable to load about section. Please refresh the page.">
          <Suspense fallback={<ComponentLoader message="Loading about section..." />}>
            <AboutMe />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallbackTitle="Why Choose Me Section" fallbackMessage="Unable to load why choose me section. Please refresh the page.">
          <Suspense fallback={<ComponentLoader message="Loading why choose me section..." />}>
            <WhyChooseMe />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallbackTitle="Success Stories Section" fallbackMessage="Unable to load success stories. Please refresh the page.">
          <Suspense fallback={<ComponentLoader message="Loading success stories..." />}>
            <SuccessStories onAlert={showAlert} />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallbackTitle="Reviews Section" fallbackMessage="Unable to load reviews. Please refresh the page.">
          <Suspense fallback={<ComponentLoader message="Loading reviews..." />}>
            <Reviews onAlert={showAlert} />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallbackTitle="Categories Section" fallbackMessage="Unable to load categories. Please refresh the page.">
          <Suspense fallback={<ComponentLoader message="Loading categories..." />}>
            <Categories onAlert={showAlert} userSession={session} />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallbackTitle="Videos Section" fallbackMessage="Unable to load videos. Please refresh the page.">
          <Suspense fallback={<ComponentLoader message="Loading videos..." />}>
            <Videos onAlert={showAlert} userSession={session} />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallbackTitle="Packages Section" fallbackMessage="Unable to load packages. Please refresh the page.">
          <Suspense fallback={<ComponentLoader message="Loading packages..." />}>
            <Packages onAlert={showAlert} userSession={session} userProfile={user} />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallbackTitle="About Coach Section" fallbackMessage="Unable to load about coach section. Please refresh the page.">
          <Suspense fallback={<ComponentLoader message="Loading about coach section..." />}>
            <AboutCoach />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallbackTitle="FAQ Section" fallbackMessage="Unable to load FAQ. Please refresh the page.">
          <Suspense fallback={<ComponentLoader message="Loading FAQ..." />}>
            <FAQ onAlert={showAlert} />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallbackTitle="Contact Section" fallbackMessage="Unable to load contact section. Please refresh the page.">
          <Suspense fallback={<ComponentLoader message="Loading contact section..." />}>
            <Contact onAlert={showAlert} />
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer />
      <ScrollToTop />
      <FloatingInstagramButton />

      <TraineeProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        session={session}
        user={user}
        domain="fitness"
        onLogout={handleLogout}
        onError={showAlert}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}
