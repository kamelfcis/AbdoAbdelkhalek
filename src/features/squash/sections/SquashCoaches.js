import React from 'react';
import OptimizedImage from '../../fitness/sections/OptimizedImage';
import { useSquashContent } from '../../../shared/hooks/useSquashContent';
import { useSquashI18n } from '../hooks/useSquashI18n';
import { pickItemField } from '../utils/localize';
import { resolveDomainMediaUrl } from '../../../shared/lib/mediaBuckets';
import { getUnsplashUrl } from '../assets/unsplashImages';

const SquashCoaches = () => {
  const { t, isAr } = useSquashI18n();
  const { data = [], isLoading, error } = useSquashContent('coaches');

  return (
    <section id="coaches" className="section-py relative overflow-hidden bg-[var(--color-bg-muted)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 gradient-text">{t('coaches.title')}</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] mx-auto mb-6" />
          <p className="text-[var(--color-text-muted)]">{t('coaches.subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[var(--color-surface)] rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-600">{t('common.error')}</p>
        ) : data.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)]">{t('coaches.empty')}</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((coach) => {
              const imageSrc =
                resolveDomainMediaUrl(coach.image_url, coach.image_path, 'squash', 'coaches') ||
                getUnsplashUrl('coach');
              return (
                <div key={coach.id} className="bg-[var(--color-surface)] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
                  <OptimizedImage
                    src={imageSrc}
                    alt={pickItemField(coach, isAr, 'name_en', 'name_ar')}
                    className="w-full h-56 object-cover"
                    width={800}
                    height={400}
                    loading="lazy"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[var(--color-text)]">
                      {pickItemField(coach, isAr, 'name_en', 'name_ar')}
                    </h3>
                    <p className="text-[var(--color-text-muted)] mt-2 line-clamp-4">
                      {pickItemField(coach, isAr, 'description_en', 'description_ar')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default SquashCoaches;
