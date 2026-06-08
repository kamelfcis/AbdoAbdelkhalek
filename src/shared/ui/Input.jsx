import React, { useId } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';

const Input = ({
  label,
  error,
  hint,
  id: idProp,
  className,
  inputClassName,
  leftIcon,
  rightIcon,
  isRTL = false,
  required,
  disabled,
  ...props
}) => {
  const autoId = useId();
  const id = idProp || autoId;
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
          {label}
          {required && <span className="text-[var(--color-danger)] ms-1" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-[var(--color-primary)] pointer-events-none',
              'start-3'
            )}
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}
        <input
          id={id}
          disabled={disabled}
          required={required}
          dir={isRTL ? 'rtl' : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          className={cn(
            'w-full rounded-lg border bg-[var(--color-surface)] text-[var(--color-text)]',
            'placeholder:text-[var(--color-text-muted)]',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:border-[var(--color-border-focus)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]',
            leftIcon ? 'ps-10' : 'ps-4',
            rightIcon ? 'pe-10' : 'pe-4',
            'py-2.5',
            inputClassName
          )}
          {...props}
        />
        {rightIcon && (
          <span
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-[var(--color-primary)]',
              'end-3'
            )}
          >
            {rightIcon}
          </span>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-[var(--color-text-muted)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.node,
  error: PropTypes.string,
  hint: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  isRTL: PropTypes.bool,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default Input;
