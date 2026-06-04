import React from 'react';
import { DashboardShell } from '../../shared/layout';
import { VideoPreviewModal } from './components/VideoPreviewModal';
import OptimizedImage from '../fitness/sections/OptimizedImage';
import { useDashboardCoach } from './context/DashboardCoachContext';

export function TraineeDashboardView() {
  const c = useDashboardCoach();
  const traineePageTitle = c.traineeCurrentSection === 'favorites'
    ? (c.currentLanguage === 'ar' ? 'مفضلاتي' : 'My Favorites')
    : (c.currentLanguage === 'ar' ? 'فيديوهاتي' : 'My Videos');

  return (
    <>

    </>
  );
}
