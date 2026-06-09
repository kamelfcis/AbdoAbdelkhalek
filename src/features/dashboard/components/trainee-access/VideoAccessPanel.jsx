import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useVirtualizer } from '@tanstack/react-virtual';
import { EmptyState, Select, ToggleGroup, ToggleGroupItem } from '../../../../shared/ui';
import { AccessPanelToolbar, VideoAccessRow, AccessPanelShell, AccessScrollList } from '../modalHelpers';
import { VISIBILITY_ALL, VISIBILITY_PUBLIC, VISIBILITY_PRIVATE } from './accessUtils';
import { dashTemplate } from '../../utils/dashTemplate';

const ROW_HEIGHT = 52;

const VideoAccessPanel = ({
  tr,
  isAr,
  catalogVideos,
  visibleVideos,
  selectedVideos,
  videoSearch,
  onVideoSearchChange,
  videoFilterCategoryId,
  onVideoFilterCategoryChange,
  categoryFilterOptions,
  visibilityFilter,
  onVisibilityFilterChange,
  onGrantAll,
  onRevokeAll,
  onToggleVideo,
  isFilteringVideos,
  grantLabel,
  revokeLabel,
  publicLabel,
  privateLabel,
}) => {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: visibleVideos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const usePlainList =
    virtualItems.length === 0 && visibleVideos.length > 0;

  const emptyTitle = () => {
    if (catalogVideos.length === 0) return tr('videos-empty');
    if (videoSearch.trim()) return tr('trainee-access-search-no-results');
    if (visibilityFilter !== VISIBILITY_ALL || isFilteringVideos) {
      return tr('trainee-access-videos-filter-empty');
    }
    return tr('trainee-access-videos-filter-empty');
  };

  const filters =
    catalogVideos.length > 0 ? (
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <Select
          label={tr('trainee-access-videos-filter-category')}
          value={videoFilterCategoryId}
          onChange={(e) => onVideoFilterCategoryChange(e.target.value)}
          options={categoryFilterOptions}
          className="max-w-xs"
          data-testid="video-category-filter"
        />
        <ToggleGroup
          type="single"
          value={visibilityFilter}
          onValueChange={(val) => onVisibilityFilterChange(val || VISIBILITY_ALL)}
          aria-label={tr('trainee-access-filter-visibility-all')}
          data-testid="video-visibility-filter"
        >
          <ToggleGroupItem value={VISIBILITY_ALL} data-testid="visibility-all">
            {tr('trainee-access-filter-visibility-all')}
          </ToggleGroupItem>
          <ToggleGroupItem value={VISIBILITY_PUBLIC} data-testid="visibility-public">
            {tr('trainee-access-filter-visibility-public')}
          </ToggleGroupItem>
          <ToggleGroupItem value={VISIBILITY_PRIVATE} data-testid="visibility-private">
            {tr('trainee-access-filter-visibility-private')}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    ) : null;

  return (
    <AccessPanelShell
      ariaLabel={tr('trainee-access-videos-section')}
      testId="video-access-panel"
      title={tr('trainee-access-videos-section')}
      toolbar={
        <AccessPanelToolbar
          searchPlaceholder={tr('trainee-access-search-videos')}
          searchValue={videoSearch}
          onSearchChange={onVideoSearchChange}
          onGrantAll={onGrantAll}
          onRevokeAll={onRevokeAll}
          grantLabel={grantLabel}
          revokeLabel={revokeLabel}
          resultCount={visibleVideos.length}
        />
      }
      filters={filters}
    >
      {visibleVideos.length === 0 ? (
        <EmptyState icon="fa-video" title={emptyTitle()} />
      ) : (
        <>
          {isFilteringVideos && (
            <p className="mb-2 text-sm text-[var(--color-text-muted)]">
              {dashTemplate(tr('trainee-access-videos-filtered'), {
                count: visibleVideos.length,
              })}
            </p>
          )}
          <AccessScrollList
            ref={parentRef}
            className="min-h-[320px]"
            style={{ height: '320px' }}
            testId="video-virtual-list"
          >
            {usePlainList ? (
              <div className="space-y-1.5">
                {visibleVideos.map((v) => {
                  const vidId = String(v.id);
                  return (
                    <VideoAccessRow
                      key={vidId}
                      video={v}
                      label={isAr ? v.title_ar : v.title_en}
                      checked={selectedVideos.has(vidId)}
                      onChange={() => onToggleVideo(vidId)}
                      publicLabel={publicLabel}
                      privateLabel={privateLabel}
                    />
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {virtualItems.map((virtualRow) => {
                  const v = visibleVideos[virtualRow.index];
                  const vidId = String(v.id);
                  return (
                    <div
                      key={vidId}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <VideoAccessRow
                        video={v}
                        label={isAr ? v.title_ar : v.title_en}
                        checked={selectedVideos.has(vidId)}
                        onChange={() => onToggleVideo(vidId)}
                        publicLabel={publicLabel}
                        privateLabel={privateLabel}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </AccessScrollList>
        </>
      )}
    </AccessPanelShell>
  );
};

VideoAccessPanel.propTypes = {
  tr: PropTypes.func.isRequired,
  isAr: PropTypes.bool,
  catalogVideos: PropTypes.array.isRequired,
  visibleVideos: PropTypes.array.isRequired,
  selectedVideos: PropTypes.instanceOf(Set).isRequired,
  videoSearch: PropTypes.string,
  onVideoSearchChange: PropTypes.func.isRequired,
  videoFilterCategoryId: PropTypes.string.isRequired,
  onVideoFilterCategoryChange: PropTypes.func.isRequired,
  categoryFilterOptions: PropTypes.array.isRequired,
  visibilityFilter: PropTypes.string.isRequired,
  onVisibilityFilterChange: PropTypes.func.isRequired,
  onGrantAll: PropTypes.func.isRequired,
  onRevokeAll: PropTypes.func.isRequired,
  onToggleVideo: PropTypes.func.isRequired,
  isFilteringVideos: PropTypes.bool,
  grantLabel: PropTypes.string.isRequired,
  revokeLabel: PropTypes.string.isRequired,
  publicLabel: PropTypes.string,
  privateLabel: PropTypes.string,
};

export default VideoAccessPanel;
