import React, { useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import { loadThreeJSOnIntersect, loadThreeJSOnInteraction } from '../../../shared/lib/threeLoader';
import { LazySplide, LazySplideSlide } from '../../../shared/components/LazySplide';

const Hero = () => {
  const { currentLanguage } = useLanguage();
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  
  // Highly optimized image URLs - much smaller for mobile, responsive
  const heroImages = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const width = isMobile ? 640 : 1024;
    const quality = isMobile ? 50 : 60;
    return [
      `https://images.unsplash.com/photo-1574629810-1484038240bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=${width}&q=${quality}`,
      `https://images.unsplash.com/photo-1517466922-ee96b6069be7?ixlib=rb-4.0.3&auto=format&fit=crop&w=${width}&q=${quality}`,
      `https://images.unsplash.com/photo-1553778263-73a83bab9b0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=${width}&q=${quality}`,
    ];
  }, []);

  // Professional Three.js deferred loading with Intersection Observer
  useEffect(() => {
    if (!canvasRef.current) return;

    // Setup intersection observer for canvas
    const cleanupIntersect = loadThreeJSOnIntersect(canvasRef.current, {
      rootMargin: '100px',
      threshold: 0.1,
      once: true,
    });

    // Also load on user interaction as fallback
    const cleanupInteraction = loadThreeJSOnInteraction(['scroll', 'touchstart', 'click', 'mousemove']);

    // Check if Three.js is ready and initialize
    const checkAndInit = setInterval(() => {
      if (window.THREE && canvasRef.current && !canvasRef.current.threeInitialized) {
        clearInterval(checkAndInit);
        initThreeJS();
      }
    }, 200);

    // Cleanup after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkAndInit);
    }, 10000);

    return () => {
      cleanupIntersect();
      cleanupInteraction();
      clearInterval(checkAndInit);
      clearTimeout(timeout);
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create particles
    const geometry = new THREE.BufferGeometry();
    const particlesCount = 150; // Reduced from 200 for better performance
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    const colors = [
      { r: 0.75, g: 0.84, b: 0.93 },
      { r: 0, g: 0.45, b: 0.72 },
      { r: 0, g: 0.35, b: 0.56 }
    ];

    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 12;
      posArray[i + 1] = (Math.random() - 0.5) * 12;
      posArray[i + 2] = (Math.random() - 0.5) * 12;

      const colorChoice = Math.floor(Math.random() * colors.length);
      const color = colors[colorChoice];
      colorsArray[i] = color.r;
      colorsArray[i + 1] = color.g;
      colorsArray[i + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x0074b7, 1, 100);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xbfd7ed, 1, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Animation with visibility control
    let animationId;
    let isVisible = true;

    // Pause animation when tab is not visible
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    function animate() {
      animationId = requestAnimationFrame(animate);

      if (isVisible && !document.hidden) {
        particles.rotation.x += 0.0003;
        particles.rotation.y += 0.0005;
        particles.rotation.z += 0.0002;

        const positions = particles.geometry.attributes.position.array;
        const time = Date.now() * 0.001;

        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const z = positions[i + 2];
          positions[i + 1] += Math.sin(time + x * 0.5) * 0.003 + Math.cos(time + z * 0.5) * 0.003;
        }
        particles.geometry.attributes.position.needsUpdate = true;

        pointLight1.position.x = Math.sin(time * 0.5) * 5;
        pointLight1.position.z = Math.cos(time * 0.5) * 5;
        pointLight2.position.x = Math.cos(time * 0.3) * -5;
        pointLight2.position.z = Math.sin(time * 0.3) * 5;

        renderer.render(scene, camera);
      }
    }

    animate();
    canvas.animationId = animationId;

    const handleResize = () => {
      const newAspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.aspect = newAspect;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    };

    window.addEventListener('resize', handleResize);
    sceneRef.current = scene;

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  };

  const handleNavClick = (section) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const splideOptions = {
    type: 'loop',
    autoplay: true,
    interval: 5000,
    pauseOnHover: true,
    resetProgress: false,
    arrows: true,
    pagination: true,
  };

  return (
    <section id="home" className="relative h-screen overflow-hidden" aria-label="Hero section">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} aria-hidden="true"></canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" style={{ zIndex: 1 }} aria-hidden="true"></div>

      <div className="relative" style={{ zIndex: 2 }}>
        <LazySplide options={splideOptions} aria-label="Hero image slider">
          <LazySplideSlide>
            <div
              className="w-full h-screen bg-cover bg-center"
              style={{
                backgroundImage: `url('${heroImages[0]}')`,
                backgroundColor: '#0f172a',
                minHeight: '100vh',
                width: '100%',
              }}
              role="img"
              aria-label="Hero image - Training and performance"
            >
              <div className="hero-overlay"></div>
              <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
                <div className="max-w-3xl animate-slide-up">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                    {getTranslation('hero-title', currentLanguage)}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 text-white">
                    {getTranslation('hero-subtitle', currentLanguage)}
                  </p>
                  <a
                    href="#packages"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick('packages');
                    }}
                    className="inline-block bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform animate-pulse"
                    aria-label={getTranslation('hero-cta', currentLanguage)}
                  >
                    {getTranslation('hero-cta', currentLanguage)}
                  </a>
                </div>
              </div>
            </div>
          </LazySplideSlide>
          <LazySplideSlide>
            <div
              className="w-full h-screen bg-cover bg-center"
              style={{
                backgroundImage: `url('${heroImages[1]}')`,
              }}
            >
              <div className="hero-overlay"></div>
              <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
                <div className="max-w-3xl animate-slide-up">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                    Personalized Training Programs
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 text-white">
                    Tailored to your specific needs and goals
                  </p>
                  <a
                    href="#categories"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick('categories');
                    }}
                    className="inline-block bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform animate-pulse"
                  >
                    Browse Categories
                  </a>
                </div>
              </div>
            </div>
          </LazySplideSlide>
          <LazySplideSlide>
            <div
              className="w-full h-screen bg-cover bg-center"
              style={{
                backgroundImage: `url('${heroImages[2]}')`,
              }}
            >
              <div className="hero-overlay"></div>
              <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
                <div className="max-w-3xl animate-slide-up">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                    Transform Your Performance
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 text-white">
                    Join our athletes who have achieved their goals
                  </p>
                  <a
                    href="#success"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick('success');
                    }}
                    className="inline-block bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform animate-pulse"
                  >
                    Success Stories
                  </a>
                </div>
              </div>
            </div>
          </LazySplideSlide>
        </LazySplide>
      </div>
    </section>
  );
};

export default Hero;


