import { useState } from "react";
import type { IconProps } from "./icon-types";
import { LazyMotion, domMin, m, useReducedMotion } from "./icon-motion";

export function PlusIcon({
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
        <m.g
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { rotate: [0, 90], scale: [1, 1.08, 1] }
              : { rotate: 0, scale: 1 }
          }
          transition={{ duration: duration, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: "12px 12px" }}
        >
          <m.line
            x1="5"
            y1="12"
            x2="19"
            y2="12"
            initial={false}
            animate={
              shouldReduceMotion
                ? {}
                : active
                ? { pathLength: [0.3, 1] }
                : { pathLength: 1 }
            }
            transition={{ duration: duration, ease: [0.23, 1, 0.32, 1] }}
          />
          <m.line
            x1="12"
            y1="5"
            x2="12"
            y2="19"
            initial={false}
            animate={
              shouldReduceMotion
                ? {}
                : active
                ? { pathLength: [0.3, 1] }
                : { pathLength: 1 }
            }
            transition={{ duration: duration, ease: [0.23, 1, 0.32, 1] }}
          />
        </m.g>
      </svg>
    </LazyMotion>
  );
}
