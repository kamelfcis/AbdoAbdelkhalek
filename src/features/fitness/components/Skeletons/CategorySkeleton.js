import React from 'react';

export const CategorySkeleton = () => {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl overflow-hidden shadow-lg animate-pulse">
      <div className="h-48 bg-[var(--color-bg-muted)]"></div>
      <div className="p-6">
        <div className="h-6 bg-[var(--color-bg-muted)] rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-[var(--color-bg-muted)] rounded mb-4 w-full"></div>
        <div className="h-4 bg-[var(--color-bg-muted)] rounded w-1/3"></div>
      </div>
    </div>
  );
};

export const CategorySkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <CategorySkeleton key={index} />
      ))}
    </div>
  );
};

