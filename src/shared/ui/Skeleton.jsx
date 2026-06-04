import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';

const Skeleton = ({ variant = 'text', className, width, height }) => {
  const variants = {
    text: 'h-4 rounded-md w-full',
    title: 'h-6 rounded-md w-3/4',
    circle: 'rounded-full aspect-square',
    rect: 'rounded-lg w-full',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-[var(--color-border)]/60',
        variants[variant] || variants.text,
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

Skeleton.propTypes = {
  variant: PropTypes.oneOf(['text', 'title', 'circle', 'rect']),
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export const SkeletonGroup = ({ count = 3, className }) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} variant="text" />
    ))}
  </div>
);

export default Skeleton;
