import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Modal = ({
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
}) => {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll(FOCUSABLE);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    previousFocusRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      const first = dialogRef.current?.querySelector(FOCUSABLE);
      first?.focus();
    }, 0);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]',
  };

  return (
    <div
      className="fixed inset-0 z-[1400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="presentation"
      onClick={closeOnOverlay ? onClose : undefined}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={cn(
          'w-full bg-[var(--color-surface)] rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col',
          sizes[size] || sizes.md,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || onClose) && (
          <div
            className={cn(
              'flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0',
              headerClassName
            )}
          >
            {title &&
              (typeof title === 'string' ? (
                <h2 id="modal-title" className="text-xl font-bold text-[var(--color-text)]">
                  {title}
                </h2>
              ) : (
                <div id="modal-title" className="text-[var(--color-text)] min-w-0 flex-1">
                  {title}
                </div>
              ))}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text)] transition-colors ms-auto"
                aria-label="Close"
              >
                <i className="fas fa-times text-lg" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        <div className={cn('px-6 py-4 overflow-y-auto flex-1', contentClassName)}>{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-muted)] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.propTypes = {
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
};

export default Modal;
