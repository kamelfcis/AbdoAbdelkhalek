import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';

const Navbar = ({
  title,
  logoSrc = '/logo.png',
  logoAlt = 'Logo',
  leftActions,
  rightActions,
  isRTL = false,
  className,
  sticky = true,
}) => (
  <header
    className={cn(
      'bg-[var(--color-surface)] shadow-sm border-b border-[var(--color-border)]',
      'px-4 sm:px-6 py-3 flex items-center justify-between gap-4',
      sticky && 'sticky top-0 z-[1200]',
      className
    )}
  >
    <div className="flex items-center gap-3 min-w-0">
      {leftActions}
      {logoSrc && (
        <img
          src={logoSrc}
          alt={logoAlt}
          className="w-10 h-10 rounded-lg object-cover shadow-sm shrink-0"
        />
      )}
      {title && (
        <h1 className="text-xl md:text-2xl font-bold text-[var(--color-text)] truncate">
          {title}
        </h1>
      )}
    </div>
    {rightActions && (
      <div className={cn('flex items-center gap-3 shrink-0', isRTL && 'flex-row-reverse')}>
        {rightActions}
      </div>
    )}
  </header>
);

Navbar.propTypes = {
  title: PropTypes.node,
  logoSrc: PropTypes.string,
  logoAlt: PropTypes.string,
  leftActions: PropTypes.node,
  rightActions: PropTypes.node,
  isRTL: PropTypes.bool,
  className: PropTypes.string,
  sticky: PropTypes.bool,
};

export default Navbar;
