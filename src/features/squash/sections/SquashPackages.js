import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { formatPrice } from '../../../shared/lib/currency';
import { getPackageDurationPrice } from '../../../shared/lib/packageDurationPricing';
import { useSquashContent } from '../../../shared/hooks/useSquashContent';
import { useSquashI18n } from '../hooks/useSquashI18n';
import { pickItemField } from '../utils/localize';
import { useSquashThreeBackground } from '../hooks/useSquashThreeBackground';
import { squashService } from '../../../shared/api/squashService';
import { queryKeys } from '../../../shared/lib/queryKeys';
import { getTranslation } from '../../../utils/translations';
import { loginPath } from '../../../shared/lib/authRoutes';
import PackageDetailsModal from '../../../shared/components/PackageDetailsModal';

const SquashPackages = ({ onAlert, userSession, userProfile }) => {
  const { t, isAr, isRTL } = useSquashI18n();
  const queryClient = useQueryClient();
  const { data: packagesData = [], isLoading, error } = useSquashContent('packages');
  const canvasRef = useSquashThreeBackground();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmingSubscription, setConfirmingSubscription] = useState(false);
  const [subscribingPackageId, setSubscribingPackageId] = useState(null);
  const [subscriptionStates, setSubscriptionStates] = useState({});
  const [expandedFeatures, setExpandedFeatures] = useState({});
  const [selectedDurations, setSelectedDurations] = useState({});

  const packages = useMemo(() => {
    return [...packagesData].sort((a, b) => {
      const priceA = parseFloat(a.price_egp) || 0;
      const priceB = parseFloat(b.price_egp) || 0;
      if (priceA !== priceB) return priceA - priceB;
      return (parseFloat(a.price_usd) || 0) - (parseFloat(b.price_usd) || 0);
    });
  }, [packagesData]);

  useEffect(() => {
    if (packages.length === 0) return;
    setSelectedDurations((prev) => {
      const next = { ...prev };
      let changed = false;
      packages.forEach((pkg) => {
        if (next[pkg.id] == null) {
          const avail =
            Array.isArray(pkg.available_durations) && pkg.available_durations.length > 0
              ? [...pkg.available_durations].sort((a, b) => a - b)
              : [1, 3, 6];
          next[pkg.id] = avail[0];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [packages]);

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

  const closeModal = useCallback(() => {
    setShowModal(false);
    setConfirmingSubscription(false);
  }, []);

  const handleConfirmSubscription = useCallback(async () => {
    if (!selectedPackage || !userSession) return;

    const durationMonths =
      selectedDurations[selectedPackage.id] ??
      (Array.isArray(selectedPackage.available_durations) && selectedPackage.available_durations.length > 0
        ? selectedPackage.available_durations[0]
        : 1);

    setSubscribingPackageId(selectedPackage.id);
    try {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      await squashService.createSubscription({
        userId: userSession.user.id,
        packageId: selectedPackage.id,
        status: 'active',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        durationMonths,
      });
      onAlert?.(isAr ? 'تم الاشتراك بنجاح!' : 'Subscription successful!');
      closeModal();
      await updateSubscriptionButtonStates();
      queryClient.invalidateQueries({ queryKey: queryKeys.packages('squash') });
    } catch (err) {
      console.error('Error subscribing:', err);
      onAlert?.(isAr ? 'حدث خطأ أثناء الاشتراك' : 'Error subscribing to package');
    } finally {
      setSubscribingPackageId(null);
    }
  }, [
    selectedPackage,
    selectedDurations,
    userSession,
    isAr,
    onAlert,
    closeModal,
    updateSubscriptionButtonStates,
    queryClient,
  ]);

  const handleSubscribe = useCallback(
    (pkg) => {
      if (!userSession) {
        window.location.href = loginPath('squash');
        return;
      }

      setSelectedPackage(pkg);
      setConfirmingSubscription(true);
      setShowModal(true);
    },
    [userSession]
  );

  const handleViewDetails = useCallback((pkg) => {
    setSelectedPackage(pkg);
    setConfirmingSubscription(false);
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
          text: 'text-[var(--color-text)]',
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

  const selectedDurationMonths = selectedPackage
    ? selectedDurations[selectedPackage.id] ??
      (Array.isArray(selectedPackage.available_durations) && selectedPackage.available_durations.length > 0
        ? selectedPackage.available_durations[0]
        : 1)
    : 1;

  return (
    <section id="packages" className="section-py relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/90 to-[var(--color-bg-muted)]/90" style={{ zIndex: 1 }} />

      <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 gradient-text">{t('packages.title')}</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] mx-auto mb-6" />
          <p className="text-[var(--color-text-muted)]">{t('packages.subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[var(--color-surface)] rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-600">{t('common.error')}</p>
        ) : packages.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)]">{t('packages.empty')}</p>
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

                const availableDurations = [
                  { months: 1, labelEn: '1 Mo', labelAr: 'شهر' },
                  { months: 3, labelEn: '3 Mo', labelAr: '3 أشهر' },
                  { months: 6, labelEn: '6 Mo', labelAr: '6 أشهر' },
                ].filter(({ months }) => {
                  if (months === 1) return (pkg.allow_1_month ?? pkg.allow1Month) !== false;
                  if (months === 3) return (pkg.allow_3_months ?? pkg.allow3Months) !== false;
                  return (pkg.allow_6_months ?? pkg.allow6Months) !== false;
                });

                const defaultDuration = availableDurations[0]?.months ?? 1;
                const selectedMonths = availableDurations.some(
                  (d) => d.months === (selectedDurations[pkg.id] || defaultDuration)
                )
                  ? selectedDurations[pkg.id] || defaultDuration
                  : defaultDuration;
                const { egp: displayEgp, usd: displayUsd } = getPackageDurationPrice(pkg, selectedMonths);

                return (
                  <div
                    key={pkg.id}
                    className="flex flex-col bg-[var(--color-surface)] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-2"
                    dir={isRTL ? 'rtl' : 'ltr'}
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
                      <div
                        className={`text-xl font-semibold ${isPlatinum ? 'text-white' : ''}`}
                        dangerouslySetInnerHTML={{ __html: formatPrice(displayEgp, displayUsd) }}
                      />
                      {pkg.duration_days != null && (
                        <p className="text-sm opacity-80 mt-1">
                          {pkg.duration_days} {t('packages.days')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 p-6">
                      <p className="text-[var(--color-text-muted)] mb-4">
                        {pickItemField(pkg, isAr, 'description_en', 'description_ar')}
                      </p>
                      {features.length > 0 && (
                        <div className="mb-6 flex-1">
                          <ul className="space-y-3">
                            {(expandedFeatures[pkg.id] ? features : features.slice(0, 4)).map((feature, idx) => (
                              <li key={idx} className="flex items-start group">
                                <div
                                  className={`flex-shrink-0 mt-1 ${isRTL ? 'ml-3' : 'mr-3'}`}
                                  style={{ color: packageColor.solid }}
                                >
                                  <i className="fas fa-check-circle text-lg" />
                                </div>
                                <span className="text-[var(--color-text)] text-sm leading-relaxed flex-1 group-hover:text-[var(--color-text)] transition-colors">
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                          {features.length > 4 && (
                            <button
                              type="button"
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

                      {!isSubscribed && (
                        <div className="border-t border-[var(--color-border)] pt-4 mb-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                            {isAr ? 'مدة الاشتراك' : 'Duration'}
                          </p>
                          {availableDurations.length > 1 ? (
                            <div
                              className="grid gap-2 mb-3"
                              style={{ gridTemplateColumns: `repeat(${availableDurations.length}, minmax(0, 1fr))` }}
                            >
                              {availableDurations.map(({ months, labelEn, labelAr }) => {
                                const isSelected = selectedMonths === months;
                                const tierPrice = getPackageDurationPrice(pkg, months);
                                const priceHint = tierPrice.egp
                                  ? `${tierPrice.egp.toLocaleString()} EGP`
                                  : tierPrice.usd
                                    ? `$${tierPrice.usd}`
                                    : null;
                                return (
                                  <button
                                    key={months}
                                    type="button"
                                    onClick={() =>
                                      setSelectedDurations((prev) => ({ ...prev, [pkg.id]: months }))
                                    }
                                    disabled={subscribingPackageId === pkg.id}
                                    aria-pressed={isSelected}
                                    style={
                                      isSelected
                                        ? {
                                            background: `linear-gradient(135deg, ${packageColor.gradientFrom}, ${packageColor.gradientTo})`,
                                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)',
                                          }
                                        : {
                                            background: 'rgba(255,255,255,0.07)',
                                            border: '1px solid rgba(0,0,0,0.12)',
                                          }
                                    }
                                    className={`py-2.5 rounded-xl text-xs font-bold leading-tight min-h-[44px] flex flex-col items-center justify-center gap-0.5 ${
                                      isSelected
                                        ? packageColor.text
                                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'
                                    }`}
                                  >
                                    <span>{isAr ? labelAr : labelEn}</span>
                                    {priceHint && (
                                      <span className={`text-[10px] font-semibold ${isSelected ? 'opacity-90' : 'opacity-70'}`}>
                                        {priceHint}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm font-semibold mb-3" style={{ color: packageColor.solid }}>
                              {isAr ? availableDurations[0]?.labelAr ?? 'شهر' : availableDurations[0]?.labelEn ?? '1 Mo'}
                            </p>
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => (isSubscribed ? handleViewDetails(pkg) : handleSubscribe(pkg))}
                        disabled={subscribingPackageId === pkg.id}
                        className={`w-full ${packageColor.text} py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all ${
                          isSubscribed ? 'opacity-75' : ''
                        }`}
                        style={{
                          background: `linear-gradient(to right, ${packageColor.gradientFrom}, ${packageColor.gradientTo})`,
                        }}
                        data-package-id={pkg.id}
                      >
                        {subscribingPackageId === pkg.id ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true" />
                            {isAr ? 'جاري الاشتراك...' : 'Subscribing…'}
                          </>
                        ) : (
                          getSubscribeButtonText(pkg)
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <PackageDetailsModal
              isOpen={showModal && !!selectedPackage}
              onClose={closeModal}
              pkg={selectedPackage}
              packageName={
                selectedPackage
                  ? pickItemField(selectedPackage, isAr, 'name_en', 'name_ar')
                  : ''
              }
              description={
                selectedPackage
                  ? pickItemField(selectedPackage, isAr, 'description_en', 'description_ar')
                  : ''
              }
              features={selectedPackage ? parseFeatures(selectedPackage) : []}
              packageColor={selectedPackage ? getPackageColor(selectedPackage) : undefined}
              domain="squash"
              language={lang}
              isRTL={isRTL}
              durationMonths={selectedDurationMonths}
              confirmingSubscription={confirmingSubscription}
              subscribing={subscribingPackageId === selectedPackage?.id}
              onConfirm={handleConfirmSubscription}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default SquashPackages;
