import { useMemo, useState, useEffect } from 'react';
import { useDashboardStats, useRecentActivities } from '../../../shared/hooks/useDashboardStats';
import { useDashboardCategoriesAll } from '../../../shared/hooks/useDashboardCategoriesAll';
import { useDashboardPackages } from '../../../shared/hooks/useDashboardPackages';
import { usePaginatedDashboardList } from '../../../shared/hooks/usePaginatedDashboardList';

const SECTION_QUERIES = {
  overview: ['stats', 'recentActivities'],
  categories: ['categories'],
  videos: ['categoriesAll'],
  packages: ['packages'],
  trainees: ['trainees', 'packages'],
  subscriptions: ['subscriptions', 'packages'],
  'success-stories': [],
  faqs: [],
  reviews: [],
};

const TRAINEES_PAGE_SIZE = 10;

function sectionNeeds(section, key) {
  const keys = SECTION_QUERIES[section] || [];
  return keys.includes(key);
}

export function useDashboardCoachQueries(adminDomain, currentSection, currentLanguage, userData) {
  const coach = Boolean(userData?.is_coach);
  const authBase = { enabled: coach, domain: adminDomain };

  const [traineePage, setTraineePage] = useState(1);

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

  const traineesQ = usePaginatedDashboardList({
    entity: 'trainees',
    domain: adminDomain,
    page: traineePage,
    limit: TRAINEES_PAGE_SIZE,
    enabled: coach && sectionNeeds(currentSection, 'trainees'),
  });

  useEffect(() => {
    if (traineePage > traineesQ.pageCount) setTraineePage(traineesQ.pageCount);
  }, [traineePage, traineesQ.pageCount]);

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
      case 'trainees':
        return traineesQ.isLoading;
      default:
        return false;
    }
  }, [
    currentSection,
    statsLoading,
    recentActivitiesLoading,
    categoriesLoading,
    traineesQ.isLoading,
  ]);

  return {
    stats,
    statsLoading,
    categories,
    categoriesLoading,
    packages,
    packagesLoading,
    trainees: traineesQ.items,
    traineesTotal: traineesQ.total,
    traineePage,
    setTraineePage,
    traineePageCount: traineesQ.pageCount,
    traineesPageSize: TRAINEES_PAGE_SIZE,
    traineesLoading: traineesQ.isLoading,
    traineesFetching: traineesQ.isFetching,
    recentActivities,
    recentActivitiesLoading,
    loading,
  };
}
