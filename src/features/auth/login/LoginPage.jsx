import React from 'react';
import { motion } from 'framer-motion';
import { Spinner } from '../../../shared/ui';
import LoginShowcase from './LoginShowcase';
import LoginAuthPanel from './LoginAuthPanel';
import LoginSignupPanel from './LoginSignupPanel';
import { useLoginAuth } from './useLoginAuth';
import { pageVariants, useLoginMotion } from './login.motion';
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
    openForgot,
    closePanels,
    t,
  } = useLoginAuth();

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
          onOpenSignup={openSignup}
          onOpenForgot={openForgot}
          onForgotBack={closePanels}
        />
      </motion.div>

      <LoginSignupPanel
        isOpen={showSignup}
        onClose={closePanels}
        t={t}
        isRTL={isRTL}
        loading={loading}
        error={error}
        success={success}
        onSubmit={handleSignup}
      />
    </main>
  );
}
