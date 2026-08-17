import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../../fitness/sections/OptimizedImage';
import { useSquashContent } from '../../../shared/hooks/useSquashContent';
import { useSquashI18n } from '../hooks/useSquashI18n';
import { pickItemField } from '../utils/localize';
import { useAuth } from '../../../contexts/AuthContext';
import { loginPath } from '../../../shared/lib/authRoutes';
import { buildWatchPath } from '../../../shared/lib/watchRoutes';
import { resolveVideoPlayUrl } from '../../../shared/lib/resolveVideoPlayUrl';
import { prefetchVideoUrl, warmVideoUrl } from '../../../shared/lib/prefetchVideo';
import { prefetchImageUrls } from '../../../shared/lib/prefetchImages';
import { getVideoThumbSrc } from '../../../shared/lib/videoThumb';

const SquashVideos = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { t, isAr, isRTL } = useSquashI18n();
  const { data: allVideos = [], isLoading, error } = useSquashContent('videos');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const handleCategorySelected = (event) => {
      const { categoryId, categoryNameEn, categoryNameAr } = event.detail;
      setSelectedCategory(String(categoryId));
      setCategoryName(isAr ? categoryNameAr : categoryNameEn);
      setVisibleCount(6);
    };
    window.addEventListener('categorySelected', handleCategorySelected);
    const category = sessionStorage.getItem('selectedCategory');
    if (category) {
      setSelectedCategory(String(category));
      setCategoryName(isAr ? sessionStorage.getItem('categoryNameAr') : sessionStorage.getItem('categoryNameEn'));
      sessionStorage.removeItem('selectedCategory');
      sessionStorage.removeItem('categoryNameEn');
      sessionStorage.removeItem('categoryNameAr');
    }
    return () => window.removeEventListener('categorySelected', handleCategorySelected);
  }, [isAr]);

  const handleVideoWarmup = useCallback((video, immediate = false) => {
    const url = resolveVideoPlayUrl(video, 'squash');
    if (!url) return;
    if (immediate) warmVideoUrl(url);
    else prefetchVideoUrl(url);
  }, []);

  const filteredVideos = useMemo(() => {
    if (!selectedCategory) return allVideos;
    return allVideos.filter((v) => String(v.category_id) === String(selectedCategory));
  }, [allVideos, selectedCategory]);

  const visibleVideos = useMemo(() => filteredVideos.slice(0, visibleCount), [filteredVideos, visibleCount]);

  useEffect(() => {
    if (isLoading || !visibleVideos.length) return undefined;
    const urls = visibleVideos
      .map((video) => getVideoThumbSrc(video, 'squash', 'card').src)
      .filter(Boolean);
    prefetchImageUrls(urls).catch(() => {});
    return undefined;
  }, [visibleVideos, isLoading]);

  const handleVideoClick = (video) => {
    const watchPath = buildWatchPath('squash', video.id);
    if (!session && !video.is_public) {
      navigate(loginPath('squash', watchPath));
      return;
    }
    navigate(watchPath);
  };

  const showAllVideos = () => {
    setSelectedCategory(null);
    setCategoryName('');
    setVisibleCount(6);
  };

  return (
    <section id="videos" className="section-py relative overflow-hidden bg-[var(--color-bg-muted)]">
      <div className="container mx-auto px-4">
        <div className="mb-16">
          {selectedCategory ? (
            <div className="flex items-center">
              <button type="button" onClick={showAllVideos} className={`${isRTL ? 'ml-4' : 'mr-4'} text-[var(--color-primary)]`} aria-label="Back">
                <i className={`fas fa-arrow-${isRTL ? 'right' : 'left'} text-2xl`} />
              </button>
              <h2 className="text-4xl font-bold gradient-text">
                {categoryName} — {t('nav.videos')}
              </h2>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4 gradient-text">{t('videos.title')}</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] mx-auto" />
              <p className="text-[var(--color-text-muted)] mt-4">{t('videos.subtitle')}</p>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[var(--color-surface)] rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-600">{t('common.error')}</p>
        ) : visibleVideos.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)]">{t('videos.empty')}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleVideos.map((video, index) => {
                const thumbnailUrl = getVideoThumbSrc(video, 'squash', 'card').src;
                const isAboveFold = index < 3;

                return (
                  <div
                    key={video.id}
                    onClick={() => handleVideoClick(video)}
                    onPointerDown={() => handleVideoWarmup(video, true)}
                    onMouseEnter={() => handleVideoWarmup(video)}
                    onFocus={() => handleVideoWarmup(video)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVideoClick(video)}
                    role="button"
                    tabIndex={0}
                    className="bg-[var(--color-surface)] rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all video-card"
                  >
                    <div className="relative bg-[var(--color-bg-muted)]">
                      {thumbnailUrl ? (
                        <>
                          <OptimizedImage
                            src={thumbnailUrl}
                            alt={pickItemField(video, isAr, 'title_en', 'title_ar')}
                            className="w-full h-auto object-cover"
                            width={800}
                            height={450}
                            loading={isAboveFold ? 'eager' : 'lazy'}
                            priority={isAboveFold}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-16 h-16 bg-[var(--color-surface)] bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition pointer-events-auto cursor-pointer">
                              <i className="fas fa-play text-[var(--color-primary)] text-2xl" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-48 bg-[var(--color-bg-muted)] flex items-center justify-center">
                          <i className="fas fa-video text-[var(--color-text-muted)] text-2xl" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg">{pickItemField(video, isAr, 'title_en', 'title_ar')}</h3>
                      <p className="text-[var(--color-text-muted)] text-sm mt-1 line-clamp-2">
                        {pickItemField(video, isAr, 'description_en', 'description_ar')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredVideos.length > visibleCount && (
              <div className="text-center mt-12">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + 6)}
                  className="bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
                >
                  {t('videos.loadMore')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default SquashVideos;
