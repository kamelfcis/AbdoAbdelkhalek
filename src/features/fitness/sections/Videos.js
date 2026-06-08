import React, { useState, useEffect, useMemo } from 'react';
import { cdnUrl, toCdnUrl } from '../../../shared/lib/cdn';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import { useVideos } from '../../../shared/hooks/useVideos';
import { VideoSkeletonGrid } from '../components/Skeletons';
import OptimizedImage from './OptimizedImage';
import { loginPath } from '../../../shared/lib/authRoutes';

const Videos = ({ onAlert, userSession }) => {
  const { currentLanguage } = useLanguage();
  const { data: allVideos = [], isLoading: loading, isFetching, error } = useVideos('fitness');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [playUrl, setPlayUrl] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const categoryOptions = useMemo(() => {
    const map = new Map();
    allVideos.forEach((video) => {
      if (!video?.category_id) return;
      if (map.has(String(video.category_id))) return;
      const nameEn = video.categories?.name_en || video.category_name_en || video.title_en || 'General';
      const nameAr = video.categories?.name_ar || video.category_name_ar || video.title_ar || 'عام';
      map.set(String(video.category_id), {
        id: String(video.category_id),
        name_en: nameEn,
        name_ar: nameAr
      });
    });
    return Array.from(map.values());
  }, [allVideos]);

  const applyVideosView = (view) => {
    if (!view) return;
    sessionStorage.removeItem('videosView');
    setShowFavoritesOnly(view === 'favorites');
    setSelectedCategory(null);
    setCategoryName('');
    setCategoryFilter('all');
    setSearchTerm('');
    setAccessFilter('all');
    setVisibleCount(6);
  };

  useEffect(() => {
    applyVideosView(sessionStorage.getItem('videosView'));

    const handleVideosNav = (event) => {
      applyVideosView(event.detail?.view || sessionStorage.getItem('videosView'));
    };

    window.addEventListener('fitnessVideosNav', handleVideosNav);
    return () => window.removeEventListener('fitnessVideosNav', handleVideosNav);
  }, []);

  useEffect(() => {
    // Listen for category selection from Categories component
    const handleCategorySelected = (event) => {
      const { categoryId, categoryNameEn, categoryNameAr } = event.detail;
      const categoryIdStr = String(categoryId);
      setSelectedCategory(categoryIdStr);
      setCategoryFilter(categoryIdStr);
      setCategoryName(currentLanguage === 'ar' ? categoryNameAr : categoryNameEn);
      setSearchTerm('');
      setAccessFilter('all');
      setVisibleCount(6);
    };
    
    window.addEventListener('categorySelected', handleCategorySelected);
    
    // Check sessionStorage for selected category
    const category = sessionStorage.getItem('selectedCategory');
    const catNameEn = sessionStorage.getItem('categoryNameEn');
    const catNameAr = sessionStorage.getItem('categoryNameAr');
    if (category) {
      const categoryIdStr = String(category);
      setSelectedCategory(categoryIdStr);
      setCategoryFilter(categoryIdStr);
      setCategoryName(currentLanguage === 'ar' ? catNameAr : catNameEn);
      setSearchTerm('');
      setAccessFilter('all');
      setVisibleCount(6);
      sessionStorage.removeItem('selectedCategory');
      sessionStorage.removeItem('categoryNameEn');
      sessionStorage.removeItem('categoryNameAr');
    }
    
    return () => {
      window.removeEventListener('categorySelected', handleCategorySelected);
    };
  }, [currentLanguage]);

  useEffect(() => {
    // Update category name when language changes
    if (selectedCategory) {
      const option = categoryOptions.find((item) => String(item.id) === String(selectedCategory));
      if (option) {
        setCategoryName(currentLanguage === 'ar' ? option.name_ar : option.name_en);
      }
    }
  }, [currentLanguage, selectedCategory, categoryOptions]);

  // Handle errors from the query
  useEffect(() => {
    if (error) {
      console.error('Error fetching videos:', error);
      onAlert?.('Error loading videos');
    }
  }, [error, onAlert]);

  // Prevent video download with keyboard shortcuts and context menu
  useEffect(() => {
    if (!showModal) return;

    const handleKeyDown = (e) => {
      // Prevent Ctrl+S (Save)
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
      // Prevent Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      // Prevent F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal]);

  const isYouTube = (url) => /youtu\.be|youtube\.com/.test(url || '');

  const toYouTubeEmbed = (url) => {
    try {
      if (!url) return '';
      // Handle various YouTube URL formats
      const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
      const watchMatch = url.match(/[?&]v=([\w-]+)/);
      const embedMatch = url.match(/youtube\.com\/embed\/([\w-]+)/);
      const id = (shortMatch && shortMatch[1]) || (watchMatch && watchMatch[1]) || (embedMatch && embedMatch[1]);
      if (!id) return url; // fallback to original
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    } catch {
      return url;
    }
  };

  const resolvePlayableUrl = async (video) => {
    // Prefer explicit video_url
    if (video.video_url) {
      // If YouTube link, convert to embed with autoplay
      if (isYouTube(video.video_url)) return toYouTubeEmbed(video.video_url);
      // If it's already a full URL to a file, return as-is
      if (/^https?:\/\//.test(video.video_url)) return toCdnUrl(video.video_url);
    }

    // Try to resolve from storage path if available
    if (video.video_path) {
      // If already a full URL
      if (/^https?:\/\//.test(video.video_path)) return toCdnUrl(video.video_path);
      const normalized = String(video.video_path).replace(/^\/+/, '');
      return cdnUrl('videos', normalized);
    }
    return '';
  };

  const handleVideoClick = async (video) => {
    // Block private video for public users
    if (!userSession && !video.is_public) {
      onAlert?.(currentLanguage === 'ar' ? 'يرجى تسجيل الدخول للوصول لهذا الفيديو' : 'Please login to access this video');
      setTimeout(() => { window.location.href = loginPath('fitness'); }, 1200);
      return;
    }

    const url = await resolvePlayableUrl(video);
    if (!url) {
      onAlert?.(getTranslation('video-not-available', currentLanguage));
      return;
    }

    setPlayUrl(url);
    setSelectedVideo(video);
    setShowModal(true);
    // Prevent body scroll while modal open
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVideo(null);
    setPlayUrl('');
    document.body.style.overflow = '';
  };

  const favoriteVideoIds = useMemo(() => {
    try {
      const saved = localStorage.getItem('traineeFavoriteVideos');
      return saved ? JSON.parse(saved).map(String) : [];
    } catch {
      return [];
    }
  }, [showFavoritesOnly, allVideos]);

  const filteredVideos = useMemo(() => {
    let result = [...allVideos];

    if (showFavoritesOnly) {
      result = result.filter((video) => favoriteVideoIds.includes(String(video.id)));
    }

    if (selectedCategory) {
      result = result.filter((video) => String(video.category_id) === String(selectedCategory));
    } else if (categoryFilter !== 'all') {
      result = result.filter((video) => String(video.category_id) === String(categoryFilter));
    }

    if (accessFilter !== 'all') {
      result = result.filter((video) => (accessFilter === 'public' ? video.is_public : !video.is_public));
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (normalizedSearch) {
      result = result.filter((video) => {
        const haystack = `${video.title_en || ''} ${video.title_ar || ''} ${video.description_en || ''} ${video.description_ar || ''}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }

    return result;
  }, [allVideos, showFavoritesOnly, favoriteVideoIds, selectedCategory, categoryFilter, accessFilter, searchTerm]);

  // Memoize visible videos to prevent unnecessary re-renders
  const visibleVideos = useMemo(() => {
    return filteredVideos.slice(0, visibleCount);
  }, [filteredVideos, visibleCount]);

  const showAllVideos = () => {
    setSelectedCategory(null);
    setCategoryName('');
    setCategoryFilter('all');
    setSearchTerm('');
    setAccessFilter('all');
    setVisibleCount(6);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setAccessFilter('all');
    setShowFavoritesOnly(false);
    setSelectedCategory(null);
    setCategoryName('');
    setVisibleCount(6);
  };

  const categorySelectValue = selectedCategory ? String(selectedCategory) : categoryFilter;

  useEffect(() => {
    setVisibleCount(6);
  }, [selectedCategory, categoryFilter, accessFilter, searchTerm, allVideos]);

  return (
    <section id="videos" className="section-py relative overflow-hidden bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-16">
          {selectedCategory ? (
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex items-center flex-1">
                <button
                  onClick={showAllVideos}
                  className={`${currentLanguage === 'ar' ? 'ml-4' : 'mr-4'} text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors`}
                  aria-label="Back to all videos"
                >
                  <i className={`fas fa-arrow-${currentLanguage === 'ar' ? 'right' : 'left'} text-2xl`}></i>
                </button>
                <h2 className="text-4xl font-bold gradient-text">
                  {categoryName} {currentLanguage === 'ar' ? 'فيديوهات' : 'Videos'}
                </h2>
              </div>
              <span className="text-sm font-normal text-gray-600">
                {getTranslation('back-to-all-videos', currentLanguage)}
              </span>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4 gradient-text">
                {showFavoritesOnly
                  ? getTranslation('sidebar-my-favorites', currentLanguage)
                  : userSession
                    ? getTranslation('sidebar-my-videos', currentLanguage)
                    : getTranslation('videos-title', currentLanguage)}
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] mx-auto"></div>
            </div>
          )}
        </div>

        {loading || (isFetching && allVideos.length === 0) ? (
          <VideoSkeletonGrid count={6} />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{getTranslation('loading-videos', currentLanguage)}</p>
          </div>
        ) : (
          <>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 mb-10 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={getTranslation('videos-search-placeholder', currentLanguage)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:border-transparent"
                    aria-label={getTranslation('videos-search-placeholder', currentLanguage)}
                  />
                  <i className={`fas fa-search absolute top-1/2 ${currentLanguage === 'ar' ? 'right-4' : 'left-4'} -translate-y-1/2 text-gray-400`}></i>
                </div>
                <select
                  value={categorySelectValue}
                  onChange={(event) => {
                    const value = event.target.value;
                    setCategoryFilter(value);
                    if (value === 'all') {
                      setSelectedCategory(null);
                      setCategoryName('');
                    } else {
                      setSelectedCategory(value);
                      const option = categoryOptions.find((item) => String(item.id) === String(value));
                      if (option) {
                        setCategoryName(currentLanguage === 'ar' ? option.name_ar : option.name_en);
                      }
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:border-transparent"
                >
                  <option value="all">{getTranslation('videos-filter-category-all', currentLanguage)}</option>
                  {categoryOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {currentLanguage === 'ar' ? option.name_ar : option.name_en}
                    </option>
                  ))}
                </select>
                <select
                  value={accessFilter}
                  onChange={(event) => setAccessFilter(event.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:border-transparent"
                >
                  <option value="all">{getTranslation('videos-filter-access-all', currentLanguage)}</option>
                  <option value="public">{getTranslation('videos-filter-access-public', currentLanguage)}</option>
                  <option value="private">{getTranslation('videos-filter-access-private', currentLanguage)}</option>
                </select>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                >
                  {getTranslation('videos-clear-filters', currentLanguage)}
                </button>
              </div>
            </div>

            {visibleVideos.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => handleVideoClick(video)}
                    className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all video-card"
                  >
                    <div className="relative bg-gray-200">
                      {(() => {
                        // Get thumbnail URL - prefer thumbnail_url, fallback to thumbnail_path
                        let thumbnailUrl = toCdnUrl(video.thumbnail_url || video.thumbnail_path);
                        
                        if (video.thumbnail_path && !thumbnailUrl?.startsWith('http')) {
                          thumbnailUrl = cdnUrl('video-thumbnails', video.thumbnail_path) || cdnUrl('videos', video.thumbnail_path);
                        }
                        
                        return thumbnailUrl ? (
                          <>
                            <OptimizedImage
                            src={thumbnailUrl} 
                            alt={currentLanguage === 'ar' ? video.title_ar : video.title_en} 
                              className="w-full h-auto object-cover"
                              width={800}
                              height={450}
                            loading="lazy"
                              priority={false}
                              onError={() => {}}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition pointer-events-auto cursor-pointer">
                          <i className="fas fa-play text-[var(--color-primary)] text-2xl"></i>
                        </div>
                      </div>
                          </>
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <i className="fas fa-video text-gray-400 text-2xl"></i>
                          </div>
                        );
                      })()}
                      {!userSession && !video.is_public && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="text-white text-center">
                            <i className="fas fa-lock text-2xl mb-2"></i>
                            <p className="text-sm">
                              {currentLanguage === 'ar' ? 'يتطلب تسجيل الدخول' : 'Login Required'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">
                        {currentLanguage === 'ar' ? video.title_ar : video.title_en}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {currentLanguage === 'ar' 
                          ? (video.categories?.name_ar || video.category_name_ar || '') 
                          : (video.categories?.name_en || video.category_name_en || '')}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {video.duration_seconds ? `${Math.floor(video.duration_seconds / 60)}:${String(video.duration_seconds % 60).padStart(2, '0')}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 text-center py-16 text-gray-500">
                {getTranslation('videos-no-results', currentLanguage)}
              </div>
            )}

            {filteredVideos.length > visibleCount && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
                >
                  {getTranslation('load-more-text', currentLanguage)}
                </button>
              </div>
            )}

            {showModal && selectedVideo && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={closeModal}>
                <div className="bg-white rounded-lg p-6 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">
                      {currentLanguage === 'ar' ? selectedVideo.title_ar : selectedVideo.title_en}
                    </h3>
                    <button onClick={closeModal} className="text-gray-600 hover:text-gray-800" aria-label="Close video">
                      <i className="fas fa-times text-2xl"></i>
                    </button>
                  </div>
                  <div className="relative bg-gray-200 mb-4" 
                       onContextMenu={(e) => e.preventDefault()}
                       onDragStart={(e) => e.preventDefault()}
                       style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
                    {isYouTube(playUrl) ? (
                      <iframe
                        key={playUrl}
                        src={playUrl}
                        className="w-full h-96"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="video"
                      ></iframe>
                    ) : playUrl ? (
                      <video 
                        key={playUrl} 
                        className="w-full h-96" 
                        controls 
                        controlsList="nodownload noplaybackrate nofullscreen" 
                        disablePictureInPicture
                        autoPlay 
                        playsInline 
                        preload="metadata"
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                        onKeyDown={(e) => {
                          // Prevent common download shortcuts
                          if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
                            e.preventDefault();
                          }
                          if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                            e.preventDefault();
                          }
                        }}
                        style={{ userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'auto' }}>
                        <source src={playUrl} />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="absolute w-full h-full flex items-center justify-center text-gray-600">
                        {getTranslation('video-not-available', currentLanguage)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-600 mb-2">
                      {currentLanguage === 'ar' ? selectedVideo.category_name_ar : selectedVideo.category_name_en}
                    </p>
                    <p className="text-gray-700">
                      {currentLanguage === 'ar' ? selectedVideo.description_ar : selectedVideo.description_en}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Videos;

