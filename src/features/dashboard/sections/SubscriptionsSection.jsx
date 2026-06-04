import React from 'react';
import { useDashboardCoach } from '../context/DashboardCoachContext';
import { SectionHeader } from '../../../shared/layout';
import { Button, Input, Select, Table, Badge, EmptyState } from '../../../shared/ui';
import { TableSkeleton } from '../../fitness/components/Skeletons';
import { queryKeys } from '../../../shared/lib/queryKeys';
import { EntityPaginationBar } from '../crud/EntityPaginationBar';

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

export function SubscriptionsSection() {
  const c = useDashboardCoach();
  const showSkeleton = c.subscriptionsLoading && c.subscriptions.length === 0;
  const showFetchingOverlay = c.subscriptionsFetching && c.subscriptions.length > 0;

  const statusLabel = (value) => {
    const map = {
      active: c.t('subscription-status-active'),
      paused: c.t('subscription-status-paused'),
      cancelled: c.t('subscription-status-cancelled'),
    };
    return map[value] || value;
  };

  const activeChips = [];
  if (c.subscriptionSearch?.trim()) {
    activeChips.push({
      key: 'search',
      label: `${c.t('filter-chip-search')}: ${c.subscriptionSearch.trim()}`,
      onRemove: () => c.setSubscriptionSearch(''),
    });
  }
  if (c.subscriptionStatusFilter !== 'all') {
    activeChips.push({
      key: 'status',
      label: `${c.t('page-status')}: ${statusLabel(c.subscriptionStatusFilter)}`,
      onRemove: () => c.setSubscriptionStatusFilter('all'),
    });
  }
  if (c.subscriptionPackageFilter !== 'all') {
    const pkg = c.packages.find((item) => String(item.id) === String(c.subscriptionPackageFilter));
    const pkgLabel = pkg
      ? c.isRTL
        ? pkg.name_ar || pkg.name_en
        : pkg.name_en || pkg.name_ar
      : c.subscriptionPackageFilter;
    activeChips.push({
      key: 'package',
      label: `${c.t('page-package')}: ${pkgLabel}`,
      onRemove: () => c.setSubscriptionPackageFilter('all'),
    });
  }
  if (c.subscriptionStartDateFrom || c.subscriptionStartDateTo) {
    activeChips.push({
      key: 'start-date',
      label: `${c.t('filter-start-date-range')}: ${c.subscriptionStartDateFrom || '…'} – ${c.subscriptionStartDateTo || '…'}`,
      onRemove: () => {
        c.setSubscriptionStartDateFrom('');
        c.setSubscriptionStartDateTo('');
      },
    });
  }
  if (c.subscriptionEndDateFrom || c.subscriptionEndDateTo) {
    activeChips.push({
      key: 'end-date',
      label: `${c.t('filter-end-date-range')}: ${c.subscriptionEndDateFrom || '…'} – ${c.subscriptionEndDateTo || '…'}`,
      onRemove: () => {
        c.setSubscriptionEndDateFrom('');
        c.setSubscriptionEndDateTo('');
      },
    });
  }

  return (
    <div className="section">
      <SectionHeader
        title={c.t('page-subscriptions-title')}
        actions={
          <Button
            variant="secondary"
            leftIcon={<i className="fas fa-sync-alt" aria-hidden="true" />}
            onClick={() =>
              c.queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions(c.adminDomain) })
            }
          >
            {c.t('btn-refresh')}
          </Button>
        }
      />

      <div className="flex flex-col gap-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Input
            className="md:col-span-2 lg:col-span-2"
            type="text"
            value={c.subscriptionSearch}
            onChange={(event) => c.setSubscriptionSearch(event.target.value)}
            placeholder={c.t('search-subscriptions-placeholder')}
            isRTL={c.isRTL}
          />
          <Select
            value={c.subscriptionStatusFilter}
            onChange={(event) => c.setSubscriptionStatusFilter(event.target.value)}
            options={[
              { value: 'all', label: c.t('filter-all-statuses') },
              { value: 'active', label: c.t('subscription-status-active') },
              { value: 'paused', label: c.t('subscription-status-paused') },
              { value: 'cancelled', label: c.t('subscription-status-cancelled') },
            ]}
          />
          <Select
            value={c.subscriptionPackageFilter}
            onChange={(event) => c.setSubscriptionPackageFilter(event.target.value)}
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
            onClick={() => c.setShowAdvancedSubscriptionFilters((open) => !open)}
          >
            {c.t('btn-advanced-filters')}
            {c.activeSubscriptionFilterCount > 0 ? ` (${c.activeSubscriptionFilterCount})` : ''}
          </Button>
          {c.hasActiveSubscriptionFilters && (
            <Button variant="ghost" size="sm" onClick={c.clearSubscriptionFilters}>
              {c.t('btn-clear-filters')}
            </Button>
          )}
        </div>

        {c.showAdvancedSubscriptionFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)]/40 p-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--color-text-muted)]">
                {c.t('filter-start-date-from')}
              </label>
              <Input
                type="date"
                value={c.subscriptionStartDateFrom}
                onChange={(event) => c.setSubscriptionStartDateFrom(event.target.value)}
                isRTL={c.isRTL}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--color-text-muted)]">
                {c.t('filter-start-date-to')}
              </label>
              <Input
                type="date"
                value={c.subscriptionStartDateTo}
                onChange={(event) => c.setSubscriptionStartDateTo(event.target.value)}
                isRTL={c.isRTL}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--color-text-muted)]">
                {c.t('filter-end-date-from')}
              </label>
              <Input
                type="date"
                value={c.subscriptionEndDateFrom}
                onChange={(event) => c.setSubscriptionEndDateFrom(event.target.value)}
                isRTL={c.isRTL}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--color-text-muted)]">
                {c.t('filter-end-date-to')}
              </label>
              <Input
                type="date"
                value={c.subscriptionEndDateTo}
                onChange={(event) => c.setSubscriptionEndDateTo(event.target.value)}
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

      {showSkeleton ? (
        <TableSkeleton rows={5} columns={6} />
      ) : (
        <div
          className={`relative transition-opacity ${showFetchingOverlay ? 'opacity-60' : ''}`}
          aria-busy={showFetchingOverlay}
        >
          <Table
            isRTL={c.isRTL}
            data={c.subscriptions}
            emptyState={
              <EmptyState
                title={c.t('subscriptions-empty')}
                description={
                  c.hasActiveSubscriptionFilters
                    ? c.t('subscriptions-filter-empty')
                    : c.t('subscriptions-empty-desc')
                }
              />
            }
            columns={[
              {
                key: 'trainee',
                align: 'center',
                header: c.t('page-trainee'),
                render: (sub) => sub.users?.full_name || sub.users?.email || c.t('na'),
              },
              {
                key: 'package',
                align: 'center',
                header: c.t('page-package'),
                render: (sub) =>
                  c.isRTL
                    ? sub.packages?.name_ar || sub.packages?.name_en
                    : sub.packages?.name_en || sub.packages?.name_ar,
              },
              {
                key: 'status',
                align: 'center',
                header: c.t('page-status'),
                render: (sub) => {
                  const variant =
                    sub.status === 'active'
                      ? 'success'
                      : sub.status === 'paused'
                        ? 'warning'
                        : sub.status === 'cancelled'
                          ? 'danger'
                          : 'neutral';
                  return <Badge variant={variant}>{sub.status || c.t('na')}</Badge>;
                },
              },
              {
                key: 'start_date',
                align: 'center',
                header: c.t('page-start-date'),
                render: (sub) => (
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {sub.start_date ? new Date(sub.start_date).toLocaleDateString() : c.t('na')}
                  </span>
                ),
              },
              {
                key: 'end_date',
                align: 'center',
                header: c.t('page-end-date'),
                render: (sub) => (
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : c.t('na')}
                  </span>
                ),
              },
              {
                key: 'actions',
                align: 'center',
                header: c.t('th-actions'),
                render: (sub) => (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => c.handleManageSubscription(sub.id, sub.status)}>
                      <i className="fas fa-sliders-h text-[var(--color-primary)] me-1" aria-hidden="true" />
                      {c.t('btn-manage')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        c.setActiveTrainee({
                          id: sub.user_id,
                          full_name: sub.users?.full_name,
                          email: sub.users?.email,
                        });
                        c.setShowTraineeAccessModal(true);
                      }}
                    >
                      <i className="fas fa-key text-green-600 me-1" aria-hidden="true" />
                      {c.t('btn-access')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => c.handleDeleteSubscription(sub.id)}
                      aria-label={c.t('aria-delete-subscription')}
                    >
                      <i className="fas fa-trash text-[var(--color-danger)]" aria-hidden="true" />
                    </Button>
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
        page={c.subscriptionPage}
        pageCount={c.subscriptionPageCount}
        total={c.subscriptionsTotal}
        pageSize={c.subscriptionsPageSize}
        onPageChange={c.setSubscriptionPage}
      />
    </div>
  );
}
