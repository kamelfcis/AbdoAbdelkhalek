import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';

const variants = {
  success: 'bg-[var(--color-success)]/10 border-[var(--color-success)]/30 text-[var(--color-success)]',
  error: 'bg-[var(--color-danger)]/10 border-[var(--color-danger)]/30 text-[var(--color-danger)]',
  warning: 'bg-[var(--color-warning)]/10 border-[var(--color-warning)]/30 text-[var(--color-warning)]',
  info: 'bg-[var(--color-info)]/10 border-[var(--color-info)]/30 text-[var(--color-info)]',
};

const icons = {
  success: 'fa-check-circle',
  error: 'fa-exclamation-circle',
  warning: 'fa-exclamation-triangle',
  info: 'fa-info-circle',
};

const Alert = ({ children, variant = 'info', title, onDismiss, className }) => (
  <div
    role="alert"
    className={cn(
      'flex gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm',
      variants[variant] || variants.info,
      className
    )}
  >
    <i className={cn('fas mt-0.5 shrink-0', icons[variant])} aria-hidden="true" />
    <div className="flex-1 min-w-0">
      {title && <p className="font-semibold mb-0.5">{title}</p>}
      <div className="text-sm">{children}</div>
    </div>
    {onDismiss && (
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <i className="fas fa-times" aria-hidden="true" />
      </button>
    )}
  </div>
);

Alert.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  title: PropTypes.node,
  onDismiss: PropTypes.func,
  className: PropTypes.string,
};

export default Alert;
