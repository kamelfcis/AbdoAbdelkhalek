import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebounceValue } from '../../../shared/lib/debounce';
import {
  usePaginatedDashboardList,
  filtersFromTraineeState,
} from '../../../shared/hooks/usePaginatedDashboardList';

const TRAINEES_PAGE_SIZE = 10;

const DEFAULT_FILTERS = {
  search: '',
  subscriptionStatusFilter: 'all',
  packageFilter: 'all',
  registeredFromFilter: 'all',
  createdDateFrom: '',
  createdDateTo: '',
};

export function useDashboardTraineeTools({
  adminDomain,
  packages = [],
  enabled = true,
}) {
  const [traineeSearch, setTraineeSearch] = useState('');
  const [traineeSubscriptionStatusFilter, setTraineeSubscriptionStatusFilter] = useState('all');
  const [traineePackageFilter, setTraineePackageFilter] = useState('all');
  const [traineeRegisteredFromFilter, setTraineeRegisteredFromFilter] = useState('all');
  const [traineeCreatedDateFrom, setTraineeCreatedDateFrom] = useState('');
  const [traineeCreatedDateTo, setTraineeCreatedDateTo] = useState('');
  const [showAdvancedTraineeFilters, setShowAdvancedTraineeFilters] = useState(false);
  const [traineePage, setTraineePage] = useState(1);

  const debouncedTraineeSearch = useDebounceValue(traineeSearch, 300);

  const traineeFilters = useMemo(
    () =>
      filtersFromTraineeState({
        search: debouncedTraineeSearch,
        subscriptionStatusFilter: traineeSubscriptionStatusFilter,
        packageId: traineePackageFilter,
        registeredFromFilter: traineeRegisteredFromFilter,
        createdDateFrom: traineeCreatedDateFrom,
        createdDateTo: traineeCreatedDateTo,
      }),
    [
      debouncedTraineeSearch,
      traineeSubscriptionStatusFilter,
      traineePackageFilter,
      traineeRegisteredFromFilter,
      traineeCreatedDateFrom,
      traineeCreatedDateTo,
    ]
  );

  const resetTraineePage = useCallback(() => setTraineePage(1), []);

  const setTraineeSearchAndResetPage = useCallback((value) => {
    setTraineeSearch(value);
    resetTraineePage();
  }, [resetTraineePage]);

  const setTraineeSubscriptionStatusFilterAndResetPage = useCallback((value) => {
    setTraineeSubscriptionStatusFilter(value);
    resetTraineePage();
  }, [resetTraineePage]);

  const setTraineePackageFilterAndResetPage = useCallback((value) => {
    setTraineePackageFilter(value);
    resetTraineePage();
  }, [resetTraineePage]);

  const setTraineeRegisteredFromFilterAndResetPage = useCallback((value) => {
    setTraineeRegisteredFromFilter(value);
    resetTraineePage();
  }, [resetTraineePage]);

  const setTraineeCreatedDateFromAndResetPage = useCallback((value) => {
    setTraineeCreatedDateFrom(value);
    resetTraineePage();
  }, [resetTraineePage]);

  const setTraineeCreatedDateToAndResetPage = useCallback((value) => {
    setTraineeCreatedDateTo(value);
    resetTraineePage();
  }, [resetTraineePage]);

  const clearTraineeFilters = useCallback(() => {
    setTraineeSearch(DEFAULT_FILTERS.search);
    setTraineeSubscriptionStatusFilter(DEFAULT_FILTERS.subscriptionStatusFilter);
    setTraineePackageFilter(DEFAULT_FILTERS.packageFilter);
    setTraineeRegisteredFromFilter(DEFAULT_FILTERS.registeredFromFilter);
    setTraineeCreatedDateFrom(DEFAULT_FILTERS.createdDateFrom);
    setTraineeCreatedDateTo(DEFAULT_FILTERS.createdDateTo);
    resetTraineePage();
  }, [resetTraineePage]);

  const traineesQ = usePaginatedDashboardList({
    entity: 'trainees',
    domain: adminDomain,
    page: traineePage,
    limit: TRAINEES_PAGE_SIZE,
    filters: traineeFilters,
    enabled,
  });

  useEffect(() => {
    resetTraineePage();
  }, [
    debouncedTraineeSearch,
    traineeSubscriptionStatusFilter,
    traineePackageFilter,
    traineeRegisteredFromFilter,
    traineeCreatedDateFrom,
    traineeCreatedDateTo,
    resetTraineePage,
  ]);

  useEffect(() => {
    if (traineePage > traineesQ.pageCount) {
      setTraineePage(traineesQ.pageCount);
    }
  }, [traineePage, traineesQ.pageCount]);

  const hasActiveTraineeFilters = useMemo(() => {
    return (
      Boolean(debouncedTraineeSearch?.trim()) ||
      traineeSubscriptionStatusFilter !== 'all' ||
      traineePackageFilter !== 'all' ||
      traineeRegisteredFromFilter !== 'all' ||
      Boolean(traineeCreatedDateFrom) ||
      Boolean(traineeCreatedDateTo)
    );
  }, [
    debouncedTraineeSearch,
    traineeSubscriptionStatusFilter,
    traineePackageFilter,
    traineeRegisteredFromFilter,
    traineeCreatedDateFrom,
    traineeCreatedDateTo,
  ]);

  const activeTraineeFilterCount = useMemo(() => {
    let count = 0;
    if (debouncedTraineeSearch?.trim()) count += 1;
    if (traineeSubscriptionStatusFilter !== 'all') count += 1;
    if (traineePackageFilter !== 'all') count += 1;
    if (traineeRegisteredFromFilter !== 'all') count += 1;
    if (traineeCreatedDateFrom || traineeCreatedDateTo) count += 1;
    return count;
  }, [
    debouncedTraineeSearch,
    traineeSubscriptionStatusFilter,
    traineePackageFilter,
    traineeRegisteredFromFilter,
    traineeCreatedDateFrom,
    traineeCreatedDateTo,
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
    traineeSearch,
    setTraineeSearch: setTraineeSearchAndResetPage,
    traineeSubscriptionStatusFilter,
    setTraineeSubscriptionStatusFilter: setTraineeSubscriptionStatusFilterAndResetPage,
    traineePackageFilter,
    setTraineePackageFilter: setTraineePackageFilterAndResetPage,
    traineeRegisteredFromFilter,
    setTraineeRegisteredFromFilter: setTraineeRegisteredFromFilterAndResetPage,
    traineeCreatedDateFrom,
    setTraineeCreatedDateFrom: setTraineeCreatedDateFromAndResetPage,
    traineeCreatedDateTo,
    setTraineeCreatedDateTo: setTraineeCreatedDateToAndResetPage,
    showAdvancedTraineeFilters,
    setShowAdvancedTraineeFilters,
    clearTraineeFilters,
    hasActiveTraineeFilters,
    activeTraineeFilterCount,
    getPackageLabel,
    trainees: traineesQ.items,
    traineesTotal: traineesQ.total,
    traineePage,
    setTraineePage,
    traineePageCount: traineesQ.pageCount,
    traineesPageSize: TRAINEES_PAGE_SIZE,
    traineesLoading: traineesQ.isLoading,
    traineesFetching: traineesQ.isFetching,
    traineesListQueryKey: traineesQ.queryKey,
  };
}
