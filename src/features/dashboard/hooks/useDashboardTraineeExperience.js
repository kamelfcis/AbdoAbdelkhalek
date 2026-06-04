import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDebounceValue } from '../../../shared/lib/debounce';
import { useTraineeVideos } from '../../../shared/hooks/useTraineeVideos';

export function useDashboardTraineeExperience(userData, currentLanguage) {
  const isTrainee = userData && !userData.is_coach;
  const traineeUserId = isTrainee ? userData?.id : null;
  const { data: traineeVideos = [], isLoading: traineeVideosLoading, error: traineeVideosError } =
    useTraineeVideos(traineeUserId);

  const [traineeVideoSearch, setTraineeVideoSearch] = useState('');
  const debouncedTraineeVideoSearch = useDebounceValue(traineeVideoSearch, 300);
  const [traineeVideoCategoryFilter, setTraineeVideoCategoryFilter] = useState('all');
  const [traineeCurrentSection, setTraineeCurrentSection] = useState('videos');
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [traineeVideosPage, setTraineeVideosPage] = useState(1);
  const [favoriteVideosPage, setFavoriteVideosPage] = useState(1);
  const videosPerPage = 9;

  const [favoriteVideoIds, setFavoriteVideoIds] = useState(() => {
    try {
      const saved = localStorage.getItem('traineeFavoriteVideos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const favoriteVideoIdsRef = useRef(favoriteVideoIds);
  useEffect(() => {
    favoriteVideoIdsRef.current = favoriteVideoIds;
  }, [favoriteVideoIds]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('traineeFavoriteVideos', JSON.stringify(favoriteVideoIdsRef.current));
      } catch {
        /* ignore */
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [favoriteVideoIds]);

  const toggleFavorite = useCallback((videoId) => {
    setFavoriteVideoIds((prev) => {
      const videoIdStr = String(videoId);
      return prev.includes(videoIdStr) ? prev.filter((id) => id !== videoIdStr) : [...prev, videoIdStr];
    });
  }, []);

  const isFavorite = useCallback(
    (videoId) => favoriteVideoIds.includes(String(videoId)),
    [favoriteVideoIds]
  );

  const filteredTraineeVideos = useMemo(() => {
    let filtered = traineeVideos;
    if (traineeVideoCategoryFilter !== 'all') {
      filtered = filtered.filter((v) => String(v.category_id) === String(traineeVideoCategoryFilter));
    }
    if (debouncedTraineeVideoSearch) {
      const searchLower = debouncedTraineeVideoSearch.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.title_en?.toLowerCase().includes(searchLower) ||
          v.title_ar?.toLowerCase().includes(searchLower) ||
          v.description_en?.toLowerCase().includes(searchLower) ||
          v.description_ar?.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [traineeVideos, traineeVideoCategoryFilter, debouncedTraineeVideoSearch]);

  const traineeVideoCategories = useMemo(() => {
    const categoryMap = new Map();
    traineeVideos.forEach((video) => {
      if (video.category_id && video.categories) {
        const catId = String(video.category_id);
        if (!categoryMap.has(catId)) {
          categoryMap.set(catId, {
            id: catId,
            name_en: video.categories.name_en || '',
            name_ar: video.categories.name_ar || '',
          });
        }
      }
    });
    return Array.from(categoryMap.values());
  }, [traineeVideos]);

  const favoriteVideos = useMemo(
    () => traineeVideos.filter((v) => favoriteVideoIds.includes(String(v.id))),
    [traineeVideos, favoriteVideoIds]
  );

  const filteredFavoriteVideos = useMemo(() => {
    let filtered = favoriteVideos;
    if (traineeVideoCategoryFilter !== 'all') {
      filtered = filtered.filter((v) => String(v.category_id) === String(traineeVideoCategoryFilter));
    }
    if (debouncedTraineeVideoSearch) {
      const searchLower = debouncedTraineeVideoSearch.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.title_en?.toLowerCase().includes(searchLower) ||
          v.title_ar?.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [favoriteVideos, traineeVideoCategoryFilter, debouncedTraineeVideoSearch]);

  const paginatedTraineeVideos = useMemo(() => {
    const start = (traineeVideosPage - 1) * videosPerPage;
    return filteredTraineeVideos.slice(start, start + videosPerPage);
  }, [filteredTraineeVideos, traineeVideosPage, videosPerPage]);

  const paginatedFavoriteVideos = useMemo(() => {
    const start = (favoriteVideosPage - 1) * videosPerPage;
    return filteredFavoriteVideos.slice(start, start + videosPerPage);
  }, [filteredFavoriteVideos, favoriteVideosPage, videosPerPage]);

  const totalTraineeVideosPages = Math.ceil(filteredTraineeVideos.length / videosPerPage) || 1;
  const totalFavoriteVideosPages = Math.ceil(filteredFavoriteVideos.length / videosPerPage) || 1;

  useEffect(() => {
    setTraineeVideosPage(1);
    setFavoriteVideosPage(1);
  }, [debouncedTraineeVideoSearch, traineeVideoCategoryFilter, traineeCurrentSection]);

  const traineeNavItems = useMemo(
    () => [
      { key: 'videos', icon: 'video', label: currentLanguage === 'ar' ? 'فيديوهاتي' : 'My Videos' },
      {
        key: 'favorites',
        icon: 'star',
        iconClassName: 'text-yellow-500',
        label: currentLanguage === 'ar' ? 'مفضلاتي' : 'My Favorites',
        badge: favoriteVideoIds.length,
      },
    ],
    [currentLanguage, favoriteVideoIds.length]
  );

  const viewAllLabel = currentLanguage === 'ar' ? 'عرض الكل' : 'View all';

  const getTimeAgo = (dateString) => {
    if (!dateString) return currentLanguage === 'ar' ? 'غير محدد' : 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return currentLanguage === 'ar' ? 'الآن' : 'Just now';
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return currentLanguage === 'ar' ? `منذ ${mins} دقيقة` : `${mins} minute${mins > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return currentLanguage === 'ar' ? `منذ ${hours} ساعة` : `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return currentLanguage === 'ar' ? `منذ ${days} يوم` : `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return {
    traineeVideos,
    traineeVideosLoading,
    traineeVideosError,
    traineeVideoSearch,
    setTraineeVideoSearch,
    debouncedTraineeVideoSearch,
    traineeVideoCategoryFilter,
    setTraineeVideoCategoryFilter,
    traineeCurrentSection,
    setTraineeCurrentSection,
    filtersExpanded,
    setFiltersExpanded,
    traineeVideosPage,
    setTraineeVideosPage,
    favoriteVideosPage,
    setFavoriteVideosPage,
    favoriteVideoIds,
    toggleFavorite,
    isFavorite,
    filteredTraineeVideos,
    traineeVideoCategories,
    paginatedTraineeVideos,
    paginatedFavoriteVideos,
    totalTraineeVideosPages,
    totalFavoriteVideosPages,
    traineeNavItems,
    viewAllLabel,
    getTimeAgo,
  };
}
