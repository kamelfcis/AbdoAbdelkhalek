import React, { useState, useEffect, useRef } from 'react';
import { cdnUrl, toCdnUrl } from '../../../shared/lib/cdn';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import { useCategories } from '../../../shared/hooks/useCategories';
import { CategorySkeletonGrid } from '../components/Skeletons';
import { loadThreeJSOnIntersect, loadThreeJSOnInteraction } from '../../../shared/lib/threeLoader';
import OptimizedImage from './OptimizedImage';

const Categories = ({ onAlert, userSession }) => {
  const { currentLanguage } = useLanguage();
  const { data: categories = [], isLoading: loading, error } = useCategories(userSession);
  const [imageUrls, setImageUrls] = useState({});
  const canvasRef = useRef(null);

  // Handle errors from the query
  useEffect(() => {
    if (error) {
      console.error('Error fetching categories:', error);
      onAlert?.('Error loading categories');
    }
  }, [error, onAlert]);

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
    
    // Similar Three.js setup as Hero component
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
    const particlesCount = isMobile ? 75 : 150; // 50% reduction on mobile
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

  // Build image URLs map when categories change
  useEffect(() => {
    if (!categories.length) return;
    
    // Build image URLs map with correct priority:
    // 1) image_url if it's a FULL URL
    // 2) image_path if it's a FULL URL
    // 3) Otherwise, construct from image_path filename -> categories/categories/<filename>
    const urlMap = {};
    for (const category of categories) {
      const imageUrlField = category.image_url;
      const imagePathField = category.image_path;

      let resolvedUrl = null;

      // 1) Prefer image_url only if it's already a full URL
      if (imageUrlField && (imageUrlField.startsWith('http://') || imageUrlField.startsWith('https://'))) {
        resolvedUrl = toCdnUrl(imageUrlField);
      }

      // 2) Otherwise, use image_path if it's a full URL
      if (!resolvedUrl && imagePathField && (imagePathField.startsWith('http://') || imagePathField.startsWith('https://'))) {
        resolvedUrl = toCdnUrl(imagePathField);
      }

      // 3) If still not resolved, build from filename (image_path or image_url)
      if (!resolvedUrl) {
        // Choose the best available filename source
        const candidate = imagePathField || imageUrlField || '';
        if (candidate) {
          let pathForBucket = candidate.trim().replace(/^\/+/, '');
          if (!pathForBucket.startsWith('categories/')) {
            pathForBucket = `categories/${pathForBucket}`;
          }
          resolvedUrl = cdnUrl('categories', pathForBucket);
        }
      }

      if (resolvedUrl) {
        urlMap[category.id] = resolvedUrl;
      }
    }
    setImageUrls(urlMap);
  }, [categories]);

  const getImageUrl = async (category) => {
    if (category.image_url) {
      if (category.image_url.startsWith('http://') || category.image_url.startsWith('https://')) {
        return toCdnUrl(category.image_url);
      }
      return cdnUrl('categories', category.image_url);
    }
    
    if (category.image_path) {
      if (category.image_path.startsWith('http://') || category.image_path.startsWith('https://')) {
        return toCdnUrl(category.image_path);
      }
      
      // Otherwise, try to construct URL from path
      // If path starts with "categories/", remove it since we're specifying bucket "categories"
      let pathForBucket = category.image_path;
      if (pathForBucket.startsWith('categories/')) {
        pathForBucket = pathForBucket.replace(/^categories\//, '');
      }
      pathForBucket = pathForBucket.replace(/^\/+/, '');
      
      return cdnUrl('categories', pathForBucket);
    }
    
    return null;
  };

  const handleCategoryClick = (categoryId, categoryNameEn, categoryNameAr) => {
    const element = document.getElementById('videos');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Store selected category for videos component with category name
      sessionStorage.setItem('selectedCategory', categoryId);
      sessionStorage.setItem('categoryNameEn', categoryNameEn || '');
      sessionStorage.setItem('categoryNameAr', categoryNameAr || '');
      // Trigger custom event to notify Videos component
      window.dispatchEvent(new CustomEvent('categorySelected', { 
        detail: { categoryId, categoryNameEn, categoryNameAr } 
      }));
    }
  };

  return (
    <section id="categories" className="section-py relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}></canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-gray-50/90" style={{ zIndex: 1 }}></div>

      <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 gradient-text">
            {getTranslation('categories-title', currentLanguage)}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] mx-auto"></div>
        </div>

        {loading ? (
          <CategorySkeletonGrid count={6} />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading categories</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => {
              // Build image URL - prioritize mapped URL, then build from category data
              let imageUrl = null;
              
              // First, try to use the mapped URL (from imageUrls state)
              if (imageUrls[category.id]) {
                imageUrl = imageUrls[category.id];
              }
              // If no mapped URL, try image_url
              else if (category.image_url) {
                imageUrl =
                  category.image_url.startsWith('http://') || category.image_url.startsWith('https://')
                    ? toCdnUrl(category.image_url)
                    : cdnUrl('categories', category.image_url);
              }
              else if (category.image_path) {
                if (category.image_path.startsWith('http://') || category.image_path.startsWith('https://')) {
                  imageUrl = toCdnUrl(category.image_path);
                } else {
                  // image_path is a relative path like "core.jpg" or "strength.jpg"
                  // Build full Supabase URL: categories/categories/filename.jpg
                  let pathForBucket = category.image_path.trim().replace(/^\/+/, '');
                  
                  // Add "categories/" prefix if not present (matches structure: categories/categories/filename.jpg)
                  if (!pathForBucket.startsWith('categories/')) {
                    pathForBucket = `categories/${pathForBucket}`;
                  }
                  
                  // Construct the full Supabase storage URL
                  imageUrl = cdnUrl('categories', pathForBucket);
                }
              }
              
              // Final check - ensure we have a valid full URL
              if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                console.error(`ERROR: imageUrl for ${category.name_en || category.name_ar} is not a full URL:`, imageUrl, 'category:', category);
                // Try to build URL as fallback
                const fallbackPath = `categories/${category.image_path || category.id}`;
                imageUrl = cdnUrl('categories', fallbackPath);
              }
              
              // Debug log for Core and Strength
              if ((category.name_en === 'Core' || category.name_en === 'Strength') && imageUrl) {
                console.log(`[DEBUG] ${category.name_en}: image_path="${category.image_path}", image_url="${category.image_url}", final URL="${imageUrl}"`);
              }
              
              return (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(
                  category.id,
                  category.name_en || category.title_en,
                  category.name_ar || category.title_ar
                )}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 cursor-pointer"
                >
                  {/* Image Section */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center relative overflow-hidden">
                    {imageUrl ? (
                      <>
                        <OptimizedImage
                          src={imageUrl}
                          alt={currentLanguage === 'ar' ? (category.name_ar || category.title_ar) : (category.name_en || category.title_en)}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          width={600}
                          height={400}
                          loading="lazy"
                          priority={false}
                          onError={() => {
                            console.error(`Failed to load image for category ${category.name_en || category.name_ar}:`, imageUrl);
                          }}
                        />
                        <div className="fallback-icon w-full h-full flex items-center justify-center bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] absolute top-0 left-0" style={{ display: 'none' }}>
                          <i className="fas fa-running text-white text-6xl"></i>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)]">
                        <i className="fas fa-running text-white text-6xl"></i>
                      </div>
                    )}
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#2c3e50] mb-2">
                      {currentLanguage === 'ar' ? (category.name_ar || category.title_ar) : (category.name_en || category.title_en)}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {currentLanguage === 'ar' ? category.description_ar : category.description_en}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryClick(
                          category.id,
                          category.name_en || category.title_en,
                          category.name_ar || category.title_ar
                        );
                      }}
                      className="inline-block text-[var(--color-primary)] font-semibold hover:text-[var(--color-primary-light)] transition cursor-pointer"
                    >
                      {currentLanguage === 'ar' ? 'عرض الفيديوهات' : 'View Videos'}
                      <i className={`fas fa-arrow-right ${currentLanguage === 'ar' ? 'mr-2' : 'ml-2'} ${currentLanguage === 'ar' ? 'rotate-180' : ''}`}></i>
                    </button>
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

export default Categories;

