/**
 * Toast wrapper — uses react-hot-toast with design token colors.
 * SweetAlert2 remains in legacy modals until Phase 3 migration.
 */
import toast from 'react-hot-toast';

const baseStyle = {
  padding: '12px 20px',
  borderRadius: 'var(--radius-lg, 0.75rem)',
  fontSize: '14px',
  fontWeight: '500',
};

export const toastSuccess = (message, options = {}) =>
  toast.success(message, {
    duration: 3000,
    position: 'top-center',
    style: { ...baseStyle, background: 'var(--color-success, #10b981)', color: '#fff' },
    ...options,
  });

export const toastError = (message, options = {}) =>
  toast.error(message, {
    duration: 4000,
    position: 'top-center',
    style: { ...baseStyle, background: 'var(--color-danger, #ef4444)', color: '#fff' },
    ...options,
  });

export const toastWarning = (message, options = {}) =>
  toast(message, {
    icon: '⚠️',
    duration: 3500,
    position: 'top-center',
    style: { ...baseStyle, background: 'var(--color-warning, #f59e0b)', color: '#fff' },
    ...options,
  });

export const toastInfo = (message, options = {}) =>
  toast(message, {
    icon: 'ℹ️',
    duration: 3000,
    position: 'top-center',
    style: { ...baseStyle, background: 'var(--color-info, #3b82f6)', color: '#fff' },
    ...options,
  });

export const toastLoading = (message, options = {}) =>
  toast.loading(message, { position: 'top-center', ...options });

export const toastDismiss = (id) => toast.dismiss(id);

/** Re-export raw toast for custom toasts (e.g. confirm dialogs in notifications.js) */
export { toast };

const toastApi = {
  success: toastSuccess,
  error: toastError,
  warning: toastWarning,
  info: toastInfo,
  loading: toastLoading,
  dismiss: toastDismiss,
};

export default toastApi;
