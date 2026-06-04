import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { authService } from '../../../shared/api/authService';
import { contentService } from '../../../shared/api/contentService';
import LoadingModal from '../sections/LoadingModal';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading] = useState(false); // Start as false to avoid blocking
  const [userSession, setUserSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [pageAlert, setPageAlert] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileDetails, setProfileDetails] = useState({
    loading: false,
    userData: null,
    videoCount: 0,
    categoryCount: 0,
    subscriptions: [],
    error: null,
  });
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    // Loading is already set to false initially - no need to set it again
    
    // Defer ALL initialization to avoid blocking main thread
    const initializeApp = async () => {
      try {
        // Check session immediately but defer profile fetch
            const { data: { session } } = await authService.getSession();
            setUserSession(session);
        
        // Fetch profile in background (non-blocking)
            if (session?.user) {
          // Use requestIdleCallback for non-critical profile fetch
          const fetchProfile = async () => {
            try {
              const { data: profile } = await contentService.getUserProfile(session.user.id);
              setUserProfile(profile || null);
            } catch (error) {
              console.error('Profile fetch error:', error);
              setUserProfile(null);
            }
          };
          
          if ('requestIdleCallback' in window) {
            requestIdleCallback(fetchProfile, { timeout: 2000 });
          } else {
            setTimeout(fetchProfile, 100);
          }
        } else {
          setUserProfile(null);
        }

        // Listen for auth changes (non-blocking)
        authService.onAuthStateChange(async (_event, session) => {
          setUserSession(session);
          if (session?.user) {
            // Defer profile fetch to avoid blocking
            const fetchProfile = async () => {
              try {
            const { data: profile } = await contentService.getUserProfile(session.user.id);
            setUserProfile(profile || null);
              } catch (error) {
                console.error('Profile fetch error:', error);
                setUserProfile(null);
              }
            };
            
            if ('requestIdleCallback' in window) {
              requestIdleCallback(fetchProfile, { timeout: 1000 });
            } else {
              setTimeout(fetchProfile, 50);
            }
          } else {
            setUserProfile(null);
          }
        });
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    // Initialize immediately for faster session check, but defer heavy operations
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      // Use requestIdleCallback if available, otherwise setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(initializeApp, { timeout: 500 });
      } else {
        setTimeout(initializeApp, 100);
      }
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(initializeApp, { timeout: 500 });
        } else {
          setTimeout(initializeApp, 100);
        }
      }, { once: true });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchProfileDetails = async () => {
      if (!userSession?.user || !showProfileModal) return;
      setProfileDetails(prev => ({ ...prev, loading: true, error: null }));

      try {
        const userId = userSession.user.id;

        const profile = await contentService.getProfileDetails();

        if (isMounted) {
          setProfileDetails({
            loading: false,
            userData: profile.userData || null,
            videoCount: profile.videoCount || 0,
            categoryCount: profile.categoryCount || 0,
            subscriptions: profile.subscriptions || [],
            error: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          setProfileDetails(prev => ({
            ...prev,
            loading: false,
            error: error?.message || 'Failed to load profile data.',
          }));
        }
        console.error('Error loading profile details:', error);
        showAlert(currentLanguage === 'ar' ? 'حدث خطأ أثناء تحميل الملف الشخصي' : 'Error loading profile');
      }
    };

    if (showProfileModal) {
      fetchProfileDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [showProfileModal, userSession, currentLanguage]);


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
      // Sign out without scope parameter to avoid 403 error
      const { error } = await authService.signOut();
      
      // Close modal regardless of signOut result
      setShowProfileModal(false);
      
      // Show success message (session will be cleared on client side)
      if (!error) {
      showAlert(currentLanguage === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Close modal even if signOut fails
      // The session will be cleared when page reloads or navigates
      setShowProfileModal(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return currentLanguage === 'ar' ? 'غير متاح' : 'N/A';
    return new Date(date).toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG' : 'en-US');
  };

  return (
    <div className="App font-['Open_Sans',_sans-serif] bg-white scroll-smooth" role="main">
      {isLoading && <LoadingModal isLoading={isLoading} progress={0} />}

      {pageAlert && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded z-50">
          {pageAlert}
        </div>
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavClick={handleNavClick}
        userSession={userSession}
        userProfile={userProfile}
        onShowProfile={() => setShowProfileModal(true)}
      />

      <Navbar
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        onNavClick={handleNavClick}
        userSession={userSession}
        userProfile={userProfile}
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
            <Categories onAlert={showAlert} userSession={userSession} />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallbackTitle="Videos Section" fallbackMessage="Unable to load videos. Please refresh the page.">
          <Suspense fallback={<ComponentLoader message="Loading videos..." />}>
            <Videos onAlert={showAlert} userSession={userSession} />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallbackTitle="Packages Section" fallbackMessage="Unable to load packages. Please refresh the page.">
          <Suspense fallback={<ComponentLoader message="Loading packages..." />}>
            <Packages onAlert={showAlert} userSession={userSession} userProfile={userProfile} />
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

      {userSession && showProfileModal && (
        <div
          className="modal fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="modal-content bg-white rounded-lg overflow-hidden max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold gradient-text">
                {currentLanguage === 'ar' ? 'الملف الشخصي' : 'User Profile'}
              </h3>
              <button
                className="text-gray-600 hover:text-[var(--color-primary)] text-2xl"
                onClick={() => setShowProfileModal(false)}
                aria-label="Close profile modal"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {profileDetails.loading ? (
                <div className="text-center py-10">
                  <div className="inline-block rounded-full h-10 w-10 border-4 border-gray-200 border-t-[var(--color-primary)] animate-spin mb-4"></div>
                  <p className="text-gray-600">
                    {currentLanguage === 'ar' ? 'جاري تحميل الملف الشخصي...' : 'Loading profile...'}
                  </p>
                </div>
              ) : profileDetails.error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded">
                  {profileDetails.error}
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-user text-white text-2xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {profileDetails.userData?.full_name || userSession.user.email}
                    </h2>
                    <p className="text-gray-600">{profileDetails.userData?.email || userSession.user.email}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        <i className="fas fa-info-circle mr-2 text-[var(--color-primary)]"></i>
                        {currentLanguage === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>
                          <span className="font-medium">
                            {currentLanguage === 'ar' ? 'الاسم الكامل:' : 'Full Name:'}
                          </span>{' '}
                          {profileDetails.userData?.full_name || 'N/A'}
                        </li>
                        <li>
                          <span className="font-medium">
                            {currentLanguage === 'ar' ? 'الهاتف:' : 'Phone:'}
                          </span>{' '}
                          {profileDetails.userData?.phone || (currentLanguage === 'ar' ? 'غير متاح' : 'N/A')}
                        </li>
                        <li>
                          <span className="font-medium">
                            {currentLanguage === 'ar' ? 'تاريخ الانضمام:' : 'Joined:'}
                          </span>{' '}
                          {formatDate(profileDetails.userData?.created_at)}
                        </li>
                        <li>
                          <span className="font-medium">
                            {currentLanguage === 'ar' ? 'نوع الحساب:' : 'Account Type:'}
                          </span>{' '}
                          {profileDetails.userData?.is_coach
                            ? currentLanguage === 'ar'
                              ? 'مدرب'
                              : 'Coach'
                            : currentLanguage === 'ar'
                              ? 'متدرب'
                              : 'Trainee'}
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        <i className="fas fa-video mr-2 text-[var(--color-primary)]"></i>
                        {currentLanguage === 'ar' ? 'الوصول للفيديوهات' : 'Video Access'}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>
                          <span className="font-medium">
                            {currentLanguage === 'ar' ? 'الفيديوهات الفردية:' : 'Individual Videos:'}
                          </span>{' '}
                          {profileDetails.videoCount}
                        </p>
                        <p>
                          <span className="font-medium">
                            {currentLanguage === 'ar' ? 'الوصول للفئات:' : 'Category Access:'}
                          </span>{' '}
                          {profileDetails.categoryCount}
                        </p>
                        <p>
                          <span className="font-medium">
                            {currentLanguage === 'ar' ? 'الاشتراكات النشطة:' : 'Active Subscriptions:'}
                          </span>{' '}
                          {profileDetails.subscriptions.filter(
                            sub => sub.status === 'active' && new Date(sub.end_date) > new Date()
                          ).length}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currentLanguage === 'ar'
                            ? 'تواصل مع مدربك للحصول على المزيد من الفيديوهات.'
                            : 'Contact your coach to gain access to more videos.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {profileDetails.subscriptions.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <i className="fas fa-user-check mr-2 text-[var(--color-primary)]"></i>
                        {currentLanguage === 'ar' ? 'الاشتراكات النشطة' : 'Active Subscriptions'}
                      </h3>
                      <div className="space-y-3">
                        {profileDetails.subscriptions.slice(0, 3).map(sub => {
                          const isActive = sub.status === 'active' && new Date(sub.end_date) > new Date();
                          const statusClass = isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800';
                          return (
                            <div
                              key={sub.id}
                              className="flex justify-between items-center p-3 bg-white rounded-lg border"
                            >
                              <div>
                                <h4 className="font-medium text-gray-800">
                                  {currentLanguage === 'ar'
                                    ? sub.packages?.name_ar || sub.packages?.name_en
                                    : sub.packages?.name_en || sub.packages?.name_ar}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {currentLanguage === 'ar' ? 'ينتهي:' : 'Expires:'}{' '}
                                  {formatDate(sub.end_date)}
                                </p>
                              </div>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}`}>
                                {isActive
                                  ? currentLanguage === 'ar'
                                    ? 'نشط'
                                    : 'Active'
                                  : currentLanguage === 'ar'
                                    ? 'منتهي'
                                    : 'Expired'}
                              </span>
                            </div>
                          );
                        })}
                        {profileDetails.subscriptions.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">
                            {currentLanguage === 'ar'
                              ? `+${profileDetails.subscriptions.length - 3} اشتراكات أخرى`
                              : `+${profileDetails.subscriptions.length - 3} more subscriptions`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <i className="fas fa-star mr-2 text-[var(--color-primary)]"></i>
                      {currentLanguage === 'ar' ? 'رحلتك التدريبية' : 'Your Training Journey'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentLanguage === 'ar'
                        ? 'لديك وصول لمحتوى تدريبي حصري. استمر في العمل الرائع!'
                        : 'You have access to exclusive training content. Keep up the great work!'}
                    </p>
                  </div>
                </>
              )}

              <div className="flex justify-end">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0 w-full md:w-auto">
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center"
                  >
                    <i className={`fas fa-sign-out-alt ${currentLanguage === 'ar' ? 'ml-2' : 'mr-2'}`}></i>
                    {currentLanguage === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                  </button>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                  >
                    {currentLanguage === 'ar' ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
