import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSquashI18n } from '../hooks/useSquashI18n';
import { loadFontAwesome } from '../../../shared/lib/fontAwesomeLoader';
import { buildDashboardPath } from '../../dashboard/config/dashboardRoutes';
import { loginPath } from '../../../shared/lib/authRoutes';
import { useLandingSectionsOptional } from '../../../shared/contexts/LandingSectionsContext';

const NAV_ITEMS = [
  { section: 'home', key: 'sidebar.home' },
  { section: 'categories', key: 'sidebar.categories' },
  { section: 'packages', key: 'sidebar.packages' },
  { section: 'about-me', key: 'sidebar.about' },
  { section: 'why-choose', key: 'sidebar.why' },
  { section: 'reviews', key: 'sidebar.reviews' },
  { section: 'videos', key: 'sidebar.videos' },
  { section: 'coaches', key: 'sidebar.coaches' },
  { section: 'programs', key: 'sidebar.programs' },
  { section: 'faq', key: 'sidebar.faq' },
];

const SquashSidebar = ({ isOpen, onClose, onNavClick, userSession, userProfile, onShowProfile }) => {
  const { t, isRTL } = useSquashI18n();
  const navigate = useNavigate();
  const { isSlugVisible } = useLandingSectionsOptional();
  const sidebarRef = useRef(null);
  const isCoach = userProfile?.is_coach ?? userSession?.user?.user_metadata?.is_coach;
  const displayName =
    userProfile?.full_name ||
    userSession?.user?.user_metadata?.full_name ||
    userSession?.user?.email ||
    '';

  useEffect(() => {
    loadFontAwesome({ priority: 'low' }).catch(() => {});
  }, []);

  const handleNavClick = (e, section) => {
    e.preventDefault();
    onNavClick(section);
    onClose();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate(loginPath('squash'));
    onClose();
  };

  const handleDashboard = (e) => {
    e.preventDefault();
    navigate(buildDashboardPath('squash', 'overview'));
    onClose();
  };

  const sidebarStyle = {
    display: isOpen ? 'flex' : 'none',
    transform: isOpen ? 'translateX(0)' : isRTL ? 'translateX(-100%)' : 'translateX(100%)',
    visibility: isOpen ? 'visible' : 'hidden',
    opacity: isOpen ? 1 : 0,
    transition: 'none',
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
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
        <div className="landing-sidebar-overlay" onClick={onClose} aria-hidden="true" />
      )}
      <div
        ref={sidebarRef}
        className={`sidebar landing-sidebar-drawer ${drawerPositionClass} ${isOpen ? 'open' : ''} ${isRTL ? 'rtl' : ''}`}
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
            aria-label={t('nav.close')}
            type="button"
          >
            <i className="fas fa-times text-2xl" />
          </button>
          <div className="flex flex-col items-center justify-center space-y-2 mt-2 w-full">
            <div className="w-16 h-16 overflow-hidden border-2 border-[var(--color-primary)] rounded-lg flex items-center justify-center shadow-md mx-auto">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" width="64" height="64" loading="eager" />
            </div>
            <span className="text-base font-bold gradient-text text-center">Abdelrahman Abdelkhalek</span>
          </div>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-4">
            {NAV_ITEMS.filter(({ section }) => isSlugVisible(section)).map(({ section, key }) => (
              <li key={section}>
                <a
                  href={`#${section}`}
                  onClick={(e) => handleNavClick(e, section)}
                  className="landing-sidebar-link"
                  style={{ textAlign: isRTL ? 'right' : 'left' }}
                >
                  {t(key)}
                </a>
              </li>
            ))}
            {!userSession && (
              <li>
                <button type="button" onClick={handleLogin} className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white text-center font-semibold">
                  <i className={`fas fa-sign-in-alt ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('sidebar.login')}
                </button>
              </li>
            )}
            {userSession && isCoach && (
              <li>
                <button type="button" onClick={handleDashboard} className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white text-center font-semibold">
                  <i className={`fas fa-tachometer-alt ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('sidebar.dashboard')}
                </button>
              </li>
            )}
            {userSession && !isCoach && onShowProfile && (
              <li>
                <button type="button" onClick={onShowProfile} className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white text-center font-semibold">
                  <i className={`fas fa-user ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {displayName.split(' ')[0]}
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default SquashSidebar;
