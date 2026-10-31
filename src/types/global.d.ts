import type Lenis from "lenis";

declare global {
  interface Window {
    /** Smooth-scroll instance set by SmoothScroll (desktop only). Kept off
     *  `window.lenis`, which the lenis package itself writes metadata to. */
    __hcLenis?: Lenis;
  }
}

export {};
