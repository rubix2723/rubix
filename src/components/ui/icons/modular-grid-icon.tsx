import { useState } from "react";
import type { IconProps } from "./icon-types";
import { LazyMotion, domMin, m, useReducedMotion } from "./icon-motion";

export function ModularGridIcon({
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
        {/* Module 1 (Top-Left Token) */}
        <m.rect
          x={3}
          y={3}
          width={7}
          height={7}
          rx={1.5}
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { scale: [0.93, 1], opacity: [0.7, 1] }
              : { scale: 1, opacity: 1 }
          }
          transition={{ duration, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: "6.5px 6.5px" }}
        />

        {/* Module 2 (Top-Right Component) */}
        <m.rect
          x={14}
          y={3}
          width={7}
          height={7}
          rx={1.5}
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { scale: [0.93, 1], opacity: [0.7, 1] }
              : { scale: 1, opacity: 1 }
          }
          transition={{ duration, delay: 0.05, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: "17.5px 6.5px" }}
        />

        {/* Module 3 (Bottom-Left Foundation) */}
        <m.rect
          x={3}
          y={14}
          width={7}
          height={7}
          rx={1.5}
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { scale: [0.93, 1], opacity: [0.7, 1] }
              : { scale: 1, opacity: 1 }
          }
          transition={{ duration, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: "6.5px 17.5px" }}
        />

        {/* Module 4 (Bottom-Right Variant) */}
        <m.rect
          x={14}
          y={14}
          width={7}
          height={7}
          rx={1.5}
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { scale: [0.93, 1], opacity: [0.7, 1] }
              : { scale: 1, opacity: 1 }
          }
          transition={{ duration, delay: 0.12, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: "17.5px 17.5px" }}
        />

        {/* Alignment Axis Indicators */}
        <line x1={10} y1={6.5} x2={14} y2={6.5} strokeDasharray="1.5 1.5" strokeOpacity={0.6} />
        <line x1={6.5} y1={10} x2={6.5} y2={14} strokeDasharray="1.5 1.5" strokeOpacity={0.6} />
      </svg>
    </LazyMotion>
  );
}
