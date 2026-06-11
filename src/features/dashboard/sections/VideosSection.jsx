import React from 'react';
import { useDashboardCoach } from '../context/DashboardCoachContext';
import { SectionHeader } from '../../../shared/layout';
import { Button, Input, Select, Table, Badge, EmptyState } from '../../../shared/ui';
import DashboardThumb from '../../../shared/ui/DashboardThumb';
import { VideosTableSkeleton } from '../../fitness/components/Skeletons';
import { EntityPaginationBar } from '../crud/EntityPaginationBar';
import { ViewModeToggle } from '../crud/ViewModeToggle';
import { useViewMode } from '../crud/useViewMode';
import { TABLE_THUMB } from '../crud/entityImageUtils';
import { VideosCardGrid } from './VideosCardGrid';

export function VideosSection() {
  const c = useDashboardCoach();
  const { viewMode, setViewMode } = useViewMode('videos', { defaultMode: 'table' });
  const thumb = (video) => c.resolveVideoAsset?.(video, 'thumbnail', 'table');
  const showSkeleton = c.videosLoading && c.paginatedVideos.length === 0;
  const showFetchingOverlay = c.videosFetching && c.paginatedVideos.length > 0;

  const tableColumns = [
    {
      key: 'title',
      align: 'center',
      header: c.t('th-video-title'),
      render: (video) => (
        <div className="flex flex-col items-center gap-2">
          <button type="button" onClick={() => c.handlePreviewVideo(video)} className="relative group">
            <div className="w-20 h-12 rounded-lg overflow-hidden shadow border border-[var(--color-border)]">
              {thumb(video) ? (
                <DashboardThumb
                  src={thumb(video)}
                  alt={c.isRTL ? video.title_ar : video.title_en}
                  width={TABLE_THUMB.width}
                  height={TABLE_THUMB.height}
                  priority
                  instant
                  className="w-full h-full"
                  imgClassName="object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] text-sm">
                  <i className="fas fa-play" aria-hidden="true" />
                </div>
              )}
            </div>
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs opacity-0 group-hover:opacity-100 transition">
              {c.t('btn-preview')}
            </span>
          </button>
          <div className="space-y-1 text-center">
            <p className="font-semibold text-[var(--color-text)] truncate max-w-[180px]">
              {c.isRTL ? video.title_ar || video.name_ar : video.title_en || video.name_en}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 max-w-[220px]">
              {c.isRTL ? video.description_ar : video.description_en}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      align: 'center',
      header: c.t('th-category'),
      render: (video) => c.getCategoryLabel(video.category_id),
    },
    {
      key: 'duration',
      align: 'center',
      header: c.t('page-duration'),
      render: (video) => c.formatDurationSeconds(video.duration_seconds),
    },
    {
      key: 'public',
      align: 'center',
      header: c.t('th-public'),
      render: (video) => (
        <Badge variant={video.is_public ? 'success' : 'danger'}>
          {video.is_public ? c.t('yes') : c.t('no')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      align: 'center',
      header: c.t('th-actions'),
      render: (video) => (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              c.setEditingVideoId(video.id);
              c.setShowVideoForm(true);
            }}
            aria-label={c.t('btn-edit')}
          >
            <i className="fas fa-edit text-[var(--color-primary)]" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              c.setActiveVideo(video);
              c.setShowVideoAccessModal(true);
            }}
            aria-label={c.t('btn-access')}
          >
            <i className="fas fa-user-lock text-green-600" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => c.handleDeleteVideo(video.id)}
            aria-label={c.t('btn-delete')}
          >
            <i className="fas fa-trash text-[var(--color-danger)]" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="section">
      <SectionHeader
        title={c.t('videos-title')}
        actions={
          <Button
            variant="primary"
            leftIcon={<i className="fas fa-plus" aria-hidden="true" />}
            onClick={() => {
              c.setEditingVideoId(null);
              c.setShowVideoForm(true);
            }}
          >
            {c.t('add-video-text')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <Input
          className="md:col-span-2 lg:col-span-2"
          type="text"
          value={c.videoSearch}
          onChange={(event) => c.setVideoSearch(event.target.value)}
          placeholder={c.t('search-videos-placeholder')}
          isRTL={c.isRTL}
        />
        <Select
          value={c.videoCategoryFilter}
          onChange={(event) => c.setVideoCategoryFilter(event.target.value)}
          options={[
            { value: 'all', label: c.t('filter-all-categories') },
            ...c.categories.map((category) => ({
              value: String(category.id),
              label: c.isRTL ? category.name_ar : category.name_en,
            })),
          ]}
        />
        <Select
          value={c.videoStatusFilter}
          onChange={(event) => c.setVideoStatusFilter(event.target.value)}
          options={[
            { value: 'all', label: c.t('filter-all-statuses') },
            { value: 'public', label: c.t('filter-public') },
            { value: 'private', label: c.t('filter-private') },
          ]}
        />
      </div>

      <div className="flex justify-end mb-4">
        <ViewModeToggle value={viewMode} onChange={setViewMode} t={c.t} isRTL={c.isRTL} />
      </div>

      {viewMode === 'cards' ? (
        <VideosCardGrid
          videos={c.paginatedVideos}
          isAr={c.isRTL}
          t={c.t}
          resolveThumb={(video) => c.resolveVideoAsset?.(video, 'thumbnail', 'card')}
          getCategoryLabel={c.getCategoryLabel}
          formatDurationSeconds={c.formatDurationSeconds}
          isLoading={c.videosLoading}
          isFetching={c.videosFetching}
          onPreview={c.handlePreviewVideo}
          onEdit={(video) => {
            c.setEditingVideoId(video.id);
            c.setShowVideoForm(true);
          }}
          onAccess={(video) => {
            c.setActiveVideo(video);
            c.setShowVideoAccessModal(true);
          }}
          onDelete={c.handleDeleteVideo}
          emptyTitle={c.t('videos-empty')}
          emptyDescription={c.t('videos-empty-desc')}
        />
      ) : showSkeleton ? (
        <VideosTableSkeleton rows={c.videosPageSize} />
      ) : (
        <div
          className={`relative transition-opacity ${showFetchingOverlay ? 'opacity-60' : ''}`}
          aria-busy={showFetchingOverlay}
        >
          <Table
            isRTL={c.isRTL}
            data={c.paginatedVideos}
            emptyState={
              <EmptyState
                title={c.t('videos-empty')}
                description={c.t('videos-empty-desc')}
              />
            }
            columns={tableColumns}
          />
        </div>
      )}

      <EntityPaginationBar
        t={c.t}
        isRTL={c.isRTL}
        page={c.videoPage}
        pageCount={c.totalVideoPages}
        total={c.videoTotal}
        pageSize={c.videosPageSize}
        onPageChange={c.setVideoPage}
      />
    </div>
  );
}
