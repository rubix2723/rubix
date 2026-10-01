import { useState } from "react";
import type { IconProps } from "./icon-types";
import { LazyMotion, domMin, m, useReducedMotion } from "./icon-motion";

export function CartIcon({
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
        <m.path
          d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { pathLength: [0.4, 1] }
              : { pathLength: 1 }
          }
          transition={{ duration: duration, ease: [0.23, 1, 0.32, 1] }}
        />
        <m.circle
          cx="9"
          cy="21"
          r="1"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { scale: [0.2, 1], opacity: [0, 1] }
              : { scale: 1, opacity: 1 }
          }
          transition={{
            duration: duration * 0.6,
            delay: active ? duration * 0.2 : 0,
            ease: [0.23, 1, 0.32, 1],
          }}
          style={{ transformOrigin: "9px 21px" }}
        />
        <m.circle
          cx="20"
          cy="21"
          r="1"
          initial={false}
          animate={
            shouldReduceMotion
              ? {}
              : active
              ? { scale: [0.2, 1], opacity: [0, 1] }
              : { scale: 1, opacity: 1 }
          }
          transition={{
            duration: duration * 0.6,
            delay: active ? duration * 0.25 : 0,
            ease: [0.23, 1, 0.32, 1],
          }}
          style={{ transformOrigin: "20px 21px" }}
        />
      </svg>
    </LazyMotion>
  );
}
