import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input, Alert } from '../../../shared/ui';
import { useThemeOptional } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import ForgotPasswordPanel from './ForgotPasswordPanel';
import { slideFromEndVariants, useLoginMotion } from './login.motion';

export default function LoginAuthPanel({
  t,
  isRTL,
  showForgot,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  savedEmail,
  loading,
  error,
  success,
  onLogin,
  onOpenSignup,
  onOpenForgot,
  onForgotBack,
}) {
  const navigate = useNavigate();
  const theme = useThemeOptional();
  const { toggleLanguage } = useLanguage();
  const motionOpts = useLoginMotion();

  return (
    <motion.aside
      className="login-auth-panel"
      variants={slideFromEndVariants(isRTL)}
      initial={motionOpts.initial}
      animate={motionOpts.animate}
    >
      <div className="login-auth-panel__inner">
        <img src="/logo.png" alt="" className="login-auth-panel__logo" />

        {showForgot ? (
          <ForgotPasswordPanel t={t} isRTL={isRTL} onBack={onForgotBack} savedEmail={savedEmail} />
        ) : (
          <>
            <h1 id="login-heading" className="login-auth-panel__title">
              {t('login-title')}
            </h1>
            <p className="login-auth-panel__subtitle">{t('login-subtitle')}</p>

            <form id="login-form" onSubmit={onLogin} aria-labelledby="login-heading">
              <Input
                label={<span className="login-input-label">{t('email-label')}</span>}
                type="email"
                id="email"
                name="email"
                required
                isRTL={isRTL}
                defaultValue={savedEmail}
                leftIcon={<i className="fas fa-envelope" aria-hidden="true" />}
                placeholder={t('email-placeholder')}
              />

              <Input
                label={<span className="login-input-label">{t('password-label')}</span>}
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                required
                isRTL={isRTL}
                leftIcon={<i className="fas fa-lock" aria-hidden="true" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:opacity-80 transition-opacity"
                    aria-label={showPassword ? t('a11y.hide-password') : t('a11y.show-password')}
                    aria-pressed={showPassword}
                  >
                    <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`} aria-hidden="true" />
                  </button>
                }
                placeholder={t('password-placeholder')}
              />

              <div className="login-auth-panel__row">
                <label className="login-auth-panel__remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    aria-label={t('a11y.remember-me')}
                  />
                  {t('remember-me')}
                </label>
                <button type="button" className="login-auth-panel__link" onClick={onOpenForgot}>
                  {t('forgot-password')}
                </button>
              </div>

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
                {loading ? t('signing-in') : t('login-btn-text')}
              </Button>
            </form>

            <div className="login-auth-panel__divider">{t('divider-or')}</div>

            <p className="text-center text-sm" style={{ color: 'var(--login-text-muted)' }}>
              {t('no-account-text')}{' '}
              <button type="button" className="login-auth-panel__link" onClick={onOpenSignup}>
                {t('show-signup')}
              </button>
            </p>

            <div className="text-center mt-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="!text-[var(--login-text-muted)] hover:!text-[var(--login-text)] !bg-transparent"
                leftIcon={
                  <i
                    className={`fas fa-arrow-${isRTL ? 'right' : 'left'}`}
                    style={{ color: 'var(--login-accent)' }}
                    aria-hidden="true"
                  />
                }
              >
                {t('back-home-text')}
              </Button>
            </div>
          </>
        )}

        <div className="login-auth-panel__toggles">
          {theme?.toggleMode && (
            <button
              type="button"
              onClick={theme.toggleMode}
              className="login-auth-panel__toggle"
              aria-label={t('a11y.theme-toggle')}
            >
              <i className={`fas ${theme.isDark ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={toggleLanguage}
            className="login-auth-panel__toggle"
            aria-label={t('a11y.language-toggle')}
          >
            <i className="fas fa-language" aria-hidden="true" />
            <span className="text-sm font-bold">{t('toggle-language')}</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
