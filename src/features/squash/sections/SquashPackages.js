import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { formatPrice } from '../../../shared/lib/currency';
import { useSquashContent } from '../../../shared/hooks/useSquashContent';
import { useSquashI18n } from '../hooks/useSquashI18n';
import { pickItemField } from '../utils/localize';
import { useSquashThreeBackground } from '../hooks/useSquashThreeBackground';
import { squashService } from '../../../shared/api/squashService';
import { queryKeys } from '../../../shared/lib/queryKeys';
import { getTranslation } from '../../../utils/translations';

const SquashPackages = ({ onAlert, userSession, userProfile }) => {
  const { t, isAr, isRTL } = useSquashI18n();
  const queryClient = useQueryClient();
  const { data: packagesData = [], isLoading, error } = useSquashContent('packages');
  const canvasRef = useSquashThreeBackground();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [subscriptionStates, setSubscriptionStates] = useState({});
  const [expandedFeatures, setExpandedFeatures] = useState({});

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

  const updateSubscriptionButtonStates = useCallback(async () => {
    if (!userSession) return;

    try {
      const userSubscriptions = await squashService.getSubscriptions();
      const states = {};
      userSubscriptions?.forEach((sub) => {
        const endDate = sub.end_date || sub.endDate;
        const packageId = sub.package_id || sub.packageId;
        const isExpired = new Date(endDate) < new Date();
        if (sub.status === 'active' && !isExpired) {
          states[packageId] = 'subscribed';
        } else if (sub.status === 'paused') {
          states[packageId] = 'paused';
        }
      });
      setSubscriptionStates(states);
    } catch (err) {
      console.error('Error updating subscription states:', err);
    }
  }, [userSession]);

  useEffect(() => {
    if (userSession) {
      updateSubscriptionButtonStates();
    }
  }, [userSession, updateSubscriptionButtonStates]);

  const handleSubscribe = useCallback(
    async (pkg) => {
      if (!userSession) {
        window.location.href = '/login.html';
        return;
      }

      const isTrainee = userProfile && !userProfile.is_coach;
      if (isTrainee) {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      const subscriptionState = subscriptionStates[pkg.id];
      if (subscriptionState === 'subscribed') {
        setSelectedPackage(pkg);
        setShowModal(true);
      } else {
        try {
          await squashService.createSubscription({
            userId: userSession.user.id,
            packageId: pkg.id,
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date(
              Date.now() + (pkg.duration_days || pkg.durationDays) * 24 * 60 * 60 * 1000
            ).toISOString(),
          });
          onAlert?.(isAr ? 'تم الاشتراك بنجاح!' : 'Subscription successful!');
          await updateSubscriptionButtonStates();
          queryClient.invalidateQueries({ queryKey: queryKeys.packages('squash') });
        } catch (err) {
          console.error('Error subscribing:', err);
          onAlert?.('Error subscribing to package');
        }
      }
    },
    [
      userSession,
      userProfile,
      isAr,
      onAlert,
      queryClient,
      subscriptionStates,
      updateSubscriptionButtonStates,
    ]
  );

  const handleViewDetails = useCallback((pkg) => {
    setSelectedPackage(pkg);
    setShowModal(true);
  }, []);

  const getSubscribeButtonText = useCallback(
    (pkg) => {
      const state = subscriptionStates[pkg.id];
      if (state === 'subscribed') {
        return isAr ? 'مشترك' : 'Subscribed';
      }
      return isAr ? 'اشترك' : getTranslation('subscribe', 'en');
    },
    [subscriptionStates, isAr]
  );

  const packageColors = useMemo(() => {
    const colorsMap = new Map();
    packages.forEach((pkg) => {
      const nameEn = (pkg.name_en || '').toLowerCase();
      const nameAr = (pkg.name_ar || '').toLowerCase();
      const isGold = nameEn.includes('gold') || nameAr.includes('ذهبي') || nameAr.includes('جولد');
      const hasPro = nameAr.includes('برو') || nameEn.includes('pro');
      const isGoldWithNutritionOrTraining =
        isGold &&
        !hasPro &&
        (nameAr.includes('تغذيه') ||
          nameAr.includes('تغذية') ||
          nameAr.includes('تمرين') ||
          nameEn.includes('nutrition') ||
          nameEn.includes('training'));

      let colorConfig;
      if (isGoldWithNutritionOrTraining) {
        colorConfig = {
          gradientFrom: 'var(--color-primary-light)',
          gradientTo: 'var(--color-primary)',
          solid: 'var(--color-primary)',
          text: 'text-white',
        };
      } else if (isGold) {
        colorConfig = {
          gradientFrom: 'rgb(244, 215, 123)',
          gradientTo: 'rgb(220, 180, 80)',
          solid: 'rgb(244, 215, 123)',
          text: 'text-gray-900',
        };
      } else if (
        nameEn.includes('platinum') ||
        nameAr.includes('بلاتيني') ||
        nameAr.includes('بلاتينوم')
      ) {
        colorConfig = {
          gradientFrom: 'rgb(157 137 255)',
          gradientTo: 'hsl(250, 73.70%, 70.20%)',
          solid: 'rgb(157 137 255)',
          text: 'text-white',
        };
      } else {
        colorConfig = {
          gradientFrom: 'var(--color-primary-light)',
          gradientTo: 'var(--color-primary)',
          solid: 'var(--color-primary)',
          text: 'text-white',
        };
      }
      colorsMap.set(pkg.id, colorConfig);
    });
    return colorsMap;
  }, [packages]);

  const getPackageColor = useCallback(
    (pkg) =>
      packageColors.get(pkg.id) || {
        gradientFrom: 'var(--color-primary-light)',
        gradientTo: 'var(--color-primary)',
        solid: 'var(--color-primary)',
        text: 'text-white',
      },
    [packageColors]
  );

  const lang = isAr ? 'ar' : 'en';

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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg) => {
                const features = parseFeatures(pkg);
                const isSubscribed = subscriptionStates[pkg.id] === 'subscribed';
                const packageColor = getPackageColor(pkg);
                const nameEn = (pkg.name_en || '').toLowerCase();
                const nameAr = (pkg.name_ar || '').toLowerCase();
                const isPlatinum =
                  packageColor.text === 'text-white' &&
                  (nameEn.includes('platinum') || nameAr.includes('بلاتيني') || nameAr.includes('بلاتينوم'));

                return (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-2"
                  >
                    <div
                      className={`${packageColor.text} p-6 text-center`}
                      style={{
                        background: `linear-gradient(to right, ${packageColor.gradientFrom}, ${packageColor.gradientTo})`,
                      }}
                    >
                      <h3 className="text-2xl font-bold mb-2">
                        {pickItemField(pkg, isAr, 'name_en', 'name_ar')}
                      </h3>
                      <p className="text-xl font-semibold">
                        <span
                          className="text-2xl"
                          style={{ color: isPlatinum ? 'white' : 'inherit' }}
                          dangerouslySetInnerHTML={{ __html: formatPrice(pkg.price_egp, pkg.price_usd) }}
                        />
                      </p>
                      {pkg.duration_days != null && (
                        <p className="text-sm opacity-80 mt-1">
                          {pkg.duration_days} {t('packages.days')}
                        </p>
                      )}
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 mb-4">
                        {pickItemField(pkg, isAr, 'description_en', 'description_ar')}
                      </p>
                      {features.length > 0 && (
                        <div className="mb-6">
                          <ul className="space-y-3">
                            {(expandedFeatures[pkg.id] ? features : features.slice(0, 4)).map((feature, idx) => (
                              <li key={idx} className="flex items-start group">
                                <div
                                  className={`flex-shrink-0 mt-1 ${isRTL ? 'ml-3' : 'mr-3'}`}
                                  style={{ color: packageColor.solid }}
                                >
                                  <i className="fas fa-check-circle text-lg" />
                                </div>
                                <span className="text-gray-700 text-sm leading-relaxed flex-1 group-hover:text-gray-900 transition-colors">
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                          {features.length > 4 && (
                            <button
                              onClick={() =>
                                setExpandedFeatures((prev) => ({
                                  ...prev,
                                  [pkg.id]: !prev[pkg.id],
                                }))
                              }
                              className="mt-4 text-sm font-medium transition-colors hover:opacity-80"
                              style={{ color: packageColor.solid }}
                              aria-expanded={!!expandedFeatures[pkg.id]}
                            >
                              {expandedFeatures[pkg.id]
                                ? isAr
                                  ? 'عرض أقل'
                                  : 'See Less'
                                : isAr
                                  ? 'عرض المزيد'
                                  : 'See More'}
                              <i
                                className={`fas fa-chevron-${expandedFeatures[pkg.id] ? 'up' : 'down'} ${isRTL ? 'mr-2' : 'ml-2'}`}
                              />
                            </button>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => (isSubscribed ? handleViewDetails(pkg) : handleSubscribe(pkg))}
                        className={`w-full ${packageColor.text} py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all ${
                          isSubscribed ? 'opacity-75' : ''
                        }`}
                        style={{
                          background: `linear-gradient(to right, ${packageColor.gradientFrom}, ${packageColor.gradientTo})`,
                        }}
                        data-package-id={pkg.id}
                      >
                        {getSubscribeButtonText(pkg)}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {showModal && selectedPackage && (
              <div
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                onClick={() => setShowModal(false)}
              >
                <div
                  className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">
                      {getTranslation('package-details-title', lang)}
                    </h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-gray-800">
                      <i className="fas fa-times text-2xl" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-700">
                          <strong>{getTranslation('price-label', lang)}:</strong>{' '}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: formatPrice(selectedPackage.price_egp, selectedPackage.price_usd),
                            }}
                          />
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-700">
                          <strong>{getTranslation('duration-label', lang)}:</strong> {selectedPackage.duration_days}{' '}
                          {getTranslation('days-label', lang)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-700">
                          <strong>{getTranslation('level-label', lang)}:</strong> {selectedPackage.level || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-700">
                          <strong>{getTranslation('type-label', lang)}:</strong> {selectedPackage.type || '-'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-700 mb-2">
                        {pickItemField(selectedPackage, isAr, 'description_en', 'description_ar')}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">{isAr ? 'المميزات' : 'Features'}</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {parseFeatures(selectedPackage).map((f, idx) => (
                          <li key={idx} className="text-gray-700">
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <i className="fas fa-video text-[var(--color-primary)]" />
                        <span className="text-gray-700">
                          {getTranslation('includes-video-feedback', lang)}:{' '}
                          {selectedPackage.includes_video_feedback ? '✔' : '✖'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <i className="fas fa-headset text-[var(--color-primary)]" />
                        <span className="text-gray-700">
                          {getTranslation('daily-support', lang)}: {selectedPackage.daily_support ? '✔' : '✖'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                    >
                      {isAr ? 'إغلاق' : 'Close'}
                    </button>
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

export default SquashPackages;
