import React from 'react';
import PropTypes from 'prop-types';
import { EmptyState, Skeleton } from '../../../../shared/ui';
import { AccessSelectableRow, AccessPanelToolbar } from '../modalHelpers';
import {
  getCategoryVideoCount,
  getCategorySelectionState,
} from './accessUtils';
import { dashTemplate } from '../../utils/dashTemplate';

const CategoryAccessPanel = ({
  tr,
  isAr,
  isLoading,
  categories,
  catalogVideos,
  selectedCategories,
  selectedVideos,
  search,
  onSearchChange,
  onGrantAll,
  onRevokeAll,
  onToggleCategory,
  onCategoryRowClick,
  grantLabel,
  revokeLabel,
}) => (
  <section aria-label={tr('trainee-access-categories-section')} data-testid="category-access-panel">
    <h3 className="mb-3 font-semibold text-[var(--color-text)]">
      {tr('trainee-access-categories-section')}
    </h3>
    <AccessPanelToolbar
      searchPlaceholder={tr('trainee-access-search-categories')}
      searchValue={search}
      onSearchChange={onSearchChange}
      onGrantAll={onGrantAll}
      onRevokeAll={onRevokeAll}
      grantLabel={grantLabel}
      revokeLabel={revokeLabel}
      resultCount={categories.length}
    />
    {isLoading ? (
      <div className="space-y-2" data-testid="category-skeleton">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rect" className="h-12" />
        ))}
      </div>
    ) : categories.length === 0 ? (
      <EmptyState
        icon="fa-folder-open"
        title={
          search.trim()
            ? tr('trainee-access-search-no-results')
            : tr('trainee-access-categories')
        }
      />
    ) : (
      <div className="max-h-[52vh] min-h-[200px] space-y-1 overflow-y-auto pe-1">
        {categories.map((cat) => {
          const catId = String(cat.id);
          const label = isAr ? cat.name_ar : cat.name_en;
          const videoCount = getCategoryVideoCount(catId, catalogVideos);
          const { checked: allVideosSelected, indeterminate: partialVideos } =
            getCategorySelectionState(catId, catalogVideos, selectedVideos);
          const isCategoryChecked = selectedCategories.has(catId);
          const showIndeterminate = partialVideos && !isCategoryChecked;
          const showChecked = isCategoryChecked || (allVideosSelected && !showIndeterminate);

          return (
            <AccessSelectableRow
              key={catId}
              id={`category-${catId}`}
              label={label}
              checked={showChecked}
              indeterminate={showIndeterminate}
              onCheckedChange={() => onToggleCategory(catId)}
              onRowClick={() => onCategoryRowClick(catId)}
              meta={dashTemplate(tr('trainee-access-videos-in-category'), { count: videoCount })}
            />
          );
        })}
      </div>
    )}
  </section>
);

CategoryAccessPanel.propTypes = {
  tr: PropTypes.func.isRequired,
  isAr: PropTypes.bool,
  isLoading: PropTypes.bool,
  categories: PropTypes.array.isRequired,
  catalogVideos: PropTypes.array.isRequired,
  selectedCategories: PropTypes.instanceOf(Set).isRequired,
  selectedVideos: PropTypes.instanceOf(Set).isRequired,
  search: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  onGrantAll: PropTypes.func.isRequired,
  onRevokeAll: PropTypes.func.isRequired,
  onToggleCategory: PropTypes.func.isRequired,
  onCategoryRowClick: PropTypes.func.isRequired,
  grantLabel: PropTypes.string.isRequired,
  revokeLabel: PropTypes.string.isRequired,
};

export default CategoryAccessPanel;
