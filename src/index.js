import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

/** Remove production SW/cache on localhost so dev assets are not intercepted. */
function clearStaleServiceWorkersInDev() {
  if (process.env.NODE_ENV === 'production' || !('serviceWorker' in navigator)) {
    return;
  }
  const host = window.location.hostname;
  const isLocal =
    host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
  if (!isLocal) return;

  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister().then((removed) => {
        if (removed) {
          console.info('[dev] Unregistered stale service worker');
        }
      });
    });
  });
  if ('caches' in window) {
    caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
  }
}

clearStaleServiceWorkersInDev();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);
        setInterval(() => registration.update(), 60 * 60 * 1000);
      })
      .catch((error) => {
        console.warn('Service Worker registration failed:', error);
      });
  });
}

if (process.env.NODE_ENV === 'production') {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => reportWebVitals(), { timeout: 10000 });
  } else {
    setTimeout(() => reportWebVitals(), 10000);
  }
}
