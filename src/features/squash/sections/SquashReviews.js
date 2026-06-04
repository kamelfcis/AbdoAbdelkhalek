import React, { useRef } from 'react';
import { LazySplide, LazySplideSlide } from '../../../shared/components/LazySplide';
import OptimizedImage from '../../fitness/sections/OptimizedImage';
import { useSquashContent } from '../../../shared/hooks/useSquashContent';
import { resolveDomainMediaUrl } from '../../../shared/lib/mediaBuckets';
import { useSquashI18n } from '../hooks/useSquashI18n';

const SquashReviews = React.memo(() => {
  const { t } = useSquashI18n();
  const { data: reviews = [], isLoading, error } = useSquashContent('reviews');
  const splideRef = useRef(null);

  const splideOptions = {
    type: 'loop',
    perPage: 3,
    gap: '2rem',
    autoplay: true,
    interval: 6000,
    pauseOnHover: true,
    arrows: false,
    pagination: true,
    breakpoints: {
      1024: { perPage: 2 },
      768: { perPage: 1 },
    },
  };

  const openImage = (url) => {
    if (!url) return;
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
    modal.onclick = () => modal.remove();
    const img = document.createElement('img');
    img.src = url;
    img.className = 'max-w-4xl max-h-[90vh] object-contain';
    img.onclick = (e) => e.stopPropagation();
    modal.appendChild(img);
    document.body.appendChild(modal);
  };

  return (
    <section id="reviews" className="section-py relative overflow-hidden bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">{t('reviews.title')}</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] mx-auto mb-6" />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t('reviews.subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-lg animate-pulse h-80" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-600">{t('common.error')}</p>
        ) : reviews.length === 0 ? (
          <p className="text-center text-gray-600">{t('reviews.empty')}</p>
        ) : (
          <LazySplide ref={splideRef} options={splideOptions} aria-label={t('reviews.title')}>
            {reviews.map((review, index) => {
              const imageUrl = resolveDomainMediaUrl(review.image_url, review.image_path, 'squash', 'reviews');
              return (
                <LazySplideSlide key={review.id}>
                  <div className="bg-white p-4 rounded-xl shadow-lg mx-4">
                    <OptimizedImage
                      src={imageUrl}
                      alt={`Review ${index + 1}`}
                      className="w-full h-auto max-h-[500px] object-contain bg-gray-50 rounded-lg cursor-pointer hover:opacity-90"
                      onClick={() => openImage(imageUrl)}
                      width={400}
                      height={600}
                      loading="lazy"
                    />
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

SquashReviews.displayName = 'SquashReviews';

export default SquashReviews;
