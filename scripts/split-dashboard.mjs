import fs from 'fs';
import path from 'path';

const root = path.resolve('src/pages/Dashboard.js');
const src = fs.readFileSync(root, 'utf8');
const lines = src.split(/\r?\n/);

const wrapSection = (name, start, end) => {
  let body = lines.slice(start, end + 1).join('\n');
  body = body.replace(/^\s*\{currentSection === '[^']+' && \(\s*\n/, '');
  body = body.replace(/\n\s*\)\}\s*$/, '');
  return `import React from 'react';
import { useDashboardCoach } from '../context/DashboardCoachContext';

export function ${name}() {
  const ctx = useDashboardCoach();
  return (
${body}
  );
}
`;
};

const sections = [
  ['OverviewSection', 1228, 1488],
  ['CategoriesSection', 1489, 1602],
  ['VideosSection', 1603, 1807],
  ['SubscriptionsSection', 1808, 1923],
  ['PackagesSection', 1924, 2086],
  ['TraineesSection', 2087, 2164],
  ['SuccessStoriesSection', 2165, 2328],
  ['FaqsSection', 2329, 2422],
  ['ReviewsSection', 2423, 2547],
];

const outDir = 'src/features/dashboard/sections';
for (const [name, start, end] of sections) {
  fs.writeFileSync(path.join(outDir, `${name}.jsx`), wrapSection(name, start, end));
}

// Trainee view body
let traineeBody = lines.slice(878, 1203).join('\n');
traineeBody = traineeBody.replace(/^    return \(\s*\n      <>\s*\n/, '');
traineeBody = traineeBody.replace(/\n      <\/>\s*\n    \);\s*$/, '');

fs.writeFileSync(
  'src/features/dashboard/TraineeDashboardView.jsx',
  `import React from 'react';
import { DashboardShell } from '../../shared/layout';
import { VideoPreviewModal } from './components/VideoPreviewModal';
import { useDashboardCoach } from './context/DashboardCoachContext';

export function TraineeDashboardView() {
  const ctx = useDashboardCoach();
  const {
    isRTL, sidebarOpen, setSidebarOpen, currentLanguage, userData, traineeNavItems,
    traineeCurrentSection, setTraineeCurrentSection, handleLogout, logoutLoading, t,
    toggleLanguage, navigate, traineePageTitle, filtersExpanded, setFiltersExpanded,
    traineeVideoSearch, setTraineeVideoSearch, traineeVideoCategoryFilter, setTraineeVideoCategoryFilter,
    traineeVideoCategories, traineeVideosLoading, traineeVideosError, debouncedTraineeVideoSearch,
    traineeCurrentSection: section, paginatedTraineeVideos, paginatedFavoriteVideos,
    toggleFavorite, isFavorite, handlePreviewVideo, totalTraineeVideosPages, totalFavoriteVideosPages,
    traineeVideosPage, setTraineeVideosPage, favoriteVideosPage, setFavoriteVideosPage,
    showVideoModal, previewVideo, closeVideoPreview, previewVideoUrl, previewVideoLoading, previewVideoError,
  } = ctx;

  const traineePageTitle = traineeCurrentSection === 'favorites'
    ? (currentLanguage === 'ar' ? 'مفضلاتي' : 'My Favorites')
    : (currentLanguage === 'ar' ? 'فيديوهاتي' : 'My Videos');

  return (
    <>
${traineeBody}
    </>
  );
}
`
);

console.log('Section files written');
