"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type Props = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  radius?: number;
  strength?: number;
  as?: "button" | "a";
  href?: string;
  style?: React.CSSProperties;
};

export default function MagneticButton({
  children,
  className = "",
  onClick,
  radius = 80,
  strength = 0.35,
  as = "button",
  href,
  style = {},
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 250, damping: 20 });
  const y = useSpring(my, { stiffness: 250, damping: 20 });

  const handleMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < radius + Math.max(r.width, r.height) / 2) {
      mx.set(dx * strength);
      my.set(dy * strength);
    } else {
      mx.set(0);
      my.set(0);
    }
  };
  
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const MotionTag = as === "a" ? motion.a : motion.button;
  
  return (
    <MotionTag
      ref={ref as never}
      href={href}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ ...style, x, y }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`magnetic-target ${className}`}
    >
      {children}
    </MotionTag>
  );
}
