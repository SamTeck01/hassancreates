"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    // Disable smooth scrolling on mobile/touch devices for smooth native momentum scroll
    if (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 810) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.85,
    });
    (window as any).lenis = lenis;
    
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete (window as any).lenis;
    };
  }, []);
  
  return null;
}
