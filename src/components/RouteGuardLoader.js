import React from 'react';

const RouteGuardLoader = ({ message = 'Checking authentication...' }) => (
  <div
    className="flex items-center justify-center min-h-screen bg-gray-100"
    role="status"
    aria-live="polite"
    aria-label={message}
  >
    <div className="rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#0074b7] animate-spin" aria-hidden="true" />
    <span className="sr-only">{message}</span>
  </div>
);

export default RouteGuardLoader;
