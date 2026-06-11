import React, { Suspense, lazy, useEffect } from 'react';

import { DashboardShell } from '../../shared/layout';

import { useDashboardCoach } from './context/DashboardCoachContext';

import { CoachDashboardModals } from './CoachDashboardModals';

import { DomainSwitcher } from './components/DomainSwitcher';



const SectionLoader = () => (

  <div className="flex items-center justify-center py-12" role="status">

    <div className="rounded-full h-8 w-8 border-2 border-gray-200 border-t-[var(--color-primary)] animate-spin" />

  </div>

);



const OverviewSection = lazy(() =>

  import(/* webpackChunkName: "dash-overview" */ './sections/OverviewSection').then((m) => ({

    default: m.OverviewSection,

  }))

);

const CategoriesSection = lazy(() =>

  import(/* webpackChunkName: "dash-categories" */ './sections/CategoriesSection').then((m) => ({

    default: m.CategoriesSection,

  }))

);

const VideosSection = lazy(() =>

  import(/* webpackChunkName: "dash-videos" */ './sections/VideosSection').then((m) => ({

    default: m.VideosSection,

  }))

);

const SubscriptionsSection = lazy(() =>

  import(/* webpackChunkName: "dash-subscriptions" */ './sections/SubscriptionsSection').then((m) => ({

    default: m.SubscriptionsSection,

  }))

);

const PackagesSection = lazy(() =>

  import(/* webpackChunkName: "dash-packages" */ './sections/PackagesSection').then((m) => ({

    default: m.PackagesSection,

  }))

);

const TraineesSection = lazy(() =>

  import(/* webpackChunkName: "dash-trainees" */ './sections/TraineesSection').then((m) => ({

    default: m.TraineesSection,

  }))

);

const SuccessStoriesSection = lazy(() =>

  import(/* webpackChunkName: "dash-stories" */ './sections/SuccessStoriesSection').then((m) => ({

    default: m.SuccessStoriesSection,

  }))

);

const FaqsSection = lazy(() =>

  import(/* webpackChunkName: "dash-faqs" */ './sections/FaqsSection').then((m) => ({

    default: m.FaqsSection,

  }))

);

const ReviewsSection = lazy(() =>

  import(/* webpackChunkName: "dash-reviews" */ './sections/ReviewsSection').then((m) => ({

    default: m.ReviewsSection,

  }))

);

const LandingSettingsSection = lazy(() =>
  import(/* webpackChunkName: "dash-landing-settings" */ './sections/LandingSettingsSection').then((m) => ({
    default: m.LandingSettingsSection,
  }))
);

const SECTION_COMPONENTS = {

  overview: OverviewSection,

  categories: CategoriesSection,

  videos: VideosSection,

  subscriptions: SubscriptionsSection,

  packages: PackagesSection,

  trainees: TraineesSection,

  'success-stories': SuccessStoriesSection,

  faqs: FaqsSection,

  reviews: ReviewsSection,

  'landing-settings': LandingSettingsSection,

};



function isSectionAvailable(section, _adminDomain, registry) {

  if (!SECTION_COMPONENTS[section]) return false;

  if (section === 'trainees' && !registry?.hasTrainees) return false;

  if (section === 'subscriptions' && !registry?.hasSubscriptions) return false;

  return true;

}



function LazySection({ children }) {

  return <Suspense fallback={<SectionLoader />}>{children}</Suspense>;

}



export function CoachDashboardView() {

  const c = useDashboardCoach();

  const isSquashDash = c.adminDomain === 'squash';

  const ActiveSection = isSectionAvailable(c.currentSection, c.adminDomain, c.registry)

    ? SECTION_COMPONENTS[c.currentSection]

    : null;



  useEffect(() => {

    if (!isSquashDash) return undefined;

    import('../squash/styles/squash-premium.css');

    return undefined;

  }, [isSquashDash]);



  const sidebarTitle =

    c.registry?.titleEn && c.currentLanguage === 'en'

      ? c.registry.titleEn

      : c.registry?.titleAr || c.t('dashboard-title');



  return (

    <>

      <DashboardShell

        squashDashboard={isSquashDash}

        isRTL={c.isRTL}

        sidebarOpen={c.sidebarOpen}

        onSidebarToggle={() => c.setSidebarOpen(!c.sidebarOpen)}

        onSidebarClose={() => c.setSidebarOpen(false)}

        sidebarTitle={sidebarTitle}

        sidebarSubtitle={c.t('welcome-text')}

        sidebarExtra={

          <DomainSwitcher isRTL={c.isRTL} currentLanguage={c.currentLanguage} t={c.t} />

        }

        navItems={c.coachNavItems}

        currentSection={c.currentSection}

        onNavigate={c.setCurrentSection}

        onLogout={c.handleLogout}

        logoutLoading={c.logoutLoading}

        logoutLabel={c.t('logout-text')}

        loggingOutLabel={c.t('logging-out')}

        onToggleLanguage={c.toggleLanguage}

        languageToggleLabel={c.t('lang-toggle')}

        pageTitle={c.getPageTitle()}

        userDisplayName={c.userData?.full_name || c.userData?.email || 'Coach'}

      >

        {ActiveSection && (

          <LazySection>

            <ActiveSection />

          </LazySection>

        )}

      </DashboardShell>

      <CoachDashboardModals />

    </>

  );

}

