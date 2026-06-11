import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toCdnUrl } from '../../../shared/lib/cdn';
import { resolveDomainMediaUrl } from '../../../shared/lib/mediaBuckets';
import OptimizedImage from '../../fitness/sections/OptimizedImage';
import { useSquashContent } from '../../../shared/hooks/useSquashContent';
import { useSquashI18n } from '../hooks/useSquashI18n';
import { pickItemField } from '../utils/localize';
import VideoPlayerModal from '../../../shared/components/VideoPlayerModal';
import { resolveVideoPlayUrl } from '../../../shared/lib/resolveVideoPlayUrl';
import { prefetchVideoUrl } from '../../../shared/lib/prefetchVideo';

const SquashVideos = () => {
  const { t, isAr, isRTL } = useSquashI18n();
  const { data: allVideos = [], isLoading, error } = useSquashContent('videos');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [playUrl, setPlayUrl] = useState('');
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

  const videoT = useCallback(
    (key) => {
      const map = {
        'video-fullscreen': 'videos.fullscreen',
        'video-exit-fullscreen': 'videos.exitFullscreen',
        'video-loading': 'videos.loading',
        'video-not-available': 'videos.unavailable',
      };
      return t(map[key] || key);
    },
    [t]
  );

  const handleVideoWarmup = useCallback((video) => {
    const url = resolveVideoPlayUrl(video, 'squash');
    if (url) prefetchVideoUrl(url);
  }, []);

  const filteredVideos = useMemo(() => {
    if (!selectedCategory) return allVideos;
    return allVideos.filter((v) => String(v.category_id) === String(selectedCategory));
  }, [allVideos, selectedCategory]);

  const visibleVideos = useMemo(() => filteredVideos.slice(0, visibleCount), [filteredVideos, visibleCount]);

  const handleVideoClick = (video) => {
    const url = resolveVideoPlayUrl(video, 'squash');
    if (!url) return;
    setPlayUrl(url);
    setSelectedVideo(video);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVideo(null);
    setPlayUrl('');
  };

  const showAllVideos = () => {
    setSelectedCategory(null);
    setCategoryName('');
    setVisibleCount(6);
  };

  return (
    <section id="videos" className="section-py relative overflow-hidden bg-gray-50">
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
              <p className="text-gray-600 mt-4">{t('videos.subtitle')}</p>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-600">{t('common.error')}</p>
        ) : visibleVideos.length === 0 ? (
          <p className="text-center text-gray-600">{t('videos.empty')}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleVideos.map((video) => {
                let thumbnailUrl = toCdnUrl(video.thumbnail_url || '');
                if (!thumbnailUrl && video.thumbnail_path) {
                  thumbnailUrl =
                    resolveDomainMediaUrl(video.thumbnail_url, video.thumbnail_path, 'squash', 'videoThumbnails') ||
                    resolveDomainMediaUrl(video.thumbnail_url, video.thumbnail_path, 'squash', 'videos');
                }
                return (
                  <div
                    key={video.id}
                    onClick={() => handleVideoClick(video)}
                    onMouseEnter={() => handleVideoWarmup(video)}
                    onFocus={() => handleVideoWarmup(video)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVideoClick(video)}
                    role="button"
                    tabIndex={0}
                    className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all"
                  >
                    <div className="relative bg-gray-200">
                      {thumbnailUrl ? (
                        <>
                          <OptimizedImage
                            src={thumbnailUrl}
                            alt={pickItemField(video, isAr, 'title_en', 'title_ar')}
                            className="w-full h-48 object-cover"
                            width={800}
                            height={450}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-14 h-14 bg-white/80 rounded-full flex items-center justify-center">
                              <i className="fas fa-play text-[var(--color-primary)] text-xl" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center">
                          <i className="fas fa-video text-gray-400 text-2xl" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg">{pickItemField(video, isAr, 'title_en', 'title_ar')}</h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
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

        <VideoPlayerModal
          isOpen={showModal && !!selectedVideo}
          onClose={closeModal}
          title={selectedVideo ? pickItemField(selectedVideo, isAr, 'title_en', 'title_ar') : ''}
          playUrl={playUrl}
          description={
            selectedVideo ? pickItemField(selectedVideo, isAr, 'description_en', 'description_ar') : ''
          }
          isRTL={isRTL}
          getLabel={videoT}
          notAvailableLabel={t('videos.unavailable')}
        />
      </div>
    </section>
  );
};

export default SquashVideos;
