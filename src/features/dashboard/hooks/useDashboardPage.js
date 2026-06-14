import { useDashboardCore } from './useDashboardCore';
// Orchestrator composes domain-specific hooks (Phase 6 Milestone F).
import { useDashboardCoachQueries } from './useDashboardCoachQueries';
import { useDashboardVideoTools } from './useDashboardVideoTools';
import { useDashboardSubscriptionTools } from './useDashboardSubscriptionTools';
import { useDashboardTraineeTools } from './useDashboardTraineeTools';
import { useDashboardTraineeExperience } from './useDashboardTraineeExperience';
import { useDashboardAccessModals } from './useDashboardAccessModals';

/** Composes dashboard state for coach + trainee views (< 300 lines). */
export function useDashboardPage() {
  const core = useDashboardCore();
  const queries = useDashboardCoachQueries(
    core.adminDomain,
    core.currentSection,
    core.currentLanguage,
    core.userData
  );
  const video = useDashboardVideoTools({
    adminDomain: core.adminDomain,
    queryClient: core.queryClient,
    currentLanguage: core.currentLanguage,
    categories: queries.categories,
    enabled: Boolean(core.userData?.is_coach) && core.currentSection === 'videos',
  });
  const subscriptions = useDashboardSubscriptionTools({
    adminDomain: core.adminDomain,
    packages: queries.packages,
    enabled: Boolean(core.userData?.is_coach) && core.currentSection === 'subscriptions',
  });
  const traineeTools = useDashboardTraineeTools({
    adminDomain: core.adminDomain,
    packages: queries.packages,
    enabled: Boolean(core.userData?.is_coach) && core.currentSection === 'trainees',
  });
  const trainee = useDashboardTraineeExperience(
    core.userData,
    core.currentLanguage,
    core.adminDomain,
    core.currentSection,
    core.setCurrentSection
  );
  const access = useDashboardAccessModals({
    adminDomain: core.adminDomain,
    queryClient: core.queryClient,
    currentLanguage: core.currentLanguage,
    packages: queries.packages,
    setCurrentSection: core.setCurrentSection,
  });

  return {
    ...core,
    ...queries,
    ...video,
    ...subscriptions,
    ...traineeTools,
    ...trainee,
    ...access,
    loading: core.isTrainee ? trainee.traineeVideosLoading : queries.loading,
  };
}
