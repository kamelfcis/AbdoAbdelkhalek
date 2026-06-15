import React from 'react';

export const VideoSkeleton = () => {
  return (
    <div className="bg-[var(--color-surface)] rounded-lg shadow-lg overflow-hidden animate-pulse">
      <div className="relative h-48 bg-[var(--color-bg-muted)]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-[var(--color-border)] rounded-full"></div>
        </div>
      </div>
      <div className="p-4">
        <div className="h-5 bg-[var(--color-bg-muted)] rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-[var(--color-bg-muted)] rounded mb-2 w-1/2"></div>
        <div className="h-4 bg-[var(--color-bg-muted)] rounded w-1/4"></div>
      </div>
    </div>
  );
};

export const VideoSkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <VideoSkeleton key={index} />
      ))}
    </div>
  );
};

