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
import {
  LandingPackageGrid,
  LandingPackageCard,
  LandingPackageHeader,
  LandingPackageDescription,
  LandingPackageFeatures,
  LandingPackageDuration,
  LandingPackageSubscribeButton,
  filterAvailableDurations,
} from '../../../shared/components/LandingPackageCard';
import { buildPackageColorMap, isPlatinumPackage } from '../../../shared/lib/packageColors';

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

  const packageColors = useMemo(() => buildPackageColorMap(packages), [packages]);

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
            <LandingPackageGrid>
              {packages.map((pkg) => {
                const features = parseFeatures(pkg);
                const isSubscribed = subscriptionStates[pkg.id] === 'subscribed';
                const packageColor = getPackageColor(pkg);
                const isPlatinum = isPlatinumPackage(pkg, packageColor);

                const availableDurations = filterAvailableDurations(pkg);

                const defaultDuration = availableDurations[0]?.months ?? 1;
                const selectedMonths = availableDurations.some(
                  (d) => d.months === (selectedDurations[pkg.id] || defaultDuration)
                )
                  ? selectedDurations[pkg.id] || defaultDuration
                  : defaultDuration;
                const { egp: displayEgp, usd: displayUsd } = getPackageDurationPrice(pkg, selectedMonths);

                return (
                  <LandingPackageCard key={pkg.id} isRTL={isRTL}>
                    <LandingPackageHeader
                      packageColor={packageColor}
                      isPlatinum={isPlatinum}
                      title={pickItemField(pkg, isAr, 'name_en', 'name_ar')}
                      priceHtml={formatPrice(displayEgp, displayUsd)}
                      durationLabel={
                        pkg.duration_days != null
                          ? `${pkg.duration_days} ${t('packages.days')}`
                          : null
                      }
                    />

                    <div className="px-6 pt-4">
                      <LandingPackageDescription>
                        {pickItemField(pkg, isAr, 'description_en', 'description_ar')}
                      </LandingPackageDescription>
                    </div>

                    <LandingPackageFeatures
                      features={features}
                      expanded={!!expandedFeatures[pkg.id]}
                      onToggle={() =>
                        setExpandedFeatures((prev) => ({
                          ...prev,
                          [pkg.id]: !prev[pkg.id],
                        }))
                      }
                      isRTL={isRTL}
                      isAr={isAr}
                      packageColor={packageColor}
                    />

                    {!isSubscribed && (
                      <LandingPackageDuration
                        isAr={isAr}
                        pkg={pkg}
                        availableDurations={availableDurations}
                        selectedMonths={selectedMonths}
                        onSelect={(months) =>
                          setSelectedDurations((prev) => ({ ...prev, [pkg.id]: months }))
                        }
                        packageColor={packageColor}
                        displayEgp={displayEgp}
                        displayUsd={displayUsd}
                        disabled={subscribingPackageId === pkg.id}
                      />
                    )}

                    <LandingPackageSubscribeButton
                      packageColor={packageColor}
                      isSubscribed={isSubscribed}
                      loading={subscribingPackageId === pkg.id}
                      loadingLabel={isAr ? 'جاري الاشتراك...' : 'Subscribing…'}
                      label={getSubscribeButtonText(pkg)}
                      onClick={() => (isSubscribed ? handleViewDetails(pkg) : handleSubscribe(pkg))}
                      disabled={subscribingPackageId === pkg.id}
                      data-package-id={pkg.id}
                    />
                  </LandingPackageCard>
                );
              })}
            </LandingPackageGrid>

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
