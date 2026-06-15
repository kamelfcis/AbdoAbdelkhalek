import React from 'react';
import { AspectRatio } from 'components/ui/aspect-ratio';
import DashboardThumb from '../../../shared/ui/DashboardThumb';
import { getVideoThumbSrc } from '../crud/entityImageUtils';
import { useDashboardCoach } from '../context/DashboardCoachContext';

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) return '';
  const totalSeconds = Math.max(0, Math.floor(Number(seconds)));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function TraineeVideoCard({ video, c }) {
  const isAr = c.currentLanguage === 'ar';
  const title = isAr ? video.title_ar || video.title_en : video.title_en || video.title_ar;
  const categoryLabel = isAr
    ? video.categories?.name_ar || video.category_name_ar || ''
    : video.categories?.name_en || video.category_name_en || '';
  const { src: thumbSrc, fallbackSrc: thumbFallbackSrc } = getVideoThumbSrc(
    video,
    c.adminDomain,
    'card'
  );

  return (
    <div className="bg-[var(--color-surface)] rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all video-card relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          c.toggleFavorite(video.id);
        }}
        className={`absolute top-2 ${c.isRTL ? 'left-2' : 'right-2'} z-10 p-2 rounded-full transition-all ${
          c.isFavorite(video.id)
            ? 'bg-[var(--color-warning)] text-[var(--color-text)] hover:opacity-90'
            : 'bg-[var(--color-surface)] bg-opacity-80 text-[var(--color-text-muted)] hover:bg-opacity-100 hover:text-[var(--color-warning)]'
        }`}
        title={
          c.isFavorite(video.id)
            ? isAr
              ? 'إزالة من المفضلة'
              : 'Remove from favorites'
            : isAr
              ? 'إضافة إلى المفضلة'
              : 'Add to favorites'
        }
      >
        <i className={`fas fa-star ${c.isFavorite(video.id) ? 'text-[var(--color-text)]' : ''}`} />
      </button>

      <button
        type="button"
        onClick={() => c.handlePreviewVideo(video)}
        className="block w-full text-left cursor-pointer"
      >
        <AspectRatio ratio={16 / 9} className="relative overflow-hidden bg-[var(--color-bg-muted)]">
          {thumbSrc ? (
            <>
              <DashboardThumb
                src={thumbSrc}
                fallbackSrc={thumbFallbackSrc}
                alt={title || ''}
                className="absolute inset-0 h-full w-full"
                imgClassName="object-cover object-center"
              />
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="w-16 h-16 bg-[var(--color-surface)] bg-opacity-80 rounded-full flex items-center justify-center">
                  <i className="fas fa-play text-[var(--color-primary)] text-2xl" />
                </span>
              </span>
            </>
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <i className="fas fa-video text-[var(--color-text-muted)] text-2xl" />
            </span>
          )}
        </AspectRatio>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 text-[var(--color-text)]">{title}</h3>
          {categoryLabel && <p className="text-[var(--color-text-muted)] text-sm mb-2">{categoryLabel}</p>}
          {video.duration_seconds != null && (
            <p className="text-[var(--color-text-muted)] text-sm">{formatDuration(video.duration_seconds)}</p>
          )}
        </div>
      </button>
    </div>
  );
}

export function TraineeVideosCardGrid({ videos }) {
  const c = useDashboardCoach();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {videos.map((video) => (
        <TraineeVideoCard key={video.id} video={video} c={c} />
      ))}
    </div>
  );
}
