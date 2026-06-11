import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';

export function ToggleSwitch({ checked, onChange, disabled = false, id, className, size = 'md' }) {
  const sizes = {
    sm: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: checked ? 'translate-x-5' : 'translate-x-0.5' },
    md: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: checked ? 'translate-x-6' : 'translate-x-0.5' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
        s.track,
        checked ? 'bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)]' : 'bg-gray-200',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span
        className={cn(
          'inline-block rounded-full bg-white shadow-md transition-transform duration-200',
          s.thumb,
          s.translate
        )}
      />
    </button>
  );
}

ToggleSwitch.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md']),
};

export default ToggleSwitch;
