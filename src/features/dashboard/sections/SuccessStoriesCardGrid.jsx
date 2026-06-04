import React from 'react';
import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'components/ui/card';
import { AspectRatio } from 'components/ui/aspect-ratio';
import { cn } from 'lib/utils';
import { EmptyState } from '../../../shared/ui';
import DashboardThumb from '../../../shared/ui/DashboardThumb';
import { CardGridSkeleton } from '../../fitness/components/Skeletons';
import { getBilingualName } from '../crud/entityCellRenderers';
import { CARD_THUMB, getSuccessStoryThumbSrc } from '../crud/entityImageUtils';

function StoryImagePair({ story, side, label, domain, priority = false }) {
  const { src, fallbackSrc } = getSuccessStoryThumbSrc(story, side, domain, 'card');

  return (
    <div className="min-w-0 flex-1 space-y-1">
      <span className="block text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <AspectRatio ratio={4 / 3} className="overflow-hidden rounded-md bg-muted">
        {src ? (
          <DashboardThumb
            src={src}
            fallbackSrc={fallbackSrc}
            alt=""
            width={CARD_THUMB.width}
            height={CARD_THUMB.height}
            priority={priority}
            className="h-full w-full"
            imgClassName="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <i className="fas fa-image text-lg opacity-40" aria-hidden="true" />
          </div>
        )}
      </AspectRatio>
    </div>
  );
}

function SuccessStoryCard({
  story,
  isAr,
  t,
  domain,
  onEdit,
  onDelete,
  isMutating,
  priority = false,
}) {
  const titleCol = { fields: ['title_en', 'title_ar'] };
  const { primary, secondary } = getBilingualName(story, titleCol, isAr);
  const description = isAr
    ? story.content_ar || story.description_ar || story.content_en || story.description_en
    : story.content_en || story.description_en || story.content_ar || story.description_ar;

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md'
      )}
    >
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        <StoryImagePair
          story={story}
          side="before"
          label={t('label-before')}
          domain={domain}
          priority={priority}
        />
        <StoryImagePair
          story={story}
          side="after"
          label={t('label-after')}
          domain={domain}
          priority={priority}
        />
      </div>

      <CardHeader className="gap-3 pt-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="truncate text-base">{primary || '—'}</CardTitle>
            {secondary && secondary !== primary && (
              <CardDescription className="truncate" dir="auto">
                {secondary}
              </CardDescription>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Badge variant={story.is_public ? 'success' : 'destructive'} className="text-[10px]">
              {story.is_public ? t('filter-public') : t('filter-private')}
            </Badge>
            {story.is_featured && (
              <Badge variant="secondary" className="text-[10px]">
                {t('filter-featured')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {description && (
        <CardContent className="pt-0">
          <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
        </CardContent>
      )}

      <CardFooter className="mt-auto gap-2 border-t border-border/60 pt-4">
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(story)}
            aria-label={t('btn-edit')}
            disabled={isMutating}
          >
            <i className="fas fa-edit text-primary" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(story.id)}
            aria-label={t('btn-delete')}
            disabled={isMutating}
          >
            <i className="fas fa-trash text-destructive" aria-hidden="true" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export function SuccessStoriesCardGrid({
  stories,
  isAr,
  t,
  domain = 'fitness',
  isLoading,
  isFetching,
  isMutating = false,
  onEdit,
  onDelete,
}) {
  const showSkeleton = isLoading && stories.length === 0;
  const showFetchingOverlay = (isFetching || isMutating) && stories.length > 0;

  if (showSkeleton) {
    return <CardGridSkeleton count={6} />;
  }

  if (!stories.length) {
    return <EmptyState title={t('no-data')} description={t('entity-no-results')} />;
  }

  return (
    <div
      className={`relative transition-opacity ${showFetchingOverlay ? 'pointer-events-none opacity-60' : ''}`}
      aria-busy={showFetchingOverlay}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {stories.map((story, index) => (
          <SuccessStoryCard
            key={story.id}
            story={story}
            isAr={isAr}
            t={t}
            domain={domain}
            onEdit={onEdit}
            onDelete={onDelete}
            isMutating={isMutating}
            priority={index < 3}
          />
        ))}
      </div>
    </div>
  );
}
