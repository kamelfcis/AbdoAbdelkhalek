import React, { Suspense, lazy, forwardRef } from 'react';

let splideCssLoaded = false;

function ensureSplideCss() {
  if (splideCssLoaded) return;
  splideCssLoaded = true;
  import('@splidejs/splide/dist/css/splide.min.css');
}

const SplideRoot = lazy(() =>
  import(/* webpackChunkName: "splide" */ '@splidejs/react-splide').then((mod) => {
    ensureSplideCss();
    return { default: mod.Splide };
  })
);

const SplideSlideRoot = lazy(() =>
  import(/* webpackChunkName: "splide" */ '@splidejs/react-splide').then((mod) => {
    ensureSplideCss();
    return { default: mod.SplideSlide };
  })
);

const SplideFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]" role="status" aria-label="Loading slider">
    <div className="rounded-full h-8 w-8 border-2 border-gray-200 border-t-[var(--color-primary)] animate-spin" />
  </div>
);

export const LazySplide = forwardRef(function LazySplide(props, ref) {
  ensureSplideCss();
  return (
    <Suspense fallback={<SplideFallback />}>
      <SplideRoot ref={ref} {...props} />
    </Suspense>
  );
});

export function LazySplideSlide(props) {
  return (
    <Suspense fallback={<div className="min-h-[180px]" aria-hidden="true" />}>
      <SplideSlideRoot {...props} />
    </Suspense>
  );
}
