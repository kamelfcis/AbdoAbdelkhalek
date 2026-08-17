import React, { useMemo, useState, useCallback } from 'react';
import { LazySplide, LazySplideSlide } from '../../../shared/components/LazySplide';
import { useSquashI18n } from '../hooks/useSquashI18n';
import { useSquashThreeBackground } from '../hooks/useSquashThreeBackground';
import { getUnsplashUrl, getSquashImageFallback } from '../assets/unsplashImages';

function HeroSlideBackground({ src, alt, priority = false }) {
  const fallback = getSquashImageFallback();
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = useCallback(() => {
    setImgSrc((current) => (current !== fallback ? fallback : current));
  }, [fallback]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
      <img
        src={imgSrc}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
        onError={handleError}
        decoding="async"
        fetchPriority={priority ? 'high' : 'low'}
        loading={priority ? 'eager' : 'lazy'}
      />
      <div className="hero-overlay absolute inset-0" aria-hidden="true" />
      <span className="sr-only">{alt}</span>
    </div>
  );
}

const SquashHero = () => {
  const { t } = useSquashI18n();
  const canvasRef = useSquashThreeBackground();

  const heroImages = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return [
      getUnsplashUrl('heroSlide1', isMobile),
      getUnsplashUrl('heroSlide2', isMobile),
      getUnsplashUrl('heroSlide3', isMobile),
    ];
  }, []);

  const handleNavClick = (section) => {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  const splideOptions = {
    type: 'loop',
    autoplay: true,
    interval: 5000,
    pauseOnHover: true,
    resetProgress: false,
    arrows: true,
    pagination: true,
  };

  const slides = [
    {
      image: heroImages[0],
      title: t('hero.title'),
      subtitle: t('hero.subtitle'),
      cta: t('hero-cta'),
      section: 'packages',
    },
    {
      image: heroImages[1],
      title: t('hero.slide2.title'),
      subtitle: t('hero.slide2.subtitle'),
      cta: t('hero.slide2.cta'),
      section: 'categories',
    },
    {
      image: heroImages[2],
      title: t('hero.slide3.title'),
      subtitle: t('hero.slide3.subtitle'),
      cta: t('hero.slide3.cta'),
      section: 'programs',
    },
  ];

  return (
    <section id="home" className="relative h-screen overflow-hidden" aria-label="Hero section">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"
        style={{ zIndex: 1 }}
        aria-hidden="true"
      />

      <div className="relative" style={{ zIndex: 2 }}>
        <LazySplide options={splideOptions} aria-label="Hero image slider">
          {slides.map((slide, index) => (
            <LazySplideSlide key={slide.section}>
              <div
                className="relative w-full h-screen"
                style={{ minHeight: '100vh' }}
                role="img"
                aria-label={slide.title}
              >
                <HeroSlideBackground src={slide.image} alt={slide.title} priority={index === 0} />
                <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
                  <div className="max-w-3xl animate-slide-up">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">{slide.title}</h1>
                    <p className="text-xl md:text-2xl mb-8 text-white">{slide.subtitle}</p>
                    <a
                      href={`#${slide.section}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(slide.section);
                      }}
                      className="inline-block bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform animate-pulse"
                      aria-label={slide.cta}
                    >
                      {slide.cta}
                    </a>
                  </div>
                </div>
              </div>
            </LazySplideSlide>
          ))}
        </LazySplide>
      </div>
    </section>
  );
};

export default SquashHero;
