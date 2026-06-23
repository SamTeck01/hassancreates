"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 150, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 150, damping: 18, mass: 0.6 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      setHovering(!!t.closest("a, button, [data-cursor='hover'], .magnetic-target"));
    };
    
    const down = () => setClicking(true);
    const up = () => setClicking(false);
    
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full hidden md:block"
      style={{
        x: sx,
        y: sy,
        translateX: "-50%",
        translateY: "-50%",
        mixBlendMode: "difference",
        opacity: visible ? 1 : 0,
        width: 48,
        height: 48,
      }}
      animate={{
        scale: hovering ? (clicking ? 0.7 : 1) : (clicking ? 0.18 : 0.25),
        backgroundColor: hovering ? "rgba(107, 33, 217, 0.2)" : "rgba(255, 255, 255, 1)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <span className="block w-full h-full rounded-full border border-[#6B21D9]" />
    </motion.div>
  );
}
