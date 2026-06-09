import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva } from 'class-variance-authority';
import { cn } from '../lib/cn';

const checkboxVariants = cva(
  [
    'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'data-[state=checked]:border-[var(--color-primary)] data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:text-white',
    'data-[state=indeterminate]:border-[var(--color-primary)] data-[state=indeterminate]:bg-[var(--color-primary)] data-[state=indeterminate]:text-white',
  ],
  {
    variants: {
      variant: {
        default: 'border-[var(--color-border)] bg-[var(--color-surface)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Checkbox = React.forwardRef(
  ({ className, variant, checked, indeterminate, disabled, id, ...props }, ref) => {
    const innerRef = useRef(null);
    const resolvedRef = ref || innerRef;

    const resolvedChecked = indeterminate ? 'indeterminate' : checked;

    return (
      <CheckboxPrimitive.Root
        ref={resolvedRef}
        id={id}
        className={cn(checkboxVariants({ variant }), className)}
        checked={resolvedChecked}
        disabled={disabled}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          {indeterminate ? (
            <i className="fas fa-minus text-[10px]" aria-hidden="true" />
          ) : (
            <i className="fas fa-check text-[10px]" aria-hidden="true" />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  }
);

Checkbox.displayName = 'Checkbox';

Checkbox.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default']),
  checked: PropTypes.bool,
  indeterminate: PropTypes.bool,
  disabled: PropTypes.bool,
  id: PropTypes.string,
};

export default Checkbox;
