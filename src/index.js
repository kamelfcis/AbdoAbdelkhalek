import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Mark body as loaded to prevent FOUC - do this immediately
if (document.body) {
  document.body.classList.add('loaded');
} else {
  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
  });
}

// Initialize app immediately for fastest FCP
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  </React.StrictMode>
);

// Defer web vitals reporting to avoid blocking - only in production
if (process.env.NODE_ENV === 'production') {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      reportWebVitals();
    }, { timeout: 10000 });
  } else {
    setTimeout(() => reportWebVitals(), 10000);
  }
}
