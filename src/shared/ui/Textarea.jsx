import React, { useId } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';

const Textarea = ({
  label,
  error,
  hint,
  id: idProp,
  className,
  rows = 3,
  required,
  disabled,
  ...props
}) => {
  const autoId = useId();
  const id = idProp || autoId;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
          {label}
          {required && <span className="text-[var(--color-danger)] ms-1">*</span>}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={cn(
          'w-full px-3 py-2.5 rounded-lg border resize-y min-h-[80px]',
          'bg-[var(--color-surface)] text-[var(--color-text)]',
          'placeholder:text-[var(--color-text-muted)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:border-[var(--color-border-focus)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]'
        )}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

Textarea.propTypes = {
  label: PropTypes.node,
  error: PropTypes.string,
  hint: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  rows: PropTypes.number,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default Textarea;
