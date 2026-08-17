import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';

const Card = ({
  children,
  header,
  footer,
  variant = 'elevated',
  className,
  bodyClassName,
  onClick,
  ...props
}) => {
  const isInteractive = Boolean(onClick);

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.(e);
              }
            }
          : undefined
      }
      className={cn(
        'rounded-xl overflow-hidden transition-all duration-200',
        variant === 'elevated' && 'bg-[var(--color-surface-raised)] shadow-md border border-[var(--color-border)]',
        variant === 'outline' && 'bg-transparent border-2 border-[var(--color-border)]',
        variant === 'glass' &&
          'bg-[var(--color-surface-glass)] backdrop-blur-md border border-white/20 shadow-[var(--shadow-glass)]',
        isInteractive && 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]',
        className
      )}
      {...props}
    >
      {header && (
        <div className="px-5 py-4 border-b border-[var(--color-border)] font-semibold text-[var(--color-text)]">
          {header}
        </div>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
      {footer && (
        <div className="px-5 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-muted)]">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  header: PropTypes.node,
  footer: PropTypes.node,
  variant: PropTypes.oneOf(['elevated', 'outline', 'glass']),
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  onClick: PropTypes.func,
};

export default Card;
