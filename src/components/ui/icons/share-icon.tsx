import { useState } from "react";
import type { IconProps } from "./icon-types";
import { LazyMotion, domMin, m, useReducedMotion } from "./icon-motion";

export function ShareIcon({
  size = 24,
  color = "currentColor",
  duration = 0.5,
  isAnimated,
  className,
  ...props
}: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const active = isAnimated ?? isHovered;

  return (
    <LazyMotion features={domMin}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-hidden="true"
        {...props}
      >
        <m.line
          x1="8.59"
          y1="13.51"
          x2="15.42"
          y2="17.49"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { pathLength: [0, 1], opacity: [0.2, 1] }
              : { pathLength: 1, opacity: 1 }
          }
          transition={{ duration: duration * 0.7, ease: [0.23, 1, 0.32, 1] }}
        />
        <m.line
          x1="15.41"
          y1="6.51"
          x2="8.59"
          y2="10.49"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { pathLength: [0, 1], opacity: [0.2, 1] }
              : { pathLength: 1, opacity: 1 }
          }
          transition={{ duration: duration * 0.7, ease: [0.23, 1, 0.32, 1] }}
        />
        <m.circle
          cx="18"
          cy="5"
          r="3"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { scale: [0.8, 1.1, 1] }
              : { scale: 1 }
          }
          transition={{ duration: duration * 0.8, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: "18px 5px" }}
        />
        <m.circle
          cx="6"
          cy="12"
          r="3"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { scale: [0.8, 1.1, 1] }
              : { scale: 1 }
          }
          transition={{ duration: duration * 0.8, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: "6px 12px" }}
        />
        <m.circle
          cx="18"
          cy="19"
          r="3"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { scale: [0.8, 1.1, 1] }
              : { scale: 1 }
          }
          transition={{ duration: duration * 0.8, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: "18px 19px" }}
        />
      </svg>
    </LazyMotion>
  );
}
