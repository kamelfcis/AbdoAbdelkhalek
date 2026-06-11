import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cn } from 'lib/utils';
import { isImagePrefetched } from '../lib/prefetchImages';

/**
 * Lightweight dashboard list thumbnail — no IntersectionObserver or srcSet.
 */
export default function DashboardThumb({
  src,
  fallbackSrc,
  alt = '',
  width,
  height,
  className,
  imgClassName,
  priority = false,
  instant = false,
  onError,
}) {
  const prefetched = instant && src && isImagePrefetched(src);
  const [loaded, setLoaded] = useState(prefetched);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setLoaded(instant && src && isImagePrefetched(src));
    setFailed(false);
  }, [src, instant]);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const handleError = useCallback(
    (e) => {
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setLoaded(false);
        return;
      }
      setFailed(true);
      onError?.(e);
    },
    [fallbackSrc, currentSrc, onError]
  );

  if (!currentSrc || failed) {
    return (
      <div
        className={cn('flex items-center justify-center bg-muted text-muted-foreground', className)}
        style={width && height ? { width, height } : undefined}
        aria-hidden={!alt}
      >
        <i className="fas fa-image text-xs opacity-50" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden bg-muted', className)}
      style={width && height ? { width, height } : undefined}
    >
      {!loaded && !prefetched && (
        <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />
      )}
      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className={cn(
          'h-full w-full object-cover',
          !instant && 'transition-opacity duration-200',
          loaded ? 'opacity-100' : 'opacity-0',
          imgClassName
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

DashboardThumb.propTypes = {
  src: PropTypes.string,
  fallbackSrc: PropTypes.string,
  alt: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  className: PropTypes.string,
  imgClassName: PropTypes.string,
  priority: PropTypes.bool,
  instant: PropTypes.bool,
  onError: PropTypes.func,
};
