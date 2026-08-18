import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getContentService } from '../../../shared/lib/getContentService';
import { Modal, Input, Button, toastSuccess, toastError } from '../../../shared/ui';
import { ModalFormFooter } from './modalHelpers';

const PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

function generatePassword(length = 12) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => PASSWORD_CHARS[byte % PASSWORD_CHARS.length]).join('');
}

function traineeDisplayName(trainee) {
  return trainee?.full_name || trainee?.fullName || trainee?.email || '';
}

export default function ResetTraineePasswordModal({
  isOpen,
  onClose,
  trainee,
  domain = 'fitness',
  t,
  currentLanguage = 'en',
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAr = currentLanguage === 'ar';

  useEffect(() => {
    if (!isOpen) return;
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setPasswordError('');
    setConfirmError('');
    setIsSubmitting(false);
  }, [isOpen, trainee?.id]);

  const validate = () => {
    let nextPasswordError = '';
    let nextConfirmError = '';
    if (password.length < 6) {
      nextPasswordError = t('reset-password-min');
    }
    if (password !== confirmPassword) {
      nextConfirmError = t('reset-password-mismatch');
    }
    setPasswordError(nextPasswordError);
    setConfirmError(nextConfirmError);
    return !nextPasswordError && !nextConfirmError;
  };

  const handleGenerate = () => {
    const next = generatePassword();
    setPassword(next);
    setConfirmPassword(next);
    setPasswordError('');
    setConfirmError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!trainee?.id || !validate()) return;

    setIsSubmitting(true);
    try {
      const contentService = getContentService(domain);
      await contentService.resetTraineePassword(trainee.id, password);
      toastSuccess(t('reset-password-success'));
      onClose?.();
    } catch (error) {
      toastError(error.message || 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderVisibilityToggle = () => (
    <button
      type="button"
      onClick={() => setShowPassword((open) => !open)}
      aria-label={showPassword ? t('reset-password-hide') : t('reset-password-show')}
      className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
    >
      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
    </button>
  );

  return (
    <Modal
      isOpen={Boolean(isOpen && trainee)}
      onClose={onClose}
      title={t('reset-trainee-password-title')}
      size="md"
      footer={
        <ModalFormFooter
          onClose={onClose}
          isSubmitting={isSubmitting}
          formId="reset-trainee-password-form"
          cancelLabel={t('btn-cancel')}
          savingLabel={t('saving')}
          submitLabel={t('reset-password-submit')}
        />
      }
    >
      {trainee && (
        <form id="reset-trainee-password-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-[var(--color-bg-muted)] p-4">
            <p className="font-semibold text-[var(--color-text)]">{traineeDisplayName(trainee)}</p>
            {trainee.email ? (
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{trainee.email}</p>
            ) : null}
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">{t('reset-trainee-password-hint')}</p>
          <div className="flex items-end gap-2">
            <Input
              className="flex-1"
              id="reset-trainee-password-new"
              label={t('reset-password-new')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError('');
              }}
              error={passwordError}
              required
              autoComplete="new-password"
              isRTL={isAr}
              rightIcon={renderVisibilityToggle()}
            />
            <Button type="button" variant="secondary" onClick={handleGenerate} disabled={isSubmitting}>
              {t('reset-password-generate')}
            </Button>
          </div>
          <Input
            id="reset-trainee-password-confirm"
            label={t('reset-password-confirm')}
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setConfirmError('');
            }}
            error={confirmError}
            required
            autoComplete="new-password"
            isRTL={isAr}
            rightIcon={renderVisibilityToggle()}
          />
        </form>
      )}
    </Modal>
  );
}

ResetTraineePasswordModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  trainee: PropTypes.object,
  domain: PropTypes.string,
  t: PropTypes.func.isRequired,
  currentLanguage: PropTypes.string,
};
