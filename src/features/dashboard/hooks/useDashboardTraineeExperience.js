import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounceValue } from '../../../shared/lib/debounce';
import { useTraineeVideos } from '../../../shared/hooks/useTraineeVideos';
import { useAuthQueryOptions } from '../../../shared/hooks/useAuthQuery';
import { getContentService } from '../../../shared/lib/getContentService';
import { queryKeys } from '../../../shared/lib/queryKeys';
import { useVideoFavorites } from '../../../shared/hooks/useVideoFavorites';
import {
  VISIBILITY_ALL,
  filterVideosByVisibility,
  getVideoCategoryId,
} from '../components/trainee-access/accessUtils';
import { VIDEOS_PAGE_SIZE } from '../constants/pagination';

export function useDashboardTraineeExperience(
  userData,
  currentLanguage,
  adminDomain = 'fitness',
  urlSection,
  setCurrentSection
) {
  const isTrainee = userData && !userData.is_coach;
  const traineeUserId = isTrainee ? userData?.id : null;
  const { data: traineeVideos = [], isLoading: traineeVideosLoading, error: traineeVideosError } =
    useTraineeVideos(adminDomain, Boolean(traineeUserId));
  const { enabled: categoriesQueryEnabled, userId: categoriesUserId } = useAuthQueryOptions(
    Boolean(traineeUserId)
  );
  const contentService = getContentService(adminDomain);
  const { data: traineeCategoriesCatalog = [], isLoading: traineeCategoriesLoading } = useQuery({
    queryKey: [...queryKeys.categories(adminDomain), { userId: categoriesUserId, scope: 'trainee-dashboard' }],
    queryFn: () => contentService.getCategories(),
    staleTime: 60 * 1000,
    enabled: categoriesQueryEnabled,
  });

  const [traineeVideoSearch, setTraineeVideoSearch] = useState('');
  const debouncedTraineeVideoSearch = useDebounceValue(traineeVideoSearch, 300);
  const [traineeVideoCategoryFilter, setTraineeVideoCategoryFilter] = useState('all');
  const [traineeVideoVisibilityFilter, setTraineeVideoVisibilityFilter] = useState(VISIBILITY_ALL);
  const [traineeCurrentSection, setTraineeCurrentSectionInternal] = useState('videos');
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [traineeVideosPage, setTraineeVideosPage] = useState(1);
  const [favoriteVideosPage, setFavoriteVideosPage] = useState(1);

  const { favoriteVideoIds, toggleFavorite, isFavorite } = useVideoFavorites(
    adminDomain === 'squash' ? 'squash' : 'fitness',
    Boolean(isTrainee)
  );

  useEffect(() => {
    if (!isTrainee) return;
    const mapped = urlSection === 'favorites' ? 'favorites' : 'videos';
    setTraineeCurrentSectionInternal(mapped);
  }, [urlSection, isTrainee]);

  const setTraineeCurrentSection = useCallback(
    (key) => {
      setTraineeCurrentSectionInternal(key);
      if (setCurrentSection) {
        setCurrentSection(key);
      }
    },
    [setCurrentSection]
  );

  const filteredTraineeVideos = useMemo(() => {
    let filtered = traineeVideos;
    if (traineeVideoCategoryFilter !== 'all') {
      filtered = filtered.filter(
        (v) => getVideoCategoryId(v) === String(traineeVideoCategoryFilter)
      );
    }
    filtered = filterVideosByVisibility(filtered, traineeVideoVisibilityFilter);
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
  }, [
    traineeVideos,
    traineeVideoCategoryFilter,
    traineeVideoVisibilityFilter,
    debouncedTraineeVideoSearch,
  ]);

  const favoriteVideos = useMemo(
    () => traineeVideos.filter((v) => favoriteVideoIds.includes(String(v.id))),
    [traineeVideos, favoriteVideoIds]
  );

  const categorySourceVideos = useMemo(
    () => (traineeCurrentSection === 'favorites' ? favoriteVideos : traineeVideos),
    [traineeCurrentSection, favoriteVideos, traineeVideos]
  );

  const traineeVideoCategories = useMemo(() => {
    const categoryIds = new Set();
    categorySourceVideos.forEach((video) => {
      const catId = getVideoCategoryId(video);
      if (catId) categoryIds.add(catId);
    });
    if (categoryIds.size === 0) return [];

    const catalogById = new Map(
      (traineeCategoriesCatalog || []).map((cat) => [
        String(cat.id),
        {
          id: String(cat.id),
          name_en: cat.name_en || cat.nameEn || '',
          name_ar: cat.name_ar || cat.nameAr || '',
        },
      ])
    );

    const resolveNestedCategory = (video) => {
      const nested = video?.categories || video?.category;
      const row = Array.isArray(nested) ? nested[0] : nested;
      if (!row) return null;
      return {
        name_en: row.name_en || row.nameEn || '',
        name_ar: row.name_ar || row.nameAr || '',
      };
    };

    const categories = [];
    categoryIds.forEach((catId) => {
      if (catalogById.has(catId)) {
        categories.push(catalogById.get(catId));
        return;
      }
      const video = categorySourceVideos.find((v) => getVideoCategoryId(v) === catId);
      const nested = resolveNestedCategory(video);
      categories.push({
        id: catId,
        name_en: nested?.name_en || '',
        name_ar: nested?.name_ar || '',
      });
    });

    return categories.sort((a, b) => {
      const labelA = (currentLanguage === 'ar' ? a.name_ar : a.name_en) || a.name_en || a.id;
      const labelB = (currentLanguage === 'ar' ? b.name_ar : b.name_en) || b.name_en || b.id;
      return labelA.localeCompare(labelB, currentLanguage === 'ar' ? 'ar' : 'en');
    });
  }, [categorySourceVideos, traineeCategoriesCatalog, currentLanguage]);

  const filteredFavoriteVideos = useMemo(() => {
    let filtered = favoriteVideos;
    if (traineeVideoCategoryFilter !== 'all') {
      filtered = filtered.filter(
        (v) => getVideoCategoryId(v) === String(traineeVideoCategoryFilter)
      );
    }
    filtered = filterVideosByVisibility(filtered, traineeVideoVisibilityFilter);
    if (debouncedTraineeVideoSearch) {
      const searchLower = debouncedTraineeVideoSearch.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.title_en?.toLowerCase().includes(searchLower) ||
          v.title_ar?.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [
    favoriteVideos,
    traineeVideoCategoryFilter,
    traineeVideoVisibilityFilter,
    debouncedTraineeVideoSearch,
  ]);

  const paginatedTraineeVideos = useMemo(() => {
    const start = (traineeVideosPage - 1) * VIDEOS_PAGE_SIZE;
    return filteredTraineeVideos.slice(start, start + VIDEOS_PAGE_SIZE);
  }, [filteredTraineeVideos, traineeVideosPage]);

  const paginatedFavoriteVideos = useMemo(() => {
    const start = (favoriteVideosPage - 1) * VIDEOS_PAGE_SIZE;
    return filteredFavoriteVideos.slice(start, start + VIDEOS_PAGE_SIZE);
  }, [filteredFavoriteVideos, favoriteVideosPage]);

  const totalTraineeVideosPages =
    Math.ceil(filteredTraineeVideos.length / VIDEOS_PAGE_SIZE) || 1;
  const totalFavoriteVideosPages =
    Math.ceil(filteredFavoriteVideos.length / VIDEOS_PAGE_SIZE) || 1;

  useEffect(() => {
    setTraineeVideosPage(1);
    setFavoriteVideosPage(1);
  }, [
    debouncedTraineeVideoSearch,
    traineeVideoCategoryFilter,
    traineeVideoVisibilityFilter,
    traineeCurrentSection,
  ]);

  useEffect(() => {
    if (traineeVideosPage > totalTraineeVideosPages) {
      setTraineeVideosPage(totalTraineeVideosPages);
    }
  }, [traineeVideosPage, totalTraineeVideosPages]);

  useEffect(() => {
    if (favoriteVideosPage > totalFavoriteVideosPages) {
      setFavoriteVideosPage(totalFavoriteVideosPages);
    }
  }, [favoriteVideosPage, totalFavoriteVideosPages]);

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
    traineeVideoVisibilityFilter,
    setTraineeVideoVisibilityFilter,
    traineeCurrentSection,
    setTraineeCurrentSection,
    filtersExpanded,
    setFiltersExpanded,
    traineeVideosPage,
    setTraineeVideosPage,
    favoriteVideosPage,
    setFavoriteVideosPage,
    favoriteVideoIds,
    favoriteVideos,
    filteredFavoriteVideos,
    toggleFavorite,
    isFavorite,
    filteredTraineeVideos,
    traineeVideoCategories,
    traineeCategoriesLoading,
    paginatedTraineeVideos,
    paginatedFavoriteVideos,
    totalTraineeVideosPages,
    totalFavoriteVideosPages,
    traineeVideosPageSize: VIDEOS_PAGE_SIZE,
    traineeNavItems,
    viewAllLabel,
    getTimeAgo,
  };
}
