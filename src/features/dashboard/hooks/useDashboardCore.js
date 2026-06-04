import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { useDashboardDomain } from '../domain/DomainContext';
import { getEntityRegistry } from '../config/entityRegistry';
import { showConfirm } from '../../../shared/lib/notifications';
import { prefetchDashboardData, prefetchDashboardSection } from '../../../shared/lib/prefetchDashboard';
import { getDashboardTranslation } from '../../../shared/i18n/dashboard';
import {
  buildDashboardPath,
  isValidSection,
  DEFAULT_SECTION,
} from '../config/dashboardRoutes';

export function useDashboardCore() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: userData, logout } = useAuth();
  const { adminDomain } = useDashboardDomain();
  const { section: sectionParam } = useParams();
  const registry = getEntityRegistry(adminDomain);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const currentSection = useMemo(() => {
    if (sectionParam && isValidSection(adminDomain, sectionParam)) {
      return sectionParam;
    }
    return DEFAULT_SECTION;
  }, [sectionParam, adminDomain]);

  useEffect(() => {
    if (sectionParam && !isValidSection(adminDomain, sectionParam)) {
      navigate(buildDashboardPath(adminDomain, DEFAULT_SECTION), { replace: true });
    }
  }, [sectionParam, adminDomain, navigate]);

  const t = useCallback(
    (key) => getDashboardTranslation(adminDomain, currentLanguage, key),
    [currentLanguage, adminDomain]
  );

  const updateDirection = useCallback((lang) => {
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
      document.body.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
      document.body.classList.remove('rtl');
    }
  }, []);

  useEffect(() => {
    if (!userData?.is_coach) return;
    prefetchDashboardData(adminDomain);
    import(/* webpackChunkName: "dashboard" */ '../DashboardPage');
    const savedLang = localStorage.getItem('websiteLanguage') || 'en';
    setCurrentLanguage(savedLang);
    updateDirection(savedLang);
  }, [userData, updateDirection, adminDomain]);

  useEffect(() => {
    if (!userData?.is_coach) return;
    prefetchDashboardSection(currentSection);
  }, [userData, currentSection]);

  const setCurrentSection = useCallback(
    (key) => {
      const section = isValidSection(adminDomain, key) ? key : DEFAULT_SECTION;
      navigate(buildDashboardPath(adminDomain, section));
    },
    [adminDomain, navigate]
  );

  const handleLogout = async () => {
    if (logoutLoading) return;
    const confirmed = await showConfirm(
      t('confirm-logout-title'),
      t('confirm-logout-body'),
      t('confirm-logout-yes'),
      t('confirm-logout-cancel')
    );
    if (confirmed) {
      setLogoutLoading(true);
      try {
        await logout();
      } finally {
        queryClient.clear();
        navigate('/');
      }
    }
  };

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'ar' : 'en';
    setCurrentLanguage(newLang);
    localStorage.setItem('websiteLanguage', newLang);
    updateDirection(newLang);
  };

  const isRTL = currentLanguage === 'ar';
  const isTrainee = userData && !userData.is_coach;

  const coachNavItems = useMemo(
    () =>
      registry.navItems.map((item) => ({
        key: item.key,
        icon: item.icon,
        iconClassName: item.iconClassName,
        label: t(item.labelKey),
      })),
    [currentLanguage, registry.navItems, t]
  );

  const getPageTitle = () => t(`page-${currentSection}`) || t('dashboard-title');

  return {
    navigate,
    queryClient,
    userData,
    adminDomain,
    registry,
    currentLanguage,
    currentSection,
    setCurrentSection,
    sidebarOpen,
    setSidebarOpen,
    logoutLoading,
    handleLogout,
    toggleLanguage,
    isRTL,
    isTrainee,
    coachNavItems,
    t,
    getPageTitle,
  };
}
