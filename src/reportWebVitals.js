function defaultReporter(metric) {
  if (typeof console !== 'undefined' && typeof console.debug === 'function') {
    console.debug('[web-vitals]', metric.name, metric.value, metric.id);
  }
  if (typeof window !== 'undefined' && typeof window.va === 'function') {
    window.va('event', {
      name: metric.name,
      data: {
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
      },
    });
  }
}

const reportWebVitals = (onPerfEntry = defaultReporter) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
