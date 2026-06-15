import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { loadThreeJSOnIntersect, loadThreeJSOnInteraction } from '../../../shared/lib/threeLoader';
import OptimizedImage from './OptimizedImage';

const About = React.memo(() => {
  const { currentLanguage } = useLanguage();
  const canvasRef = useRef(null);

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
    
    const THREE = window.THREE;
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
    const particlesCount = isMobile ? 110 : 220; // 50% reduction on mobile
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

  return (
    <section
      id="about-me"
      className="section-py relative overflow-hidden wow fadeInLeft"
      data-wow-duration="0.75s"
      data-wow-delay="0s"
      style={{ visibility: 'visible', animationDuration: '0.75s', animationDelay: '0s', animationName: 'fadeInLeft' }}
    >
      <canvas
        ref={canvasRef}
        id="about-me-three-canvas"
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0, width: '100%', height: '100%' }}
        width="1900"
        height="1510"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-muted)]/90 to-[var(--color-bg)]/90" style={{ zIndex: 1 }}></div>

      <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 id="about-me-title" className="text-4xl font-bold mb-4 gradient-text">
              {currentLanguage === 'ar' ? 'من أنا؟' : 'Who Am I?'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] mx-auto mb-6"></div>
            <p id="about-me-subtitle" className="text-xl text-[var(--color-text-muted)] max-w-3xl mx-auto leading-relaxed">
              {currentLanguage === 'ar'
                ? 'عبدالرحمن عبدالخالق - لاعب كرة قدم سابق | مدرب أداء | متخصص في تطوير الرياضيين وعلوم الرياضة'
                : 'Abdelrahman Abdelkhalek - Former Professional Footballer | Performance Coach | Specialist in Athletic Development & Sports Science'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                <OptimizedImage
                  src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Abdelrahman Abdelkhalek"
                  className="w-full h-96 object-cover"
                  width={800}
                  height={384}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent"></div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-full opacity-20"></div>
            </div>

            <div className="space-y-8">
              <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-[var(--color-primary)]">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] rounded-full flex items-center justify-center">
                      <i className="fas fa-dumbbell text-white text-lg"></i>
                    </div>
                  </div>
                  <div>
                    <h3 id="strength-title" className="text-xl font-bold text-[var(--color-text)] mb-2">
                      Strength &amp; Conditioning (S&amp;C)
                    </h3>
                    <p id="strength-desc" className="text-[var(--color-text-muted)] leading-relaxed">
                      {currentLanguage === 'ar'
                        ? 'متخصص في تصميم برامج تطوير السرعة، القوة، التحمّل، الاجلتي باستخدام منهجيات مبنية على الأدلة العلمية.'
                        : 'Specialized in designing speed, strength, endurance, and agility development programs using evidence-based methodologies.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-[var(--color-primary-light)]">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-full flex items-center justify-center">
                      <i className="fas fa-apple-alt text-white text-lg"></i>
                    </div>
                  </div>
                  <div>
                    <h3 id="nutrition-title" className="text-xl font-bold text-[var(--color-text)] mb-2">
                      Sports Nutrition
                    </h3>
                    <p id="nutrition-desc" className="text-[var(--color-text-muted)] leading-relaxed">
                      {currentLanguage === 'ar'
                        ? 'حاصل على شهادات متعددة في التغذية الرياضية المتقدمة، مع تطبيق عملي لأنظمة غذائية مخصصة حسب مراحل الموسم (Pre-season, In-season, Off-season, Tapering).'
                        : 'Holder of multiple certifications in advanced sports nutrition, applying customized nutrition systems across season phases (Pre-season, In-season, Off-season, Tapering).'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-[var(--color-primary)]">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] rounded-full flex items-center justify-center">
                      <i className="fas fa-brain text-white text-lg"></i>
                    </div>
                  </div>
                  <div>
                    <h3 id="mental-title" className="text-xl font-bold text-[var(--color-text)] mb-2">
                      Mental Performance
                    </h3>
                    <p id="mental-desc" className="text-[var(--color-text-muted)] leading-relaxed">
                      {currentLanguage === 'ar'
                        ? 'دارس وممارس لعلم النفس الرياضي، متخصص في تقنيات التحكم في الضغط العصبي، تحسين التركيز، وزيادة الاستجابة الذهنية تحت ضغط المنافسة.'
                        : 'Student and practitioner of sports psychology, specialized in stress-control techniques, focus improvement, and enhanced mental response under competition pressure.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-[var(--color-primary-light)]">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-full flex items-center justify-center">
                      <i className="fas fa-futbol text-white text-lg"></i>
                    </div>
                  </div>
                  <div>
                    <h3 id="analysis-title" className="text-xl font-bold text-[var(--color-text)] mb-2">
                      Football Analysis
                    </h3>
                    <p id="analysis-desc" className="text-[var(--color-text-muted)] leading-relaxed">
                      {currentLanguage === 'ar'
                        ? 'تحليل متخصص لأداء اللاعب في المباريات، فهم الأدوار الوظيفية للمراكز المختلفة وتطوير استراتيجيات تحسين الأداء.'
                        : 'Specialized analysis of player performance in matches, understanding position-specific responsibilities, and developing performance enhancement strategies.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <a
              href="#packages"
              className="inline-flex items-center bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white px-8 py-4 rounded-full font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <i className="fas fa-arrow-down mr-2 rtl:ml-2 rtl:mr-0"></i>
              <span id="cta-text">
                {currentLanguage === 'ar' ? 'اكتشف برامجي التدريبية' : 'Discover My Training Programs'}
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

About.displayName = 'About';

export default About;

