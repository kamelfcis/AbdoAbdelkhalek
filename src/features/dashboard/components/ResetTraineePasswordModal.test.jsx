import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetTraineePasswordModal from './ResetTraineePasswordModal';

const mockResetTraineePassword = vi.fn();

vi.mock('../../../shared/lib/getContentService', () => ({
  getContentService: () => ({
    resetTraineePassword: mockResetTraineePassword,
  }),
}));

vi.mock('../../../shared/ui', () => ({
  Modal: ({ isOpen, title, children, footer }) =>
    isOpen ? (
      <div role="dialog">
        <div>{title}</div>
        <div>{children}</div>
        <div>{footer}</div>
      </div>
    ) : null,
  Input: ({ label, value, onChange, error, type = 'text', id, rightIcon, ...props }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} value={value} onChange={onChange} {...props} />
      {rightIcon}
      {error ? <p role="alert">{error}</p> : null}
    </div>
  ),
  Button: ({ children, onClick, type = 'button', ...props }) => (
    <button type={type} onClick={onClick} {...props}>
      {children}
    </button>
  ),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('./modalHelpers', () => ({
  ModalFormFooter: ({ submitLabel, formId }) => (
    <button type="submit" form={formId}>
      {submitLabel}
    </button>
  ),
}));

const t = (key) =>
  ({
    'reset-trainee-password-title': 'Reset trainee password',
    'reset-trainee-password-hint': 'The trainee can sign in immediately.',
    'reset-password-new': 'New password',
    'reset-password-confirm': 'Confirm password',
    'reset-password-generate': 'Generate',
    'reset-password-show': 'Show password',
    'reset-password-hide': 'Hide password',
    'reset-password-min': 'Password must be at least 6 characters',
    'reset-password-mismatch': 'Passwords do not match',
    'reset-password-submit': 'Save password',
    'reset-password-success': 'Trainee password updated',
    'btn-cancel': 'Cancel',
    saving: 'Saving...',
  })[key] || key;

const trainee = {
  id: 'user-1',
  full_name: 'Mohamed Kamel',
  email: 'trainee@example.com',
};

describe('ResetTraineePasswordModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResetTraineePassword.mockResolvedValue({ ok: true });
  });

  function renderModal() {
    return render(
      <ResetTraineePasswordModal
        isOpen
        onClose={vi.fn()}
        trainee={trainee}
        domain="fitness"
        currentLanguage="en"
        t={t}
      />
    );
  }

  it('requires at least 6 characters', async () => {
    renderModal();

    fireEvent.change(screen.getByLabelText('New password'), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: '12345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save password' }));

    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    expect(mockResetTraineePassword).not.toHaveBeenCalled();
  });

  it('requires the confirmation to match', () => {
    renderModal();

    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'secret1' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'secret2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save password' }));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(mockResetTraineePassword).not.toHaveBeenCalled();
  });

  it('submits matching passwords of at least 6 characters', async () => {
    renderModal();

    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'secret1' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save password' }));

    await waitFor(() => {
      expect(mockResetTraineePassword).toHaveBeenCalledWith('user-1', 'secret1');
    });
  });
});
