import { useEffect, useRef } from 'react';
import { loadThreeJSOnIntersect, loadThreeJSOnInteraction } from '../../../shared/lib/threeLoader';

const PARTICLE_COLOR = 0x9bea00;

export function useSquashThreeBackground(options = {}) {
  const canvasRef = useRef(null);
  const particleColor = options.color ?? PARTICLE_COLOR;
  const particlesCount = options.particlesCount;

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    const cleanupIntersect = loadThreeJSOnIntersect(canvasRef.current, {
      rootMargin: options.rootMargin ?? '200px',
      threshold: 0.1,
      once: true,
    });
    const cleanupInteraction = loadThreeJSOnInteraction(['scroll', 'touchstart', 'click']);

    let checkInterval;
    const checkAndInit = () => {
      if (window.THREE && canvasRef.current && !canvasRef.current.threeInitialized) {
        clearInterval(checkInterval);
        initThreeJS();
      }
    };
    checkInterval = setInterval(checkAndInit, 200);
    const timeout = setTimeout(() => clearInterval(checkInterval), 10000);

    const initThreeJS = () => {
      const THREE = window.THREE;
      if (!THREE || !canvasRef.current || canvasRef.current.threeInitialized) return;
      const canvas = canvasRef.current;
      canvas.threeInitialized = true;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        canvas.offsetWidth / canvas.offsetHeight || 1,
        0.1,
        1000
      );
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const isMobile =
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const count = particlesCount ?? (isMobile ? 100 : 200);
      const geometry = new THREE.BufferGeometry();
      const posArray = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 10;
        posArray[i + 1] = (Math.random() - 0.5) * 10;
        posArray[i + 2] = (Math.random() - 0.5) * 10;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const material = new THREE.PointsMaterial({
        size: 0.05,
        color: particleColor,
        transparent: true,
        opacity: 0.55,
      });
      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      let animationId;
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        particles.rotation.x += 0.001;
        particles.rotation.y += 0.0015;
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        if (!canvas) return;
        camera.aspect = canvas.offsetWidth / canvas.offsetHeight || 1;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
      };
      window.addEventListener('resize', onResize);
      canvas._squashThreeCleanup = () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', onResize);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    };

    return () => {
      cleanupIntersect();
      cleanupInteraction();
      clearInterval(checkInterval);
      clearTimeout(timeout);
      if (canvasRef.current?._squashThreeCleanup) {
        canvasRef.current._squashThreeCleanup();
      }
      if (canvasRef.current) {
        canvasRef.current.threeInitialized = false;
      }
    };
  }, [particleColor, particlesCount, options.rootMargin]);

  return canvasRef;
}

export default useSquashThreeBackground;
