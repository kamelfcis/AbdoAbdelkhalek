import fs from 'fs';

const lines = fs.readFileSync('src/pages/Dashboard.js', 'utf8').split(/\r?\n/);

const imports = `import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { contentService } from '../../shared/api/contentService';
import { uploadService } from '../../shared/api/uploadService';
import { CDN_BASE, cdnUrl } from '../../shared/lib/cdn';
import { showSuccess, showError, showConfirm } from '../../shared/lib/notifications';
import { getTranslation } from '../../utils/translations';
import { useDebounceValue } from '../../shared/lib/debounce';
import { useDashboardStats, useRecentActivities } from '../../shared/hooks/useDashboardStats';
import { useDashboardCategories } from '../../shared/hooks/useDashboardCategories';
import { useDashboardVideos } from '../../shared/hooks/useDashboardVideos';
import { useDashboardPackages } from '../../shared/hooks/useDashboardPackages';
import { useTrainees } from '../../shared/hooks/useTrainees';
import { useSubscriptions } from '../../shared/hooks/useSubscriptions';
import { useDashboardSuccessStories } from '../../shared/hooks/useDashboardSuccessStories';
import { useDashboardFAQs } from '../../shared/hooks/useDashboardFAQs';
import { useDashboardReviews } from '../../shared/hooks/useDashboardReviews';
import { useTraineeVideos } from '../../shared/hooks/useTraineeVideos';
import { invalidateContentCrud, invalidateAccessCrud, invalidateDashboardSession } from '../../shared/lib/queryKeys';
import { dashboardTranslations } from '../utils/dashboardTranslations';
import { createCoachHandlers } from '../utils/coachHandlers';
`;

// Body: lines 42-863 (index 41-862) + handlers 2738-2930 (index 2737-2929)
const bodyStart = 41;
const bodyMid = 862;
const handlersStart = 2737;
const handlersEnd = 2929;

let body = lines.slice(bodyStart, bodyMid + 1).join('\n');
const handlers = lines.slice(handlersStart, handlersEnd + 1).join('\n');

// Replace inline translations with dashboardTranslations import usage
body = body.replace(/const translations = \{[\s\S]*?\};\s*\n\s*const t = \(key\) => translations\[currentLanguage\]\[key\] \|\| key;/,
  'const t = (key) => dashboardTranslations[currentLanguage][key] || key;');

const hook = `${imports}
export function useDashboardPage() {
${body}

${handlers}

  return {
    navigate, queryClient, userData, logout, searchParams, setSearchParams,
    currentLanguage, setCurrentLanguage, currentSection, setCurrentSection,
    sidebarOpen, setSidebarOpen, logoutLoading, setLogoutLoading,
    stats, statsLoading, categories, categoriesLoading, videos, videosLoading,
    packages, packagesLoading, trainees, traineesLoading, subscriptions, subscriptionsLoading,
    successStories, successStoriesLoading, faqs, faqsLoading, reviews, reviewsLoading,
    recentActivities, recentActivitiesLoading, isTrainee, traineeVideos, traineeVideosLoading,
    traineeVideosError, loading, showCategoryForm, setShowCategoryForm, showVideoForm, setShowVideoForm,
    showPackageForm, setShowPackageForm, showStoryForm, setShowStoryForm, showFaqForm, setShowFaqForm,
    showReviewForm, setShowReviewForm, editingCategoryId, setEditingCategoryId, editingVideoId, setEditingVideoId,
    editingPackageId, setEditingPackageId, editingStoryId, setEditingStoryId, editingFaqId, setEditingFaqId,
    editingReviewId, setEditingReviewId, showTraineeAccessModal, setShowTraineeAccessModal, activeTrainee, setActiveTrainee,
    showVideoAccessModal, setShowVideoAccessModal, activeVideo, setActiveVideo,
    showConvertToSubscriptionModal, setShowConvertToSubscriptionModal, traineeForConversion, setTraineeForConversion,
    reviewStatusFilter, setReviewStatusFilter, reviewSearch, setReviewSearch, storySearch, setStorySearch,
    storyStatusFilter, setStoryStatusFilter, storyFeaturedFilter, setStoryFeaturedFilter, packageSearch, setPackageSearch,
    videoSearch, setVideoSearch, videoCategoryFilter, setVideoCategoryFilter, videoStatusFilter, setVideoStatusFilter,
    videoPage, setVideoPage, previewVideo, previewVideoUrl, previewVideoLoading, previewVideoError, showVideoModal,
    categorySearch, setCategorySearch, categoryStatusFilter, setCategoryStatusFilter, traineeVideoSearch, setTraineeVideoSearch,
    debouncedTraineeVideoSearch, traineeVideoCategoryFilter, setTraineeVideoCategoryFilter, traineeCurrentSection, setTraineeCurrentSection,
    filtersExpanded, setFiltersExpanded, traineeVideosPage, setTraineeVideosPage, favoriteVideosPage, setFavoriteVideosPage,
    favoriteVideoIds, toggleFavorite, isFavorite, filteredTraineeVideos, traineeVideoCategories, paginatedTraineeVideos,
    paginatedFavoriteVideos, totalTraineeVideosPages, totalFavoriteVideosPages, categoryMap,
    editingCategory, editingVideo, editingPackage, editingStory, editingFaq, editingReview,
    formatDateTime, formatDurationSeconds, filteredReviews, filteredSuccessStories, filteredPackages, filteredCategories,
    getCategoryLabel, filteredVideos, totalVideoPages, paginatedVideos, videoStartIndex, videoEndIndex,
    resolveSuccessStoryImage, handlePreviewVideo, closeVideoPreview, t, getTimeAgo, handleLogout, toggleLanguage,
    getPageTitle, isRTL, coachNavItems, traineeNavItems, viewAllLabel,
    handleDeleteCategory, handleDeleteVideo, handleManageSubscription, handleDeleteSubscription,
    handleConvertToSubscription, handleToggleReviewVisibility, handleDeletePackage, handleDeleteStory, handleDeleteFaq, handleDeleteReview,
  };
}
`;

fs.writeFileSync('src/features/dashboard/hooks/useDashboardPage.js', hook);
console.log('Wrote useDashboardPage.js', hook.length);
