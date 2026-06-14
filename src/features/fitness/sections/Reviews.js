import React, { useState, useEffect, useRef } from 'react';
import { LazySplide, LazySplideSlide } from '../../../shared/components/LazySplide';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import { useReviews } from '../../../shared/hooks/useReviews';
import OptimizedImage from './OptimizedImage';
import { resolveMediaUrl } from '../../../shared/lib/cdn';

const Reviews = React.memo(({ onAlert }) => {
  const { currentLanguage } = useLanguage();
  const { data: reviews = [], isLoading: loading, error } = useReviews();
  const splideRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const [autoplayProgress, setAutoplayProgress] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

  // Handle errors from the query
  useEffect(() => {
    if (error) {
      console.error('Error fetching reviews:', error);
      onAlert?.('Error loading reviews');
    }
  }, [error, onAlert]);

  useEffect(() => {
    if (splideRef.current && reviews.length > 0) {
      const splide = splideRef.current.splide;
      if (splide && splide.options.autoplay) {
        const interval = splide.options.interval || 6000;
        
        const updateProgress = () => {
          if (!isAutoplayPaused && splideRef.current) {
            const elapsed = Date.now() - startTimeRef.current;
            const progress = Math.min(elapsed / interval, 1);
            setAutoplayProgress(progress);
            
            if (progress >= 1) {
              startTimeRef.current = Date.now(); // Reset for next cycle
            }
          } else {
            setAutoplayProgress(0);
          }
        };
        
        const progressInterval = setInterval(updateProgress, 100);
        
        // Reset progress when slide changes
        const handleMove = () => {
          startTimeRef.current = Date.now();
          setAutoplayProgress(0);
        };
        
        if (splide.root) {
          splide.root.addEventListener('splide:move', handleMove);
        }
        
        return () => {
          clearInterval(progressInterval);
          if (splide.root) {
            splide.root.removeEventListener('splide:move', handleMove);
          }
        };
      }
    }
  }, [reviews, isAutoplayPaused]);


  const resolveImageUrl = (url, path) => resolveMediaUrl(url, path, 'reviews');

  const handlePrev = () => {
    if (splideRef.current?.splide) {
      splideRef.current.splide.go('<');
    }
  };

  const handleNext = () => {
    if (splideRef.current?.splide) {
      splideRef.current.splide.go('>');
    }
  };

  const toggleAutoplay = () => {
    if (splideRef.current?.splide) {
      const autoplay = splideRef.current.splide.Components.Autoplay;
      if (autoplay) {
        if (isAutoplayPaused) {
          autoplay.play();
        } else {
          autoplay.pause();
        }
        setIsAutoplayPaused(!isAutoplayPaused);
      }
    }
  };

  const openReviewImageModal = (imageUrl) => {
    // Create modal for full-size review image
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
    modal.onclick = () => modal.remove();
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = 'max-w-4xl max-h-[90vh] object-contain';
    img.onclick = (e) => e.stopPropagation();
    
    modal.appendChild(img);
    document.body.appendChild(modal);
  };

  const splideOptions = {
    type: 'loop',
    perPage: 3,
    perMove: 1,
    gap: '2rem',
    padding: '2rem',
    autoplay: true,
    interval: 6000,
    pauseOnHover: true,
    pauseOnFocus: true,
    resetProgress: false,
    arrows: false,
    pagination: false,
    speed: 1000,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    drag: 'free',
    flickPower: 300,
    flickMaxPages: 1,
    focus: 'center',
    trimSpace: false,
    updateOnMove: true,
    breakpoints: {
      1024: {
        perPage: 2,
        gap: '1.5rem',
        padding: '1.5rem',
        interval: 7000,
        speed: 900,
      },
      768: {
        perPage: 1,
        gap: '1rem',
        padding: '1rem',
        interval: 8000,
        speed: 800,
      },
    },
  };

  return (
    <section id="reviews" className="section-py relative overflow-hidden bg-gray-50">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/90 to-white/90" style={{ zIndex: 1 }}></div>
      
      <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full mb-6 shadow-lg">
            <i className="fab fa-whatsapp text-white text-3xl"></i>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 pb-2 bg-gradient-to-r from-green-400 via-green-600 to-green-800 bg-clip-text text-transparent">
            {getTranslation('reviews-title', currentLanguage)}
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto mb-8 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {getTranslation('reviews-subtitle', currentLanguage)}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white p-4 rounded-xl shadow-lg animate-pulse">
                <div className="h-[500px] bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">
              {currentLanguage === 'ar' ? 'حدث خطأ أثناء تحميل الآراء' : 'Error loading reviews'}
            </p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="relative">
            {/* Custom Navigation Arrows */}
            <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-20 hidden lg:block">
              <button
                onClick={handlePrev}
                className="w-16 h-16 bg-gradient-to-br from-white to-gray-50 rounded-full shadow-2xl hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all duration-500 flex items-center justify-center group hover:scale-125 hover:rotate-[-10deg] border-2 border-transparent hover:border-green-600 backdrop-blur-sm relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                <i className={`fas fa-chevron-${currentLanguage === 'ar' ? 'right' : 'left'} text-green-600 text-xl group-hover:text-white transition-all duration-300 relative z-10 group-hover:scale-110`}></i>
                <span className="absolute inset-0 rounded-full border-2 border-green-600 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700"></span>
              </button>
            </div>
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-20 hidden lg:block">
              <button
                onClick={handleNext}
                className="w-16 h-16 bg-gradient-to-br from-white to-gray-50 rounded-full shadow-2xl hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all duration-500 flex items-center justify-center group hover:scale-125 hover:rotate-[10deg] border-2 border-transparent hover:border-green-600 backdrop-blur-sm relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                <i className={`fas fa-chevron-${currentLanguage === 'ar' ? 'left' : 'right'} text-green-600 text-xl group-hover:text-white transition-all duration-300 relative z-10 group-hover:scale-110`}></i>
                <span className="absolute inset-0 rounded-full border-2 border-green-600 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700"></span>
              </button>
            </div>

            {/* Splide Slider */}
            <LazySplide ref={splideRef} options={splideOptions} aria-label="Customer Reviews">
              {reviews.map((review, index) => {
                const imageUrl = resolveImageUrl(review.image_url, review.image_path);
                
                return (
                  <LazySplideSlide key={review.id}>
                    <div className="bg-white p-4 rounded-xl shadow-lg mx-4 h-full">
                      <div className="flex flex-col h-full justify-center">
                        <div className="relative overflow-hidden rounded-lg">
                          <OptimizedImage
                            src={imageUrl}
                            alt={`WhatsApp Review ${index + 1}`}
                            className="w-full h-auto max-h-[500px] object-contain bg-gray-50 transition-transform duration-500 hover:scale-105 rounded-lg cursor-pointer hover:opacity-90"
                            onClick={() => openReviewImageModal(imageUrl)}
                            width={400}
                            height={600}
                            loading="lazy"
                            priority={false}
                            onError={() => {}}
                          />
                          
                          {/* WhatsApp icon overlay */}
                          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2 opacity-80">
                            <i className="fab fa-whatsapp text-sm"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </LazySplideSlide>
                );
              })}
            </LazySplide>

            {/* Progress Indicators & Controls */}
            <div className="flex flex-col items-center mt-8 space-y-4">
              {/* Autoplay Progress Bar */}
              <div className="w-full max-w-md">
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-100"
                    style={{ width: `${autoplayProgress * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Play/Pause Button */}
              <button
                onClick={toggleAutoplay}
                className="flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105"
                title="Toggle Autoplay"
              >
                <i className={`fas ${isAutoplayPaused ? 'fa-play' : 'fa-pause'} text-green-600 group-hover:text-green-400 transition-colors`}></i>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
                  {currentLanguage === 'ar' ? (isAutoplayPaused ? 'تشغيل' : 'إيقاف مؤقت') : (isAutoplayPaused ? 'Play' : 'Pause')}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {currentLanguage === 'ar' ? 'لا توجد آراء متاحة حالياً' : 'No reviews available yet.'}
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {getTranslation('reviews-cta-title', currentLanguage)}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {getTranslation('reviews-cta-desc', currentLanguage)}
            </p>
            <a
              href="https://wa.me/201123903411"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-gradient-to-r from-green-400 to-green-600 text-white px-8 py-4 rounded-full font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <i className={`fab fa-whatsapp ${currentLanguage === 'ar' ? 'ml-3' : 'mr-3'} text-xl`}></i>
              <span>{getTranslation('reviews-cta-text', currentLanguage)}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

Reviews.displayName = 'Reviews';

export default Reviews;
