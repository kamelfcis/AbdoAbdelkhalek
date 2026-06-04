import React, { useRef } from 'react';
import { LazySplide, LazySplideSlide } from '../../../shared/components/LazySplide';
import OptimizedImage from '../../fitness/sections/OptimizedImage';
import { useSquashContent } from '../../../shared/hooks/useSquashContent';
import { resolveDomainMediaUrl } from '../../../shared/lib/mediaBuckets';
import { useSquashI18n } from '../hooks/useSquashI18n';
import { pickItemField } from '../utils/localize';
import { useSquashThreeBackground } from '../hooks/useSquashThreeBackground';

const SquashSuccessStories = React.memo(() => {
  const { t, isAr } = useSquashI18n();
  const { data: stories = [], isLoading, error } = useSquashContent('successStories');
  const canvasRef = useSquashThreeBackground();
  const splideRef = useRef(null);

  const splideOptions = {
    type: 'loop',
    perPage: 3,
    perMove: 1,
    gap: '2rem',
    padding: '2rem',
    autoplay: true,
    interval: 5000,
    pauseOnHover: true,
    arrows: false,
    pagination: true,
    breakpoints: {
      1024: { perPage: 2 },
      768: { perPage: 1 },
    },
  };

  const resolveImage = (url, path) => resolveDomainMediaUrl(url, path, 'squash', 'successStories');

  return (
    <section id="success-stories" className="section-py relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-gray-50/90" style={{ zIndex: 1 }} />

      <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">{t('stories.title')}</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] mx-auto mb-6" />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t('stories.subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg animate-pulse h-64" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-600">{t('common.error')}</p>
        ) : stories.length === 0 ? (
          <p className="text-center text-gray-600">{t('stories.empty')}</p>
        ) : (
          <LazySplide ref={splideRef} options={splideOptions} aria-label={t('stories.title')}>
            {stories.map((story) => {
              const beforeSrc = resolveImage(story.before_image_url, story.before_image_path);
              const afterSrc = resolveImage(story.after_image_url, story.after_image_path);
              return (
                <LazySplideSlide key={story.id}>
                  <div className="bg-white p-6 rounded-xl shadow-lg mx-4 h-full">
                    <h3 className="text-2xl font-bold mb-4 gradient-text">
                      {pickItemField(story, isAr, 'title_en', 'title_ar')}
                    </h3>
                    <p className="text-gray-700 mb-6">
                      {pickItemField(story, isAr, 'content_en', 'content_ar')}
                    </p>
                    {(beforeSrc || afterSrc) && (
                      <div className="grid grid-cols-2 gap-4">
                        {beforeSrc && (
                          <div className="relative rounded-lg overflow-hidden">
                            <OptimizedImage src={beforeSrc} alt={t('transform.before')} className="w-full h-48 object-cover" width={400} height={300} loading="lazy" />
                            <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold py-1 px-2 rounded-full">
                              {t('transform.before')}
                            </span>
                          </div>
                        )}
                        {afterSrc && (
                          <div className="relative rounded-lg overflow-hidden">
                            <OptimizedImage src={afterSrc} alt={t('transform.after')} className="w-full h-48 object-cover" width={400} height={300} loading="lazy" />
                            <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold py-1 px-2 rounded-full">
                              {t('transform.after')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </LazySplideSlide>
              );
            })}
          </LazySplide>
        )}
      </div>
    </section>
  );
});

SquashSuccessStories.displayName = 'SquashSuccessStories';

export default SquashSuccessStories;
