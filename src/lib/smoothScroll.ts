/** Pause/resume the desktop smooth scroller (no-op on touch devices). */
export function pauseSmoothScroll() {
  if (typeof window !== "undefined") window.__hcLenis?.stop();
}

export function resumeSmoothScroll() {
  if (typeof window !== "undefined") window.__hcLenis?.start();
}
