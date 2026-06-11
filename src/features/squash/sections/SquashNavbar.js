import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSquashI18n } from '../hooks/useSquashI18n';
import { loadFontAwesome } from '../../../shared/lib/fontAwesomeLoader';
import { buildDashboardPath } from '../../dashboard/config/dashboardRoutes';
import { loginPath } from '../../../shared/lib/authRoutes';
import { useLandingSectionsOptional } from '../../../shared/contexts/LandingSectionsContext';

const SquashNavbar = React.memo(({ onSidebarToggle, onNavClick, userSession, userProfile, onShowProfile }) => {
  const { t } = useSquashI18n();
  const navigate = useNavigate();
  const { isSlugVisible } = useLandingSectionsOptional();
  const isCoach = userProfile?.is_coach ?? userSession?.user?.user_metadata?.is_coach;
  const displayName =
    userProfile?.full_name ||
    userSession?.user?.user_metadata?.full_name ||
    userSession?.user?.email ||
    '';

  useEffect(() => {
    loadFontAwesome({ priority: 'high' }).catch(() => {});
  }, []);

  const handleNavClick = (e, section) => {
    e.preventDefault();
    onNavClick(section);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate(loginPath('squash'));
  };

  const handleDashboard = (e) => {
    e.preventDefault();
    navigate(buildDashboardPath('squash', 'overview'));
  };

  return (
    <nav
      className="bg-white shadow-lg sticky top-0 w-full z-40"
      role="navigation"
      aria-label="Main navigation"
      style={{ position: 'sticky', top: 0 }}
    >
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-7 flex justify-between items-center min-h-[100px] md:min-h-[110px]">
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, 'home')}
          className="flex flex-col items-center justify-center space-y-1 group hover:opacity-90"
          aria-label="Home"
        >
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-12 h-12 md:w-14 md:h-14 overflow-hidden border-2 border-[var(--color-primary)] rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" width="56" height="56" loading="eager" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg md:text-xl lg:text-2xl font-bold gradient-text leading-tight text-center">
                Abdelrahman
              </span>
              <span className="text-base md:text-lg lg:text-xl font-semibold text-[var(--color-primary)] leading-tight text-center">
                Abdelkhalek
              </span>
            </div>
          </div>
        </a>

        <div className="hidden lg:flex space-x-4 xl:space-x-6 items-center h-full">
          <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="nav-link">
            {t('nav.home')}
          </a>
          {isSlugVisible('categories') && (
            <a href="#categories" onClick={(e) => handleNavClick(e, 'categories')} className="nav-link">
              {t('nav.categories')}
            </a>
          )}
          {isSlugVisible('packages') && (
            <a href="#packages" onClick={(e) => handleNavClick(e, 'packages')} className="nav-link">
              {t('nav.packages')}
            </a>
          )}
          <a href="#about-me" onClick={(e) => handleNavClick(e, 'about-me')} className="nav-link">
            {t('nav.about')}
          </a>
          <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="nav-link">
            {t('nav.contact')}
          </a>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4 rtl:space-x-reverse h-full">
          {!userSession && (
            <button
              onClick={handleLogin}
              className="hidden md:block bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white px-4 md:px-5 py-3 rounded-full text-sm md:text-base font-semibold hover:shadow-lg flex items-center"
            >
              <i className="fas fa-sign-in-alt mr-2 rtl:ml-2 rtl:mr-0" />
              <span className="hidden lg:inline">{t('nav.login')}</span>
            </button>
          )}
          {userSession && isCoach && (
            <button
              onClick={handleDashboard}
              className="hidden md:block bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white px-4 md:px-5 py-3 rounded-full text-sm md:text-base font-semibold hover:shadow-lg flex items-center"
            >
              <i className="fas fa-tachometer-alt mr-2 rtl:ml-2 rtl:mr-0" />
              <span className="hidden lg:inline">{t('nav.dashboard')}</span>
            </button>
          )}
          {userSession && !isCoach && onShowProfile && (
            <button
              onClick={onShowProfile}
              className="hidden md:block bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white px-4 md:px-5 py-3 rounded-full text-sm md:text-base font-semibold hover:shadow-lg flex items-center"
            >
              <i className="fas fa-user mr-2 rtl:ml-2 rtl:mr-0" />
              <span className="hidden lg:inline">{displayName.split(' ')[0]}</span>
            </button>
          )}
          <button
            onClick={onSidebarToggle}
            className="text-gray-800 hover:text-[var(--color-primary)] p-3 hover:bg-gray-100 rounded-lg flex items-center justify-center"
            aria-label={t('nav.menu')}
            type="button"
          >
            <i className="fas fa-bars text-xl md:text-2xl" aria-hidden="true" />
          </button>
        </div>
      </div>
      <style>{`.nav-link { color: #1f2937; font-size: 1rem; padding: 0.75rem 0.5rem; display: flex; align-items: center; height: 100%; } .nav-link:hover { color: var(--color-primary); font-weight: 700; }`}</style>
    </nav>
  );
});

SquashNavbar.displayName = 'SquashNavbar';

export default SquashNavbar;
