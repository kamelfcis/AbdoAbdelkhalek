import { useReducedMotion } from 'framer-motion';

export const EASE_PREMIUM = [0.22, 1, 0.36, 1];

export const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_PREMIUM },
  },
};

export const slideFromEndVariants = (isRTL) => ({
  hidden: { opacity: 0, x: isRTL ? -32 : 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: EASE_PREMIUM },
  },
});

export const statFloatVariants = {
  initial: { y: 0 },
  animate: {
    y: [-2, 2, -2],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const glassHover = {
  whileHover: { y: -4, transition: { duration: 0.25 } },
};

export function useLoginMotion() {
  const reduce = useReducedMotion();
  return {
    reduce,
    initial: reduce ? false : 'hidden',
    animate: reduce ? false : 'visible',
    whileHover: reduce ? undefined : glassHover.whileHover,
    statAnimate: reduce ? undefined : 'animate',
  };
}
