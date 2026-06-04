import React from 'react';
import { DashboardCoachProvider, useDashboardCoach } from './context/DashboardCoachContext';
import { DashboardDomainProvider } from './domain/DomainContext';
import { CoachDashboardView } from './CoachDashboardView';
import { TraineeDashboardView } from './TraineeDashboardView';

function DashboardInner() {
  const c = useDashboardCoach();

  if (c.loading && !c.userData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="loading-spinner w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (c.isTrainee) {
    return <TraineeDashboardView />;
  }

  return <CoachDashboardView />;
}

export default function DashboardPage() {
  return (
    <DashboardDomainProvider>
      <DashboardCoachProvider>
        <DashboardInner />
      </DashboardCoachProvider>
    </DashboardDomainProvider>
  );
}
