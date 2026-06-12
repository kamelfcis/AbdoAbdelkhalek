import React, { useState, useEffect, useRef } from 'react';
import { contentService } from '../../../shared/api/contentService';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import { loadThreeJSOnIntersect, loadThreeJSOnInteraction } from '../../../shared/lib/threeLoader';

const FAQ = ({ onAlert }) => {
  const { currentLanguage } = useLanguage();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);
  const isRTL = currentLanguage === 'ar';
  const canvasRef = useRef(null);
  const answerRefs = useRef([]);
  const [answerHeights, setAnswerHeights] = useState([]);
  const THREE = window?.THREE;

  useEffect(() => {
    fetchFAQs();
  }, []);

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
    if (!window.THREE || !canvasRef.current || canvasRef.current.threeInitialized) return;

    const THREE = window.THREE;
    const canvas = canvasRef.current;
    canvas.threeInitialized = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      65,
      (canvas.clientWidth || window.innerWidth) /
        (canvas.clientHeight || window.innerHeight),
      0.1,
      1000
    );
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance

    const resizeRenderer = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resizeRenderer();
    window.addEventListener('resize', resizeRenderer);

    // Detect mobile and reduce particles by 50% for better performance
    const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const particlesCount = isMobile ? 110 : 220; // 50% reduction on mobile
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 12;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.09,
      color: 0x0074b7,
      transparent: true,
      opacity: 0.6,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const pointLight = new THREE.PointLight(0xbfd7ed, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    let animationFrameId;
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

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (isVisible && !document.hidden) {
        particles.rotation.x += 0.0015;
        particles.rotation.y += 0.002;
        renderer.render(scene, camera);
      }
    };

    animate();
    canvas.animationId = animationFrameId;
    canvas.cleanup = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      visibilityObserver.disconnect();
      window.removeEventListener('resize', resizeRenderer);
      if (renderer) renderer.dispose();
      if (geometry) geometry.dispose();
      if (material) material.dispose();
    };
  };

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const data = await contentService.getFaqs();
      const filtered = (data || []).filter((f) => f.is_active !== false);
      setFaqs(filtered.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
      setTimeout(() => {
        const heights = answerRefs.current.map((el) => el?.scrollHeight || 0);
        setAnswerHeights(heights);
      }, 0);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      onAlert?.('Error loading FAQs');
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (index) => {
    const newIndex = openIndex === index ? null : index;
    setOpenIndex(newIndex);
  };

  useEffect(() => {
    const heights = answerRefs.current.map((el) => el?.scrollHeight || 0);
    setAnswerHeights(heights);
  }, [faqs, currentLanguage]);

  useEffect(() => {
    const handleResize = () => {
      const heights = answerRefs.current.map((el) => el?.scrollHeight || 0);
      setAnswerHeights(heights);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      id="faq"
      className="section-py relative overflow-hidden"
      data-wow-duration="0.75s"
      data-wow-delay="0s"
    >
      <canvas
        ref={canvasRef}
        id="faq-three-canvas"
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0, width: '100%', height: '100%' }}
        width="1900"
        height="857"
      />

      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-light)]/10 via-white/80 to-gray-50/90"
        style={{ zIndex: 1 }}
      ></div>

      <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-4">
              <i className="fas fa-question-circle text-4xl text-white"></i>
            </div>
          </div>
          <h2
            id="faq-title"
            className="text-5xl font-bold mb-6 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-dark)] to-[var(--color-primary)] bg-clip-text text-transparent"
          >
            {getTranslation('faq-title', currentLanguage)}
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent mx-auto mb-6 rounded-full"></div>
          <p
            id="faq-subtitle"
            className="text-xl text-gray-700 max-w-3xl mx-auto font-medium"
          >
            {getTranslation('faq-subtitle', currentLanguage)}
          </p>
        </div>

        {loading ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12 bg-white/80 rounded-2xl shadow-lg">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-[var(--color-primary-light)] opacity-25"></div>
                <div className="absolute inset-0 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
              </div>
              <p className="text-gray-600 font-medium">
                {getTranslation('loading-faqs', currentLanguage)}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className="faq-item bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-transparent hover:border-[var(--color-primary)]/30 transform hover:-translate-y-1"
              >
                <button
                  className={`w-full px-8 py-6 ${
                    isRTL ? 'text-right' : 'text-left'
                  } hover:bg-gradient-to-r hover:from-[var(--color-primary-light)]/10 hover:to-transparent transition-all duration-300 flex items-center ${
                    isRTL ? 'flex-row-reverse' : ''
                  } justify-between focus:outline-none focus:ring-4 focus:ring-[var(--color-border-focus)]/20 group`}
                  onClick={() => toggleFAQ(index)}
                  id={`faq-question-${index}`}
                >
                  <div
                    className={`flex items-center gap-4 flex-1 ${
                      isRTL ? 'flex-row-reverse text-right' : ''
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-bold text-lg">{index + 1}</span>
                    </div>
                    <span
                      className={`font-bold text-gray-800 text-lg group-hover:text-[var(--color-primary)] transition-colors duration-300 ${
                        isRTL ? 'leading-relaxed' : ''
                      }`}
                    >
                      {currentLanguage === 'ar'
                        ? (faq.question_ar || faq.question_en)
                        : (faq.question_en || faq.question_ar)}
                    </span>
                  </div>
                  <div
                    className={`w-8 h-8 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center group-hover:bg-[var(--color-primary)] transition-all duration-300 ${
                      isRTL ? '' : ''
                    }`}
                  >
                    <i
                      className={`fas fa-chevron-down text-[var(--color-primary)] group-hover:text-white transition-all duration-300 ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                      id={`faq-icon-${index}`}
                    ></i>
                  </div>
                </button>
                <div
                  className="faq-answer overflow-hidden transition-all duration-500 ease-in-out"
                  style={{
                    maxHeight:
                      openIndex === index
                        ? `${answerHeights[index] || 0}px`
                        : '0px',
                  }}
                  id={`faq-answer-${index}`}
                >
                  <div
                    className="px-8 pb-6"
                    ref={(el) => {
                      answerRefs.current[index] = el;
                    }}
                  >
                    <div className="pt-4 border-t-2 border-[var(--color-primary-light)]/30">
                        <div className="flex gap-3">
                          {isRTL ? null : null}
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-lg flex items-center justify-center">
                            <i className="fas fa-lightbulb text-white text-sm"></i>
                          </div>
                        </div>
                          <p
                            className={`text-gray-700 leading-relaxed text-base flex-1 ${
                              isRTL ? 'text-right' : 'text-left'
                            }`}
                          >
                            {currentLanguage === 'ar'
                              ? (faq.answer_ar || faq.answer_en)
                              : (faq.answer_en || faq.answer_ar)}
                          </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQ;

