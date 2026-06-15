/**
 * Optimized Image Component
 * Provides lazy loading, responsive images, and performance optimization
 */
import React, { useState, useRef, useEffect } from 'react';
import { getOptimizedImageUrl, generateSrcSet, generateSizes } from '../../../shared/lib/imageOptimizer';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  priority = false,
  sizes,
  srcSet,
  onLoad,
  onError,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(priority ? src : placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Optimize image URL
  const optimizedSrc = src ? getOptimizedImageUrl(src, {
    mobileWidth: 640,
    tabletWidth: 1024,
    desktopWidth: 1280,
  }) : '';

  // Generate srcset if not provided
  const imageSrcSet = srcSet || (src ? generateSrcSet(src) : '');
  const imageSizes = sizes || generateSizes();

  useEffect(() => {
    if (priority && optimizedSrc) {
      setImageSrc(optimizedSrc);
    } else if (!priority && imgRef.current) {
      // Use Intersection Observer for lazy loading
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && imageSrc === placeholder) {
              setImageSrc(optimizedSrc);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.01,
        }
      );

      observer.observe(imgRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [optimizedSrc, priority, placeholder, imageSrc]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  // Aspect ratio box to prevent layout shift
  const aspectRatioStyle = width && height ? {
    paddingBottom: `${(height / width) * 100}%`,
  } : {};

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={aspectRatioStyle}
    >
      {width && height && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          aria-hidden="true"
        />
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt || ''}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        srcSet={imageSrcSet || undefined}
        sizes={imageSrcSet ? imageSizes : undefined}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${hasError ? 'opacity-0' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
        {...props}
      />
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-[var(--color-bg-muted)] animate-pulse"
          aria-hidden="true"
        />
      )}
      {hasError && (
        <div
          className="absolute inset-0 bg-[var(--color-bg-muted)] flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-[var(--color-text-muted)] text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;


