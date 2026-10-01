import { useState } from "react";
import type { IconProps } from "./icon-types";
import { LazyMotion, domMin, m, useReducedMotion } from "./icon-motion";

export function SearchIcon({
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
          cx="11"
          cy="11"
          r="7"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { pathLength: [0.2, 1], rotate: [0, 90] }
              : { pathLength: 1, rotate: 0 }
          }
          transition={{ duration: duration, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: "11px 11px" }}
        />
        <m.path
          d="M21 21l-4.35-4.35"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { pathLength: [0, 1], opacity: [0.2, 1] }
              : { pathLength: 1, opacity: 1 }
          }
          transition={{
            duration: duration * 0.7,
            delay: active ? duration * 0.2 : 0,
            ease: [0.23, 1, 0.32, 1],
          }}
        />
      </svg>
    </LazyMotion>
  );
}
