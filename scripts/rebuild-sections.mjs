import fs from 'fs';
import path from 'path';

const lines = fs.readFileSync('src/features/dashboard/DashboardPage.full.js', 'utf8').split(/\r?\n/);

const keys = [
  'navigate','queryClient','userData','logout','searchParams','setSearchParams',
  'currentLanguage','setCurrentLanguage','currentSection','setCurrentSection',
  'sidebarOpen','setSidebarOpen','logoutLoading','setLogoutLoading',
  'stats','statsLoading','categories','categoriesLoading','videos','videosLoading',
  'packages','packagesLoading','trainees','traineesLoading','subscriptions','subscriptionsLoading',
  'successStories','successStoriesLoading','faqs','faqsLoading','reviews','reviewsLoading',
  'recentActivities','recentActivitiesLoading','isTrainee','traineeVideos','traineeVideosLoading',
  'traineeVideosError','loading','showCategoryForm','setShowCategoryForm','showVideoForm','setShowVideoForm',
  'showPackageForm','setShowPackageForm','showStoryForm','setShowStoryForm','showFaqForm','setShowFaqForm',
  'showReviewForm','setShowReviewForm','editingCategoryId','setEditingCategoryId','editingVideoId','setEditingVideoId',
  'editingPackageId','setEditingPackageId','editingStoryId','setEditingStoryId','editingFaqId','setEditingFaqId',
  'editingReviewId','setEditingReviewId','showTraineeAccessModal','setShowTraineeAccessModal','activeTrainee','setActiveTrainee',
  'showVideoAccessModal','setShowVideoAccessModal','activeVideo','setActiveVideo',
  'showConvertToSubscriptionModal','setShowConvertToSubscriptionModal','traineeForConversion','setTraineeForConversion',
  'reviewStatusFilter','setReviewStatusFilter','reviewSearch','setReviewSearch','storySearch','setStorySearch',
  'storyStatusFilter','setStoryStatusFilter','storyFeaturedFilter','setStoryFeaturedFilter','packageSearch','setPackageSearch',
  'videoSearch','setVideoSearch','videoCategoryFilter','setVideoCategoryFilter','videoStatusFilter','setVideoStatusFilter',
  'videoPage','setVideoPage','previewVideo','previewVideoUrl','previewVideoLoading','previewVideoError','showVideoModal',
  'categorySearch','setCategorySearch','categoryStatusFilter','setCategoryStatusFilter','traineeVideoSearch','setTraineeVideoSearch',
  'debouncedTraineeVideoSearch','traineeVideoCategoryFilter','setTraineeVideoCategoryFilter','traineeCurrentSection','setTraineeCurrentSection',
  'filtersExpanded','setFiltersExpanded','traineeVideosPage','setTraineeVideosPage','favoriteVideosPage','setFavoriteVideosPage',
  'favoriteVideoIds','toggleFavorite','isFavorite','filteredTraineeVideos','traineeVideoCategories','paginatedTraineeVideos',
  'paginatedFavoriteVideos','totalTraineeVideosPages','totalFavoriteVideosPages','categoryMap',
  'editingCategory','editingVideo','editingPackage','editingStory','editingFaq','editingReview',
  'formatDateTime','formatDurationSeconds','filteredReviews','filteredSuccessStories','filteredPackages','filteredCategories',
  'getCategoryLabel','filteredVideos','totalVideoPages','paginatedVideos','videoStartIndex','videoEndIndex',
  'resolveSuccessStoryImage','handlePreviewVideo','closeVideoPreview','getTimeAgo','handleLogout','toggleLanguage',
  'getPageTitle','coachNavItems','traineeNavItems','viewAllLabel',
  'handleDeleteCategory','handleDeleteVideo','handleManageSubscription','handleDeleteSubscription',
  'handleConvertToSubscription','handleToggleReviewVisibility','handleDeletePackage','handleDeleteStory','handleDeleteFaq','handleDeleteReview',
  'VIDEOS_PER_PAGE','resolveVideoAsset','fetchVideoAssetUrl','contentService','cdnUrl',
].sort((a, b) => b.length - a.length);

const SKIP = new Set([
  'OptimizedImage','React','Fragment','SectionHeader','StatCard','Button','Input','Select','Table',
  'Badge','EmptyState','Modal','StatsCardGrid','TableSkeleton','CardGridSkeleton','ListSkeleton',
  'loading','priority','className','type','value','key','icon','color','footer','variant','size',
]);

const imports = `import React from 'react';
import { useDashboardCoach } from '../context/DashboardCoachContext';
import { SectionHeader } from '../../../shared/layout';
import { StatCard, Button, Input, Select, Table, Badge, EmptyState, Modal } from '../../../shared/ui';
import { StatsCardGrid, TableSkeleton, CardGridSkeleton, ListSkeleton } from '../../fitness/components/Skeletons';
import OptimizedImage from '../../fitness/sections/OptimizedImage';
import { cdnUrl } from '../../../shared/lib/cdn';
`;

function wrapSection(name, start, end) {
  let body = lines.slice(start, end + 1).join('\n');
  body = body.replace(/^\s*\{currentSection === '[^']+' && \(\s*\n/, '');
  body = body.replace(/\n\s*\)\}\s*$/, '');
  for (const key of keys) {
    if (SKIP.has(key)) continue;
    body = body.replace(new RegExp(`(?<![.\\w"'])${key}(?![\\w])`, 'g'), (match, offset, str) => {
      const before = str[offset - 1];
      if (before === "'" || before === '"') return match;
      return `c.${match}`;
    });
  }
  body = body.replace(/\bc\.isRTL=\{/g, 'isRTL={');
  body = body.replace(/\{c\.isRTL\}/g, '{c.isRTL}');
  body = body.replace(/<c\.OptimizedImage/g, '<OptimizedImage');
  body = body.replace(/\bc\.loading="/g, 'loading="');
  body = body.replace(/Search c\.categories/g, 'Search categories');
  body = body.replace(/c\.t\('total-c\./g, "c.t('total-");
  body = body.replace(/setCurrentSection\('c\./g, "setCurrentSection('");
  return `${imports}
export function ${name}() {
  const c = useDashboardCoach();
  return (
${body}
  );
}
`;
}

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

const dir = 'src/features/dashboard/sections';
for (const [name, start, end] of sections) {
  fs.writeFileSync(path.join(dir, `${name}.jsx`), wrapSection(name, start, end));
}
console.log('Rebuilt sections');
