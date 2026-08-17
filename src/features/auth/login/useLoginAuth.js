import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { authService } from '../../../services/authService';
import { prefetchDashboardData } from '../../../shared/lib/prefetchDashboard';
import { getDefaultDashboardPath } from '../../../features/dashboard/config/dashboardRoutes';
import { parseSignupDomain, resolvePostLoginPath } from '../../../shared/lib/authRoutes';
import { getLoginTranslation } from '../../../shared/i18n';

const REMEMBER_EMAIL_KEY = 'loginRememberEmail';

export function useLoginAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const signupDomain = parseSignupDomain(searchParams.get('domain'));
  const nextParam = searchParams.get('next');
  const { currentLanguage } = useLanguage();
  const { login, isCoach, isAuthenticated, isLoading } = useAuth();

  const t = useCallback((key) => getLoginTranslation(currentLanguage, key), [currentLanguage]);
  const isRTL = currentLanguage === 'ar';

  const resolveDestination = useCallback(
    (coach) =>
      resolvePostLoginPath({
        signupDomain,
        nextParam,
        fromLocation: location.state?.from,
        isCoach: coach,
        coachDashboardPath: getDefaultDashboardPath(),
      }),
    [signupDomain, nextParam, location.state]
  );

  const [showSignup, setShowSignup] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [savedEmail, setSavedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (stored) {
      setSavedEmail(stored);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (location.state?.logoutSuccess) {
      setSuccess(t('logout-success'));
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search
      );
    }
  }, [location.state, t]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    const destination = resolveDestination(isCoach);
    if (isCoach) {
      navigate(destination, { replace: true });
      return;
    }

    navigate(destination, {
      replace: true,
      state: {
        authMessage: t('trainee-welcome'),
        authMessageAr: getLoginTranslation('ar', 'trainee-welcome'),
      },
    });
  }, [isLoading, isAuthenticated, isCoach, navigate, resolveDestination, t]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim().toLowerCase());
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      const { profile } = await login({
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
      });

      setSuccess(t('success-text'));
      setLoading(false);

      const destination = resolveDestination(Boolean(profile?.is_coach));
      if (profile?.is_coach) {
        prefetchDashboardData('fitness');
        navigate(destination);
      } else {
        navigate(destination, {
          state: {
            authMessage: t('trainee-welcome'),
            authMessageAr: getLoginTranslation('ar', 'trainee-welcome'),
          },
        });
      }
    } catch (authError) {
      const msg = authError.message || '';
      if (msg.includes('Invalid') || msg.includes('credentials')) {
        setError(t('error-text'));
      } else {
        setError(t('error-text') + (msg ? ': ' + msg : ''));
      }
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.target);
    const fullName = formData.get('fullname');
    const email = formData.get('email');
    const password = formData.get('password');
    const phone = formData.get('phone');
    const normalizedEmail = email.trim().toLowerCase();

    try {
      await authService.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            is_coach: false,
            registered_from: signupDomain || undefined,
          },
        },
      });

      setShowSignup(false);
      e.target.reset();

      try {
        await login({
          email: normalizedEmail,
          password,
          rememberMe: false,
        });

        setSuccess(t('account-created'));
        setLoading(false);

        navigate(resolveDestination(false), {
          state: {
            authMessage: t('trainee-welcome'),
            authMessageAr: getLoginTranslation('ar', 'trainee-welcome'),
          },
        });
      } catch (loginError) {
        console.error('Auto-login after signup failed:', loginError);
        setError(t('signup-created-login-failed'));
        setLoading(false);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(t('signup.error') + (err.message ? ': ' + err.message : ''));
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
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

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  const openSignup = useCallback(() => {
    clearMessages();
    setShowForgot(false);
    setShowSignup(true);
  }, [clearMessages]);

  const openLogin = useCallback(() => {
    clearMessages();
    setShowSignup(false);
    setShowForgot(false);
  }, [clearMessages]);

  const openForgot = useCallback(() => {
    clearMessages();
    setShowSignup(false);
    setShowForgot(true);
  }, [clearMessages]);

  const closePanels = useCallback(() => {
    setShowSignup(false);
    setShowForgot(false);
    clearMessages();
  }, [clearMessages]);

  return {
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
    clearMessages,
    handleLogin,
    handleSignup,
    handleForgotPassword,
    openSignup,
    openLogin,
    openForgot,
    closePanels,
    navigate,
    t,
  };
}
