import React from 'react';
import { motion } from 'framer-motion';
import { Spinner } from '../../../shared/ui';
import LoginShowcase from './LoginShowcase';
import LoginAuthPanel from './LoginAuthPanel';
import { useLoginAuth } from './useLoginAuth';
import { pageVariants, useLoginMotion } from './login.motion';
import { fitnessPortalImage } from '../../fitness/assets/unsplashImages';
import { squashPortalImage } from '../../squash/assets/unsplashImages';
import './login-page.css';

export default function LoginPage() {
  const motionOpts = useLoginMotion();

  const {
    signupDomain,
    isLoading,
    isRTL,
    showSignup,
    showForgot,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    savedEmail,
    loading,
    error,
    success,
    handleLogin,
    handleSignup,
    openSignup,
    openLogin,
    openForgot,
    closePanels,
    t,
  } = useLoginAuth();

  const heroImage = signupDomain === 'squash' ? squashPortalImage : fitnessPortalImage;

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--login-bg, #050816)' }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <main
      data-login-page
      data-login-domain={signupDomain || undefined}
      role="main"
      style={{ '--login-hero-image': 'url(' + heroImage + ')' }}
    >
      <motion.div
        className="login-page__grid"
        variants={pageVariants}
        initial={motionOpts.initial}
        animate={motionOpts.animate}
      >
        <LoginShowcase domain={signupDomain} t={t} />
        <LoginAuthPanel
          t={t}
          isRTL={isRTL}
          showSignup={showSignup}
          showForgot={showForgot}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          rememberMe={rememberMe}
          setRememberMe={setRememberMe}
          savedEmail={savedEmail}
          loading={loading}
          error={error}
          success={success}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onOpenSignup={openSignup}
          onOpenForgot={openForgot}
          onBackToLogin={openLogin}
          onForgotBack={closePanels}
        />
      </motion.div>
    </main>
  );
}
