import { useState } from "react";
import type { IconProps } from "./icon-types";
import { LazyMotion, domMin, m, useReducedMotion } from "./icon-motion";

export function BellIcon({
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
        <m.g
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { rotate: [0, -7, 6, -3, 0] }
              : { rotate: 0 }
          }
          transition={{ duration: duration, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: "12px 3px" }}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </m.g>
      </svg>
    </LazyMotion>
  );
}
