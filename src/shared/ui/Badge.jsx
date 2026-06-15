import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';

const variants = {
  primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20',
  success: 'bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/25',
  warning: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)] border-[var(--color-warning)]/25',
  danger: 'bg-[var(--color-danger)]/15 text-[var(--color-danger)] border-[var(--color-danger)]/25',
  info: 'bg-[var(--color-info)]/15 text-[var(--color-info)] border-[var(--color-info)]/25',
  neutral: 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]',
};

const Badge = ({ children, variant = 'neutral', className, dot = false }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      variants[variant] || variants.neutral,
      className
    )}
  >
    {dot && (
      <span
        className="w-1.5 h-1.5 rounded-full bg-current opacity-80"
        aria-hidden="true"
      />
    )}
    {children}
  </span>
);

Badge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'info', 'neutral']),
  className: PropTypes.string,
  dot: PropTypes.bool,
};

export default Badge;
