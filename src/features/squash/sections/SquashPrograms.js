import React from 'react';
import OptimizedImage from '../../fitness/sections/OptimizedImage';
import { useSquashContent } from '../../../shared/hooks/useSquashContent';
import { useSquashI18n } from '../hooks/useSquashI18n';
import { pickItemField } from '../utils/localize';
import { resolveDomainMediaUrl } from '../../../shared/lib/mediaBuckets';
import { getUnsplashUrl } from '../assets/unsplashImages';

const SquashPrograms = () => {
  const { t, isAr } = useSquashI18n();
  const { data = [], isLoading, error } = useSquashContent('programs');

  return (
    <section id="programs" className="section-py relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 gradient-text">{t('programs.title')}</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] mx-auto mb-6" />
          <p className="text-gray-600">{t('programs.subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-600">{t('common.error')}</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-600">{t('programs.empty')}</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((program) => {
              const imageSrc =
                resolveDomainMediaUrl(program.image_url, program.image_path, 'squash', 'programs') ||
                getUnsplashUrl('program');
              return (
                <div key={program.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <OptimizedImage
                    src={imageSrc}
                    alt={pickItemField(program, isAr, 'name_en', 'name_ar')}
                    className="w-full h-48 object-cover"
                    width={800}
                    height={400}
                    loading="lazy"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800">
                      {pickItemField(program, isAr, 'name_en', 'name_ar')}
                    </h3>
                    <p className="text-gray-600 mt-2 line-clamp-4">
                      {pickItemField(program, isAr, 'description_en', 'description_ar')}
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

export default SquashPrograms;
