import React from 'react';
import PropTypes from 'prop-types';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../lib/cn';

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]',
};

const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
  className,
  contentClassName,
  headerClassName,
  headerStyle,
  closeButtonClassName,
  onOpenChange,
}) => {
  const handleOpenChange = (open) => {
    if (!open) onClose?.();
    onOpenChange?.(open);
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[1400] bg-black/65 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out"
          onClick={closeOnOverlay ? undefined : (e) => e.stopPropagation()}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[1400] flex w-full -translate-x-1/2 -translate-y-1/2 flex-col',
            'max-h-[90vh] overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-2xl',
            'ring-1 ring-[var(--color-border)] focus:outline-none',
            sizes[size] || sizes.md,
            className
          )}
          onPointerDownOutside={closeOnOverlay ? undefined : (e) => e.preventDefault()}
          onInteractOutside={closeOnOverlay ? undefined : (e) => e.preventDefault()}
          aria-describedby={undefined}
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {(title || onClose) && (
            <div
              className={cn(
                'flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-6 py-4',
                headerClassName
              )}
              style={headerStyle}
            >
              {title &&
                (typeof title === 'string' ? (
                  <DialogPrimitive.Title
                    id="modal-title"
                    className="text-xl font-bold text-[var(--color-text)]"
                  >
                    {title}
                  </DialogPrimitive.Title>
                ) : (
                  <DialogPrimitive.Title
                    id="modal-title"
                    className="min-w-0 flex-1 text-[var(--color-text)]"
                    asChild
                  >
                    <div>{title}</div>
                  </DialogPrimitive.Title>
                ))}
              {onClose && (
                <DialogPrimitive.Close
                  type="button"
                  className={cn(
                    'ms-auto rounded-lg p-2 text-[var(--color-text-muted)] transition-colors',
                    'hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text)]',
                    closeButtonClassName
                  )}
                  aria-label="Close"
                >
                  <i className="fas fa-times text-lg" aria-hidden="true" />
                </DialogPrimitive.Close>
              )}
            </div>
          )}
          <div className={cn('relative flex-1 overflow-y-auto px-6 py-4', contentClassName)}>
            {children}
          </div>
          {footer && (
            <div className="shrink-0 border-t border-[var(--color-border)] bg-gradient-to-b from-[var(--color-bg-muted)]/80 to-[var(--color-bg-muted)] px-6 py-4">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

Dialog.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  closeOnOverlay: PropTypes.bool,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  headerStyle: PropTypes.object,
  closeButtonClassName: PropTypes.string,
  onOpenChange: PropTypes.func,
};

export default Dialog;
