import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import { loadThreeJSOnIntersect } from '../../../shared/lib/threeLoader';

const WhyChooseMe = React.memo(() => {
  const { currentLanguage } = useLanguage();
  const canvasRef = useRef(null);
  const [threeReady, setThreeReady] = useState(
    () => typeof window !== 'undefined' && Boolean(window.THREE)
  );

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const cleanup = loadThreeJSOnIntersect(canvasRef.current, {
      rootMargin: '200px',
      threshold: 0.1,
      once: true,
    });
    const check = setInterval(() => {
      if (window.THREE) {
        clearInterval(check);
        setThreeReady(true);
      }
    }, 200);
    const timeout = setTimeout(() => clearInterval(check), 10000);
    return () => {
      cleanup?.();
      clearInterval(check);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const THREE = typeof window !== 'undefined' ? window.THREE : null;
    if (!canvasRef.current || !THREE || !threeReady) {
      return undefined;
    }

    const canvas = canvasRef.current;
    if (canvas.threeInitialized) return undefined;
    canvas.threeInitialized = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
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

    const resizeRenderer = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resizeRenderer();
    window.addEventListener('resize', resizeRenderer);

    const particlesCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 14;
      positions[i + 1] = (Math.random() - 0.5) * 14;
      positions[i + 2] = (Math.random() - 0.5) * 14;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.085,
      color: 0x0074b7,
      transparent: true,
      opacity: 0.6,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      particles.rotation.x += 0.0016;
      particles.rotation.y += 0.002;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeRenderer);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.threeInitialized = false;
    };
  }, [threeReady]);

  const featureCards = [
    {
      idPrefix: 'online-advantage',
      icon: 'fas fa-laptop',
      wrapperClasses:
        'bg-gradient-to-r from-[#bfd7ed]/10 to-[#0074b7]/10 p-6 rounded-xl border-l-4 border-[#0074b7]',
      iconClasses:
        'w-12 h-12 bg-gradient-to-r from-[#bfd7ed] to-[#0074b7] rounded-full flex items-center justify-center',
    },
    {
      idPrefix: 'website-purpose',
      icon: 'fas fa-shield-alt',
      wrapperClasses:
        'bg-gradient-to-r from-[#0074b7]/10 to-[#bfd7ed]/10 p-6 rounded-xl border-l-4 border-[#bfd7ed]',
      iconClasses:
        'w-12 h-12 bg-gradient-to-r from-[#0074b7] to-[#bfd7ed] rounded-full flex items-center justify-center',
    },
    {
      idPrefix: 'goal',
      icon: 'fas fa-trophy',
      wrapperClasses:
        'bg-gradient-to-r from-[#bfd7ed]/10 to-[#0074b7]/10 p-6 rounded-xl border-l-4 border-[#0074b7]',
      iconClasses:
        'w-12 h-12 bg-gradient-to-r from-[#bfd7ed] to-[#0074b7] rounded-full flex items-center justify-center',
    },
    {
      idPrefix: 'experience',
      icon: 'fas fa-graduation-cap',
      wrapperClasses:
        'bg-gradient-to-r from-[#0074b7]/10 to-[#bfd7ed]/10 p-6 rounded-xl border-l-4 border-[#bfd7ed]',
      iconClasses:
        'w-12 h-12 bg-gradient-to-r from-[#0074b7] to-[#bfd7ed] rounded-full flex items-center justify-center',
    },
  ];

  return (
    <section
      id="why-choose-me"
      className="section-py relative overflow-hidden wow fadeInLeft"
      data-wow-duration="0.75s"
      data-wow-delay="0s"
      style={{
        visibility: 'visible',
        animationDuration: '0.75s',
        animationDelay: '0s',
        animationName: 'fadeInLeft',
      }}
    >
      <canvas
        ref={canvasRef}
        id="why-choose-three-canvas"
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0, width: '100%', height: '100%' }}
        width="1900"
        height="1628"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/90 via-[var(--color-bg-muted)]/85 to-[var(--color-bg)]/90"
        style={{ zIndex: 1 }}
      ></div>

      <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2
              id="why-choose-title"
              className="text-4xl font-bold mb-4 gradient-text"
            >
              {getTranslation('why-choose-title', currentLanguage)}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#bfd7ed] to-[#0074b7] mx-auto mb-6"></div>
          </div>

          <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#bfd7ed] to-[#0074b7] rounded-full opacity-10 transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#0074b7] to-[#bfd7ed] rounded-full opacity-10 transform -translate-x-12 translate-y-12"></div>

            <div className="relative z-10">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-r from-[#bfd7ed] to-[#0074b7] rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-quote-left text-white text-2xl"></i>
                </div>
                <p
                  id="personal-message"
                  className="text-xl text-[var(--color-text)] leading-relaxed italic max-w-3xl mx-auto"
                >
                  {getTranslation('personal-message', currentLanguage)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {featureCards.map((card) => (
                  <div key={card.idPrefix} className={card.wrapperClasses}>
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                      <div className="flex-shrink-0">
                        <div className={card.iconClasses}>
                          <i className={`${card.icon} text-white text-lg`}></i>
                        </div>
                      </div>
                      <div>
                        <h3
                          id={`${card.idPrefix}-title`}
                          className="text-lg font-bold text-[var(--color-text)] mb-2"
                        >
                          {getTranslation(`${card.idPrefix}-title`, currentLanguage)}
                        </h3>
                        <p
                          id={`${card.idPrefix}-desc`}
                          className="text-[var(--color-text-muted)] text-sm leading-relaxed"
                        >
                          {getTranslation(`${card.idPrefix}-desc`, currentLanguage)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <i className="fas fa-exclamation-triangle text-yellow-600 text-2xl mr-3 rtl:ml-3 rtl:mr-0"></i>
                  <h3
                    id="warning-title"
                    className="text-lg font-bold text-yellow-800"
                  >
                    {getTranslation('warning-title', currentLanguage)}
                  </h3>
                </div>
                <p
                  id="warning-message"
                  className="text-yellow-700 leading-relaxed"
                >
                  {getTranslation('warning-message', currentLanguage)}
                </p>
              </div>

              <div className="text-center mt-12">
                <a
                  href="#packages"
                  className="inline-block bg-gradient-to-r from-[#bfd7ed] to-[#0074b7] text-white px-8 py-4 rounded-full font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <i className="fas fa-rocket mr-2 rtl:ml-2 rtl:mr-0"></i>
                  <span id="cta-choose-text">
                    {getTranslation('cta-choose-text', currentLanguage)}
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

WhyChooseMe.displayName = 'WhyChooseMe';

export default WhyChooseMe;

