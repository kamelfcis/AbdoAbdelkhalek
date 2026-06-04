import React from 'react';



import { SectionHeader } from '../../../shared/layout';



import { useDashboardCoach } from '../context/DashboardCoachContext';



import { useEntityCrud } from './useEntityCrud';

import { useViewMode } from './useViewMode';



import { EntityToolbar } from './EntityToolbar';

import { ViewModeToggle } from './ViewModeToggle';

import { EntityTable } from './EntityTable';

import { EntityCardGrid } from './EntityCardGrid';



import { EntityFormModal } from './EntityFormModal';



import { EntityPaginationBar } from './EntityPaginationBar';







export function GenericEntitySection({ entityKey, actionsExtra }) {



  const c = useDashboardCoach();



  const crud = useEntityCrud(entityKey, { currentLanguage: c.currentLanguage });



  const supportsCardView = Boolean(crud.config?.cardView);

  const { viewMode, setViewMode } = useViewMode(entityKey, { defaultMode: 'table' });







  if (!crud.config) {



    return <p className="text-[var(--color-text-muted)]">{c.t('domain-section-unavailable')}</p>;



  }







  const title = crud.config.titleKey



    ? c.t(crud.config.titleKey)



    : c.currentLanguage === 'ar'



      ? crud.config.titleAr



      : crud.config.titleEn;







  const addLabel = crud.config.addKey



    ? c.t(crud.config.addKey)



    : c.currentLanguage === 'ar'



      ? crud.config.addAr



      : crud.config.addEn;







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
    actionsExtra,
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



        addLabel={addLabel || c.t('btn-add-fallback')}



        onAdd={crud.openCreate}



      />



      {supportsCardView && (

        <div className="flex justify-end mb-4">

          <ViewModeToggle

            value={viewMode}

            onChange={setViewMode}

            t={c.t}

            isRTL={c.isRTL}

          />

        </div>

      )}



      {supportsCardView && viewMode === 'cards' ? (

        <EntityCardGrid {...dataViewProps} />

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



      {!crud.config.dedicatedForm && (

        <EntityFormModal

          isOpen={crud.showForm}

          onClose={crud.closeForm}

          config={crud.config}

          record={crud.editingRecord}

          onSaved={crud.onSaved}

          currentLanguage={c.currentLanguage}

          t={c.t}

        />

      )}



    </div>



  );



}


