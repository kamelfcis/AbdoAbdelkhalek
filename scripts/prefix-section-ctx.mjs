import fs from 'fs';
import path from 'path';

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
  'resolveSuccessStoryImage','handlePreviewVideo','closeVideoPreview','t','getTimeAgo','handleLogout','toggleLanguage',
  'getPageTitle','isRTL','coachNavItems','traineeNavItems','viewAllLabel',
  'handleDeleteCategory','handleDeleteVideo','handleManageSubscription','handleDeleteSubscription',
  'handleConvertToSubscription','handleToggleReviewVisibility','handleDeletePackage','handleDeleteStory','handleDeleteFaq','handleDeleteReview',
  'VIDEOS_PER_PAGE','OptimizedImage','cdnUrl','contentService',
].sort((a, b) => b.length - a.length);

const imports = `import React from 'react';
import { useDashboardCoach } from '../context/DashboardCoachContext';
import { SectionHeader } from '../../../shared/layout';
import { StatCard, Button, Input, Select, Table, Badge, EmptyState, Modal } from '../../../shared/ui';
import { StatsCardGrid, TableSkeleton, CardGridSkeleton, ListSkeleton } from '../../fitness/components/Skeletons';
import OptimizedImage from '../../fitness/sections/OptimizedImage';
import { cdnUrl } from '../../../shared/lib/cdn';
`;

const dir = 'src/features/dashboard/sections';
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.jsx') || file === 'index.jsx') continue;
  let body = fs.readFileSync(path.join(dir, file), 'utf8');
  const match = body.match(/return \(\s*([\s\S]*)\s*\);\s*\}/);
  if (!match) continue;
  let inner = match[1];
  for (const key of keys) {
    inner = inner.replace(new RegExp(`(?<![.\\w])${key}(?![\\w])`, 'g'), `c.${key}`);
  }
  const name = file.replace('.jsx', '');
  const out = `${imports}
export function ${name}() {
  const c = useDashboardCoach();
  return (
${inner}
  );
}
`;
  fs.writeFileSync(path.join(dir, file), out);
}
console.log('Prefixed section ctx');
