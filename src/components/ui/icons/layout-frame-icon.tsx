import { useState } from "react";
import type { IconProps } from "./icon-types";
import { LazyMotion, domMin, m, useReducedMotion } from "./icon-motion";

export function LayoutFrameIcon({
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
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-hidden="true"
        {...props}
      >
        {/* Outer Product Window Frame */}
        <m.rect
          x={3}
          y={3}
          width={18}
          height={18}
          rx={3}
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { pathLength: [0.8, 1], opacity: [0.7, 1] }
              : { pathLength: 1, opacity: 1 }
          }
          transition={{ duration, ease: [0.23, 1, 0.32, 1] }}
        />

        {/* Top Header Division */}
        <m.line
          x1={3}
          y1={8.5}
          x2={21}
          y2={8.5}
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { pathLength: [0.5, 1], opacity: [0.6, 1] }
              : { pathLength: 1, opacity: 1 }
          }
          transition={{ duration: duration * 0.9, delay: 0.05, ease: [0.23, 1, 0.32, 1] }}
        />

        {/* Left Hierarchy Sidebar */}
        <m.line
          x1={8.5}
          y1={8.5}
          x2={8.5}
          y2={21}
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { pathLength: [0.5, 1], opacity: [0.6, 1] }
              : { pathLength: 1, opacity: 1 }
          }
          transition={{ duration: duration * 0.9, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
        />

        {/* Precision Cursor Indicator */}
        <m.path
          d="m13.5 13.5 4 4m-3.5 0 3.5-3.5"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { x: [0, 1.5, 0], y: [0, 1.5, 0] }
              : { x: 0, y: 0 }
          }
          transition={{ duration: duration * 0.8, ease: [0.23, 1, 0.32, 1] }}
        />
      </svg>
    </LazyMotion>
  );
}
