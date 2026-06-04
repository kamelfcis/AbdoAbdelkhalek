import React, { useEffect, useRef } from 'react';

const LoadingModal = ({ isLoading, progress }) => {
  const progressCircleRef = useRef(null);

  useEffect(() => {
    if (progressCircleRef.current) {
      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(() => {
        if (progressCircleRef.current) {
          const circumference = 283; // 2 * PI * 45
          const offset = circumference - (progress / 100) * circumference;
          progressCircleRef.current.style.strokeDashoffset = offset;
        }
      });
    }
  }, [progress]);

  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 bg-white flex items-center justify-center z-[9999]" 
      style={{ willChange: 'opacity' }}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4" aria-hidden="true">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              ref={progressCircleRef}
              cx="50"
              cy="50"
              r="45"
              stroke="#0074b7"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset="283"
              className="transition-all duration-300 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Abdelrahman Abdelkhalek Logo"
              className="w-10 h-10 rounded-full object-cover animate-pulse shadow-lg"
              width="40"
              height="40"
            />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Loading</h3>
        <p className="text-sm text-gray-500">Please wait...</p>
      </div>
    </div>
  );
};

export default LoadingModal;

