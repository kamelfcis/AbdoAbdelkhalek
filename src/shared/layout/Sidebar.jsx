import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const MOBILE_MQ = '(max-width: 767px)';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_MQ).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}

/**
 * Collapsible sidebar — fixed on the start side (left in LTR, right in RTL).
 */
const Sidebar = ({
  isOpen,
  onClose,
  header,
  footer,
  children,
  isRTL = false,
  width = 'var(--sidebar-width, 16rem)',
  className,
}) => {
  const isMobile = useIsMobile();
  const closedTransform = isRTL ? 'translate-x-full' : '-translate-x-full';

  useBodyScrollLock(isOpen && isMobile);

  const sidebarContent = (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[1300] md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        id="app-sidebar"
        aria-label="Sidebar navigation"
        dir={isRTL ? 'rtl' : 'ltr'}
        className={cn(
          'fixed top-0 h-[100dvh] md:h-full z-[1310] flex flex-col',
          'bg-[var(--color-surface)] shadow-xl border-[var(--color-border)]',
          isRTL ? 'border-l right-0' : 'border-r left-0',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : closedTransform,
          className
        )}
        style={{ width }}
      >
        {header && (
          <div className="p-5 border-b border-[var(--color-border)] shrink-0">{header}</div>
        )}
        <nav className="flex-1 overflow-y-auto overscroll-contain p-4">{children}</nav>
        {footer && (
          <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
            {footer}
          </div>
        )}
      </aside>
      {/* Spacer for layout margin coordination */}
      <span className="hidden" aria-hidden="true" />
    </>
  );

  if (isMobile) {
    return createPortal(sidebarContent, document.body);
  }

  return sidebarContent;
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  header: PropTypes.node,
  footer: PropTypes.node,
  children: PropTypes.node,
  isRTL: PropTypes.bool,
  width: PropTypes.string,
  className: PropTypes.string,
};

export const SidebarNavItem = ({ icon, label, active, onClick, iconClassName, isRTL, badge }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'w-full text-start px-4 py-3 rounded-lg transition flex items-center gap-3',
      'hover:bg-[var(--color-bg-muted)]',
      active
        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] font-semibold'
        : 'text-[var(--color-primary)]'
    )}
  >
    {icon && (
      <i
        className={cn('fas shrink-0 text-[var(--color-primary)]', icon, iconClassName)}
        aria-hidden="true"
      />
    )}
    <span className="truncate flex-1">{label}</span>
    {badge != null && Number(badge) > 0 && (
      <span className="shrink-0 bg-[var(--color-warning)] text-[var(--color-text-inverse)] text-xs font-bold rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
        {badge}
      </span>
    )}
  </button>
);

SidebarNavItem.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.node.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func,
  iconClassName: PropTypes.string,
  isRTL: PropTypes.bool,
  badge: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default Sidebar;
