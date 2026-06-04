import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebounceValue } from '../../../shared/lib/debounce';
import {
  usePaginatedDashboardList,
  filtersFromSubscriptionState,
} from '../../../shared/hooks/usePaginatedDashboardList';

const SUBSCRIPTIONS_PAGE_SIZE = 10;

const DEFAULT_FILTERS = {
  search: '',
  statusFilter: 'all',
  packageFilter: 'all',
  startDateFrom: '',
  startDateTo: '',
  endDateFrom: '',
  endDateTo: '',
};

export function useDashboardSubscriptionTools({
  adminDomain,
  packages = [],
  enabled = true,
}) {
  const [subscriptionSearch, setSubscriptionSearch] = useState('');
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState('all');
  const [subscriptionPackageFilter, setSubscriptionPackageFilter] = useState('all');
  const [subscriptionStartDateFrom, setSubscriptionStartDateFrom] = useState('');
  const [subscriptionStartDateTo, setSubscriptionStartDateTo] = useState('');
  const [subscriptionEndDateFrom, setSubscriptionEndDateFrom] = useState('');
  const [subscriptionEndDateTo, setSubscriptionEndDateTo] = useState('');
  const [showAdvancedSubscriptionFilters, setShowAdvancedSubscriptionFilters] = useState(false);
  const [subscriptionPage, setSubscriptionPage] = useState(1);

  const debouncedSubscriptionSearch = useDebounceValue(subscriptionSearch, 300);

  const subscriptionFilters = useMemo(
    () =>
      filtersFromSubscriptionState({
        search: debouncedSubscriptionSearch,
        statusFilter: subscriptionStatusFilter,
        packageId: subscriptionPackageFilter,
        startDateFrom: subscriptionStartDateFrom,
        startDateTo: subscriptionStartDateTo,
        endDateFrom: subscriptionEndDateFrom,
        endDateTo: subscriptionEndDateTo,
      }),
    [
      debouncedSubscriptionSearch,
      subscriptionStatusFilter,
      subscriptionPackageFilter,
      subscriptionStartDateFrom,
      subscriptionStartDateTo,
      subscriptionEndDateFrom,
      subscriptionEndDateTo,
    ]
  );

  const resetSubscriptionPage = useCallback(() => setSubscriptionPage(1), []);

  const setSubscriptionSearchAndResetPage = useCallback((value) => {
    setSubscriptionSearch(value);
    resetSubscriptionPage();
  }, [resetSubscriptionPage]);

  const setSubscriptionStatusFilterAndResetPage = useCallback((value) => {
    setSubscriptionStatusFilter(value);
    resetSubscriptionPage();
  }, [resetSubscriptionPage]);

  const setSubscriptionPackageFilterAndResetPage = useCallback((value) => {
    setSubscriptionPackageFilter(value);
    resetSubscriptionPage();
  }, [resetSubscriptionPage]);

  const setSubscriptionStartDateFromAndResetPage = useCallback((value) => {
    setSubscriptionStartDateFrom(value);
    resetSubscriptionPage();
  }, [resetSubscriptionPage]);

  const setSubscriptionStartDateToAndResetPage = useCallback((value) => {
    setSubscriptionStartDateTo(value);
    resetSubscriptionPage();
  }, [resetSubscriptionPage]);

  const setSubscriptionEndDateFromAndResetPage = useCallback((value) => {
    setSubscriptionEndDateFrom(value);
    resetSubscriptionPage();
  }, [resetSubscriptionPage]);

  const setSubscriptionEndDateToAndResetPage = useCallback((value) => {
    setSubscriptionEndDateTo(value);
    resetSubscriptionPage();
  }, [resetSubscriptionPage]);

  const clearSubscriptionFilters = useCallback(() => {
    setSubscriptionSearch(DEFAULT_FILTERS.search);
    setSubscriptionStatusFilter(DEFAULT_FILTERS.statusFilter);
    setSubscriptionPackageFilter(DEFAULT_FILTERS.packageFilter);
    setSubscriptionStartDateFrom(DEFAULT_FILTERS.startDateFrom);
    setSubscriptionStartDateTo(DEFAULT_FILTERS.startDateTo);
    setSubscriptionEndDateFrom(DEFAULT_FILTERS.endDateFrom);
    setSubscriptionEndDateTo(DEFAULT_FILTERS.endDateTo);
    resetSubscriptionPage();
  }, [resetSubscriptionPage]);

  const subscriptionsQ = usePaginatedDashboardList({
    entity: 'subscriptions',
    domain: adminDomain,
    page: subscriptionPage,
    limit: SUBSCRIPTIONS_PAGE_SIZE,
    filters: subscriptionFilters,
    enabled,
  });

  useEffect(() => {
    resetSubscriptionPage();
  }, [
    debouncedSubscriptionSearch,
    subscriptionStatusFilter,
    subscriptionPackageFilter,
    subscriptionStartDateFrom,
    subscriptionStartDateTo,
    subscriptionEndDateFrom,
    subscriptionEndDateTo,
    resetSubscriptionPage,
  ]);

  useEffect(() => {
    if (subscriptionPage > subscriptionsQ.pageCount) {
      setSubscriptionPage(subscriptionsQ.pageCount);
    }
  }, [subscriptionPage, subscriptionsQ.pageCount]);

  const hasActiveSubscriptionFilters = useMemo(() => {
    return (
      Boolean(debouncedSubscriptionSearch?.trim()) ||
      subscriptionStatusFilter !== 'all' ||
      subscriptionPackageFilter !== 'all' ||
      Boolean(subscriptionStartDateFrom) ||
      Boolean(subscriptionStartDateTo) ||
      Boolean(subscriptionEndDateFrom) ||
      Boolean(subscriptionEndDateTo)
    );
  }, [
    debouncedSubscriptionSearch,
    subscriptionStatusFilter,
    subscriptionPackageFilter,
    subscriptionStartDateFrom,
    subscriptionStartDateTo,
    subscriptionEndDateFrom,
    subscriptionEndDateTo,
  ]);

  const activeSubscriptionFilterCount = useMemo(() => {
    let count = 0;
    if (debouncedSubscriptionSearch?.trim()) count += 1;
    if (subscriptionStatusFilter !== 'all') count += 1;
    if (subscriptionPackageFilter !== 'all') count += 1;
    if (subscriptionStartDateFrom || subscriptionStartDateTo) count += 1;
    if (subscriptionEndDateFrom || subscriptionEndDateTo) count += 1;
    return count;
  }, [
    debouncedSubscriptionSearch,
    subscriptionStatusFilter,
    subscriptionPackageFilter,
    subscriptionStartDateFrom,
    subscriptionStartDateTo,
    subscriptionEndDateFrom,
    subscriptionEndDateTo,
  ]);

  const getPackageLabel = useCallback(
    (packageId) => {
      if (!packageId) return null;
      const pkg = packages.find((item) => String(item.id) === String(packageId));
      if (!pkg) return packageId;
      return pkg.name_en || pkg.name_ar || packageId;
    },
    [packages]
  );

  return {
    subscriptionSearch,
    setSubscriptionSearch: setSubscriptionSearchAndResetPage,
    subscriptionStatusFilter,
    setSubscriptionStatusFilter: setSubscriptionStatusFilterAndResetPage,
    subscriptionPackageFilter,
    setSubscriptionPackageFilter: setSubscriptionPackageFilterAndResetPage,
    subscriptionStartDateFrom,
    setSubscriptionStartDateFrom: setSubscriptionStartDateFromAndResetPage,
    subscriptionStartDateTo,
    setSubscriptionStartDateTo: setSubscriptionStartDateToAndResetPage,
    subscriptionEndDateFrom,
    setSubscriptionEndDateFrom: setSubscriptionEndDateFromAndResetPage,
    subscriptionEndDateTo,
    setSubscriptionEndDateTo: setSubscriptionEndDateToAndResetPage,
    showAdvancedSubscriptionFilters,
    setShowAdvancedSubscriptionFilters,
    clearSubscriptionFilters,
    hasActiveSubscriptionFilters,
    activeSubscriptionFilterCount,
    getPackageLabel,
    subscriptions: subscriptionsQ.items,
    subscriptionsTotal: subscriptionsQ.total,
    subscriptionPage,
    setSubscriptionPage,
    subscriptionPageCount: subscriptionsQ.pageCount,
    subscriptionsPageSize: SUBSCRIPTIONS_PAGE_SIZE,
    subscriptionsLoading: subscriptionsQ.isLoading,
    subscriptionsFetching: subscriptionsQ.isFetching,
    subscriptionsListQueryKey: subscriptionsQ.queryKey,
  };
}
