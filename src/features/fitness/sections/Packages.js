import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { contentService } from '../../../shared/api/contentService';
import { queryKeys } from '../../../shared/lib/queryKeys';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import { formatPrice } from '../../../shared/lib/currency';
import { usePackages } from '../../../shared/hooks/usePackages';
import { PackageSkeletonGrid } from '../components/Skeletons';
import { loadThreeJSOnIntersect, loadThreeJSOnInteraction } from '../../../shared/lib/threeLoader';
import { loginPath } from '../../../shared/lib/authRoutes';

const Packages = ({ onAlert, userSession, userProfile }) => {
  const { currentLanguage } = useLanguage();
  const isRTL = currentLanguage === 'ar';
  const queryClient = useQueryClient();
  const { data: packagesData = [], isLoading: loading, error } = usePackages();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [subscriptionStates, setSubscriptionStates] = useState({});
  const [expandedFeatures, setExpandedFeatures] = useState({});
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

  const handleSubscribe = useCallback(async (pkg) => {
    if (!userSession) {
      window.location.href = loginPath('fitness');
      return;
    }

    // Trainees scroll to contact; coaches may self-subscribe via API.
    // userProfile loads deferred — fall back to session metadata from /auth/me.
    const isCoach = Boolean(
      userProfile?.is_coach ?? userSession?.user?.user_metadata?.is_coach
    );

    if (!isCoach) {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    const subscriptionState = subscriptionStates[pkg.id];
    if (subscriptionState === 'subscribed') {
      // Show details modal
      setSelectedPackage(pkg);
      setShowModal(true);
    } else {
      // Handle subscription (coaches only — backend enforces requireCoach)
      try {
        await contentService.createSubscription({
          userId: userSession.user.id,
          packageId: pkg.id,
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + (pkg.duration_days || pkg.durationDays) * 24 * 60 * 60 * 1000).toISOString(),
        });
        onAlert?.(currentLanguage === 'ar' ? 'تم الاشتراك بنجاح!' : 'Subscription successful!');
        await updateSubscriptionButtonStates();
        // Invalidate packages query to refetch
        queryClient.invalidateQueries({ queryKey: queryKeys.packages() });
      } catch (error) {
        console.error('Error subscribing:', error);
        onAlert?.('Error subscribing to package');
      }
    }
  }, [userSession, userProfile, currentLanguage, onAlert, queryClient, subscriptionStates, updateSubscriptionButtonStates]);

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
  const packageColors = useMemo(() => {
    const colorsMap = new Map();
    packages.forEach((pkg) => {
    const nameEn = (pkg.name_en || '').toLowerCase();
    const nameAr = (pkg.name_ar || '').toLowerCase();
    
      // Check if it's a gold package
      const isGold = nameEn.includes('gold') || nameAr.includes('ذهبي') || nameAr.includes('جولد');
      
      // Check if it has "برو" (pro) - pro packages should be yellow/gold
      const hasPro = nameAr.includes('برو') || nameEn.includes('pro');
      
      // Gold packages with "تغذيه" or "تمرين" or both (but NOT pro) should use default (silver) color
    const isGoldWithNutritionOrTraining = 
        isGold &&
        !hasPro &&
        (nameAr.includes('تغذيه') || nameAr.includes('تغذية') || nameAr.includes('تمرين') || 
         nameEn.includes('nutrition') || nameEn.includes('training'));
      
      let colorConfig;
    
      // If it's a gold package with nutrition/training (but not pro), use default color (same as silver)
    if (isGoldWithNutritionOrTraining) {
        colorConfig = {
        gradientFrom: 'var(--color-primary-light)',
        gradientTo: 'var(--color-primary)',
        solid: 'var(--color-primary)',
        text: 'text-white'
      };
      } else if (isGold) {
        // Regular gold packages (including pro packages with nutrition/training)
        colorConfig = {
        gradientFrom: 'rgb(244, 215, 123)',
        gradientTo: 'rgb(220, 180, 80)',
        solid: 'rgb(244, 215, 123)',
        text: 'text-gray-900'
      };
      } else if (nameEn.includes('platinum') || nameAr.includes('بلاتيني') || nameAr.includes('بلاتينوم')) {
        colorConfig = {
        gradientFrom: 'rgb(157 137 255)',
        gradientTo: 'hsl(250, 73.70%, 70.20%)',
        solid: 'rgb(157 137 255)',
        text: 'text-white'
      };
      } else {
    // Default color (silver)
        colorConfig = {
          gradientFrom: 'var(--color-primary-light)',
          gradientTo: 'var(--color-primary)',
          solid: 'var(--color-primary)',
          text: 'text-white'
        };
      }
      
      colorsMap.set(pkg.id, colorConfig);
    });
    return colorsMap;
  }, [packages]);

  // Get package color based on cached map
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
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-gray-50/90" style={{ zIndex: 1 }}></div>

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
            <p className="text-gray-600">No packages available.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg) => {
                const features = currentLanguage === 'en' ? pkg.features_en : pkg.features_ar;
                const featuresList = Array.isArray(features) ? features : (features ? JSON.parse(features) : []);
                const isSubscribed = subscriptionStates[pkg.id] === 'subscribed';
                const packageColor = getPackageColor(pkg);
                const nameEn = (pkg.name_en || '').toLowerCase();
                const nameAr = (pkg.name_ar || '').toLowerCase();
                const isPlatinum = packageColor.text === 'text-white' && 
                  (nameEn.includes('platinum') || nameAr.includes('بلاتيني') || nameAr.includes('بلاتينوم'));

                return (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-2"
                  >
                    <div 
                      className={`${packageColor.text} p-6 text-center`}
                      style={{
                        background: `linear-gradient(to right, ${packageColor.gradientFrom}, ${packageColor.gradientTo})`
                      }}
                    >
                      <h3 className="text-2xl font-bold mb-2">
                        {currentLanguage === 'ar' ? pkg.name_ar : pkg.name_en}
                      </h3>
                      <p className="text-xl font-semibold">
                        <span 
                          className="text-2xl" 
                          style={{ color: isPlatinum ? 'white' : 'inherit' }}
                          dangerouslySetInnerHTML={{ __html: formatPrice(pkg.price_egp, pkg.price_usd) }}
                        ></span>
                      </p>
                      <p className="text-sm opacity-80">
                        {pkg.duration_days} {getTranslation('days', currentLanguage)}
                      </p>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 mb-4">
                        {currentLanguage === 'ar' ? pkg.description_ar : pkg.description_en}
                      </p>
                      {featuresList.length > 0 && (
                        <div className="mb-6">
                          <ul className="space-y-3">
                            {(expandedFeatures[pkg.id] ? featuresList : featuresList.slice(0, 4)).map((feature, idx) => (
                              <li key={idx} className="flex items-start group">
                                <div 
                                  className={`flex-shrink-0 mt-1 ${isRTL ? 'ml-3' : 'mr-3'}`}
                                  style={{ color: packageColor.solid }}
                                >
                                  <i className="fas fa-check-circle text-lg"></i>
                                </div>
                                <span className="text-gray-700 text-sm leading-relaxed flex-1 group-hover:text-gray-900 transition-colors">
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                          {featuresList.length > 4 && (
                            <button
                              onClick={() => setExpandedFeatures(prev => ({
                                ...prev,
                                [pkg.id]: !prev[pkg.id]
                              }))}
                              className="mt-4 text-sm font-medium transition-colors hover:opacity-80"
                              style={{ color: packageColor.solid }}
                              aria-expanded={!!expandedFeatures[pkg.id]}
                              aria-label={expandedFeatures[pkg.id] 
                                ? (currentLanguage === 'ar' ? 'عرض أقل' : 'See Less')
                                : (currentLanguage === 'ar' ? 'عرض المزيد' : 'See More')
                              }
                            >
                              {expandedFeatures[pkg.id] 
                                ? (currentLanguage === 'ar' ? 'عرض أقل' : 'See Less')
                                : (currentLanguage === 'ar' ? 'عرض المزيد' : 'See More')
                              }
                              <i className={`fas fa-chevron-${expandedFeatures[pkg.id] ? 'up' : 'down'} ${isRTL ? 'mr-2' : 'ml-2'}`}></i>
                            </button>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => isSubscribed ? handleViewDetails(pkg) : handleSubscribe(pkg)}
                        className={`w-full ${packageColor.text} py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all ${
                          isSubscribed ? 'opacity-75' : ''
                        }`}
                        style={{
                          background: `linear-gradient(to right, ${packageColor.gradientFrom}, ${packageColor.gradientTo})`
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
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">{getTranslation('package-details-title', currentLanguage)}</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-gray-800">
                      <i className="fas fa-times text-2xl"></i>
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-700">
                          <strong>{getTranslation('price-label', currentLanguage)}:</strong>{' '}
                          <span 
                            style={{ color: 'white' }}
                            dangerouslySetInnerHTML={{ __html: formatPrice(selectedPackage.price_egp, selectedPackage.price_usd) }}
                          ></span>
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-700">
                          <strong>{getTranslation('duration-label', currentLanguage)}:</strong> {selectedPackage.duration_days} {getTranslation('days-label', currentLanguage)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-700">
                          <strong>{getTranslation('level-label', currentLanguage)}:</strong> {selectedPackage.level || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-700">
                          <strong>{getTranslation('type-label', currentLanguage)}:</strong> {selectedPackage.type || '-'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-700 mb-2">
                        {currentLanguage === 'ar' ? selectedPackage.description_ar : selectedPackage.description_en}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">{currentLanguage === 'ar' ? 'المميزات' : 'Features'}</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {(() => {
                          const features = currentLanguage === 'en' ? selectedPackage.features_en : selectedPackage.features_ar;
                          const featuresList = Array.isArray(features) ? features : (features ? JSON.parse(features) : []);
                          return featuresList.map((f, idx) => (
                            <li key={idx} className="text-gray-700">{f}</li>
                          ));
                        })()}
                      </ul>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <i className="fas fa-video text-[var(--color-primary)]"></i>
                        <span className="text-gray-700">
                          {getTranslation('includes-video-feedback', currentLanguage)}: {selectedPackage.includes_video_feedback ? '✔' : '✖'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <i className="fas fa-headset text-[var(--color-primary)]"></i>
                        <span className="text-gray-700">
                          {getTranslation('daily-support', currentLanguage)}: {selectedPackage.daily_support ? '✔' : '✖'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                    >
                      {currentLanguage === 'ar' ? 'إغلاق' : 'Close'}
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

export default Packages;

