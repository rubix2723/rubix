import { useState } from "react";
import type { IconProps } from "./icon-types";
import { LazyMotion, domMin, m, useReducedMotion } from "./icon-motion";

export function CameraIcon({
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
          d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { scale: [1, 0.98, 1] }
              : { scale: 1 }
          }
          transition={{ duration: duration, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: "12px 13px" }}
        />
        <m.circle
          cx="12"
          cy="13"
          r="4"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { scale: [1, 1.15, 1] }
              : { scale: 1 }
          }
          transition={{ duration: duration, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: "12px 13px" }}
        />
      </svg>
    </LazyMotion>
  );
}
