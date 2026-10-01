import { LazyMotion, domMin, m, useReducedMotion, type Variants, type Transition } from "motion/react";

export { LazyMotion, domMin, m, useReducedMotion };

/**
 * Standard calibrated transition easing for RUBIX motion language
 * Uses cubic-bezier(0.23, 1, 0.32, 1) — responsive, controlled, no bounce
 */
export const RUBIX_TRANSITION: Transition = {
  duration: 0.45,
  ease: [0.23, 1, 0.32, 1],
};

/**
 * Standard path drawing variants
 */
export const drawVariants: Variants = {
  normal: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.2 },
  },
  animate: {
    pathLength: [0, 1],
    opacity: [0.3, 1],
    transition: {
      duration: 0.45,
      ease: [0.23, 1, 0.32, 1],
    },
  },
};
