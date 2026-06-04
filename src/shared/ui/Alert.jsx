import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';

const variants = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
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
