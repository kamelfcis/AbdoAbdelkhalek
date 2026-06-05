import React, { useState } from 'react';
import { Button, Input, Alert } from '../../../shared/ui';
import { authService } from '../../../services/authService';

export default function ForgotPasswordPanel({ t, isRTL, onBack, savedEmail = '' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.target);
    const email = formData.get('email');

    try {
      await authService.requestPasswordReset(email.trim().toLowerCase());
      setSuccess(t('forgot.success'));
    } catch (err) {
      setError(t('forgot.error'));
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-forgot-panel">
      <h2 id="forgot-heading" className="login-auth-panel__title">
        {t('forgot.title')}
      </h2>
      <p className="login-auth-panel__subtitle">{t('forgot.subtitle')}</p>

      <form onSubmit={handleSubmit} aria-labelledby="forgot-heading">
        <Input
          label={<span className="login-input-label">{t('forgot.email-label')}</span>}
          type="email"
          id="forgot-email"
          name="email"
          required
          isRTL={isRTL}
          defaultValue={savedEmail}
          leftIcon={<i className="fas fa-envelope" aria-hidden="true" />}
          placeholder={t('email-placeholder')}
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
          className="login-auth-panel__btn-accent mt-4"
        >
          {loading ? t('forgot.sending') : t('forgot.submit')}
        </Button>
      </form>

      <div className="login-forgot-panel__back">
        <button type="button" className="login-auth-panel__link" onClick={onBack}>
          {t('forgot.back-to-login')}
        </button>
      </div>
    </div>
  );
}
