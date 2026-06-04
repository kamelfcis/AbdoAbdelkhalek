/**
 * Lightweight notification utility using react-hot-toast
 * Replaces SweetAlert2 for better performance (~50KB savings)
 */
import toast from 'react-hot-toast';

/**
 * Show success notification
 */
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    duration: 3000,
    position: 'top-center',
    style: {
      background: '#10b981',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
    ...options,
  });
};

/**
 * Show error notification
 */
export const showError = (message, options = {}) => {
  return toast.error(message, {
    duration: 4000,
    position: 'top-center',
    style: {
      background: '#ef4444',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
    ...options,
  });
};

/**
 * Show warning notification
 */
export const showWarning = (message, options = {}) => {
  return toast(message, {
    icon: '⚠️',
    duration: 3500,
    position: 'top-center',
    style: {
      background: '#f59e0b',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
    ...options,
  });
};

/**
 * Show info notification
 */
export const showInfo = (message, options = {}) => {
  return toast(message, {
    icon: 'ℹ️',
    duration: 3000,
    position: 'top-center',
    style: {
      background: '#3b82f6',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
    ...options,
  });
};

/**
 * Show confirmation dialog (replaces Swal.fire with confirm)
 * Returns a Promise that resolves to true if confirmed, false if cancelled
 */
export const showConfirm = (title, message, confirmText = 'Yes', cancelText = 'Cancel') => {
  return new Promise((resolve) => {
    const toastId = toast(
      (t) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '300px' }}>
          <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{title}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>{message}</div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                background: '#fff',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // Keep open until user clicks
        position: 'top-center',
        style: {
          background: '#fff',
          color: '#1f2937',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          maxWidth: '400px',
        },
      }
    );
  });
};

/**
 * Show loading notification
 */
export const showLoading = (message) => {
  return toast.loading(message, {
    position: 'top-center',
  });
};

/**
 * Dismiss notification
 */
export const dismissNotification = (toastId) => {
  toast.dismiss(toastId);
};

