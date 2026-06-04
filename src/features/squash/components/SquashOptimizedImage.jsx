import React, { useMemo } from 'react';
import { cn } from '../../../shared/lib/cn';

export function SquashOptimizedImage({
  src,
  alt,
  className,
  width = 1200,
  priority = false,
  ...rest
}) {
  const optimizedSrc = useMemo(() => {
    if (!src || !src.includes('unsplash.com')) return src;
    if (src.includes('w=')) return src;
    const sep = src.includes('?') ? '&' : '?';
    return `${src}${sep}w=${width}&q=75&auto=format&fit=crop`;
  }, [src, width]);

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={cn(className)}
      {...rest}
    />
  );
}

export default SquashOptimizedImage;
