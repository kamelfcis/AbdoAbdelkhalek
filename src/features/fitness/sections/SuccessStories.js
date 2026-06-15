import React, { useState, useEffect, useRef } from 'react';
import { LazySplide, LazySplideSlide } from '../../../shared/components/LazySplide';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import { useSuccessStories } from '../../../shared/hooks/useSuccessStories';
import OptimizedImage from './OptimizedImage';
import { resolveMediaUrl } from '../../../shared/lib/cdn';

const SuccessStories = React.memo(({ onAlert }) => {
  const { currentLanguage } = useLanguage();
  const { data: stories = [], isLoading: loading, error } = useSuccessStories();
  const splideRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const [autoplayProgress, setAutoplayProgress] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const canvasRef = useRef(null);
  const paginationRef = useRef(null);
  const THREE = window?.THREE;

  // Handle errors from the query
  useEffect(() => {
    if (error) {
      console.error('Error fetching success stories:', error);
      onAlert?.('Error loading success stories');
    }
  }, [error, onAlert]);

  useEffect(() => {
    if (!canvasRef.current || !THREE) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      (canvas.clientWidth || window.innerWidth) /
        (canvas.clientHeight || window.innerHeight),
      0.1,
      1000
    );
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setClearColor(0x000000, 0);

    const resizeRenderer = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resizeRenderer();
    window.addEventListener('resize', resizeRenderer);

    const particlesCount = 220;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const palette = [
      new THREE.Color('var(--color-primary-light)'),
      new THREE.Color('var(--color-primary)'),
      new THREE.Color('var(--color-primary-dark)'),
    ];

    for (let i = 0; i < particlesCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.085,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x0074b7, 1.2, 100);
    pointLight1.position.set(6, 6, 6);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xbfd7ed, 1, 80);
    pointLight2.position.set(-6, -4, 6);
    scene.add(pointLight2);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      particles.rotation.x += 0.0015;
      particles.rotation.y += 0.002;
      particles.rotation.z += 0.0008;

      const time = Date.now() * 0.001;
      pointLight1.position.x = Math.sin(time * 0.6) * 6;
      pointLight1.position.z = Math.cos(time * 0.6) * 6;
      pointLight2.position.x = Math.cos(time * 0.4) * -6;
      pointLight2.position.z = Math.sin(time * 0.4) * 5;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeRenderer);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [THREE]);

  useEffect(() => {
    if (splideRef.current && stories.length > 0) {
      const splide = splideRef.current.splide;
      if (splide && splide.options.autoplay) {
        const interval = splide.options.interval || 5000;
        
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
  }, [stories, isAutoplayPaused]);

  useEffect(() => {
    if (!stories.length || !splideRef.current || !paginationRef.current) return;

    const splide = splideRef.current.splide;
    if (!splide) return;

    const paginationEl = paginationRef.current;
    paginationEl.innerHTML = '';

    const dots = stories.map((_, index) => {
      const button = document.createElement('button');
      button.className =
        'relative w-3 h-3 rounded-full bg-[var(--color-border)] hover:bg-[var(--color-primary)] transition-all duration-500 mx-1.5 hover:scale-150 group focus:outline-none';
      const glow = document.createElement('span');
      glow.className =
        'absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] opacity-0 blur-sm transition-opacity duration-300';
      button.appendChild(glow);
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.5)';
        glow.style.opacity = '0.6';
      });
      button.addEventListener('mouseleave', () => {
        if (!button.classList.contains('is-active')) {
          button.style.transform = 'scale(1)';
          glow.style.opacity = '0';
        }
      });
      button.addEventListener('click', () => {
        splide.go(index);
      });
      paginationEl.appendChild(button);
      return button;
    });

    const updateActiveDot = (index) => {
      dots.forEach((dot, i) => {
        const glow = dot.firstChild;
        if (i === index) {
          dot.classList.add('is-active');
          dot.style.transform = 'scale(1.8)';
          dot.style.background =
            'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%)';
          dot.style.boxShadow = '0 0 20px rgba(0,116,183,0.45)';
          glow.style.opacity = '0.9';
        } else {
          dot.classList.remove('is-active');
          dot.style.transform = 'scale(1)';
          dot.style.background = '#d1d5db';
          dot.style.boxShadow = 'none';
          glow.style.opacity = '0';
        }
      });
    };

    const syncActiveDot = () => {
      const realIndex = splide.index % stories.length;
      updateActiveDot(realIndex);
    };

    splide.on('mounted move', syncActiveDot);
    syncActiveDot();

    return () => {
      splide.off('mounted move', syncActiveDot);
    };
  }, [stories, currentLanguage]);


  const resolveImageUrl = (url, path) => resolveMediaUrl(url, path, 'success-stories');

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

  const splideOptions = {
    type: 'loop',
    perPage: 3,
    perMove: 1,
    gap: '2rem',
    padding: '2rem',
    autoplay: true,
    interval: 5000,
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
        interval: 5500,
        speed: 900,
      },
      768: {
        perPage: 1,
        gap: '1rem',
        padding: '1rem',
        interval: 6000,
        speed: 800,
      },
    },
  };

  return (
    <section
      id="success"
      className="section-py relative overflow-hidden wow fadeInLeft"
      data-wow-duration="0.75s"
      data-wow-delay="0s"
    >
      <canvas
        ref={canvasRef}
        id="stories-three-canvas"
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0, width: '100%', height: '100%' }}
        width="1900"
        height="1200"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/90 to-[var(--color-bg-muted)]/90"
        style={{ zIndex: 1 }}
      ></div>

      <div
        className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-[var(--color-primary-light)]/20 to-[var(--color-primary)]/20 rounded-full blur-3xl transform -translate-x-36 -translate-y-36"
        style={{ zIndex: 0 }}
      ></div>
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[var(--color-primary)]/20 to-[var(--color-primary-light)]/20 rounded-full blur-3xl transform translate-x-48 translate-y-48"
        style={{ zIndex: 0 }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-[var(--color-primary-light)]/10 to-[var(--color-primary)]/10 rounded-full blur-2xl transform -translate-x-32 -translate-y-32"
        style={{ zIndex: 0 }}
      ></div>

      <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] rounded-full mb-6 shadow-lg">
            <i className="fas fa-trophy text-white text-2xl"></i>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 pb-2 gradient-text">
            {getTranslation('success-title', currentLanguage)}
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] mx-auto mb-8 rounded-full"></div>
          {currentLanguage === 'ar' ? (
            <p className="text-xl text-[var(--color-text-muted)] max-w-3xl mx-auto leading-relaxed">
              اكتشف رحلات التحول المذهلة للاعبين الذين حققوا أحلامهم من خلال التدريب العلمي والمتابعة المتخصصة
            </p>
          ) : (
            <p className="text-xl text-[var(--color-text-muted)] max-w-3xl mx-auto leading-relaxed">
              Discover the amazing transformation journeys of players who achieved their dreams through
              scientific training and specialized follow-up
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-[var(--color-surface)] p-6 rounded-xl shadow-lg animate-pulse">
                <div className="h-6 bg-[var(--color-bg-muted)] rounded mb-4 w-2/3"></div>
                <div className="h-4 bg-[var(--color-bg-muted)] rounded mb-6 w-full"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-[300px] bg-[var(--color-bg-muted)] rounded-lg"></div>
                  <div className="h-[300px] bg-[var(--color-bg-muted)] rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">
              {currentLanguage === 'ar' ? 'حدث خطأ أثناء تحميل قصص النجاح' : 'Error loading success stories'}
            </p>
          </div>
        ) : stories.length > 0 ? (
          <div className="relative">
            <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-20 hidden lg:block">
              <button
                onClick={handlePrev}
                className="w-16 h-16 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-bg-muted)] rounded-full shadow-2xl hover:shadow-[0_0_30px_rgba(0,116,183,0.5)] transition-all duration-500 flex items-center justify-center group hover:scale-125 hover:rotate-[-10deg] border-2 border-transparent hover:border-[var(--color-primary)] backdrop-blur-sm relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                <i className={`fas fa-chevron-${currentLanguage === 'ar' ? 'right' : 'left'} text-[var(--color-primary)] text-xl group-hover:text-[var(--color-text-inverse)] transition-all duration-300 relative z-10 group-hover:scale-110`}></i>
                <span className="absolute inset-0 rounded-full border-2 border-[var(--color-primary)] opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700"></span>
              </button>
            </div>
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-20 hidden lg:block">
              <button
                onClick={handleNext}
                className="w-16 h-16 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-bg-muted)] rounded-full shadow-2xl hover:shadow-[0_0_30px_rgba(0,116,183,0.5)] transition-all duration-500 flex items-center justify-center group hover:scale-125 hover:rotate-[10deg] border-2 border-transparent hover:border-[var(--color-primary)] backdrop-blur-sm relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                <i className={`fas fa-chevron-${currentLanguage === 'ar' ? 'left' : 'right'} text-[var(--color-primary)] text-xl group-hover:text-[var(--color-text-inverse)] transition-all duration-300 relative z-10 group-hover:scale-110`}></i>
                <span className="absolute inset-0 rounded-full border-2 border-[var(--color-primary)] opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700"></span>
              </button>
            </div>

            <LazySplide ref={splideRef} options={splideOptions} aria-label="Success Stories">
              {stories.map((story) => {
                const beforeSrc = resolveImageUrl(story.before_image_url, story.before_image_path);
                const afterSrc = resolveImageUrl(story.after_image_url, story.after_image_path);

                return (
                  <LazySplideSlide key={story.id}>
                    <div className="bg-[var(--color-surface)] p-6 pb-8 rounded-xl shadow-lg mx-4 h-full">
                      <div className="flex flex-col h-full justify-center">
                        <h3 className="text-2xl font-bold mb-4 gradient-text">
                          {currentLanguage === 'ar' ? (story.title_ar || 'قصة نجاح') : (story.title_en || 'Success Story')}
                        </h3>
                        {(story.content_en || story.content_ar) && (
                          <p className="text-[var(--color-text)] mb-6 flex-grow">
                            {currentLanguage === 'ar' ? (story.content_ar || story.content_en) : (story.content_en || story.content_ar)}
                          </p>
                        )}

                        {beforeSrc && afterSrc ? (
                          <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6 w-full">
                            <div className="w-full">
                              <div className="relative overflow-hidden rounded-lg">
                                <OptimizedImage
                                  src={beforeSrc}
                                  alt={currentLanguage === 'ar' ? 'قبل' : 'Before'}
                                  className="w-full h-[180px] sm:h-[449px] md:h-[280px] lg:h-[300px] object-cover bg-[var(--color-bg-muted)] transition-transform duration-500 hover:scale-105"
                                  width={600}
                                  height={450}
                                  loading="lazy"
                                  priority={false}
                                  onError={() => {}}
                                />
                                <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] sm:text-xs md:text-sm font-bold py-1 px-2 sm:px-3 md:px-4 rounded-full shadow-md">
                                  {currentLanguage === 'ar' ? 'قبل' : 'Before'}
                                </span>
                              </div>
                            </div>
                            <div className="w-full">
                              <div className="relative overflow-hidden rounded-lg">
                                <OptimizedImage
                                  src={afterSrc}
                                  alt={currentLanguage === 'ar' ? 'بعد' : 'After'}
                                  className="w-full h-[180px] sm:h-[449px] md:h-[280px] lg:h-[300px] object-cover bg-[var(--color-bg-muted)] transition-transform duration-500 hover:scale-105"
                                  width={600}
                                  height={450}
                                  loading="lazy"
                                  priority={false}
                                  onError={() => {}}
                                />
                                <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gradient-to-r from-green-500 to-teal-600 text-white text-[10px] sm:text-xs md:text-sm font-bold py-1 px-2 sm:px-3 md:px-4 rounded-full shadow-md">
                                  {currentLanguage === 'ar' ? 'بعد' : 'After'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (beforeSrc || afterSrc) ? (
                          <div className="text-center mb-6">
                            <div className="relative overflow-hidden rounded-lg mb-2 max-w-md mx-auto">
                              <OptimizedImage
                                src={beforeSrc || afterSrc}
                                alt={currentLanguage === 'ar' ? (beforeSrc ? 'قبل' : 'بعد') : (beforeSrc ? 'Before' : 'After')}
                                className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
                                width={600}
                                height={400}
                                loading="lazy"
                                priority={false}
                                onError={() => {}}
                              />
                            </div>
                            <p className="text-sm font-semibold text-[var(--color-text-muted)] bg-[var(--color-bg-muted)] py-1 px-3 rounded-full inline-block">
                              {currentLanguage === 'ar' ? (beforeSrc ? 'قبل' : 'بعد') : (beforeSrc ? 'Before' : 'After')}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </LazySplideSlide>
                );
              })}
            </LazySplide>

            <div className="flex flex-col items-center mt-8 space-y-4">
              <div
                className="flex justify-center"
                ref={paginationRef}
              ></div>

              <div className="w-full max-w-md">
                <div className="h-1 bg-[var(--color-bg-muted)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] transition-all duration-100"
                    style={{ width: `${autoplayProgress * 100}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={toggleAutoplay}
                className="flex items-center space-x-2 bg-[var(--color-surface)] px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105"
                title="Toggle Autoplay"
              >
                <i className={`fas ${isAutoplayPaused ? 'fa-play' : 'fa-pause'} text-[var(--color-primary)] group-hover:text-[var(--color-primary-light)] transition-colors`}></i>
                <span className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                  {isAutoplayPaused
                    ? getTranslation('autoplay-text-play', currentLanguage)
                    : getTranslation('autoplay-text-pause', currentLanguage)}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-muted)]">
              {currentLanguage === 'ar' ? 'لا توجد قصص نجاح متاحة حالياً' : 'No success stories available yet.'}
            </p>
          </div>
        )}

        {stories.length > 0 && (
          <div className="text-center mt-16">
            <div className="bg-[var(--color-surface)]/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-4">
                {currentLanguage === 'ar' ? 'كن القصة التالية' : 'Be the Next Story'}
              </h3>
              <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed">
                {currentLanguage === 'ar' 
                  ? 'ابدأ رحلتك نحو الاحتراف مع برامج تدريبية مخصصة ومتابعة متخصصة'
                  : 'Start your journey towards professionalism with customized training programs and specialized follow-up'}
              </p>
              <a
                href="#packages"
                className="inline-flex items-center bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white px-8 py-4 rounded-full font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <i className={`fas fa-rocket ${currentLanguage === 'ar' ? 'ml-3' : 'mr-3'}`}></i>
                <span>{currentLanguage === 'ar' ? 'ابدأ رحلتك الآن' : 'Start Your Journey Now'}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

SuccessStories.displayName = 'SuccessStories';

export default SuccessStories;
