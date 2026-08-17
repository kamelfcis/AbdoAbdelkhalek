import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';
import Sidebar, { SidebarNavItem } from './Sidebar';
import Navbar from './Navbar';
import Button from '../ui/Button';
import MediaPreconnect from './MediaPreconnect';
import { useThemeOptional } from '../../contexts/ThemeContext';

/**
 * Dashboard shell — sidebar + top navbar + main content area.
 */
const DashboardShell = ({
  isRTL = false,
  sidebarOpen,
  onSidebarToggle,
  onSidebarClose,
  sidebarTitle,
  sidebarSubtitle,
  navItems = [],
  currentSection,
  onNavigate,
  onLogout,
  logoutLoading = false,
  logoutLabel,
  loggingOutLabel,
  onToggleLanguage,
  languageToggleLabel,
  pageTitle,
  userDisplayName,
  navbarExtraActions,
  sidebarExtra,
  showThemeToggle = true,
  squashDashboard = false,
  children,
  className,
}) => {
  const theme = useThemeOptional();
  const marginClass = sidebarOpen
    ? isRTL
      ? 'md:mr-[var(--sidebar-width,16rem)]'
      : 'md:ml-[var(--sidebar-width,16rem)]'
    : '';

  const sidebarHeader = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-lg object-cover shadow-md shrink-0" />
        <div className="min-w-0">
          <h2 className="dashboard-display text-lg font-bold text-[var(--color-text)] truncate">{sidebarTitle}</h2>
          {sidebarSubtitle && (
            <p className="text-sm text-[var(--color-text-muted)] truncate">{sidebarSubtitle}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onSidebarClose}
        className="md:hidden p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-muted)]"
        aria-label="Close sidebar"
      >
        <i className="fas fa-times" aria-hidden="true" />
      </button>
    </div>
  );

  const sidebarFooter = (
    <>
      <Button
        variant="danger"
        fullWidth
        loading={logoutLoading}
        onClick={onLogout}
        leftIcon={<i className="fas fa-sign-out-alt" aria-hidden="true" />}
      >
        {logoutLoading ? loggingOutLabel : logoutLabel}
      </Button>
      {onToggleLanguage && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onToggleLanguage}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-bg-muted)] hover:bg-[var(--color-border)] transition text-sm font-semibold text-[var(--color-primary)]"
          >
            <i className="fas fa-language" aria-hidden="true" />
            <span>{languageToggleLabel}</span>
          </button>
        </div>
      )}
    </>
  );

  return (
    <div
      className={cn(
        'dashboard-shell min-h-screen bg-[var(--color-bg-canvas)] text-[var(--color-text)]',
        className
      )}
      {...(squashDashboard ? { 'data-squash-dashboard': 'true' } : {})}
    >
      <MediaPreconnect />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={onSidebarClose}
        isRTL={isRTL}
        header={sidebarHeader}
        footer={sidebarFooter}
        className="dashboard-sidebar"
      >
        {sidebarExtra}
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.key}>
              <SidebarNavItem
                icon={item.icon ? `fa-${item.icon}` : undefined}
                iconClassName={item.iconClassName}
                label={item.label}
                badge={item.badge}
                active={currentSection === item.key}
                isRTL={isRTL}
                onClick={() => onNavigate(item.key)}
              />
            </li>
          ))}
        </ul>
      </Sidebar>

      <div className={cn('transition-[margin] duration-300 ease-in-out min-h-screen flex flex-col', marginClass)}>
        <Navbar
          isRTL={isRTL}
          title={pageTitle}
          className="dashboard-navbar py-2.5"
          leftActions={
            <button
              type="button"
              onClick={onSidebarToggle}
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text)] transition"
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
            >
              <i className={cn('fas text-xl', sidebarOpen ? 'fa-times' : 'fa-bars')} aria-hidden="true" />
            </button>
          }
          rightActions={
            <>
              {navbarExtraActions}
              {showThemeToggle && theme?.toggleMode && (
                <button
                  type="button"
                  onClick={theme.toggleMode}
                  className="dashboard-theme-toggle"
                  aria-label={theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={theme.isDark ? 'Light mode' : 'Dark mode'}
                >
                  <i className={cn('fas', theme.isDark ? 'fa-sun' : 'fa-moon')} aria-hidden="true" />
                </button>
              )}
              {userDisplayName && (
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] flex items-center justify-center">
                    <i className="fas fa-user text-[var(--color-text-inverse)] text-sm" aria-hidden="true" />
                  </div>
                  <span className="hidden md:block font-medium truncate max-w-[180px]">{userDisplayName}</span>
                </div>
              )}
            </>
          }
        />

        <main className="dashboard-shell-main flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

DashboardShell.propTypes = {
  isRTL: PropTypes.bool,
  sidebarOpen: PropTypes.bool,
  onSidebarToggle: PropTypes.func,
  onSidebarClose: PropTypes.func,
  sidebarTitle: PropTypes.node,
  sidebarSubtitle: PropTypes.node,
  navItems: PropTypes.array,
  currentSection: PropTypes.string,
  onNavigate: PropTypes.func,
  onLogout: PropTypes.func,
  logoutLoading: PropTypes.bool,
  logoutLabel: PropTypes.node,
  loggingOutLabel: PropTypes.node,
  onToggleLanguage: PropTypes.func,
  languageToggleLabel: PropTypes.node,
  pageTitle: PropTypes.node,
  userDisplayName: PropTypes.node,
  navbarExtraActions: PropTypes.node,
  showThemeToggle: PropTypes.bool,
  squashDashboard: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default DashboardShell;
