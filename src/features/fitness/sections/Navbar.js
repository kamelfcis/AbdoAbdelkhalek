import React, { useEffect, useRef, useState } from 'react';
import { useSiteHeaderLayout } from '../../../shared/hooks/useSiteHeaderLayout';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import { loadFontAwesome } from '../../../shared/lib/fontAwesomeLoader';
import { buildDashboardPath } from '../../dashboard/config/dashboardRoutes';
import { loginPath } from '../../../shared/lib/authRoutes';
import { useLandingSectionsOptional } from '../../../shared/contexts/LandingSectionsContext';
import { useThemeOptional } from '../../../contexts/ThemeContext';
import { cn } from '../../../shared/lib/cn';

const Navbar = React.memo(({ onSidebarToggle, onNavClick, userSession, userProfile, onShowProfile }) => {
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { isSlugVisible } = useLandingSectionsOptional();
  const theme = useThemeOptional();
  const isCoach = userProfile?.is_coach ?? userSession?.user?.user_metadata?.is_coach;
  const displayName =
    userProfile?.full_name ||
    userSession?.user?.user_metadata?.full_name ||
    userSession?.user?.email ||
    '';
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
  useSiteHeaderLayout(headerRef);

  useEffect(() => {
    loadFontAwesome({ priority: 'high' }).catch((error) => {
      console.warn('Font Awesome loading failed:', error);
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (e, section) => {
    e.preventDefault();
    onNavClick(section);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate(loginPath('fitness'));
  };

  const handleDashboard = (e) => {
    e.preventDefault();
    navigate(buildDashboardPath('fitness', 'overview'));
  };

  const navLinkClass =
    'text-[var(--color-text)] hover:text-[var(--color-primary)] text-base md:text-lg py-3 px-2 flex items-center h-full transition-colors';

  return (
    <nav
      ref={headerRef}
      className="site-header surface-header w-full"
      data-site-header
      role="navigation"
      aria-label="Main navigation"
      style={{
        boxShadow: scrolled ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transition: 'box-shadow 0.3s ease, background 0.3s ease',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        backgroundColor: scrolled ? 'color-mix(in srgb, var(--color-surface) 92%, transparent)' : undefined,
      }}
    >
      <div
        className="container mx-auto px-4 md:px-6 flex justify-between items-center"
        style={{
          paddingTop: scrolled ? '0.5rem' : '1.25rem',
          paddingBottom: scrolled ? '0.5rem' : '1.25rem',
          minHeight: scrolled ? '56px' : '80px',
          transition: 'padding 0.3s ease, min-height 0.3s ease',
        }}
      >
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, 'home')}
          className="flex flex-col items-center justify-center space-y-1"
          aria-label="Home"
        >
          <div className="flex items-center space-x-2 md:space-x-3">
            <div
              className="overflow-hidden border-2 border-[var(--color-primary)] rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"
              style={{
                width: scrolled ? '36px' : '48px',
                height: scrolled ? '36px' : '48px',
                transition: 'width 0.3s ease, height 0.3s ease',
              }}
            >
              <img
                src="/logo.png"
                alt="Abdelrahman Abdelkhalek Logo"
                className="w-full h-full object-cover"
                width="56"
                height="56"
                loading="eager"
              />
            </div>
            <div className="flex flex-col items-center">
              <span
                className="font-bold gradient-text leading-tight text-center"
                style={{
                  fontSize: scrolled ? '0.95rem' : '1.1rem',
                  transition: 'font-size 0.3s ease',
                }}
              >
                Abdelrahman
              </span>
              <span
                className="font-semibold text-[var(--color-primary)] leading-tight text-center"
                style={{
                  fontSize: scrolled ? '0.8rem' : '1rem',
                  transition: 'font-size 0.3s ease',
                }}
              >
                Abdelkhalek
              </span>
            </div>
          </div>
        </a>

        <div className="hidden lg:flex space-x-4 xl:space-x-6 items-center h-full">
          <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className={navLinkClass}>
            {getTranslation('nav-home', currentLanguage)}
          </a>
          {isSlugVisible('categories') && (
            <a href="#categories" onClick={(e) => handleNavClick(e, 'categories')} className={navLinkClass}>
              {getTranslation('nav-categories', currentLanguage)}
            </a>
          )}
          {isSlugVisible('packages') && (
            <a href="#packages" onClick={(e) => handleNavClick(e, 'packages')} className={navLinkClass}>
              {getTranslation('nav-packages', currentLanguage)}
            </a>
          )}
          <a href="#about-me" onClick={(e) => handleNavClick(e, 'about-me')} className={navLinkClass}>
            {getTranslation('nav-about', currentLanguage)}
          </a>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4 rtl:space-x-reverse h-full">
          {!userSession && (
            <button
              onClick={handleLogin}
              className="hidden md:block bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white px-4 md:px-5 py-3 md:py-3.5 rounded-full text-sm md:text-base font-semibold shadow-md hover:brightness-95 flex items-center"
            >
              <i className="fas fa-sign-in-alt mr-2 rtl:ml-2 rtl:mr-0"></i>
              <span className="hidden lg:inline">{getTranslation('nav-login', currentLanguage)}</span>
            </button>
          )}
          {userSession && isCoach && (
            <button
              onClick={handleDashboard}
              className="hidden md:block bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white px-4 md:px-5 py-3 md:py-3.5 rounded-full text-sm md:text-base font-semibold shadow-md hover:brightness-95 flex items-center"
            >
              <i className="fas fa-tachometer-alt mr-2 rtl:ml-2 rtl:mr-0"></i>
              <span className="hidden lg:inline">{getTranslation('nav-dashboard', currentLanguage)}</span>
            </button>
          )}
          {userSession && !isCoach && (
            <button
              onClick={onShowProfile}
              className="hidden md:block bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white px-4 md:px-5 py-3 md:py-3.5 rounded-full text-sm md:text-base font-semibold shadow-md hover:brightness-95 flex items-center"
            >
              <i className="fas fa-user mr-2 rtl:ml-2 rtl:mr-0"></i>
              <span className="hidden lg:inline">{displayName.split(' ')[0]}</span>
            </button>
          )}
          {theme?.toggleMode && (
            <button
              type="button"
              onClick={theme.toggleMode}
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text)] transition flex items-center justify-center"
              aria-label={theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme.isDark ? 'Light mode' : 'Dark mode'}
            >
              <i className={cn('fas text-lg md:text-xl', theme.isDark ? 'fa-sun' : 'fa-moon')} aria-hidden="true" />
            </button>
          )}
          <button
            onClick={onSidebarToggle}
            className="text-[var(--color-text)] hover:text-[var(--color-primary)] p-3 hover:bg-[var(--color-bg-muted)] rounded-lg flex items-center justify-center transition-colors"
            aria-label="Toggle menu"
            aria-expanded={false}
            type="button"
          >
            <i className="fas fa-bars text-xl md:text-2xl" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
