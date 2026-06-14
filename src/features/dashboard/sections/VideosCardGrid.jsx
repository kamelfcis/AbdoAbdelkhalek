import React from 'react';
import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'components/ui/card';
import { AspectRatio } from 'components/ui/aspect-ratio';
import { cn } from 'lib/utils';
import { EmptyState } from '../../../shared/ui';
import DashboardThumb from '../../../shared/ui/DashboardThumb';
import { CardGridSkeleton } from '../../fitness/components/Skeletons';
import { VIDEOS_PAGE_SIZE } from '../constants/pagination';

function VideoCard({
  video,
  isAr,
  t,
  thumb,
  categoryLabel,
  durationLabel,
  onPreview,
  onWarmPreview,
  onEdit,
  onAccess,
  onDelete,
}) {
  const title = isAr ? video.title_ar || video.title_en : video.title_en || video.title_ar;
  const { src: thumbSrc, fallbackSrc: thumbFallbackSrc } = thumb || {};

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md'
      )}
      onMouseEnter={() => onWarmPreview?.(video)}
    >
      <button
        type="button"
        onClick={() => onPreview(video)}
        onFocus={() => onWarmPreview?.(video)}
        onPointerDown={() => onWarmPreview?.(video, true)}
        className="block w-full text-left"
        aria-label={t('btn-preview')}
      >
        <AspectRatio
          ratio={16 / 9}
          className="relative overflow-hidden rounded-lg bg-muted ring-1 ring-border/60"
        >
          {thumbSrc ? (
            <DashboardThumb
              src={thumbSrc}
              fallbackSrc={thumbFallbackSrc}
              alt=""
              priority
              instant
              className="absolute inset-0 h-full w-full"
              imgClassName="object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              <i className="fas fa-play text-2xl opacity-50" aria-hidden="true" />
            </div>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white opacity-0 transition group-hover:opacity-100">
            {t('btn-preview')}
          </span>
        </AspectRatio>
      </button>

      <CardHeader className="gap-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="truncate text-base">{title || '—'}</CardTitle>
            <p className="truncate text-sm text-muted-foreground">{categoryLabel}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Badge variant={video.is_public ? 'success' : 'destructive'} className="text-[10px]">
              {video.is_public ? t('filter-public') : t('filter-private')}
            </Badge>
            <span className="text-xs text-muted-foreground">{durationLabel}</span>
          </div>
        </div>
      </CardHeader>

      {(video.description_en || video.description_ar) && (
        <CardContent className="pt-0">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {isAr ? video.description_ar || video.description_en : video.description_en || video.description_ar}
          </p>
        </CardContent>
      )}

      <CardFooter className="mt-auto gap-2 border-t border-border/60 pt-4">
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(video)}
            aria-label={t('btn-edit')}
          >
            <i className="fas fa-edit text-primary" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAccess(video)}
            aria-label={t('btn-access')}
          >
            <i className="fas fa-user-lock text-green-600" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(video.id)}
            aria-label={t('btn-delete')}
          >
            <i className="fas fa-trash text-destructive" aria-hidden="true" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export function VideosCardGrid({
  videos,
  isAr,
  t,
  resolveThumb,
  getCategoryLabel,
  formatDurationSeconds,
  isLoading,
  isFetching,
  videoThumbsReady = true,
  onPreview,
  onWarmPreview,
  onEdit,
  onAccess,
  onDelete,
  emptyTitle,
  emptyDescription,
}) {
  const showDataSkeleton = isLoading && videos.length === 0;

  if (showDataSkeleton) {
    return <CardGridSkeleton count={VIDEOS_PAGE_SIZE} />;
  }

  if (!videos.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  if (!videoThumbsReady) {
    return <CardGridSkeleton count={VIDEOS_PAGE_SIZE} />;
  }

  return (
    <div
      className={cn('relative transition-opacity', isFetching && 'opacity-60')}
      aria-busy={isFetching}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            isAr={isAr}
            t={t}
            thumb={resolveThumb(video)}
            categoryLabel={getCategoryLabel(video.category_id)}
            durationLabel={formatDurationSeconds(video.duration_seconds)}
            onPreview={onPreview}
            onWarmPreview={onWarmPreview}
            onEdit={onEdit}
            onAccess={onAccess}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
