import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input, Alert } from '../../../shared/ui';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getLoginTranslation } from '../../../shared/i18n';
import { authService } from '../../../services/authService';
import { fadeUpVariants, useLoginMotion } from './login.motion';
import './login-page.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { currentLanguage } = useLanguage();
  const isRTL = currentLanguage === 'ar';
  const t = (key) => getLoginTranslation(currentLanguage, key);
  const motionOpts = useLoginMotion();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!token) {
    return (
      <main data-login-page className="login-reset-page" role="main">
        <div className="login-reset-page__card">
          <Alert variant="error" role="alert">
            {t('reset.token-invalid')}
          </Alert>
          <Button
            className="login-auth-panel__btn-accent mt-4"
            fullWidth
            onClick={() => navigate('/login')}
          >
            {t('forgot.back-to-login')}
          </Button>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.target);
    const password = formData.get('password');
    const confirm = formData.get('confirm');

    if (password.length < 8) {
      setError(t('validation.password-min-length'));
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setError(t('validation.password-mismatch'));
      setLoading(false);
      return;
    }

    try {
      await authService.resetPassword(token, password);
      setSuccess(t('reset.success'));
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(t('reset.token-invalid'));
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main data-login-page className="login-reset-page" role="main">
      <motion.div
        className="login-reset-page__card"
        variants={fadeUpVariants}
        initial={motionOpts.initial}
        animate={motionOpts.animate}
      >
        <h1 className="login-auth-panel__title">{t('reset.title')}</h1>
        <p className="login-auth-panel__subtitle">{t('reset.subtitle')}</p>

        <form onSubmit={handleSubmit} aria-labelledby="reset-heading">
          <div className="space-y-4">
            <Input
              label={<span className="login-input-label">{t('reset.new-password-label')}</span>}
              type={showPassword ? 'text' : 'password'}
              id="reset-password"
              name="password"
              required
              minLength={8}
              isRTL={isRTL}
              leftIcon={<i className="fas fa-lock" aria-hidden="true" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('a11y.hide-password') : t('a11y.show-password')}
                  aria-pressed={showPassword}
                >
                  <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`} aria-hidden="true" />
                </button>
              }
            />
            <Input
              label={<span className="login-input-label">{t('reset.confirm-password-label')}</span>}
              type={showPassword ? 'text' : 'password'}
              id="reset-confirm"
              name="confirm"
              required
              minLength={8}
              isRTL={isRTL}
              leftIcon={<i className="fas fa-lock" aria-hidden="true" />}
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
              {loading ? t('reset.submitting') : t('reset.submit')}
            </Button>
          </div>
        </form>
      </motion.div>
    </main>
  );
}
