import React, { useId } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';

const Select = ({
  label,
  error,
  hint,
  id: idProp,
  options = [],
  placeholder,
  className,
  required,
  disabled,
  ...props
}) => {
  const autoId = useId();
  const id = idProp || autoId;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
          {label}
          {required && <span className="text-[var(--color-danger)] ms-1">*</span>}
        </label>
      )}
      <select
        id={id}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(
          'w-full px-3 py-2.5 rounded-lg border appearance-none',
          'bg-[var(--color-surface)] text-[var(--color-text)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]'
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const value = typeof opt === 'object' ? opt.value : opt;
          const labelText = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={value} value={value}>
              {labelText}
            </option>
          );
        })}
      </select>
      {hint && !error && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>}
      {error && <p className="mt-1 text-xs text-[var(--color-danger)]" role="alert">{error}</p>}
    </div>
  );
};

Select.propTypes = {
  label: PropTypes.node,
  error: PropTypes.string,
  hint: PropTypes.string,
  id: PropTypes.string,
  options: PropTypes.array,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default Select;
