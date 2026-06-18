import React from 'react';
import { mediaThumbUrl, deriveCardThumbStoragePath } from '../../../shared/lib/cdn';
import { resolveDomainMediaUrl, getSharedContentMediaBuckets } from '../../../shared/lib/mediaBuckets';
import OptimizedImage from '../../fitness/sections/OptimizedImage';
import { useSquashContent } from '../../../shared/hooks/useSquashContent';
import { useSquashI18n } from '../hooks/useSquashI18n';
import { pickItemField } from '../utils/localize';
import { useSquashThreeBackground } from '../hooks/useSquashThreeBackground';

const SQUASH_CATEGORY_BUCKET = getSharedContentMediaBuckets('squash', 'categories').categories;
const CARD_THUMB_WIDTH = 480;

function getSquashCategoryImageUrl(category) {
  const url = category.image_url;
  const path = category.image_path;
  const full = resolveDomainMediaUrl(url, path, 'squash', 'categories');
  if (!full && !path && !url) return null;

  const storagePath = path || url || '';
  const relativePath = /^https?:\/\//.test(storagePath) ? '' : storagePath;
  const derivedThumb = relativePath ? deriveCardThumbStoragePath(relativePath) : null;

  return (
    mediaThumbUrl(url, path, SQUASH_CATEGORY_BUCKET, {
      width: CARD_THUMB_WIDTH,
      quality: 75,
      thumbPath: derivedThumb,
    }) || full
  );
}

const SquashCategories = () => {
  const { t, isAr, isRTL } = useSquashI18n();
  const { data: categories = [], isLoading, error } = useSquashContent('categories');
  const canvasRef = useSquashThreeBackground();

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
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/90 to-[var(--color-bg-muted)]/90" style={{ zIndex: 1 }} />

      <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 gradient-text">{t('categories.title')}</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] mx-auto" />
          <p className="text-[var(--color-text-muted)] mt-4">{t('categories.subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[var(--color-surface)] rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-600">{t('common.error')}</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)]">{t('categories.empty')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => {
              const imageUrl = getSquashCategoryImageUrl(category);
              const title = pickItemField(category, isAr, 'name_en', 'name_ar') || pickItemField(category, isAr, 'title_en', 'title_ar');
              const description = pickItemField(category, isAr, 'description_en', 'description_ar');
              return (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(category)}
                  role="button"
                  tabIndex={0}
                  className="bg-[var(--color-surface)] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 cursor-pointer"
                >
                  <div className="h-48 bg-[var(--color-bg-muted)] flex items-center justify-center relative overflow-hidden">
                    {imageUrl ? (
                      <OptimizedImage src={imageUrl} alt={title} objectFit="contain" className="w-full h-full" width={600} height={400} loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)]">
                        <i className="fas fa-table-tennis text-white text-5xl" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">{title}</h3>
                    {description && <p className="text-[var(--color-text-muted)] mb-4">{description}</p>}
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
