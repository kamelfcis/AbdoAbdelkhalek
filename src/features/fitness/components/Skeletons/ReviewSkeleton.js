import React from 'react';

export const ReviewSkeleton = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded mb-2 w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
};

export const ReviewSkeletonList = ({ count = 3 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <ReviewSkeleton key={index} />
      ))}
    </div>
  );
};

