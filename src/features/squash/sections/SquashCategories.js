import React, { useEffect, useState } from 'react';
import { toCdnUrl } from '../../../shared/lib/cdn';
import { resolveDomainMediaUrl } from '../../../shared/lib/mediaBuckets';
import OptimizedImage from '../../fitness/sections/OptimizedImage';
import { useSquashContent } from '../../../shared/hooks/useSquashContent';
import { useSquashI18n } from '../hooks/useSquashI18n';
import { pickItemField } from '../utils/localize';
import { useSquashThreeBackground } from '../hooks/useSquashThreeBackground';

const SquashCategories = () => {
  const { t, isAr, isRTL } = useSquashI18n();
  const { data: categories = [], isLoading, error } = useSquashContent('categories');
  const [imageUrls, setImageUrls] = useState({});
  const canvasRef = useSquashThreeBackground();

  useEffect(() => {
    if (!categories.length) return;
    const urlMap = {};
    for (const category of categories) {
      const imageUrlField = category.image_url;
      const imagePathField = category.image_path;
      let resolvedUrl = null;
      if (imageUrlField && /^https?:\/\//.test(imageUrlField)) {
        resolvedUrl = toCdnUrl(imageUrlField);
      }
      if (!resolvedUrl && imagePathField && /^https?:\/\//.test(imagePathField)) {
        resolvedUrl = toCdnUrl(imagePathField);
      }
      if (!resolvedUrl) {
        const candidate = imagePathField || imageUrlField || '';
        if (candidate) {
          resolvedUrl = resolveDomainMediaUrl(imageUrlField, imagePathField || candidate, 'squash', 'categories');
        }
      }
      if (resolvedUrl) urlMap[category.id] = resolvedUrl;
    }
    setImageUrls(urlMap);
  }, [categories]);

  const handleCategoryClick = (category) => {
    const element = document.getElementById('videos');
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth' });
    const id = String(category.id);
    const nameEn = category.name_en || category.title_en || '';
    const nameAr = category.name_ar || category.title_ar || '';
    sessionStorage.setItem('selectedCategory', id);
    sessionStorage.setItem('categoryNameEn', nameEn);
    sessionStorage.setItem('categoryNameAr', nameAr);
    window.dispatchEvent(
      new CustomEvent('categorySelected', { detail: { categoryId: id, categoryNameEn: nameEn, categoryNameAr: nameAr } })
    );
  };

  return (
    <section id="categories" className="section-py relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-gray-50/90" style={{ zIndex: 1 }} />

      <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 gradient-text">{t('categories.title')}</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] mx-auto" />
          <p className="text-gray-600 mt-4">{t('categories.subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-600">{t('common.error')}</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-gray-600">{t('categories.empty')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => {
              const imageUrl = imageUrls[category.id];
              const title = pickItemField(category, isAr, 'name_en', 'name_ar') || pickItemField(category, isAr, 'title_en', 'title_ar');
              const description = pickItemField(category, isAr, 'description_en', 'description_ar');
              return (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(category)}
                  role="button"
                  tabIndex={0}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 cursor-pointer"
                >
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {imageUrl ? (
                      <OptimizedImage src={imageUrl} alt={title} className="w-full h-full object-cover" width={600} height={400} loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)]">
                        <i className="fas fa-table-tennis text-white text-5xl" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                    {description && <p className="text-gray-600 mb-4">{description}</p>}
                    <span className="text-[var(--color-primary)] font-semibold">
                      {t('categories.viewVideos')}
                      <i className={`fas fa-arrow-right ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                    </span>
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

export default SquashCategories;
