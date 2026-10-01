import { useState } from "react";
import type { IconProps } from "./icon-types";
import { LazyMotion, domMin, m, useReducedMotion } from "./icon-motion";

export function CalendarIcon({
  size = 24,
  color = "currentColor",
  duration = 0.45,
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
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <m.path
          d="M16 2v4M8 2v4"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { y: [-2, 0], opacity: [0.5, 1] }
              : { y: 0, opacity: 1 }
          }
          transition={{ duration: duration * 0.7, ease: [0.23, 1, 0.32, 1] }}
        />
        <m.path
          d="M3 10h18"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { pathLength: [0, 1], opacity: [0.2, 1] }
              : { pathLength: 1, opacity: 1 }
          }
          transition={{
            duration: duration * 0.8,
            delay: active ? duration * 0.15 : 0,
            ease: [0.23, 1, 0.32, 1],
          }}
        />
      </svg>
    </LazyMotion>
  );
}
