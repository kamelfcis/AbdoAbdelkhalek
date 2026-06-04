import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';

const variants = {
  primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20',
  success: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  danger: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
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
