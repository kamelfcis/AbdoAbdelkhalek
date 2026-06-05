import React from 'react';
import { useDashboardCoach } from '../context/DashboardCoachContext';
import { SectionHeader } from '../../../shared/layout';
import { Button, Input, Select, Table, Badge, EmptyState, StatCard } from '../../../shared/ui';
import { StatsCardGrid, TableSkeleton } from '../../fitness/components/Skeletons';
import { queryKeys } from '../../../shared/lib/queryKeys';
import { EntityPaginationBar } from '../crud/EntityPaginationBar';
import { dashTemplate } from '../utils/dashTemplate';

function ActiveFilterChip({ label, onRemove, isRTL }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-1 text-xs text-[var(--color-text)]">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
        aria-label={label}
      >
        <i className={`fas fa-times ${isRTL ? 'ms-0' : ''}`} aria-hidden="true" />
      </button>
    </span>
  );
}

function traineeName(trainee, t) {
  return trainee.full_name || trainee.fullName || t('na');
}

function traineeCreatedAt(trainee) {
  return trainee.created_at || trainee.createdAt;
}

function traineeRegisteredFrom(trainee) {
  return trainee.registered_from ?? trainee.registeredFrom ?? null;
}

function subscriptionStatusVariant(status) {
  if (status === 'active') return 'success';
  if (status === 'paused') return 'warning';
  if (status === 'cancelled') return 'danger';
  return 'neutral';
}

export function TraineesSection() {
  const c = useDashboardCoach();
  const showSkeleton = c.traineesLoading && c.trainees.length === 0;
  const showFetchingOverlay = c.traineesFetching && c.trainees.length > 0;
  const showStatsSkeleton = c.statsLoading && !c.stats?.trainees;

  const subscriptionStatusLabel = (value) => {
    const map = {
      active: c.t('subscription-status-active'),
      paused: c.t('subscription-status-paused'),
      cancelled: c.t('subscription-status-cancelled'),
      none: c.t('trainee-subscription-none'),
    };
    return map[value] || value;
  };

  const registeredFromLabel = (value) => {
    const map = {
      online_football: c.t('domain.fitness'),
      fitness: c.t('domain.fitness'),
      squash: c.t('domain.squash'),
      legacy: c.t('trainee-source-legacy'),
    };
    return map[value] || value;
  };

  const activeChips = [];
  if (c.traineeSearch?.trim()) {
    activeChips.push({
      key: 'search',
      label: `${c.t('filter-chip-search')}: ${c.traineeSearch.trim()}`,
      onRemove: () => c.setTraineeSearch(''),
    });
  }
  if (c.traineeSubscriptionStatusFilter !== 'all') {
    activeChips.push({
      key: 'subscription-status',
      label: `${c.t('page-status')}: ${subscriptionStatusLabel(c.traineeSubscriptionStatusFilter)}`,
      onRemove: () => c.setTraineeSubscriptionStatusFilter('all'),
    });
  }
  if (c.traineePackageFilter !== 'all') {
    const pkg = c.packages.find((item) => String(item.id) === String(c.traineePackageFilter));
    const pkgLabel = pkg
      ? c.isRTL
        ? pkg.name_ar || pkg.name_en
        : pkg.name_en || pkg.name_ar
      : c.traineePackageFilter;
    activeChips.push({
      key: 'package',
      label: `${c.t('page-package')}: ${pkgLabel}`,
      onRemove: () => c.setTraineePackageFilter('all'),
    });
  }
  if (c.adminDomain === 'fitness' && c.traineeRegisteredFromFilter !== 'all') {
    activeChips.push({
      key: 'registered-from',
      label: `${c.t('trainee-source-label')}: ${registeredFromLabel(c.traineeRegisteredFromFilter)}`,
      onRemove: () => c.setTraineeRegisteredFromFilter('all'),
    });
  }
  if (c.traineeCreatedDateFrom || c.traineeCreatedDateTo) {
    activeChips.push({
      key: 'created-date',
      label: `${c.t('filter-joined-date-range')}: ${c.traineeCreatedDateFrom || '…'} – ${c.traineeCreatedDateTo || '…'}`,
      onRemove: () => {
        c.setTraineeCreatedDateFrom('');
        c.setTraineeCreatedDateTo('');
      },
    });
  }

  return (
    <div className="section">
      <SectionHeader
        title={c.t('page-trainees-title')}
        subtitle={c.t('trainees-subtitle')}
        actions={
          <Button
            variant="secondary"
            leftIcon={<i className="fas fa-sync-alt" aria-hidden="true" />}
            onClick={() => {
              c.queryClient.invalidateQueries({ queryKey: queryKeys.trainees(c.adminDomain) });
              c.queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats(c.adminDomain) });
            }}
          >
            {c.t('btn-refresh')}
          </Button>
        }
      />

      {showStatsSkeleton ? (
        <div className="mb-6">
          <StatsCardGrid count={4} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard
            label={c.t('total-trainees-label')}
            value={c.stats.trainees ?? 0}
            icon="fa-users"
            color="blue"
            isRTL={c.isRTL}
          />
          <StatCard
            label={c.t('active-subscriptions-label')}
            value={c.stats.activeSubscriptions ?? 0}
            icon="fa-user-check"
            color="indigo"
            footer={`${c.stats.totalSubscriptions ?? c.stats.subscriptions ?? 0} ${c.t('label-total')}`}
            isRTL={c.isRTL}
            onClick={() => c.setCurrentSection('subscriptions')}
          />
          <StatCard
            label={c.t('trainees-new-month-label')}
            value={c.stats.traineesNewThisMonth ?? 0}
            icon="fa-user-plus"
            color="green"
            isRTL={c.isRTL}
          />
          <StatCard
            label={c.t('trainees-no-subscription-label')}
            value={c.stats.traineesWithoutActiveSubscription ?? 0}
            icon="fa-user-clock"
            color="orange"
            isRTL={c.isRTL}
          />
        </div>
      )}

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-sm shadow-lg p-4 md:p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Input
              className="md:col-span-2 lg:col-span-2"
              type="text"
              value={c.traineeSearch}
              onChange={(event) => c.setTraineeSearch(event.target.value)}
              placeholder={c.t('search-trainees-placeholder')}
              isRTL={c.isRTL}
            />
            <Select
              value={c.traineeSubscriptionStatusFilter}
              onChange={(event) => c.setTraineeSubscriptionStatusFilter(event.target.value)}
              options={[
                { value: 'all', label: c.t('filter-all-statuses') },
                { value: 'active', label: c.t('subscription-status-active') },
                { value: 'paused', label: c.t('subscription-status-paused') },
                { value: 'cancelled', label: c.t('subscription-status-cancelled') },
                { value: 'none', label: c.t('trainee-subscription-none') },
              ]}
            />
            <Select
              value={c.traineePackageFilter}
              onChange={(event) => c.setTraineePackageFilter(event.target.value)}
              options={[
                { value: 'all', label: c.t('filter-all-packages') },
                ...c.packages.map((pkg) => ({
                  value: pkg.id,
                  label: c.isRTL ? pkg.name_ar || pkg.name_en : pkg.name_en || pkg.name_ar,
                })),
              ]}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<i className="fas fa-sliders-h" aria-hidden="true" />}
              onClick={() => c.setShowAdvancedTraineeFilters((open) => !open)}
            >
              {c.t('btn-advanced-filters')}
              {c.activeTraineeFilterCount > 0 ? ` (${c.activeTraineeFilterCount})` : ''}
            </Button>
            {c.hasActiveTraineeFilters && (
              <Button variant="ghost" size="sm" onClick={c.clearTraineeFilters}>
                {c.t('btn-clear-filters')}
              </Button>
            )}
            {c.hasActiveTraineeFilters && (
              <span className="text-xs text-[var(--color-text-muted)] ms-auto">
                {dashTemplate(c.t('trainees-filtered-count'), {
                  count: c.traineesTotal,
                  total: c.stats.trainees ?? c.traineesTotal,
                })}
              </span>
            )}
          </div>

          {c.showAdvancedTraineeFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)]/40 p-4">
              {c.adminDomain === 'fitness' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--color-text-muted)]">
                    {c.t('trainee-source-label')}
                  </label>
                  <Select
                    value={c.traineeRegisteredFromFilter}
                    onChange={(event) => c.setTraineeRegisteredFromFilter(event.target.value)}
                    options={[
                      { value: 'all', label: c.t('filter-all-sources') },
                      { value: 'online_football', label: c.t('domain.fitness') },
                      { value: 'squash', label: c.t('domain.squash') },
                      { value: 'legacy', label: c.t('trainee-source-legacy') },
                    ]}
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--color-text-muted)]">
                  {c.t('filter-joined-date-from')}
                </label>
                <Input
                  type="date"
                  value={c.traineeCreatedDateFrom}
                  onChange={(event) => c.setTraineeCreatedDateFrom(event.target.value)}
                  isRTL={c.isRTL}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--color-text-muted)]">
                  {c.t('filter-joined-date-to')}
                </label>
                <Input
                  type="date"
                  value={c.traineeCreatedDateTo}
                  onChange={(event) => c.setTraineeCreatedDateTo(event.target.value)}
                  isRTL={c.isRTL}
                />
              </div>
            </div>
          )}

          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeChips.map((chip) => (
                <ActiveFilterChip
                  key={chip.key}
                  label={chip.label}
                  onRemove={chip.onRemove}
                  isRTL={c.isRTL}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showSkeleton ? (
        <TableSkeleton rows={5} columns={6} />
      ) : (
        <div
          className={`relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-sm shadow-lg overflow-hidden transition-opacity ${showFetchingOverlay ? 'opacity-60' : ''}`}
          aria-busy={showFetchingOverlay}
        >
          <Table
            isRTL={c.isRTL}
            data={c.trainees}
            emptyState={
              <EmptyState
                title={c.t('trainees-empty')}
                description={
                  c.hasActiveTraineeFilters
                    ? c.t('trainees-filter-empty')
                    : c.t('trainees-empty-desc')
                }
              />
            }
            columns={[
              {
                key: 'name',
                align: 'center',
                header: c.t('th-name'),
                render: (trainee) => (
                  <div className="space-y-1">
                    <p className="font-semibold text-[var(--color-text)]">{traineeName(trainee, c.t)}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{trainee.email}</p>
                  </div>
                ),
              },
              {
                key: 'phone',
                align: 'center',
                header: c.t('th-phone'),
                render: (trainee) => trainee.phone || c.t('na'),
              },
              {
                key: 'subscription',
                align: 'center',
                header: c.t('page-status'),
                render: (trainee) => {
                  const status = trainee.subscription_status ?? trainee.subscriptionStatus;
                  if (!status) {
                    return (
                      <Badge variant="neutral">{c.t('trainee-subscription-none')}</Badge>
                    );
                  }
                  return (
                    <Badge variant={subscriptionStatusVariant(status)}>
                      {subscriptionStatusLabel(status)}
                    </Badge>
                  );
                },
              },
              ...(c.adminDomain === 'fitness'
                ? [
                    {
                      key: 'source',
                      align: 'center',
                      header: c.t('trainee-source-label'),
                      render: (trainee) => {
                        const source = traineeRegisteredFrom(trainee);
                        const label = source
                          ? registeredFromLabel(source)
                          : c.t('trainee-source-legacy');
                        return <Badge variant="neutral">{label}</Badge>;
                      },
                    },
                  ]
                : []),
              {
                key: 'joined',
                align: 'center',
                header: c.t('th-joined'),
                render: (trainee) => {
                  const created = traineeCreatedAt(trainee);
                  return (
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {created ? new Date(created).toLocaleDateString() : c.t('na')}
                    </span>
                  );
                },
              },
              {
                key: 'actions',
                align: 'center',
                header: c.t('th-actions'),
                render: (trainee) => (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        c.setActiveTrainee({
                          ...trainee,
                          full_name: traineeName(trainee, c.t),
                        });
                        c.setShowTraineeAccessModal(true);
                      }}
                    >
                      <i className="fas fa-key text-green-600 me-1" aria-hidden="true" />
                      {c.t('btn-access')}
                    </Button>
                    {c.adminDomain === 'fitness' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          c.setTraineeForConversion({
                            ...trainee,
                            full_name: traineeName(trainee, c.t),
                          });
                          c.setShowConvertToSubscriptionModal(true);
                        }}
                      >
                        <i className="fas fa-shopping-cart text-[var(--color-primary)] me-1" aria-hidden="true" />
                        {c.t('convert-to-subscription')}
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      <EntityPaginationBar
        t={c.t}
        isRTL={c.isRTL}
        page={c.traineePage}
        pageCount={c.traineePageCount}
        total={c.traineesTotal}
        pageSize={c.traineesPageSize}
        onPageChange={c.setTraineePage}
      />
    </div>
  );
}
