import React from 'react';
import { SectionHeader } from '../../../shared/layout';
import { useDashboardCoach } from '../context/DashboardCoachContext';
import { useEntityCrud } from '../crud/useEntityCrud';
import { EntityToolbar } from '../crud/EntityToolbar';
import { EntityTable } from '../crud/EntityTable';
import { EntityPaginationBar } from '../crud/EntityPaginationBar';
import { ViewModeToggle } from '../crud/ViewModeToggle';
import { useViewMode } from '../crud/useViewMode';
import SuccessStoryFormModal from '../components/SuccessStoryFormModal';
import { SuccessStoriesCardGrid } from './SuccessStoriesCardGrid';

export function SuccessStoriesSection() {
  const c = useDashboardCoach();
  const crud = useEntityCrud('success-stories', { currentLanguage: c.currentLanguage });
  const { viewMode, setViewMode } = useViewMode('success-stories', { defaultMode: 'table' });

  if (!crud.config) {
    return <p className="text-[var(--color-text-muted)]">{c.t('domain-section-unavailable')}</p>;
  }

  const title = crud.config.titleKey ? c.t(crud.config.titleKey) : '';
  const addLabel = crud.config.addKey ? c.t(crud.config.addKey) : c.t('btn-add-fallback');

  const dataViewProps = {
    config: crud.config,
    data: crud.filteredItems,
    isAr: crud.isAr,
    t: c.t,
    domain: crud.adminDomain,
    isLoading: crud.isLoading,
    isFetching: crud.isFetching,
    isMutating: crud.isMutating,
    onEdit: crud.openEdit,
    onDelete: crud.deleteItem,
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
      />

      <div className="mb-4 flex justify-end">
        <ViewModeToggle value={viewMode} onChange={setViewMode} t={c.t} isRTL={c.isRTL} />
      </div>

      {viewMode === 'cards' ? (
        <SuccessStoriesCardGrid {...dataViewProps} />
      ) : (
        <EntityTable {...dataViewProps} isRTL={c.isRTL} />
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
      <SuccessStoryFormModal
        isOpen={crud.showForm}
        onClose={crud.closeForm}
        story={crud.editingRecord}
        domain={c.adminDomain}
        onSaved={crud.onSaved}
        currentLanguage={c.currentLanguage}
      />
    </div>
  );
}
