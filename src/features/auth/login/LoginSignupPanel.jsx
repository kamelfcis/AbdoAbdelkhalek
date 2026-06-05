import React from 'react';
import { Button, Input, Alert, Modal } from '../../../shared/ui';

export default function LoginSignupPanel({
  isOpen,
  onClose,
  t,
  isRTL,
  loading,
  error,
  success,
  onSubmit,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={null}
      size="md"
      className="!bg-transparent !shadow-none border-0"
      contentClassName="!p-0"
    >
      <div className="login-signup-panel">
        <h2 className="login-signup-panel__title">{t('signup-title')}</h2>

        <form id="signup-form" onSubmit={onSubmit} aria-labelledby="signup-heading">
          <div className="space-y-4">
            <Input
              label={<span className="login-input-label">{t('fullname-label')}</span>}
              type="text"
              id="signup-fullname"
              name="fullname"
              required
              isRTL={isRTL}
              leftIcon={<i className="fas fa-user" aria-hidden="true" />}
            />
            <Input
              label={<span className="login-input-label">{t('signup-email-label')}</span>}
              type="email"
              id="signup-email"
              name="email"
              required
              isRTL={isRTL}
              leftIcon={<i className="fas fa-envelope" aria-hidden="true" />}
            />
            <Input
              label={<span className="login-input-label">{t('signup-password-label')}</span>}
              type="password"
              id="signup-password"
              name="password"
              required
              isRTL={isRTL}
              leftIcon={<i className="fas fa-lock" aria-hidden="true" />}
            />
            <Input
              label={<span className="login-input-label">{t('phone-label')}</span>}
              type="tel"
              id="signup-phone"
              name="phone"
              isRTL={isRTL}
              leftIcon={<i className="fas fa-phone" aria-hidden="true" />}
            />

            {error && (
              <Alert variant="error" role="alert" aria-live="polite">
                {error}
              </Alert>
            )}
            {success && (
              <Alert variant="success" role="alert" aria-live="polite">
                {success}
              </Alert>
            )}

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
              className="login-auth-panel__btn-accent"
            >
              {loading ? t('creating-account') : t('signup-btn-text')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
