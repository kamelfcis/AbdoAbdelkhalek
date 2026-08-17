import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';

const colorSchemes = {
  blue: {
    card: 'bg-[var(--color-info)]/10 border-[var(--color-info)]/25',
    label: 'text-[var(--color-info)]',
    value: 'text-[var(--color-text)]',
    icon: 'bg-[var(--color-info)]',
    footer: 'text-[var(--color-info)] border-[var(--color-info)]/25',
  },
  green: {
    card: 'bg-[var(--color-success)]/10 border-[var(--color-success)]/25',
    label: 'text-[var(--color-success)]',
    value: 'text-[var(--color-text)]',
    icon: 'bg-[var(--color-success)]',
    footer: 'text-[var(--color-success)] border-[var(--color-success)]/25',
  },
  purple: {
    card: 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/25',
    label: 'text-[var(--color-accent)]',
    value: 'text-[var(--color-text)]',
    icon: 'bg-[var(--color-accent)]',
    footer: 'text-[var(--color-accent)] border-[var(--color-accent)]/25',
  },
  yellow: {
    card: 'bg-[var(--color-warning)]/10 border-[var(--color-warning)]/25',
    label: 'text-[var(--color-warning)]',
    value: 'text-[var(--color-text)]',
    icon: 'bg-[var(--color-warning)]',
    footer: 'text-[var(--color-warning)] border-[var(--color-warning)]/25',
  },
  orange: {
    card: 'bg-[var(--color-warning)]/10 border-[var(--color-warning)]/25',
    label: 'text-[var(--color-warning)]',
    value: 'text-[var(--color-text)]',
    icon: 'bg-[var(--color-warning)]',
    footer: 'text-[var(--color-warning)] border-[var(--color-warning)]/25',
  },
  red: {
    card: 'bg-[var(--color-danger)]/10 border-[var(--color-danger)]/25',
    label: 'text-[var(--color-danger)]',
    value: 'text-[var(--color-text)]',
    icon: 'bg-[var(--color-danger)]',
    footer: 'text-[var(--color-danger)] border-[var(--color-danger)]/25',
  },
  indigo: {
    card: 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/25',
    label: 'text-[var(--color-primary)]',
    value: 'text-[var(--color-text)]',
    icon: 'bg-[var(--color-primary)]',
    footer: 'text-[var(--color-primary)] border-[var(--color-primary)]/25',
  },
  teal: {
    card: 'bg-[var(--color-secondary)]/10 border-[var(--color-secondary)]/25',
    label: 'text-[var(--color-secondary)]',
    value: 'text-[var(--color-text)]',
    icon: 'bg-[var(--color-secondary)]',
    footer: 'text-[var(--color-secondary)] border-[var(--color-secondary)]/25',
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
        'dashboard-stat-card rounded-xl p-6 border transition-all duration-200',
        'bg-[var(--color-surface-raised)]',
        onClick && 'cursor-pointer hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]',
        scheme.card,
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium mb-1 truncate', scheme.label)}>{label}</p>
          <p className={cn('dashboard-display text-3xl font-bold', scheme.value)}>{value}</p>
        </div>
        {icon && (
          <div
            className={cn(
              'w-14 h-14 shrink-0 rounded-xl flex items-center justify-center shadow-md',
              scheme.icon
            )}
          >
            <i className={cn('fas text-[var(--color-text-inverse)] text-xl', icon)} aria-hidden="true" />
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
