import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-4',
};

const Spinner = ({ size = 'md', className, label = 'Loading' }) => (
  <span role="status" className="inline-flex items-center justify-center">
    <span
      className={cn(
        'rounded-full border-[var(--color-primary)] border-t-transparent animate-spin',
        sizes[size] || sizes.md,
        className
      )}
      aria-hidden="true"
    />
    <span className="sr-only">{label}</span>
  </span>
);

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  label: PropTypes.string,
};

export default Spinner;
