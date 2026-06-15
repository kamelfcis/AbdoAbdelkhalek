import { useState, useEffect, useMemo, useCallback } from 'react';
import { uploadService } from '../../../shared/api/uploadService';
import { getSharedContentMediaBuckets, resolveDomainMediaUrl } from '../../../shared/lib/mediaBuckets';
import { getContentService } from '../../../shared/lib/getContentService';
import { showSuccess, showError, showConfirm } from '../../../shared/lib/notifications';
import { invalidateContentCrud, removePaginatedListItem, queryKeys } from '../../../shared/lib/queryKeys';
import { getDashboardTranslation } from '../../../shared/i18n/dashboard';
import { useDebounceValue } from '../../../shared/lib/debounce';
import { prefetchImageUrls } from '../../../shared/lib/prefetchImages';
import { prefetchVideoUrl, warmVideoUrl } from '../../../shared/lib/prefetchVideo';
import {
  usePaginatedDashboardList,
  filtersFromCrudState,
} from '../../../shared/hooks/usePaginatedDashboardList';
import { getVideoThumbSrc } from '../crud/entityImageUtils';
import { useVideoThumbBatch } from './useVideoThumbBatch';
import { VIDEOS_PAGE_SIZE } from '../constants/pagination';

export function useDashboardVideoTools({
  adminDomain,
  queryClient,
  currentLanguage,
  categories = [],
  enabled = true,
}) {
  const contentService = getContentService(adminDomain);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [showVideoAccessModal, setShowVideoAccessModal] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [videoSearch, setVideoSearch] = useState('');
  const [videoCategoryFilter, setVideoCategoryFilter] = useState('all');
  const [videoStatusFilter, setVideoStatusFilter] = useState('all');
  const [videoPage, setVideoPage] = useState(1);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');
  const [previewVideoLoading, setPreviewVideoLoading] = useState(false);
  const [previewVideoError, setPreviewVideoError] = useState('');

  const isAr = currentLanguage === 'ar';
  const debouncedVideoSearch = useDebounceValue(videoSearch, 300);

  const videoFilters = useMemo(
    () =>
      filtersFromCrudState({
        search: debouncedVideoSearch,
        statusFilter: videoStatusFilter,
        categoryId: videoCategoryFilter,
      }),
    [debouncedVideoSearch, videoStatusFilter, videoCategoryFilter]
  );

  const setVideoSearchAndResetPage = useCallback((value) => {
    setVideoSearch(value);
    setVideoPage(1);
  }, []);

  const setVideoCategoryFilterAndResetPage = useCallback((value) => {
    setVideoCategoryFilter(value);
    setVideoPage(1);
  }, []);

  const setVideoStatusFilterAndResetPage = useCallback((value) => {
    setVideoStatusFilter(value);
    setVideoPage(1);
  }, []);

  const {
    items: paginatedVideos,
    total: videoTotal,
    pageCount: totalVideoPages,
    isLoading: videosLoading,
    isFetching: videosFetching,
    queryKey: videosListQueryKey,
  } = usePaginatedDashboardList({
    entity: 'videos',
    domain: adminDomain,
    page: videoPage,
    limit: VIDEOS_PAGE_SIZE,
    filters: videoFilters,
    enabled: enabled,
  });

  useEffect(() => {
    setVideoPage(1);
  }, [debouncedVideoSearch, videoStatusFilter, videoCategoryFilter]);

  useEffect(() => {
    setVideoSearch('');
    setVideoCategoryFilter('all');
    setVideoStatusFilter('all');
    setVideoPage(1);
  }, [adminDomain]);

  useEffect(() => {
    if (!videosLoading && videoTotal > 0 && videoPage > totalVideoPages) {
      setVideoPage(totalVideoPages);
    }
  }, [videoPage, totalVideoPages, videosLoading, videoTotal]);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => {
      if (category?.id) map.set(category.id, category);
    });
    return map;
  }, [categories]);

  const editingVideo = useMemo(
    () => (editingVideoId ? paginatedVideos.find((item) => item.id === editingVideoId) || null : null),
    [editingVideoId, paginatedVideos]
  );

  const videoStartIndex = videoTotal ? (videoPage - 1) * VIDEOS_PAGE_SIZE + 1 : 0;
  const videoEndIndex = videoTotal
    ? Math.min(videoPage * VIDEOS_PAGE_SIZE, videoTotal)
    : 0;

  const getCategoryLabel = (categoryId) => {
    if (!categoryId) return isAr ? 'غير محدد' : 'N/A';
    const category = categoryMap.get(categoryId);
    if (!category) return isAr ? 'غير محدد' : 'N/A';
    return isAr ? category.name_ar || category.name_en : category.name_en || category.name_ar;
  };

  const formatDurationSeconds = useCallback(
    (seconds) => {
      if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) {
        return isAr ? 'غير متاح' : 'N/A';
      }
      const totalSeconds = Math.max(0, Math.floor(Number(seconds)));
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    [isAr]
  );

  const sanitizeStorageValue = (value) => {
    if (typeof value !== 'string') return null;
    return value.trim().replace(/^['"]|['"]$/g, '') || null;
  };

  const isAbsoluteUrl = (value) => typeof value === 'string' && /^https?:\/\//i.test(value);

  const resolveVideoThumb = useCallback(
    (video, thumbVariant = 'card') => getVideoThumbSrc(video, adminDomain, thumbVariant),
    [adminDomain]
  );

  const resolveVideoAsset = useCallback(
    (video, type, thumbVariant = 'card') => {
      if (!video) return null;
      if (type === 'thumbnail') {
        return resolveVideoThumb(video, thumbVariant).src;
      }
      const urlKey = `${type}_url`;
      const pathKey = `${type}_path`;
      const kind = 'videos';
      const storedUrl = sanitizeStorageValue(video[urlKey]);
      const storedPath = sanitizeStorageValue(video[pathKey]);
      if (storedUrl && storedUrl !== 'pending') {
        if (isAbsoluteUrl(storedUrl)) return storedUrl;
        return resolveDomainMediaUrl(storedUrl, null, adminDomain, kind) || storedUrl;
      }
      if (!storedPath) return null;
      if (isAbsoluteUrl(storedPath)) return storedPath;
      return resolveDomainMediaUrl(null, storedPath, adminDomain, kind);
    },
    [adminDomain, resolveVideoThumb]
  );

  const { isThumbBatchReady: videoThumbsReady } = useVideoThumbBatch({
    videos: paginatedVideos,
    resolveThumbPair: (video) => resolveVideoThumb(video, 'card'),
    enabled: enabled && !videosLoading,
  });

  useEffect(() => {
    if (!enabled || videoPage >= totalVideoPages) return;

    const nextPage = videoPage + 1;
    const nextKey = queryKeys.dashboard.videos(adminDomain, {
      page: nextPage,
      limit: VIDEOS_PAGE_SIZE,
      ...videoFilters,
    });
    const nextData = queryClient.getQueryData(nextKey);
    const nextItems = nextData?.items;
    if (!nextItems?.length) return;

    const thumbUrls = nextItems.flatMap((video) => {
      const card = getVideoThumbSrc(video, adminDomain, 'card');
      const table = getVideoThumbSrc(video, adminDomain, 'table');
      return [card.src, card.fallbackSrc, table.src, table.fallbackSrc];
    });
    void prefetchImageUrls(thumbUrls.filter(Boolean));
  }, [
    enabled,
    adminDomain,
    videoPage,
    totalVideoPages,
    videoFilters,
    queryClient,
  ]);

  // URL resolution is fully synchronous (stored url/path + public bucket URL) —
  // no network round-trip is needed before playback can start.
  const fetchVideoAssetUrl = useCallback(
    (video, type) => {
      const resolved = resolveVideoAsset(video, type);
      if (resolved) return resolved;
      if (!video) return null;
      const pathKey = `${type}_path`;
      const kind = type === 'thumbnail' ? 'videoThumbnails' : 'videos';
      const storedPath = sanitizeStorageValue(video[pathKey]);
      if (!storedPath) return null;
      const bucket = getSharedContentMediaBuckets(adminDomain, kind)[kind];
      const { data: publicData } = uploadService.getPublicUrl(bucket, storedPath);
      return publicData?.publicUrl || resolveDomainMediaUrl(null, storedPath, adminDomain, kind);
    },
    [adminDomain, resolveVideoAsset]
  );

  /** CDN warmup for a card's video (hover/focus = debounced, pointerdown = immediate). */
  const warmPreviewVideo = useCallback(
    (video, immediate = false) => {
      try {
        const url = fetchVideoAssetUrl(video, 'video');
        if (!url) return;
        if (immediate) warmVideoUrl(url);
        else prefetchVideoUrl(url);
      } catch {
        // warmup is best-effort
      }
    },
    [fetchVideoAssetUrl]
  );

  const handlePreviewVideo = (video) => {
    if (!video) return;
    setPreviewVideo(video);
    setPreviewVideoError('');
    setPreviewVideoLoading(false);
    setShowVideoModal(true);
    let url = null;
    try {
      url = fetchVideoAssetUrl(video, 'video');
    } catch {
      setPreviewVideoUrl('');
      setPreviewVideoError(
        getDashboardTranslation(adminDomain, currentLanguage, 'video-preview-error-generic')
      );
      return;
    }
    if (url) {
      setPreviewVideoUrl(url);
    } else {
      setPreviewVideoUrl('');
      setPreviewVideoError(
        getDashboardTranslation(adminDomain, currentLanguage, 'video-preview-error-load')
      );
    }
  };

  const closeVideoPreview = useCallback(() => {
    setPreviewVideo(null);
    setPreviewVideoUrl('');
    setPreviewVideoError('');
    setPreviewVideoLoading(false);
    setShowVideoModal(false);
  }, []);

  const handleDeleteVideo = async (id) => {
    const confirmed = await showConfirm(
      getDashboardTranslation(adminDomain, currentLanguage, 'confirm-delete-video-title'),
      getDashboardTranslation(adminDomain, currentLanguage, 'confirm-delete-video-body'),
      getDashboardTranslation(adminDomain, currentLanguage, 'confirm-delete-video-yes'),
      getDashboardTranslation(adminDomain, currentLanguage, 'btn-cancel')
    );
    if (confirmed) {
      let previousData;
      if (videosListQueryKey) {
        previousData = queryClient.getQueryData(videosListQueryKey);
        removePaginatedListItem(queryClient, videosListQueryKey, id);
      }
      try {
        await contentService.deleteVideo(id);
        showSuccess(getDashboardTranslation(adminDomain, currentLanguage, 'video-deleted'));
        void invalidateContentCrud(queryClient, 'videos', adminDomain, { deferSecondary: true });
      } catch (error) {
        if (videosListQueryKey && previousData !== undefined) {
          queryClient.setQueryData(videosListQueryKey, previousData);
        }
        showError(error.message || 'Error deleting video');
      }
    }
  };

  return {
    showVideoForm,
    setShowVideoForm,
    editingVideoId,
    setEditingVideoId,
    editingVideo,
    showVideoAccessModal,
    setShowVideoAccessModal,
    activeVideo,
    setActiveVideo,
    videoSearch,
    setVideoSearch: setVideoSearchAndResetPage,
    videoCategoryFilter,
    setVideoCategoryFilter: setVideoCategoryFilterAndResetPage,
    videoStatusFilter,
    setVideoStatusFilter: setVideoStatusFilterAndResetPage,
    videoPage,
    setVideoPage,
    videosPageSize: VIDEOS_PAGE_SIZE,
    previewVideo,
    previewVideoUrl,
    previewVideoLoading,
    previewVideoError,
    showVideoModal,
    paginatedVideos,
    videoTotal,
    totalVideoPages,
    videoStartIndex,
    videoEndIndex,
    videosLoading,
    videosFetching,
    videoThumbsReady,
    getCategoryLabel,
    formatDurationSeconds,
    resolveVideoAsset,
    resolveVideoThumb,
    warmPreviewVideo,
    handlePreviewVideo,
    closeVideoPreview,
    handleDeleteVideo,
  };
}
