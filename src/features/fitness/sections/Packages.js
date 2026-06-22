import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { contentService } from '../../../shared/api/contentService';
import { queryKeys } from '../../../shared/lib/queryKeys';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import { formatPrice } from '../../../shared/lib/currency';
import { getPackageDurationPrice } from '../../../shared/lib/packageDurationPricing';
import { usePackages } from '../../../shared/hooks/usePackages';
import { PackageSkeletonGrid } from '../components/Skeletons';
import { loadThreeJSOnIntersect, loadThreeJSOnInteraction } from '../../../shared/lib/threeLoader';
import { loginPath } from '../../../shared/lib/authRoutes';
import PackageDetailsModal from '../../../shared/components/PackageDetailsModal';
import SubscriptionSuccessModal from '../components/SubscriptionSuccessModal';
import {
  LandingPackageGrid,
  LandingPackageCard,
  LandingPackageHeader,
  LandingPackageFeatures,
  LandingPackageDuration,
  LandingPackageSubscribeButton,
  filterAvailableDurations,
} from '../../../shared/components/LandingPackageCard';
import { buildPackageColorMap, isPlatinumPackage } from '../../../shared/lib/packageColors';

const Packages = ({ onAlert, userSession, userProfile }) => {
  const { currentLanguage } = useLanguage();
  const isRTL = currentLanguage === 'ar';
  const queryClient = useQueryClient();
  const { data: packagesData = [], isLoading: loading, error } = usePackages();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [subscriptionStates, setSubscriptionStates] = useState({});
  const [expandedFeatures, setExpandedFeatures] = useState({});
  const [selectedDurations, setSelectedDurations] = useState({});
  const [subscribingPackageId, setSubscribingPackageId] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const canvasRef = useRef(null);

  // Sort packages by price using useMemo for better performance
  const packages = useMemo(() => {
    if (packagesData.length === 0) return [];
    return [...packagesData].sort((a, b) => {
      const priceA = parseFloat(a.price_egp) || 0;
      const priceB = parseFloat(b.price_egp) || 0;
      if (priceA !== priceB) {
        return priceA - priceB;
      }
      const usdPriceA = parseFloat(a.price_usd) || 0;
      const usdPriceB = parseFloat(b.price_usd) || 0;
      return usdPriceA - usdPriceB;
    });
  }, [packagesData]);

  // Initialise selectedDurations to the first available duration per package
  useEffect(() => {
    if (packages.length === 0) return;
    setSelectedDurations((prev) => {
      const next = { ...prev };
      let changed = false;
      packages.forEach((pkg) => {
        if (next[pkg.id] == null) {
          const avail = Array.isArray(pkg.available_durations) && pkg.available_durations.length > 0
            ? [...pkg.available_durations].sort((a, b) => a - b)
            : [1, 3, 6];
          next[pkg.id] = avail[0];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [packages]);

  // Handle errors from the query
  useEffect(() => {
    if (error) {
      console.error('Error fetching packages:', error);
      onAlert?.('Error loading packages');
    }
  }, [error, onAlert]);

  // Memoize updateSubscriptionButtonStates to prevent unnecessary calls
  const updateSubscriptionButtonStates = useCallback(async () => {
    if (!userSession) return;

    try {
      const userSubscriptions = await contentService.getSubscriptions();

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
    } catch (error) {
      console.error('Error updating subscription states:', error);
    }
  }, [userSession]);

  useEffect(() => {
    if (userSession) {
      updateSubscriptionButtonStates();
    }
  }, [userSession, updateSubscriptionButtonStates]);

  // Professional Three.js deferred loading with Intersection Observer
  useEffect(() => {
    if (!canvasRef.current) return;

    // Setup intersection observer for canvas - only load when visible
    const cleanupIntersect = loadThreeJSOnIntersect(canvasRef.current, {
      rootMargin: '200px', // Load 200px before entering viewport
      threshold: 0.1,
      once: true,
    });

    // Also load on user interaction as fallback
    const cleanupInteraction = loadThreeJSOnInteraction(['scroll', 'touchstart', 'click']);

    // Check if Three.js is ready and initialize
    let checkInterval;
    const checkAndInit = () => {
      if (window.THREE && canvasRef.current && !canvasRef.current.threeInitialized) {
        clearInterval(checkInterval);
        initThreeJS();
      }
    };

    checkInterval = setInterval(checkAndInit, 200);

    // Cleanup after 10 seconds max
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
    }, 10000);

    return () => {
      cleanupIntersect();
      cleanupInteraction();
      clearInterval(checkInterval);
      clearTimeout(timeout);
      if (canvasRef.current?.animationId) {
        cancelAnimationFrame(canvasRef.current.animationId);
      }
    };
  }, []);

  const initThreeJS = () => {
    // Ensure Three.js is loaded
    if (!window.THREE) {
      console.warn('Three.js not loaded yet');
      return;
    }
    
    if (!canvasRef.current || canvasRef.current.threeInitialized) return;
    
    const THREE = window.THREE; // Get THREE from window
    const canvas = canvasRef.current;
    canvas.threeInitialized = true;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance

    const geometry = new THREE.BufferGeometry();
    // Detect mobile and reduce particles by 50% for better performance
    const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const particlesCount = isMobile ? 50 : 100; // 50% reduction on mobile
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 10;
      posArray[i + 1] = (Math.random() - 0.5) * 10;
      posArray[i + 2] = (Math.random() - 0.5) * 10;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x0074b7,
      transparent: true,
      opacity: 0.6,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let animationId;
    let isVisible = true;

    // Pause animation when tab is not visible
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Intersection Observer to pause when section is not visible
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0 }
    );
    visibilityObserver.observe(canvas);

    function animate() {
      animationId = requestAnimationFrame(animate);
      if (isVisible && !document.hidden) {
        particles.rotation.x += 0.001;
        particles.rotation.y += 0.002;
        renderer.render(scene, camera);
      }
    }

    animate();
    canvas.animationId = animationId;
    canvas.cleanup = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      visibilityObserver.disconnect();
      if (renderer) {
        renderer.dispose();
      }
      if (geometry) {
        geometry.dispose();
      }
      if (material) {
        material.dispose();
      }
    };
  };

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleSubscribe = useCallback(async (pkg) => {
    if (!userSession) {
      window.location.href = loginPath('fitness');
      return;
    }

    const durationMonths = selectedDurations[pkg.id] || 1;
    setSubscribingPackageId(pkg.id);
    try {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      await contentService.createSubscription({
        userId: userSession.user.id,
        packageId: pkg.id,
        status: 'active',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        durationMonths,
      });
      setSuccessData({
        packageName: currentLanguage === 'ar' ? pkg.name_ar : pkg.name_en,
        durationMonths,
      });
      await updateSubscriptionButtonStates();
      queryClient.invalidateQueries({ queryKey: queryKeys.packages() });
    } catch (error) {
      console.error('Error subscribing:', error);
      onAlert?.(currentLanguage === 'ar' ? 'حدث خطأ أثناء الاشتراك' : 'Error subscribing to package');
    } finally {
      setSubscribingPackageId(null);
    }
  }, [userSession, selectedDurations, currentLanguage, onAlert, updateSubscriptionButtonStates, queryClient]);

  const handleViewDetails = useCallback((pkg) => {
    setSelectedPackage(pkg);
    setShowModal(true);
  }, []);

  const getSubscribeButtonText = useCallback((pkg) => {
    const state = subscriptionStates[pkg.id];
    if (state === 'subscribed') {
      return currentLanguage === 'ar' ? 'مشترك' : 'Subscribed';
    }
    return currentLanguage === 'ar' ? 'اشترك' : getTranslation('subscribe', currentLanguage);
  }, [subscriptionStates, currentLanguage]);

  // Memoized package colors - cache calculations for better performance
  const packageColors = useMemo(() => buildPackageColorMap(packages), [packages]);

  const getPackageColor = useCallback((pkg) => {
    return packageColors.get(pkg.id) || {
      gradientFrom: 'var(--color-primary-light)',
      gradientTo: 'var(--color-primary)',
      solid: 'var(--color-primary)',
      text: 'text-white'
    };
  }, [packageColors]);

  return (
    <section id="packages" className="section-py relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}></canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/90 to-[var(--color-bg-muted)]/90" style={{ zIndex: 1 }}></div>

      <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 gradient-text">
            {getTranslation('packages-title', currentLanguage)}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] mx-auto mb-6"></div>
        </div>

        {loading ? (
          <PackageSkeletonGrid count={3} />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading packages</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-muted)]">No packages available.</p>
          </div>
        ) : (
          <>
            <LandingPackageGrid>
              {packages.map((pkg) => {
                const features = currentLanguage === 'en' ? pkg.features_en : pkg.features_ar;
                const featuresList = Array.isArray(features) ? features : (features ? JSON.parse(features) : []);
                const isSubscribed = subscriptionStates[pkg.id] === 'subscribed';
                const packageColor = getPackageColor(pkg);
                const isPlatinum = isPlatinumPackage(pkg, packageColor);
                const isAr = currentLanguage === 'ar';

                const availableDurations = filterAvailableDurations(pkg);

                const defaultDuration = availableDurations[0]?.months ?? 1;
                const selectedMonths = availableDurations.some(d => d.months === (selectedDurations[pkg.id] || defaultDuration))
                  ? (selectedDurations[pkg.id] || defaultDuration)
                  : defaultDuration;
                const { egp: displayEgp, usd: displayUsd } = getPackageDurationPrice(pkg, selectedMonths);

                return (
                  <LandingPackageCard key={pkg.id} isRTL={isRTL}>
                    <LandingPackageHeader
                      packageColor={packageColor}
                      isPlatinum={isPlatinum}
                      title={isAr ? pkg.name_ar : pkg.name_en}
                      priceHtml={formatPrice(displayEgp, displayUsd)}
                      durationLabel={`${pkg.duration_days} ${getTranslation('days', currentLanguage)}`}
                    />

                    <LandingPackageFeatures
                      features={featuresList}
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
                      onClick={() => {
                        if (isSubscribed) {
                          handleViewDetails(pkg);
                        } else if (subscribingPackageId !== pkg.id) {
                          handleSubscribe(pkg);
                        }
                      }}
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
                  ? currentLanguage === 'ar'
                    ? selectedPackage.name_ar
                    : selectedPackage.name_en
                  : ''
              }
              description={
                selectedPackage
                  ? currentLanguage === 'ar'
                    ? selectedPackage.description_ar
                    : selectedPackage.description_en
                  : ''
              }
              features={(() => {
                if (!selectedPackage) return [];
                const features =
                  currentLanguage === 'en'
                    ? selectedPackage.features_en
                    : selectedPackage.features_ar;
                return Array.isArray(features) ? features : features ? JSON.parse(features) : [];
              })()}
              packageColor={selectedPackage ? getPackageColor(selectedPackage) : undefined}
              durationMonths={
                selectedPackage
                  ? selectedDurations[selectedPackage.id] ?? selectedPackage.available_durations?.[0] ?? 1
                  : 1
              }
              domain="fitness"
              language={currentLanguage}
              isRTL={isRTL}
            />

            <SubscriptionSuccessModal
              isOpen={!!successData}
              onClose={() => setSuccessData(null)}
              packageName={successData?.packageName}
              durationMonths={successData?.durationMonths}
              currentLanguage={currentLanguage}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default Packages;

