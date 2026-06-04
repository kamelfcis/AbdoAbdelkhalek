import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import OptimizedImage from './OptimizedImage';

const AboutCoach = React.memo(() => {
  const { currentLanguage } = useLanguage();
  const canvasRef = useRef(null);
  const THREE = window?.THREE;

  useEffect(() => {
    if (!canvasRef.current || !THREE) {
      return;
    }

    const canvas = canvasRef.current;
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

    const particlesCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 12;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x0074b7,
      transparent: true,
      opacity: 0.55,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      particles.rotation.x += 0.0015;
      particles.rotation.y += 0.0025;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeRenderer);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [THREE]);

  return (
    <section
      id="about"
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
        id="about-three-canvas"
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0, width: '100%', height: '100%' }}
        width="1900"
        height="1241"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-gray-50/90 to-white/90"
        style={{ zIndex: 1 }}
      ></div>

      <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <OptimizedImage
                src="/logo.png"
                alt="Abdelrahman Abdelkhalek"
                className="w-full h-auto rounded-lg shadow-xl"
                width={400}
                height={400}
                loading="eager"
                priority={true}
              />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#bfd7ed] rounded-lg -z-10"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#0074b7] rounded-lg -z-10"></div>
            </div>
            <div>
              <h2
                id="about-title"
                className="text-4xl font-bold mb-6 gradient-text"
              >
                {getTranslation('about-title', currentLanguage)}
              </h2>
              <p
                id="about-content"
                className="text-gray-700 mb-6 text-lg leading-relaxed"
              >
                {getTranslation('about-content', currentLanguage)}
              </p>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <div className="w-16 h-1 bg-[#bfd7ed]"></div>
                <div className="w-16 h-1 bg-[#0074b7]"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-gradient-to-br from-[#0074b7] to-[#0074b7]/90 text-white p-8 rounded-xl shadow-lg hover:scale-[1.02] transition-transform">
              <h3
                id="specialization-title"
                className="text-2xl font-bold mb-4 flex items-center"
              >
                {getTranslation('specialization-title', currentLanguage)}
              </h3>
              <ul className="space-y-2">
                {[1, 2, 3, 4].map((idx) => (
                  <li key={idx} className="flex items-center">
                    <i className="fas fa-check-circle mr-2"></i>
                    <span id={`specialization-${idx}`}>
                      {getTranslation(`specialization-${idx}`, currentLanguage)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#0074b7] to-[#0074b7]/90 text-white p-8 rounded-xl shadow-lg hover:scale-[1.02] transition-transform">
              <h3
                id="methodology-title"
                className="text-2xl font-bold mb-4 flex items-center"
              >
                {getTranslation('methodology-title', currentLanguage)}
              </h3>
              <p
                id="methodology-content"
                className="mb-4 text-gray-100 leading-relaxed"
              >
                {getTranslation('methodology-content', currentLanguage)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#0074b7] to-[#0074b7]/90 text-white p-8 rounded-xl shadow-lg hover:scale-[1.02] transition-transform">
              <h3
                id="approach-title"
                className="text-2xl font-bold mb-4 flex items-center"
              >
                {getTranslation('approach-title', currentLanguage)}
              </h3>
              <p
                id="approach-content"
                className="mb-4 text-gray-100 leading-relaxed"
              >
                {getTranslation('approach-content', currentLanguage)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

AboutCoach.displayName = 'AboutCoach';

export default AboutCoach;

