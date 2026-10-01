import { useState } from "react";
import type { IconProps } from "./icon-types";
import { LazyMotion, domMin, m, useReducedMotion } from "./icon-motion";

export function HomeIcon({
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
        <m.path
          d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { pathLength: [0.3, 1], opacity: [0.5, 1] }
              : { pathLength: 1, opacity: 1 }
          }
          transition={{ duration: duration, ease: [0.23, 1, 0.32, 1] }}
        />
        <m.path
          d="M9 21V12h6v9"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { pathLength: [0, 1], opacity: [0, 1] }
              : { pathLength: 1, opacity: 1 }
          }
          transition={{
            duration: duration * 0.75,
            delay: active ? duration * 0.25 : 0,
            ease: [0.23, 1, 0.32, 1],
          }}
        />
      </svg>
    </LazyMotion>
  );
}
