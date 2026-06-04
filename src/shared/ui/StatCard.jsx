import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';

const colorSchemes = {
  blue: {
    card: 'from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950/40 dark:to-blue-900/30 dark:border-blue-800',
    label: 'text-blue-700 dark:text-blue-300',
    value: 'text-blue-900 dark:text-blue-100',
    icon: 'from-blue-400 to-blue-600',
    footer: 'text-blue-600 border-blue-200',
  },
  green: {
    card: 'from-green-50 to-green-100 border-green-200 dark:from-green-950/40 dark:to-green-900/30 dark:border-green-800',
    label: 'text-green-700 dark:text-green-300',
    value: 'text-green-900 dark:text-green-100',
    icon: 'from-green-400 to-green-600',
    footer: 'text-green-600 border-green-200',
  },
  purple: {
    card: 'from-purple-50 to-purple-100 border-purple-200 dark:from-purple-950/40 dark:to-purple-900/30 dark:border-purple-800',
    label: 'text-purple-700 dark:text-purple-300',
    value: 'text-purple-900 dark:text-purple-100',
    icon: 'from-purple-400 to-purple-600',
    footer: 'text-purple-600 border-purple-200',
  },
  yellow: {
    card: 'from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-950/40 dark:to-yellow-900/30 dark:border-yellow-800',
    label: 'text-yellow-700 dark:text-yellow-300',
    value: 'text-yellow-900 dark:text-yellow-100',
    icon: 'from-yellow-400 to-yellow-600',
    footer: 'text-yellow-600 border-yellow-200',
  },
  orange: {
    card: 'from-orange-50 to-orange-100 border-orange-200 dark:from-orange-950/40 dark:to-orange-900/30 dark:border-orange-800',
    label: 'text-orange-700 dark:text-orange-300',
    value: 'text-orange-900 dark:text-orange-100',
    icon: 'from-orange-400 to-orange-600',
    footer: 'text-orange-600 border-orange-200',
  },
  red: {
    card: 'from-red-50 to-red-100 border-red-200 dark:from-red-950/40 dark:to-red-900/30 dark:border-red-800',
    label: 'text-red-700 dark:text-red-300',
    value: 'text-red-900 dark:text-red-100',
    icon: 'from-red-400 to-red-600',
    footer: 'text-red-600 border-red-200',
  },
  indigo: {
    card: 'from-indigo-50 to-indigo-100 border-indigo-200 dark:from-indigo-950/40 dark:to-indigo-900/30 dark:border-indigo-800',
    label: 'text-indigo-700 dark:text-indigo-300',
    value: 'text-indigo-900 dark:text-indigo-100',
    icon: 'from-indigo-400 to-indigo-600',
    footer: 'text-indigo-600 border-indigo-200',
  },
  teal: {
    card: 'from-teal-50 to-teal-100 border-teal-200 dark:from-teal-950/40 dark:to-teal-900/30 dark:border-teal-800',
    label: 'text-teal-700 dark:text-teal-300',
    value: 'text-teal-900 dark:text-teal-100',
    icon: 'from-teal-400 to-teal-600',
    footer: 'text-teal-600 border-teal-200',
  },
};

const StatCard = ({
  label,
  value,
  icon,
  color = 'blue',
  footer,
  onClick,
  isRTL = false,
  className,
}) => {
  const scheme = colorSchemes[color] || colorSchemes.blue;

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'bg-gradient-to-br rounded-xl shadow-md p-6 border transition-all duration-300',
        onClick && 'cursor-pointer hover:shadow-xl hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
        scheme.card,
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium mb-1 truncate', scheme.label)}>{label}</p>
          <p className={cn('text-3xl font-bold', scheme.value)}>{value}</p>
        </div>
        {icon && (
          <div
            className={cn(
              'w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md',
              scheme.icon
            )}
          >
            <i className={cn('fas text-white text-xl', icon)} aria-hidden="true" />
          </div>
        )}
      </div>
      {footer && (
        <div className={cn('mt-4 pt-4 border-t flex items-center text-xs', scheme.footer)}>
          <i className={cn('fas', isRTL ? 'fa-arrow-left ms-1' : 'fa-arrow-right me-1')} aria-hidden="true" />
          <span>{footer}</span>
        </div>
      )}
    </div>
  );
};

StatCard.propTypes = {
  label: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  icon: PropTypes.string,
  color: PropTypes.oneOf(Object.keys(colorSchemes)),
  footer: PropTypes.node,
  onClick: PropTypes.func,
  isRTL: PropTypes.bool,
  className: PropTypes.string,
};

export default StatCard;
