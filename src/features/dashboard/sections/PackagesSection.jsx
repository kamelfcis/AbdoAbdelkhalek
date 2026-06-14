import React, { useState, useCallback } from 'react';
import { useDashboardCoach } from '../context/DashboardCoachContext';
import { SectionHeader } from '../../../shared/layout';
import { useEntityCrud } from '../crud/useEntityCrud';
import { ViewModeToggle } from '../crud/ViewModeToggle';
import { EntityToolbar } from '../crud/EntityToolbar';
import { EntityTable } from '../crud/EntityTable';
import { EntityPaginationBar } from '../crud/EntityPaginationBar';
import PackageFormModal from '../components/PackageFormModal';
import { PackagesCardGrid } from './PackagesCardGrid';

const STORAGE_KEY = 'dashboardPackagesView';

function readStoredPackagesView() {
  if (typeof window === 'undefined') return 'cards';
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'table' || v === 'cards' ? v : 'cards';
  } catch {
    return 'cards';
  }
}

function usePackagesViewMode() {
  const [viewMode, setViewModeState] = useState(readStoredPackagesView);

  const setViewMode = useCallback((mode) => {
    if (mode !== 'table' && mode !== 'cards') return;
    setViewModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  return { viewMode, setViewMode };
}

export function PackagesSection() {
  const c = useDashboardCoach();
  const crud = useEntityCrud('packages', { currentLanguage: c.currentLanguage });
  const { viewMode, setViewMode } = usePackagesViewMode();

  if (!crud.config) {
    return <p className="text-[var(--color-text-muted)]">{c.t('domain-section-unavailable')}</p>;
  }

  const title = crud.config.titleKey ? c.t(crud.config.titleKey) : 'Packages';
  const addLabel = crud.config.addKey ? c.t(crud.config.addKey) : c.t('btn-add-fallback');

  const dataViewProps = {
    config: crud.config,
    data: crud.filteredItems,
    isAr: crud.isAr,
    isRTL: crud.isAr,
    t: c.t,
    domain: crud.adminDomain,
    isLoading: crud.isLoading,
    isFetching: crud.isFetching,
    isMutating: crud.isMutating,
    onEdit: crud.openEdit,
    onDelete: crud.deleteItem,
    selectedIds: crud.selectedIds,
    onToggleRow: crud.toggleRow,
    onToggleSelectAll: crud.toggleSelectAll,
  };

  return (
    <div className="section">
      <SectionHeader title={title} />

      <EntityToolbar
        t={c.t}
        search={crud.search}
        onSearchChange={crud.setSearch}
        statusFilter={crud.statusFilter}
        onStatusFilterChange={crud.setStatusFilter}
        featuredFilter={crud.featuredFilter}
        onFeaturedFilterChange={crud.setFeaturedFilter}
        showStatusFilter={Boolean(crud.config.statusFilter)}
        showFeaturedFilter={Boolean(crud.config.featuredFilter)}
        addLabel={addLabel}
        onAdd={crud.openCreate}
        bulkDelete={Boolean(crud.config.bulkDelete)}
        selectedCount={crud.selectedCount}
        onDeleteSelected={crud.deleteSelected}
        isMutating={crud.isMutating}
      />

      <div className="flex justify-end mb-4">
        <ViewModeToggle value={viewMode} onChange={setViewMode} t={c.t} isRTL={c.isRTL} />
      </div>

      {viewMode === 'cards' ? (
        <PackagesCardGrid
          packages={crud.filteredItems}
          isAr={crud.isAr}
          t={c.t}
          isLoading={crud.isLoading}
          isMutating={crud.isMutating}
          onEdit={crud.openEdit}
          onDelete={crud.deleteItem}
          emptyTitle={c.t('no-data')}
          emptyDescription={c.t('entity-no-results')}
        />
      ) : (
        <EntityTable {...dataViewProps} />
      )}

      <EntityPaginationBar
        t={c.t}
        isRTL={c.isRTL}
        page={crud.page}
        pageCount={crud.pageCount}
        total={crud.total}
        pageSize={crud.pageSize}
        onPageChange={crud.setPage}
      />

      <PackageFormModal
        isOpen={crud.showForm}
        onClose={crud.closeForm}
        pack={crud.editingRecord}
        onSaved={crud.onSaved}
        currentLanguage={c.currentLanguage}
        domain={c.adminDomain}
        t={c.t}
      />
    </div>
  );
}
