import { useState } from "react";
import type { IconProps } from "./icon-types";
import { LazyMotion, domMin, m, useReducedMotion } from "./icon-motion";

export function MotionPathIcon({
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
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-hidden="true"
        {...props}
      >
        {/* Kinetic Bezier Curve Path */}
        <m.path
          d="M3 18C7 6 15 20 21 6"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { pathLength: [0.65, 1], opacity: [0.7, 1] }
              : { pathLength: 1, opacity: 1 }
          }
          transition={{ duration, ease: [0.23, 1, 0.32, 1] }}
        />

        {/* Start Anchor Node */}
        <circle cx={3} cy={18} r={2} strokeWidth={1.75} />

        {/* End Target Node */}
        <m.circle
          cx={21}
          cy={6}
          r={2}
          strokeWidth={1.75}
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { scale: [0.85, 1.2, 1] }
              : { scale: 1 }
          }
          transition={{ duration: duration * 0.8, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: "21px 6px" }}
        />

        {/* Vector Tangent Control Points */}
        <m.path
          d="M10 11.5L14 12.5"
          strokeDasharray="1.5 1.5"
          strokeOpacity={0.6}
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { opacity: [0.3, 0.8] }
              : { opacity: 0.6 }
          }
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        />
        <circle cx={10} cy={11.5} r={1} fill="currentColor" />
        <circle cx={14} cy={12.5} r={1} fill="currentColor" />
      </svg>
    </LazyMotion>
  );
}
