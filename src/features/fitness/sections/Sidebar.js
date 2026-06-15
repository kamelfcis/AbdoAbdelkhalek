import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import { buildDashboardPath, buildTraineeDashboardPath } from '../../dashboard/config/dashboardRoutes';
import { loginPath } from '../../../shared/lib/authRoutes';
import { useLandingSectionsOptional } from '../../../shared/contexts/LandingSectionsContext';

const Sidebar = ({ isOpen, onClose, onNavClick, userSession, userProfile, onShowProfile }) => {
  const { currentLanguage, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const { isSlugVisible } = useLandingSectionsOptional();
  const sidebarRef = useRef(null);
  const langText = currentLanguage === 'ar' ? 'English' : 'العربية';
  const isRTL = currentLanguage === 'ar';
  const isCoach = userProfile?.is_coach ?? userSession?.user?.user_metadata?.is_coach;
  const displayName =
    userProfile?.full_name ||
    userSession?.user?.user_metadata?.full_name ||
    userSession?.user?.email ||
    '';

  useEffect(() => {
    if (window.loadFontAwesome) {
      window.loadFontAwesome();
    }
  }, []);

  const handleNavClick = (e, section) => {
    e.preventDefault();
    onNavClick(section);
    onClose();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate(loginPath('fitness'));
    onClose();
  };

  const handleDashboard = (e) => {
    e.preventDefault();
    navigate(buildDashboardPath('fitness', 'overview'));
    onClose();
  };

  const openTraineeVideos = (e, view) => {
    e.preventDefault();
    navigate(
      buildTraineeDashboardPath('fitness', view === 'favorites' ? 'favorites' : 'my-videos')
    );
    onClose();
  };

  const sidebarStyle = {
    display: isOpen ? 'flex' : 'none',
    transform: isOpen ? 'translateX(0)' : isRTL ? 'translateX(-100%)' : 'translateX(100%)',
    transition: 'none',
    visibility: isOpen ? 'visible' : 'hidden',
    opacity: isOpen ? 1 : 0,
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    const active = document.activeElement;
    if (active && sidebarRef.current?.contains(active)) {
      active.blur();
    }
  }, [isOpen]);

  const drawerPositionClass = isRTL ? 'landing-sidebar-drawer--start' : 'landing-sidebar-drawer--end';

  return (
    <>
      {isOpen && (
        <div
          className="landing-sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        ref={sidebarRef}
        className={`sidebar landing-sidebar-drawer ${drawerPositionClass} ${isOpen ? 'open' : ''} ${isRTL ? 'rtl' : ''} relative`}
        style={sidebarStyle}
        dir={isRTL ? 'rtl' : 'ltr'}
        role="navigation"
        aria-label="Sidebar navigation"
        aria-hidden={!isOpen}
        {...(!isOpen ? { inert: true } : {})}
        tabIndex={isOpen ? 0 : -1}
      >
        <div className="p-4 border-b landing-sidebar-section flex-shrink-0 relative">
          <button
            onClick={onClose}
            className={`landing-sidebar-close absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-10`}
            aria-label="Close sidebar"
            type="button"
          >
            <i className="fas fa-times text-2xl"></i>
          </button>

          <div className="flex flex-col items-center justify-center space-y-2 mt-2 w-full">
            <div className="w-16 h-16 sm:w-18 sm:h-18 overflow-hidden border-2 border-[var(--color-primary)] rounded-lg flex items-center justify-center flex-shrink-0 shadow-md mx-auto">
              <img
                src="/logo.png"
                alt="Abdelrahman Abdelkhalek Logo"
                className="w-full h-full object-cover"
                width="64"
                height="64"
                loading="eager"
              />
            </div>
            <div className="flex flex-col items-center w-full">
              <span className="text-base sm:text-lg md:text-xl font-bold gradient-text leading-tight text-center w-full">
                Abdelrahman
              </span>
              <span className="text-sm sm:text-base md:text-lg font-semibold text-[var(--color-primary)] leading-tight text-center w-full">
                Abdelkhalek
              </span>
            </div>
          </div>
        </div>
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-4">
            <li>
              <a
                href="#home"
                onClick={(e) => handleNavClick(e, 'home')}
                className="landing-sidebar-link"
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              >
                {getTranslation('sidebar-home', currentLanguage)}
              </a>
            </li>
            {isSlugVisible('categories') && (
              <li>
                <a
                  href="#categories"
                  onClick={(e) => handleNavClick(e, 'categories')}
                  className="landing-sidebar-link"
                  style={{ textAlign: isRTL ? 'right' : 'left' }}
                >
                  {getTranslation('sidebar-categories', currentLanguage)}
                </a>
              </li>
            )}
            {isSlugVisible('packages') && (
              <li>
                <a
                  href="#packages"
                  onClick={(e) => handleNavClick(e, 'packages')}
                  className="landing-sidebar-link"
                  style={{ textAlign: isRTL ? 'right' : 'left' }}
                >
                  {getTranslation('sidebar-packages', currentLanguage)}
                </a>
              </li>
            )}
            <li>
              <a
                href="#about-me"
                onClick={(e) => handleNavClick(e, 'about-me')}
                className="landing-sidebar-link"
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              >
              {getTranslation('sidebar-about', currentLanguage)}
            </a>
          </li>
          {isSlugVisible('success') && (
            <li>
              <a
                href="#success"
                onClick={(e) => handleNavClick(e, 'success')}
                className="landing-sidebar-link"
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              >
                {getTranslation('sidebar-success', currentLanguage)}
              </a>
            </li>
          )}
          {userSession && !isCoach && isSlugVisible('videos') && (
              <>
                <li>
                  <a
                    href="#videos"
                    onClick={(e) => openTraineeVideos(e, 'all')}
                    className="landing-sidebar-link"
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                  >
                    <i className={`fas fa-video ${isRTL ? 'ml-2' : 'mr-2'}`}></i>
                    {getTranslation('sidebar-my-videos', currentLanguage)}
                  </a>
                </li>
                <li>
                  <a
                    href="#videos"
                    onClick={(e) => openTraineeVideos(e, 'favorites')}
                    className="landing-sidebar-link"
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                  >
                    <i className={`fas fa-heart ${isRTL ? 'ml-2' : 'mr-2'}`}></i>
                    {getTranslation('sidebar-my-favorites', currentLanguage)}
                  </a>
                </li>
              </>
            )}
            {!userSession && (
              <li>
                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white text-center font-semibold flex items-center justify-center"
                  style={{ direction: 'ltr' }}
                >
                  <i className={`fas fa-sign-in-alt ${isRTL ? 'ml-2' : 'mr-2'}`}></i>
                  {getTranslation('sidebar-login', currentLanguage)}
                </button>
              </li>
            )}
            {userSession && isCoach && (
              <li>
                <button
                  type="button"
                  onClick={handleDashboard}
                  className="block py-2 px-4 rounded-lg bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white text-center font-semibold flex items-center justify-center w-full"
                  style={{ direction: 'ltr' }}
                >
                  <i className={`fas fa-tachometer-alt ${isRTL ? 'ml-2' : 'mr-2'}`}></i>
                  {getTranslation('sidebar-dashboard', currentLanguage)}
                </button>
              </li>
            )}
            {userSession && !isCoach && (
              <li>
                <button
                  type="button"
                  onClick={onShowProfile}
                  className="block py-2 px-4 rounded-lg bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white text-center font-semibold flex items-center justify-center w-full"
                  style={{ direction: 'ltr' }}
                >
                  <i className={`fas fa-user ${isRTL ? 'ml-2' : 'mr-2'}`}></i>
                  {displayName.split(' ')[0]}
                </button>
              </li>
            )}
          </ul>
        </nav>
        <div className="p-4 border-t landing-sidebar-section mt-auto flex-shrink-0">
          <div className={`flex ${isRTL ? 'space-x-reverse' : ''} space-x-4 justify-center`}>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center hover:opacity-90"
              aria-label="Facebook"
            >
              <i className="fab fa-facebook-f" aria-hidden="true"></i>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] text-white flex items-center justify-center hover:opacity-90"
              aria-label="Instagram"
            >
              <i className="fab fa-instagram" aria-hidden="true"></i>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center hover:opacity-90"
              aria-label="LinkedIn"
            >
              <i className="fab fa-linkedin-in" aria-hidden="true"></i>
            </a>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={toggleLanguage}
              className={`bg-[var(--color-bg-muted)] p-2 rounded-full shadow flex items-center justify-center glow ${isRTL ? 'flex-row-reverse' : ''}`}
              aria-label="Toggle language"
              type="button"
            >
              <i className="fas fa-language text-lg gradient-text"></i>
              <span className={`text-sm font-semibold gradient-text ${isRTL ? 'mr-2' : 'ml-2'}`}>
                {langText}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
