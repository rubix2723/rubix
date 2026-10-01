import { useState } from "react";
import type { IconProps } from "./icon-types";
import { LazyMotion, domMin, m, useReducedMotion } from "./icon-motion";

export function UserIcon({
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
        <m.circle
          cx="12"
          cy="7"
          r="4"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { scale: [1, 1.08, 1], y: [0, -1, 0] }
              : { scale: 1, y: 0 }
          }
          transition={{ duration: duration, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: "12px 7px" }}
        />
        <m.path
          d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { pathLength: [0.4, 1], opacity: [0.4, 1] }
              : { pathLength: 1, opacity: 1 }
          }
          transition={{ duration: duration, ease: [0.23, 1, 0.32, 1] }}
        />
      </svg>
    </LazyMotion>
  );
}
