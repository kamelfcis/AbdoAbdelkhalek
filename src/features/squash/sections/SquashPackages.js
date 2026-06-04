import React, { useMemo } from 'react';
import { formatPrice } from '../../../shared/lib/currency';
import { useSquashContent } from '../../../shared/hooks/useSquashContent';
import { useSquashI18n } from '../hooks/useSquashI18n';
import { pickItemField } from '../utils/localize';
import { useSquashThreeBackground } from '../hooks/useSquashThreeBackground';

const SquashPackages = () => {
  const { t, isAr } = useSquashI18n();
  const { data: packagesData = [], isLoading, error } = useSquashContent('packages');
  const canvasRef = useSquashThreeBackground();

  const packages = useMemo(() => {
    return [...packagesData].sort((a, b) => {
      const priceA = parseFloat(a.price_egp) || 0;
      const priceB = parseFloat(b.price_egp) || 0;
      if (priceA !== priceB) return priceA - priceB;
      return (parseFloat(a.price_usd) || 0) - (parseFloat(b.price_usd) || 0);
    });
  }, [packagesData]);

  const parseFeatures = (pkg) => {
    const raw = isAr ? pkg.features_ar : pkg.features_en;
    if (Array.isArray(raw)) return raw;
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  return (
    <section id="packages" className="section-py relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-gray-50/90" style={{ zIndex: 1 }} />

      <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 gradient-text">{t('packages.title')}</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] mx-auto mb-6" />
          <p className="text-gray-600">{t('packages.subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-600">{t('common.error')}</p>
        ) : packages.length === 0 ? (
          <p className="text-center text-gray-600">{t('packages.empty')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => {
              const features = parseFeatures(pkg);
              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-2"
                >
                  <div className="bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white p-6 text-center">
                    <h3 className="text-2xl font-bold mb-2">{pickItemField(pkg, isAr, 'name_en', 'name_ar')}</h3>
                    <p
                      className="text-xl font-semibold"
                      dangerouslySetInnerHTML={{ __html: formatPrice(pkg.price_egp, pkg.price_usd) }}
                    />
                    {pkg.duration_days != null && (
                      <p className="text-sm opacity-80 mt-1">
                        {pkg.duration_days} {t('packages.days')}
                      </p>
                    )}
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{pickItemField(pkg, isAr, 'description_en', 'description_ar')}</p>
                    {features.length > 0 && (
                      <ul className="space-y-2">
                        {features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-700">
                            <i className="fas fa-check-circle text-[var(--color-primary)] mt-0.5 mr-2 rtl:ml-2 rtl:mr-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
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

export default SquashPackages;
