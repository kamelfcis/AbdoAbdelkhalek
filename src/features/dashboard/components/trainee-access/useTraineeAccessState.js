import { useEffect, useMemo, useState, useCallback } from 'react';
import { getContentService } from '../../../../shared/lib/getContentService';
import { normalizeListResponse } from '../../../../shared/api/listUtils';
import { toastSuccess, toastError } from '../../../../shared/ui';
import {
  FILTER_ALL,
  VISIBILITY_ALL,
  buildSelectedVideos,
  getVideoCategoryId,
  filterCategoriesBySearch,
  filterVideosBySearch,
  filterVideosByCategory,
  filterVideosByVisibility,
  setsEqual,
  createSnapshot,
} from './accessUtils';

const EMPTY_LIST = [];

export const useTraineeAccessState = ({
  isOpen,
  trainee,
  categoriesProp = EMPTY_LIST,
  videosProp = EMPTY_LIST,
  onClose,
  onSaved,
  domain,
  isAr,
  tr,
}) => {
  const contentService = useMemo(() => getContentService(domain), [domain]);
  const [catalogCategories, setCatalogCategories] = useState([]);
  const [catalogVideos, setCatalogVideos] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [initialSnapshot, setInitialSnapshot] = useState(createSnapshot([], []));
  const [videoFilterCategoryId, setVideoFilterCategoryId] = useState(FILTER_ALL);
  const [categorySearch, setCategorySearch] = useState('');
  const [videoSearch, setVideoSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState(VISIBILITY_ALL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [grantProgress, setGrantProgress] = useState(0);
  const [grantPhase, setGrantPhase] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setCatalogCategories([]);
      setCatalogVideos([]);
      setSelectedCategories(new Set());
      setSelectedVideos(new Set());
      setInitialSnapshot(createSnapshot([], []));
      setVideoFilterCategoryId(FILTER_ALL);
      setCategorySearch('');
      setVideoSearch('');
      setVisibilityFilter(VISIBILITY_ALL);
      setGrantProgress(0);
      setGrantPhase('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !trainee?.id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const usePropCategories = categoriesProp.length > 0;
        const usePropVideos = videosProp.length > 0;

        const [categoriesResult, videosResult, access] = await Promise.all([
          usePropCategories
            ? Promise.resolve({ items: categoriesProp })
            : contentService.getCategories({ limit: 500, offset: 0 }),
          usePropVideos
            ? Promise.resolve({ items: videosProp })
            : contentService.getVideos({ limit: 500, offset: 0 }),
          contentService.getTraineeAccess(trainee.id),
        ]);

        const catItems = usePropCategories
          ? categoriesProp
          : normalizeListResponse(categoriesResult).items;
        const vidItems = usePropVideos ? videosProp : normalizeListResponse(videosResult).items;

        const cats = new Set(
          (access.categories || []).map((a) => String(a.categoryId || a.category_id || ''))
        );
        const vids = buildSelectedVideos(access, vidItems);

        setCatalogCategories(catItems);
        setCatalogVideos(vidItems);
        setSelectedCategories(cats);
        setSelectedVideos(vids);
        setInitialSnapshot(createSnapshot(cats, vids));
        setVideoFilterCategoryId(FILTER_ALL);
      } catch (e) {
        console.error(e);
        toastError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isOpen, trainee?.id, contentService, categoriesProp, videosProp]);

  const isDirty = useMemo(
    () =>
      !setsEqual(selectedCategories, initialSnapshot.categories) ||
      !setsEqual(selectedVideos, initialSnapshot.videos),
    [selectedCategories, selectedVideos, initialSnapshot]
  );

  const toggleCategory = useCallback(
    (catId) => {
      const next = new Set(selectedCategories);
      const nextVideos = new Set(selectedVideos);
      const categoryVideos = catalogVideos.filter((v) => getVideoCategoryId(v) === catId);

      if (next.has(catId)) {
        next.delete(catId);
        categoryVideos.forEach((v) => nextVideos.delete(String(v.id)));
      } else {
        next.add(catId);
        categoryVideos.forEach((v) => nextVideos.add(String(v.id)));
      }
      setSelectedCategories(next);
      setSelectedVideos(nextVideos);
    },
    [selectedCategories, selectedVideos, catalogVideos]
  );

  const toggleVideo = useCallback(
    (vidId) => {
      const next = new Set(selectedVideos);
      if (next.has(vidId)) next.delete(vidId);
      else next.add(vidId);
      setSelectedVideos(next);
    },
    [selectedVideos]
  );

  const grantAllCategories = useCallback(() => {
    setSelectedCategories(new Set(catalogCategories.map((cat) => String(cat.id))));
  }, [catalogCategories]);

  const revokeAllCategories = useCallback(() => {
    setSelectedCategories(new Set());
  }, []);

  const visibleCategories = useMemo(
    () => filterCategoriesBySearch(catalogCategories, categorySearch, isAr),
    [catalogCategories, categorySearch, isAr]
  );

  const visibleVideos = useMemo(() => {
    let result = catalogVideos;
    result = filterVideosByCategory(result, videoFilterCategoryId);
    result = filterVideosByVisibility(result, visibilityFilter);
    result = filterVideosBySearch(result, videoSearch, isAr);
    return result;
  }, [catalogVideos, videoFilterCategoryId, visibilityFilter, videoSearch, isAr]);

  const grantAllVisibleVideos = useCallback(() => {
    setSelectedVideos(new Set(visibleVideos.map((v) => String(v.id))));
  }, [visibleVideos]);

  const revokeAllVisibleVideos = useCallback(() => {
    setSelectedVideos(new Set());
  }, []);

  const handleSave = useCallback(async () => {
    setIsSubmitting(true);
    setGrantProgress(0);
    setGrantPhase(tr('grant-progress-preparing') || 'Preparing…');
    try {
      setGrantProgress(20);
      setGrantPhase(tr('grant-progress-validating') || 'Validating…');

      setGrantProgress(50);
      setGrantPhase(tr('grant-progress-granting') || 'Granting access…');

      await contentService.setTraineeAccess(trainee.id, {
        categoryIds: Array.from(selectedCategories),
        videoIds: Array.from(selectedVideos),
      });

      setGrantProgress(80);
      setGrantPhase(tr('grant-progress-updating') || 'Updating subscription…');

      await new Promise((resolve) => setTimeout(resolve, 350));

      setGrantProgress(100);
      setGrantPhase(tr('grant-progress-done') || 'Done!');

      await new Promise((resolve) => setTimeout(resolve, 500));

      toastSuccess(tr('trainee-access-saved'));
      onSaved?.();
      onClose?.();
    } catch (e) {
      setGrantProgress(0);
      setGrantPhase('');
      toastError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [contentService, trainee?.id, selectedCategories, selectedVideos, tr, onSaved, onClose]);

  const handleClose = useCallback(() => {
    if (isDirty && !window.confirm(tr('trainee-access-confirm-discard'))) return;
    onClose?.();
  }, [isDirty, onClose, tr]);

  const categoryFilterOptions = useMemo(
    () => [
      { value: FILTER_ALL, label: tr('trainee-access-videos-filter-all') },
      ...catalogCategories.map((cat) => ({
        value: String(cat.id),
        label: isAr ? cat.name_ar : cat.name_en,
      })),
    ],
    [catalogCategories, isAr, tr]
  );

  const isFilteringVideos = videoFilterCategoryId !== FILTER_ALL;

  return {
    catalogCategories,
    catalogVideos,
    selectedCategories,
    selectedVideos,
    videoFilterCategoryId,
    setVideoFilterCategoryId,
    categorySearch,
    setCategorySearch,
    videoSearch,
    setVideoSearch,
    visibilityFilter,
    setVisibilityFilter,
    isSubmitting,
    isLoading,
    isDirty,
    toggleCategory,
    toggleVideo,
    grantAllCategories,
    revokeAllCategories,
    grantAllVisibleVideos,
    revokeAllVisibleVideos,
    visibleCategories,
    visibleVideos,
    handleSave,
    handleClose,
    categoryFilterOptions,
    isFilteringVideos,
    grantProgress,
    grantPhase,
  };
};
