import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDashboardDomain } from '../domain/DomainContext';
import { getContentService } from '../../../shared/lib/getContentService';
import {
  invalidateContentCrud,
  patchPaginatedListItem,
  prependPaginatedListItem,
  removePaginatedListItem,
} from '../../../shared/lib/queryKeys';
import { showSuccess, showError, showConfirm } from '../../../shared/lib/notifications';
import { mapPackage } from '../../../shared/api/createDomainContentService';
import { getEntityConfig } from './entityConfigs';
import { getDashboardTranslation } from '../../../shared/i18n/dashboard';
import {
  usePaginatedDashboardList,
  filtersFromCrudState,
} from '../../../shared/hooks/usePaginatedDashboardList';
import { useDebounceValue } from '../../../shared/lib/debounce';
import { selectRangeIds } from './selectRangeIds';

function isPackageLikeRow(row) {
  return (
    row.price_egp != null ||
    row.priceEgp != null ||
    row.price_usd != null ||
    row.priceUsd != null ||
    row.duration_days != null ||
    row.durationDays != null ||
    row.packageType != null
  );
}

function normalizeCrudRow(row) {
  if (!row || typeof row !== 'object') return row;
  const base = isPackageLikeRow(row) ? mapPackage(row) : row;
  return {
    ...base,
    name_en: base.name_en ?? base.nameEn,
    name_ar: base.name_ar ?? base.nameAr,
    description_en: base.description_en ?? base.descriptionEn,
    description_ar: base.description_ar ?? base.descriptionAr,
    price_egp: base.price_egp ?? base.priceEgp,
    price_usd: base.price_usd ?? base.priceUsd,
    duration_days: base.duration_days ?? base.durationDays,
    features_en: base.features_en ?? base.featuresEn,
    features_ar: base.features_ar ?? base.featuresAr,
    includes_video_feedback: base.includes_video_feedback ?? base.includesVideoFeedback,
    daily_support: base.daily_support ?? base.dailySupport,
    level: base.level ?? base.packageLevel,
    type: base.type ?? base.packageType,
    is_public: base.is_public ?? base.isPublic,
    is_active: base.is_active ?? base.isActive,
    is_featured: base.is_featured ?? base.isFeatured,
    image_url: base.image_url ?? base.imageUrl,
    image_path: base.image_path ?? base.imagePath,
    question_en: base.question_en ?? base.questionEn,
    question_ar: base.question_ar ?? base.questionAr,
    answer_en: base.answer_en ?? base.answerEn,
    answer_ar: base.answer_ar ?? base.answerAr,
    order_index: base.order_index ?? base.orderIndex,
  };
}

function formatDashboardMessage(domain, lang, key, vars = {}) {
  let text = getDashboardTranslation(domain, lang, key);
  Object.entries(vars).forEach(([name, value]) => {
    text = text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value));
  });
  return text;
}

function mergeSavedRow(prev, saved) {
  return normalizeCrudRow({ ...prev, ...saved });
}

export function useEntityCrud(entityKey, { currentLanguage = 'en' } = {}) {
  const { adminDomain } = useDashboardDomain();
  const config = getEntityConfig(adminDomain, entityKey);
  const queryClient = useQueryClient();
  const contentService = getContentService(adminDomain);
  const isAr = currentLanguage === 'ar';

  const pageSize = config?.pageSize ?? 10;
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [isMutating, setIsMutating] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState(null);

  const debouncedSearch = useDebounceValue(search, 300);
  const apiFilters = useMemo(
    () => filtersFromCrudState({ search: debouncedSearch, statusFilter, featuredFilter }),
    [debouncedSearch, statusFilter, featuredFilter]
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, featuredFilter]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastClickedIndex(null);
  }, []);

  useEffect(() => {
    clearSelection();
  }, [page, clearSelection]);

  const listQuery = usePaginatedDashboardList({
    entity: config?.invalidateKey,
    domain: adminDomain,
    page,
    limit: pageSize,
    filters: apiFilters,
    enabled: Boolean(config?.invalidateKey && config?.methods?.list),
  });

  const { items: rawItems, total, pageCount, isLoading, isFetching, queryKey: listQueryKey } = listQuery;

  const items = useMemo(() => (rawItems || []).map(normalizeCrudRow), [rawItems]);
  const pageIds = useMemo(() => items.map((row) => row.id).filter((id) => id != null), [items]);

  const toggleRow = useCallback(
    (id, index, { shiftKey } = {}) => {
      if (id == null) return;
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (shiftKey && lastClickedIndex != null) {
          selectRangeIds(pageIds, lastClickedIndex, index).forEach((rangeId) => next.add(rangeId));
        } else if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
      setLastClickedIndex(index);
    },
    [pageIds, lastClickedIndex]
  );

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allSelected = pageIds.length > 0 && pageIds.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(pageIds);
    });
  }, [pageIds]);

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setShowForm(true);
  }, []);

  const openEdit = useCallback((row) => {
    setEditingRecord(row);
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingRecord(null);
  }, []);

  const onSaved = useCallback(
    async (savedRecord, { isCreate } = {}) => {
      closeForm();

      if (listQueryKey && savedRecord?.id != null) {
        const normalized = normalizeCrudRow(savedRecord);
        if (isCreate && page === 1) {
          prependPaginatedListItem(queryClient, listQueryKey, normalized, pageSize);
        } else if (!isCreate) {
          patchPaginatedListItem(queryClient, listQueryKey, normalized.id, (row) =>
            mergeSavedRow(row, normalized)
          );
        }
      }

      if (config?.invalidateKey) {
        await invalidateContentCrud(queryClient, config.invalidateKey, adminDomain);
      }
    },
    [queryClient, config, adminDomain, closeForm, listQueryKey, page, pageSize]
  );

  const deleteItem = useCallback(
    async (id) => {
      if (!config?.methods?.delete) return;
      const confirmed = await showConfirm(
        isAr ? 'هل أنت متأكد؟' : 'Are you sure?',
        isAr ? 'سيتم الحذف نهائياً' : 'This item will be deleted',
        isAr ? 'نعم، احذف' : 'Yes, delete',
        isAr ? 'إلغاء' : 'Cancel'
      );
      if (!confirmed) return;

      let previousData;
      if (listQueryKey) {
        previousData = queryClient.getQueryData(listQueryKey);
        removePaginatedListItem(queryClient, listQueryKey, id);
      }

      setIsMutating(true);
      try {
        await contentService[config.methods.delete](id);
        showSuccess(isAr ? 'تم الحذف' : 'Deleted successfully');
        if (config?.invalidateKey) {
          void invalidateContentCrud(queryClient, config.invalidateKey, adminDomain, {
            deferSecondary: true,
          });
        }
      } catch (err) {
        if (listQueryKey && previousData !== undefined) {
          queryClient.setQueryData(listQueryKey, previousData);
        }
        showError(err.message || 'Delete failed');
      } finally {
        setIsMutating(false);
      }
    },
    [config, contentService, queryClient, adminDomain, isAr, listQueryKey]
  );

  const deleteSelected = useCallback(async () => {
    if (!config?.methods?.delete || selectedIds.size === 0) return;

    const ids = [...selectedIds];
    const count = ids.length;
    const lang = isAr ? 'ar' : 'en';

    const confirmed = await showConfirm(
      formatDashboardMessage(adminDomain, lang, 'confirm-bulk-delete-title', { count }),
      formatDashboardMessage(adminDomain, lang, 'confirm-bulk-delete-body', { count }),
      formatDashboardMessage(adminDomain, lang, 'confirm-bulk-delete-yes'),
      formatDashboardMessage(adminDomain, lang, 'btn-cancel')
    );
    if (!confirmed) return;

    let previousData;
    if (listQueryKey) {
      previousData = queryClient.getQueryData(listQueryKey);
      ids.forEach((id) => removePaginatedListItem(queryClient, listQueryKey, id));
    }

    setIsMutating(true);
    try {
      const bulkMethod = config.methods.deleteFaqsBulk;
      if (config.bulkDelete && bulkMethod && typeof contentService[bulkMethod] === 'function') {
        await contentService[bulkMethod](ids);
      } else {
        await Promise.all(ids.map((id) => contentService[config.methods.delete](id)));
      }
      showSuccess(formatDashboardMessage(adminDomain, lang, 'bulk-delete-success', { count }));
      clearSelection();
      if (config?.invalidateKey) {
        void invalidateContentCrud(queryClient, config.invalidateKey, adminDomain, {
          deferSecondary: true,
        });
      }
    } catch (err) {
      if (listQueryKey && previousData !== undefined) {
        queryClient.setQueryData(listQueryKey, previousData);
      }
      showError(err.message || 'Delete failed');
    } finally {
      setIsMutating(false);
    }
  }, [
    config,
    contentService,
    queryClient,
    adminDomain,
    isAr,
    listQueryKey,
    selectedIds,
    clearSelection,
  ]);

  return {
    config,
    adminDomain,
    contentService,
    items,
    filteredItems: items,
    total,
    pageCount,
    page,
    pageSize,
    setPage,
    isLoading,
    isFetching,
    isMutating,
    showForm,
    setShowForm,
    editingRecord,
    editingItem: editingRecord,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    featuredFilter,
    setFeaturedFilter,
    openCreate,
    openEdit,
    closeForm,
    onSaved,
    deleteItem,
    deleteSelected,
    selectedIds,
    selectedCount: selectedIds.size,
    toggleRow,
    toggleSelectAll,
    clearSelection,
    isAr,
  };
}
