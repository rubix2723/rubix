// Motion Preferences & Accessibility Helper
// Detects prefers-reduced-motion and provides reactive subscription

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function onReducedMotionChange(callback: (reduced: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {};
  
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handler = (e: MediaQueryListEvent) => callback(e.matches);
  
  mql.addEventListener("change", handler);
  return () => mql.removeEventListener("change", handler);
}
