import fs from 'fs';

const lines = fs.readFileSync('src/pages/Dashboard.js', 'utf8').split(/\r?\n/);
let inner = lines.slice(879, 1202).join('\n'); // DashboardShell ... VideoPreviewModal

const keys = [
  'navigate','queryClient','userData','logout','currentLanguage','setCurrentLanguage',
  'sidebarOpen','setSidebarOpen','logoutLoading','setLogoutLoading','traineeNavItems',
  'traineeCurrentSection','setTraineeCurrentSection','handleLogout','toggleLanguage','navigate','t','isRTL',
  'filtersExpanded','setFiltersExpanded','traineeVideoSearch','setTraineeVideoSearch',
  'traineeVideoCategoryFilter','setTraineeVideoCategoryFilter','traineeVideoCategories',
  'traineeVideosLoading','traineeVideosError','debouncedTraineeVideoSearch',
  'paginatedTraineeVideos','paginatedFavoriteVideos','toggleFavorite','isFavorite','handlePreviewVideo',
  'totalTraineeVideosPages','totalFavoriteVideosPages','traineeVideosPage','setTraineeVideosPage',
  'favoriteVideosPage','setFavoriteVideosPage','showVideoModal','previewVideo','closeVideoPreview',
  'previewVideoUrl','previewVideoLoading','previewVideoError','videosPerPage','OptimizedImage',
].sort((a, b) => b.length - a.length);

for (const key of keys) {
  inner = inner.replace(new RegExp(`(?<![.\\w])${key}(?![\\w])`, 'g'), `c.${key}`);
}

const out = `import React from 'react';
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
${inner}
    </>
  );
}
`;

fs.writeFileSync('src/features/dashboard/TraineeDashboardView.jsx', out);
console.log('Trainee view written');
