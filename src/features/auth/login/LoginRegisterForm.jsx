import React from 'react';
import { motion } from 'framer-motion';
import { Button, Input, Alert } from '../../../shared/ui';
import { fadeUpVariants, useLoginMotion } from './login.motion';

export default function LoginRegisterForm({
  t,
  isRTL,
  loading,
  error,
  success,
  onSubmit,
  onBackToLogin,
}) {
  const motionOpts = useLoginMotion();

  return (
    <motion.div
      className="login-register-form"
      variants={fadeUpVariants}
      initial={motionOpts.initial}
      animate={motionOpts.animate}
    >
      <h1 id="signup-heading" className="login-auth-panel__title">
        {t('signup-title')}
      </h1>
      <p className="login-auth-panel__subtitle">{t('signup-subtitle')}</p>

      <form id="signup-form" onSubmit={onSubmit} aria-labelledby="signup-heading">
        <Input
          label={<span className="login-input-label">{t('fullname-label')}</span>}
          type="text"
          id="signup-fullname"
          name="fullname"
          required
          isRTL={isRTL}
          leftIcon={<i className="fas fa-user" aria-hidden="true" />}
          placeholder={t('fullname-placeholder')}
        />
        <Input
          label={<span className="login-input-label">{t('signup-email-label')}</span>}
          type="email"
          id="signup-email"
          name="email"
          required
          isRTL={isRTL}
          leftIcon={<i className="fas fa-envelope" aria-hidden="true" />}
          placeholder={t('email-placeholder')}
        />
        <Input
          label={<span className="login-input-label">{t('signup-password-label')}</span>}
          type="password"
          id="signup-password"
          name="password"
          required
          minLength={6}
          isRTL={isRTL}
          leftIcon={<i className="fas fa-lock" aria-hidden="true" />}
          placeholder={t('password-placeholder')}
        />
        <Input
          label={<span className="login-input-label">{t('phone-label')}</span>}
          type="tel"
          id="signup-phone"
          name="phone"
          isRTL={isRTL}
          leftIcon={<i className="fas fa-phone" aria-hidden="true" />}
          placeholder={t('phone-placeholder')}
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
      </form>

      <p className="login-register-form__back text-center text-sm mt-4">
        {t('have-account-text')}{' '}
        <button type="button" className="login-auth-panel__link" onClick={onBackToLogin}>
          {t('forgot.back-to-login')}
        </button>
      </p>
    </motion.div>
  );
}
