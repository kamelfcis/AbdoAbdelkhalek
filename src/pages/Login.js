import React, { useState, useEffect } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

import { authService } from '../services/authService';

import { Button, Input, Alert, Modal, Spinner, Card } from '../shared/ui';
import { useThemeOptional } from '../contexts/ThemeContext';
import { prefetchDashboardData } from '../shared/lib/prefetchDashboard';
import { getDefaultDashboardPath } from '../features/dashboard/config/dashboardRoutes';
import { parseSignupDomain, traineeHomePath } from '../shared/lib/authRoutes';



const TRAINEE_WELCOME_MESSAGE =

  'Welcome back! Browse categories and videos on the home page.';

const TRAINEE_WELCOME_MESSAGE_AR =

  'مرحباً بعودتك! تصفح التصنيفات والفيديوهات من الصفحة الرئيسية.';



const Login = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signupDomain = parseSignupDomain(searchParams.get('domain'));

  const { login, isCoach, isAuthenticated, isLoading } = useAuth();
  const theme = useThemeOptional();

  const [currentLanguage, setCurrentLanguage] = useState('en');

  const [showSignup, setShowSignup] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState('');



  const translations = {

    en: {

      'login-title': 'Welcome Back',

      'login-subtitle': 'Sign in to your account',

      'email-label': 'Email Address',

      'password-label': 'Password',

      'login-btn-text': 'Sign In',

      'no-account-text': "Don't have an account?",

      'show-signup': 'Sign up',

      'back-home-text': 'Back to Home',

      'signup-title': 'Create Account',

      'fullname-label': 'Full Name',

      'signup-email-label': 'Email Address',

      'signup-password-label': 'Password',

      'phone-label': 'Phone Number',

      'signup-btn-text': 'Create Account',

      'error-text': 'Invalid email or password',

      'success-text': 'Login successful! Redirecting...',

      'signing-in': 'Signing in...',

      'creating-account': 'Creating Account...',

      'account-created': 'Account created successfully! Please check your email for verification.',

    },

    ar: {

      'login-title': 'مرحباً بعودتك',

      'login-subtitle': 'سجل دخولك إلى حسابك',

      'email-label': 'البريد الإلكتروني',

      'password-label': 'كلمة المرور',

      'login-btn-text': 'تسجيل الدخول',

      'no-account-text': 'ليس لديك حساب؟',

      'show-signup': 'إنشاء حساب',

      'back-home-text': 'العودة للرئيسية',

      'signup-title': 'إنشاء حساب جديد',

      'fullname-label': 'الاسم الكامل',

      'signup-email-label': 'البريد الإلكتروني',

      'signup-password-label': 'كلمة المرور',

      'phone-label': 'رقم الهاتف',

      'signup-btn-text': 'إنشاء الحساب',

      'error-text': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',

      'success-text': 'تم تسجيل الدخول بنجاح! جاري التوجيه...',

      'signing-in': 'جاري تسجيل الدخول...',

      'creating-account': 'جاري إنشاء الحساب...',

      'account-created': 'تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني للتفعيل.',

    }

  };



  const t = (key) => translations[currentLanguage][key] || key;



  const updateDirection = (lang) => {

    if (lang === 'ar') {

      document.documentElement.dir = 'rtl';

      document.documentElement.lang = 'ar';

      document.body.classList.add('rtl');

    } else {

      document.documentElement.dir = 'ltr';

      document.documentElement.lang = 'en';

      document.body.classList.remove('rtl');

    }

  };



  useEffect(() => {

    if (isLoading || !isAuthenticated) return;



    if (isCoach) {

      navigate(getDefaultDashboardPath(), { replace: true });

    } else {

      navigate(traineeHomePath(signupDomain), {

        replace: true,

        state: {

          authMessage: TRAINEE_WELCOME_MESSAGE,

          authMessageAr: TRAINEE_WELCOME_MESSAGE_AR,

        },

      });

    }

  }, [isLoading, isAuthenticated, isCoach, navigate, signupDomain]);



  useEffect(() => {

    const savedLang = localStorage.getItem('websiteLanguage') || 'en';

    setCurrentLanguage(savedLang);

    updateDirection(savedLang);

  }, []);



  const handleLogin = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError('');

    setSuccess('');



    const formData = new FormData(e.target);

    const email = formData.get('email');

    const password = formData.get('password');



    try {

      const { profile } = await login({

        email: email.trim().toLowerCase(),

        password,

      });



      setSuccess(t('success-text'));

      setLoading(false);

      if (profile?.is_coach) {
        prefetchDashboardData('fitness');
      }

      setTimeout(() => {

        if (profile?.is_coach) {

          navigate(getDefaultDashboardPath());

        } else {

          navigate(traineeHomePath(signupDomain), {

            state: {

              authMessage: TRAINEE_WELCOME_MESSAGE,

              authMessageAr: TRAINEE_WELCOME_MESSAGE_AR,

            },

          });

        }

      }, 1500);

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



    try {

      await authService.signUp({

        email,

        password,

        options: {

          data: {

            full_name: fullName,

            phone: phone,

            is_coach: false,

            registered_from: signupDomain || undefined,

          }

        }

      });



      setSuccess(t('account-created'));

      setShowSignup(false);

      e.target.reset();

    } catch (err) {

      console.error('Signup error:', err);

      setError(currentLanguage === 'en'

        ? 'Error creating account: ' + err.message

        : 'خطأ في إنشاء الحساب: ' + err.message);

    } finally {

      setLoading(false);

    }

  };



  const toggleLanguage = () => {

    const newLang = currentLanguage === 'en' ? 'ar' : 'en';

    setCurrentLanguage(newLang);

    localStorage.setItem('websiteLanguage', newLang);

    updateDirection(newLang);

  };



  const isRTL = currentLanguage === 'ar';



  if (isLoading) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">

        <Spinner size="lg" />

      </div>

    );

  }



  return (

    <div

      className="font-['Rajdhani',_sans-serif] min-h-screen flex items-center justify-center relative overflow-hidden"

      style={{ background: 'var(--gradient-hero)' }}

    >

      {['dumbbell', 'futbol', 'running', 'trophy', 'medal', 'heartbeat'].map((icon, idx) => (

        <div

          key={idx}

          className="floating-element absolute opacity-10 text-white text-2xl animate-float"

          style={{

            top: `${10 + idx * 15}%`,

            [isRTL ? 'right' : 'left']: `${5 + idx * 15}%`,

            animationDelay: `${idx}s`,

          }}

        >

          <i className={`fas fa-${icon}`} aria-hidden="true" />

        </div>

      ))}



      <Card variant="glass" className="w-full max-w-md mx-4 relative z-10 !rounded-3xl !p-8">

        <div className="text-center mb-8">

          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border-2 border-white/20">

            <img src="/logo.png" alt="Logo" className="w-20 h-20 rounded-full object-cover" />

          </div>

          <h1

            className="text-4xl font-bold text-white mb-3"

            style={{ fontFamily: 'var(--font-display)', textShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}

          >

            {t('login-title')}

          </h1>

          <p className="text-gray-200 text-lg">{t('login-subtitle')}</p>

          <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-green-400 mx-auto mt-4 rounded-full" />

        </div>



        <form id="login-form" onSubmit={handleLogin} className="space-y-5">

          <Input

            label={<span className="text-white font-semibold text-lg">{t('email-label')}</span>}

            type="email"

            id="email"

            name="email"

            required

            isRTL={isRTL}

            leftIcon={<i className="fas fa-envelope" aria-hidden="true" />}

            placeholder={currentLanguage === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}

            inputClassName="!bg-white/90 backdrop-blur-sm !border-2 !border-[var(--color-accent)]/20 !text-gray-800"

          />



          <Input

            label={<span className="text-white font-semibold text-lg">{t('password-label')}</span>}

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

                className="hover:text-[var(--color-primary-dark)] transition-colors"

                aria-label={showPassword ? 'Hide password' : 'Show password'}

              >

                <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`} aria-hidden="true" />

              </button>

            }

            placeholder={currentLanguage === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}

            inputClassName="!bg-white/90 backdrop-blur-sm !border-2 !border-[var(--color-accent)]/20 !text-gray-800"

          />



          {error && <Alert variant="error">{error}</Alert>}

          {success && <Alert variant="success">{success}</Alert>}



          <Button

            type="submit"

            variant="gradient"

            size="lg"

            fullWidth

            loading={loading}

            disabled={loading}

          >

            {loading ? t('signing-in') : t('login-btn-text')}

          </Button>

        </form>



        <div className="my-8 flex items-center">

          <div className="flex-1 border-t border-white/30" />

          <span className="px-6 text-white text-sm font-semibold">

            {currentLanguage === 'ar' ? 'أو' : 'or'}

          </span>

          <div className="flex-1 border-t border-white/30" />

        </div>



        <div className="text-center">

          <p className="text-gray-200 text-lg">

            {t('no-account-text')}{' '}

            <button

              type="button"

              onClick={() => setShowSignup(true)}

              className="text-blue-400 font-bold hover:text-blue-300 transition-colors hover:underline"

            >

              {t('show-signup')}

            </button>

          </p>

        </div>



        <div className="text-center mt-6">

          <Button

            variant="ghost"

            onClick={() => navigate('/')}

            className="!text-gray-300 hover:!text-white !bg-transparent"

            leftIcon={

              <i className={`fas fa-arrow-${isRTL ? 'right' : 'left'} text-blue-400`} aria-hidden="true" />

            }

          >

            {t('back-home-text')}

          </Button>

        </div>



        <div className="text-center mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          {theme?.toggleMode && (
            <button
              type="button"
              onClick={theme.toggleMode}
              className="bg-white/10 backdrop-blur-sm p-3 rounded-full shadow-lg flex items-center justify-center hover:bg-white/20 transition-all border border-white/20"
              aria-label={theme.isDark ? 'Light mode' : 'Dark mode'}
            >
              <i className={`fas ${theme.isDark ? 'fa-sun' : 'fa-moon'} text-xl text-blue-400`} aria-hidden="true" />
            </button>
          )}

          <button
            type="button"
            onClick={toggleLanguage}
            className="bg-white/10 backdrop-blur-sm p-3 rounded-full shadow-lg flex items-center justify-center hover:bg-white/20 transition-all border border-white/20"
          >
            <i className="fas fa-language text-xl text-blue-400" aria-hidden="true" />
            <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-sm font-bold text-white`}>
              {currentLanguage === 'en' ? 'العربية' : 'English'}
            </span>
          </button>
        </div>

      </Card>



      <Modal

        isOpen={showSignup}

        onClose={() => setShowSignup(false)}

        title={

          <span style={{ fontFamily: 'var(--font-display)' }} className="text-white">

            {t('signup-title')}

          </span>

        }

        size="md"

        className="!bg-transparent !shadow-none border-0"

        contentClassName="!p-0"

      >

        <Card variant="glass" className="!rounded-3xl">

          <form id="signup-form" onSubmit={handleSignup} className="space-y-4">

            <Input

              label={<span className="text-white font-semibold">{t('fullname-label')}</span>}

              type="text"

              id="signup-fullname"

              name="fullname"

              required

              isRTL={isRTL}

              leftIcon={<i className="fas fa-user" aria-hidden="true" />}

              inputClassName="!bg-white/90 !text-gray-800"

            />

            <Input

              label={<span className="text-white font-semibold">{t('signup-email-label')}</span>}

              type="email"

              id="signup-email"

              name="email"

              required

              isRTL={isRTL}

              leftIcon={<i className="fas fa-envelope" aria-hidden="true" />}

              inputClassName="!bg-white/90 !text-gray-800"

            />

            <Input

              label={<span className="text-white font-semibold">{t('signup-password-label')}</span>}

              type="password"

              id="signup-password"

              name="password"

              required

              isRTL={isRTL}

              leftIcon={<i className="fas fa-lock" aria-hidden="true" />}

              inputClassName="!bg-white/90 !text-gray-800"

            />

            <Input

              label={<span className="text-white font-semibold">{t('phone-label')}</span>}

              type="tel"

              id="signup-phone"

              name="phone"

              isRTL={isRTL}

              leftIcon={<i className="fas fa-phone" aria-hidden="true" />}

              inputClassName="!bg-white/90 !text-gray-800"

            />



            {error && <Alert variant="error">{error}</Alert>}

            {success && <Alert variant="success">{success}</Alert>}



            <Button type="submit" variant="gradient" size="lg" fullWidth loading={loading} disabled={loading}>

              {loading ? t('creating-account') : t('signup-btn-text')}

            </Button>

          </form>

        </Card>

      </Modal>

    </div>

  );

};



export default Login;

