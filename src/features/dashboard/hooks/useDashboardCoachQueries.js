import { useMemo } from 'react';
import { useDashboardStats, useRecentActivities } from '../../../shared/hooks/useDashboardStats';
import { useDashboardCategoriesAll } from '../../../shared/hooks/useDashboardCategoriesAll';
import { useDashboardPackages } from '../../../shared/hooks/useDashboardPackages';

const SECTION_QUERIES = {
  overview: ['stats', 'recentActivities'],
  categories: ['categories'],
  videos: ['categoriesAll'],
  packages: ['packages'],
  trainees: ['stats', 'packages'],
  subscriptions: ['subscriptions', 'packages'],
  'success-stories': [],
  faqs: [],
  reviews: [],
};

function sectionNeeds(section, key) {
  const keys = SECTION_QUERIES[section] || [];
  return keys.includes(key);
}

export function useDashboardCoachQueries(adminDomain, currentSection, currentLanguage, userData) {
  const coach = Boolean(userData?.is_coach);
  const authBase = { enabled: coach, domain: adminDomain };

  const { data: stats = {}, isLoading: statsLoading } = useDashboardStats({
    ...authBase,
    enabled: coach && sectionNeeds(currentSection, 'stats'),
  });

  const { data: categories = [], isLoading: categoriesLoading } = useDashboardCategoriesAll({
    ...authBase,
    enabled: coach && sectionNeeds(currentSection, 'categoriesAll'),
  });

  const { data: packages = [], isLoading: packagesLoading } = useDashboardPackages({
    ...authBase,
    enabled: coach && sectionNeeds(currentSection, 'packages'),
  });

  const { data: recentActivities = [], isLoading: recentActivitiesLoading } = useRecentActivities(
    currentLanguage,
    {
      ...authBase,
      enabled: coach && sectionNeeds(currentSection, 'recentActivities'),
      domain: adminDomain,
    }
  );

  const loading = useMemo(() => {
    switch (currentSection) {
      case 'overview':
        return statsLoading || recentActivitiesLoading;
      case 'videos':
        return categoriesLoading;
      default:
        return false;
    }
  }, [
    currentSection,
    statsLoading,
    recentActivitiesLoading,
    categoriesLoading,
  ]);

  return {
    stats,
    statsLoading,
    categories,
    categoriesLoading,
    packages,
    packagesLoading,
    recentActivities,
    recentActivitiesLoading,
    loading,
  };
}
