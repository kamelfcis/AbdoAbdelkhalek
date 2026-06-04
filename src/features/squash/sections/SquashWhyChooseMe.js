import React from 'react';
import { useSquashI18n } from '../hooks/useSquashI18n';
import { useSquashThreeBackground } from '../hooks/useSquashThreeBackground';

const FEATURES = [
  { icon: 'fas fa-user-tie', keys: ['why.f1.title', 'why.f1.desc'] },
  { icon: 'fas fa-chart-line', keys: ['why.f2.title', 'why.f2.desc'] },
  { icon: 'fas fa-building', keys: ['why.f3.title', 'why.f3.desc'] },
  { icon: 'fas fa-globe', keys: ['why.f4.title', 'why.f4.desc'] },
];

const SquashWhyChooseMe = React.memo(() => {
  const { t, isRTL } = useSquashI18n();
  const canvasRef = useSquashThreeBackground();

  return (
    <section id="why-choose" className="section-py relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-gray-50/85 to-white/90" style={{ zIndex: 1 }} />

      <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">{t('why.title')}</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] mx-auto mb-6" />
            <p className="text-xl text-gray-600">{t('why.subtitle')}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {FEATURES.map(({ icon, keys }) => (
                <div
                  key={keys[0]}
                  className="bg-gradient-to-r from-[var(--color-primary-light)]/10 to-[var(--color-primary)]/10 p-6 rounded-xl border-l-4 border-[var(--color-primary)]"
                >
                  <div className={`flex items-start space-x-4 ${isRTL ? 'rtl:space-x-reverse' : ''}`}>
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] rounded-full flex items-center justify-center">
                        <i className={`${icon} text-white text-lg`} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{t(keys[0])}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{t(keys[1])}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

SquashWhyChooseMe.displayName = 'SquashWhyChooseMe';

export default SquashWhyChooseMe;
