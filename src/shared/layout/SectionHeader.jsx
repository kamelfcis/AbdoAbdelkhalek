import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';

const SectionHeader = ({ title, subtitle, actions, className, size = 'md' }) => (
  <div
    className={cn(
      'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6',
      className
    )}
  >
    <div>
      <h2
        className={cn(
          'dashboard-display font-bold text-[var(--color-text)]',
          size === 'lg' ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{subtitle}</p>
      )}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

SectionHeader.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  actions: PropTypes.node,
  className: PropTypes.string,
  size: PropTypes.oneOf(['md', 'lg']),
};

export default SectionHeader;
