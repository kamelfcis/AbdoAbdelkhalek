import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';
import Button from './Button';

const EmptyState = ({ icon = 'fa-inbox', title, description, actionLabel, onAction, className }) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center text-center py-12 px-6',
      'rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]',
      className
    )}
  >
    <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
      <i className={cn('fas text-2xl text-[var(--color-primary)]', icon)} aria-hidden="true" />
    </div>
    {title && <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">{title}</h3>}
    {description && (
      <p className="text-sm text-[var(--color-text-muted)] max-w-sm mb-4">{description}</p>
    )}
    {actionLabel && onAction && (
      <Button variant="primary" size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.node,
  description: PropTypes.node,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  className: PropTypes.string,
};

export default EmptyState;
