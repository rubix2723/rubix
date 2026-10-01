import { useState } from "react";
import type { IconProps } from "./icon-types";
import { LazyMotion, domMin, m, useReducedMotion } from "./icon-motion";

export function ZapIcon({
  size = 24,
  color = "currentColor",
  duration = 0.4,
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
        <m.path
          d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? {
                  pathLength: [0.6, 1],
                  scale: [1, 1.05, 1],
                  rotate: [0, -2, 1, 0],
                }
              : { pathLength: 1, scale: 1, rotate: 0 }
          }
          transition={{
            duration: duration,
            ease: [0.23, 1, 0.32, 1],
          }}
          style={{ transformOrigin: "12px 12px" }}
        />
      </svg>
    </LazyMotion>
  );
}
