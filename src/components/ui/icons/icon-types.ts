import type { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** Size in pixels (viewBox remains 24x24) */
  size?: number;
  /** Stroke color override (defaults to currentColor) */
  color?: string;
  /** Custom duration in seconds */
  duration?: number;
  /** Imperative active/animated trigger state */
  isAnimated?: boolean;
  /** CSS class names */
  className?: string;
}
