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
import { getEntityConfig } from './entityConfigs';
import {
  usePaginatedDashboardList,
  filtersFromCrudState,
} from '../../../shared/hooks/usePaginatedDashboardList';
import { useDebounceValue } from '../../../shared/lib/debounce';

function normalizeCrudRow(row) {
  if (!row || typeof row !== 'object') return row;
  return {
    ...row,
    name_en: row.name_en ?? row.nameEn,
    name_ar: row.name_ar ?? row.nameAr,
    description_en: row.description_en ?? row.descriptionEn,
    description_ar: row.description_ar ?? row.descriptionAr,
    is_public: row.is_public ?? row.isPublic,
    is_featured: row.is_featured ?? row.isFeatured,
    image_url: row.image_url ?? row.imageUrl,
    image_path: row.image_path ?? row.imagePath,
    question_en: row.question_en ?? row.questionEn,
    question_ar: row.question_ar ?? row.questionAr,
    answer_en: row.answer_en ?? row.answerEn,
    answer_ar: row.answer_ar ?? row.answerAr,
  };
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

  const debouncedSearch = useDebounceValue(search, 300);
  const apiFilters = useMemo(
    () => filtersFromCrudState({ search: debouncedSearch, statusFilter, featuredFilter }),
    [debouncedSearch, statusFilter, featuredFilter]
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, featuredFilter]);

  const listQuery = usePaginatedDashboardList({
    entity: config?.invalidateKey,
    domain: adminDomain,
    page,
    limit: pageSize,
    filters: apiFilters,
    enabled: Boolean(config?.invalidateKey && config?.methods?.list),
  });

  const { items, total, pageCount, isLoading, isFetching, queryKey: listQueryKey } = listQuery;

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
    (savedRecord, { isCreate } = {}) => {
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
        void invalidateContentCrud(queryClient, config.invalidateKey, adminDomain, {
          deferSecondary: true,
        });
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
    isAr,
  };
}
