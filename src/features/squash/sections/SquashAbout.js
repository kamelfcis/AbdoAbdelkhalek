import React from 'react';
import OptimizedImage from '../../fitness/sections/OptimizedImage';
import { useSquashI18n } from '../hooks/useSquashI18n';
import { useSquashThreeBackground } from '../hooks/useSquashThreeBackground';
import { unsplashImages } from '../assets/unsplashImages';

const SquashAbout = React.memo(() => {
  const { t, isRTL } = useSquashI18n();
  const canvasRef = useSquashThreeBackground();

  const handleNavClick = (section) => {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="about-me" className="section-py relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/90 to-white/90" style={{ zIndex: 1 }} />

      <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">{t('about.title')}</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] mx-auto mb-6" />
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{t('about.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                <OptimizedImage
                  src={unsplashImages.about}
                  alt={t('about.title')}
                  className="w-full h-96 object-cover"
                  width={800}
                  height={384}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
              </div>
            </div>

            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>{t('about.p1')}</p>
              <p>{t('about.p2')}</p>
            </div>
          </div>

          <div className="text-center mt-16">
            <a
              href="#packages"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('packages');
              }}
              className="inline-flex items-center bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white px-8 py-4 rounded-full font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <i className={`fas fa-arrow-down ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span>{t('about.cta')}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

SquashAbout.displayName = 'SquashAbout';

export default SquashAbout;
