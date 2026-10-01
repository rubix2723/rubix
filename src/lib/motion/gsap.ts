import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let isRegistered = false;

export function initGSAP() {
  if (typeof window === "undefined") return;
  if (!isRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    isRegistered = true;
  }
}

export function getGSAP() {
  initGSAP();
  return { gsap, ScrollTrigger };
}

export { gsap, ScrollTrigger };
