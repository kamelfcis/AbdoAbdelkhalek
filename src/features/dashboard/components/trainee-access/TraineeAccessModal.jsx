import React from 'react';
import PropTypes from 'prop-types';
import { getDashboardTranslation } from '../../../../shared/i18n/dashboard';
import { Dialog, Spinner } from '../../../../shared/ui';
import { ModalFormFooter } from '../modalHelpers';
import { dashTemplate } from '../../utils/dashTemplate';
import { useTraineeAccessState } from './useTraineeAccessState';
import TraineeAccessHeader from './TraineeAccessHeader';
import AccessSummaryBar from './AccessSummaryBar';
import AccessHelpCallout from './AccessHelpCallout';
import CategoryAccessPanel from './CategoryAccessPanel';
import VideoAccessPanel from './VideoAccessPanel';
import TraineeAccessLayout from './TraineeAccessLayout';

const EMPTY_LIST = [];

const TraineeAccessModal = ({
  isOpen,
  onClose,
  trainee,
  categories: categoriesProp = EMPTY_LIST,
  videos: videosProp = EMPTY_LIST,
  onSaved,
  currentLanguage = 'en',
  domain = 'fitness',
  t,
}) => {
  const tr = t || ((key) => getDashboardTranslation(domain, currentLanguage, key));
  const isAr = currentLanguage === 'ar';

  const state = useTraineeAccessState({
    isOpen,
    trainee,
    categoriesProp,
    videosProp,
    onClose,
    onSaved,
    domain,
    isAr,
    tr,
  });

  const {
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
  } = state;

  const submitLabel = isDirty
    ? dashTemplate(tr('trainee-access-save-dirty'), { count: selectedVideos.size })
    : tr('btn-save-changes');

  const categoryPanel = (
    <CategoryAccessPanel
      tr={tr}
      isAr={isAr}
      isLoading={isLoading}
      categories={visibleCategories}
      catalogVideos={catalogVideos}
      selectedCategories={selectedCategories}
      selectedVideos={selectedVideos}
      search={categorySearch}
      onSearchChange={setCategorySearch}
      onGrantAll={grantAllCategories}
      onRevokeAll={revokeAllCategories}
      onToggleCategory={toggleCategory}
      onCategoryRowClick={setVideoFilterCategoryId}
      grantLabel={tr('btn-grant-all')}
      revokeLabel={tr('btn-revoke-all')}
    />
  );

  const videoPanel = (
    <VideoAccessPanel
      tr={tr}
      isAr={isAr}
      catalogVideos={catalogVideos}
      visibleVideos={visibleVideos}
      selectedVideos={selectedVideos}
      videoSearch={videoSearch}
      onVideoSearchChange={setVideoSearch}
      videoFilterCategoryId={videoFilterCategoryId}
      onVideoFilterCategoryChange={setVideoFilterCategoryId}
      categoryFilterOptions={categoryFilterOptions}
      visibilityFilter={visibilityFilter}
      onVisibilityFilterChange={setVisibilityFilter}
      onGrantAll={grantAllVisibleVideos}
      onRevokeAll={revokeAllVisibleVideos}
      onToggleVideo={toggleVideo}
      isFilteringVideos={isFilteringVideos}
      grantLabel={tr('btn-grant-all')}
      revokeLabel={tr('btn-revoke-all')}
      publicLabel={tr('filter-public')}
      privateLabel={tr('filter-private')}
    />
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={<TraineeAccessHeader trainee={trainee} tr={tr} />}
      size="full"
      className="rounded-2xl border border-[var(--color-border)] shadow-2xl ring-1 ring-[var(--color-primary)]/15"
      contentClassName="relative bg-[var(--color-bg-muted)]/25 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top_right,var(--color-primary)_0%,transparent_50%),radial-gradient(ellipse_at_bottom_left,var(--color-primary)_0%,transparent_45%)] before:opacity-[0.04]"
      headerClassName="border-b border-white/10 text-white [&_#modal-title]:text-white"
      headerStyle={{ background: 'var(--gradient-brand)' }}
      closeButtonClassName="text-white/90 hover:bg-white/10 hover:text-white"
      footer={
        <ModalFormFooter
          onClose={handleClose}
          isSubmitting={isSubmitting}
          onSubmit={handleSave}
          cancelLabel={tr('btn-cancel')}
          savingLabel={tr('saving')}
          submitLabel={submitLabel}
          summary={
            isDirty ? (
              <span className="text-sm text-[var(--color-text-muted)]">
                {dashTemplate(tr('trainee-access-summary'), {
                  categories: selectedCategories.size,
                  videos: selectedVideos.size,
                })}
              </span>
            ) : null
          }
        />
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-4">
          <AccessSummaryBar
            categoryCount={selectedCategories.size}
            videoCount={selectedVideos.size}
            isDirty={isDirty}
            tr={tr}
          />
          <AccessHelpCallout tr={tr} />
          <TraineeAccessLayout tr={tr} categoryPanel={categoryPanel} videoPanel={videoPanel} />
        </div>
      )}
    </Dialog>
  );
};

TraineeAccessModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  trainee: PropTypes.object,
  categories: PropTypes.array,
  videos: PropTypes.array,
  onSaved: PropTypes.func,
  currentLanguage: PropTypes.string,
  domain: PropTypes.string,
  t: PropTypes.func,
};

export default TraineeAccessModal;
