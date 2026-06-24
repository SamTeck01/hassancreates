"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Briefcase02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import MagneticButton from "./MagneticButton";
import StaggeredText from "./StaggeredText";

// ── SparkIcon ─────────────────────────────────────────────────────────────────
// The exported Figma SVG asset (39×28 px, node #2003:43).
const SparkIcon = ({ isMobile }: { isMobile: boolean }) => (
  <motion.span
    className="absolute inline-flex"
    style={{
      top: isMobile ? "2px" : "12px",
      right: isMobile ? "-14px" : "-24px",
    }}
    animate={{ scale: [1, 1.18, 1], rotate: [0, 10, -5, 0] }}
    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
  >
    <Image src="/spark.svg" alt="" width={isMobile ? 12 : 24} height={isMobile ? 9 : 18} priority />
  </motion.span>
);

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 800], [0, 200]);

  // Avatar tilt calculations
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-6, 6]), { stiffness: 200, damping: 20 });

  const avatarRectRef = useRef<DOMRect | null>(null);

  const onMove = (e: React.MouseEvent) => {
    let r = avatarRectRef.current;
    if (!r) {
      r = e.currentTarget.getBoundingClientRect();
      avatarRectRef.current = r;
    }
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  // States for vertical slot-reel text animation
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const states = ["Hassan!", "a Motion Designer", "a Visual Designer"];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      requestAnimationFrame(() => {
        setPrefersReducedMotion(true);
      });
    }
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Fast transitions (cycleCount < 6) for first 2 full loops (~400ms per state),
    // then slow transitions (~1500ms per state) indefinitely.
    const isFastPhase = cycleCount < 6;
    const delay = isFastPhase ? 400 : 1500;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % 3);
      setCycleCount((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [cycleCount, prefersReducedMotion]);

  return (
    <section ref={ref} id="top" className="relative min-h-screen overflow-hidden flex flex-col justify-center">
      {/* Parallax Background */}
      <motion.div
        style={{ y: bgY, backgroundImage: "url(/new-bg-hero.png)" }}
        className="absolute inset-0 -top-20 -bottom-20 bg-cover bg-center z-0"
      />
      {/* Soft white gradient fade mask layers */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent z-0" />

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-5xl px-3 pt-52 pb-24 text-center">
        {/* Soft white glow/scrim layer behind the hero text content */}
        <div className="absolute inset-x-0 top-1/3 mx-auto h-[300px] w-[850px] max-w-[95%] bg-white/60 rounded-full filter blur-[90px] pointer-events-none z-0" />

        {/* Line 1: Hi, I'm [avatar] [cycling text] */}
        <div className="relative flex flex-nowrap items-center justify-center gap-1.5 md:gap-3 text-[clamp(20px,4.2vw,28px)] md:text-[clamp(28px,4.5vw,46px)] font-medium text-black z-10 whitespace-nowrap">
          <StaggeredText
            text="Hi,"
            delay={1.1}
            className="font-kyiv-sans font-medium tracking-[-0.02em]"
          />
          <StaggeredText
            text="I'm"
            delay={1.2}
            className="font-kyiv-serif font-light text-[#6B21D9]"
          />
          
          {/* Avatar with 3D tilt */}
          <motion.div
            onMouseMove={onMove}
            onMouseLeave={() => {
              avatarRectRef.current = null;
              mx.set(0);
              my.set(0);
            }}
            style={{ rotateX: rx, rotateY: ry, transformPerspective: 600 }}
            className="inline-block cursor-pointer select-none"
          >
            <motion.div
              style={{
                width: isMobile ? 26 : 46,
                height: isMobile ? 26 : 46,
                borderRadius: "50%",
                border: isMobile ? "1px solid #6B21D9" : "2px solid #6B21D9",
                boxShadow: isMobile 
                  ? "0px 2px 6px rgba(107,33,217,0.25)"
                  : "0px 1px 3px rgba(0,0,0,0.10), 0px 5px 5px rgba(0,0,0,0.09), 0px 12px 7px rgba(0,0,0,0.05), 0px 4px 14px rgba(107,33,217,0.30)",
                overflow: "hidden",
                background: "#fff",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: 1.25 }}
              whileHover={{ scale: 1.12, boxShadow: "0px 8px 24px rgba(107,33,217,0.38)" }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Image
                src="/avatar.png"
                alt="Hassan"
                fill
                sizes={isMobile ? "26px" : "46px"}
                className="object-cover"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Cycling text */}
          {prefersReducedMotion ? (
            <span className="font-kyiv-serif font-medium">{states[currentIndex]}</span>
          ) : (
            <span className="relative inline-flex overflow-hidden align-middle select-none justify-start">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={currentIndex}
                  initial={{ y: "-100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="font-kyiv font-medium text-[#6B21D9] pl-1 pr-1 inline-block whitespace-nowrap"
                >
                  {states[currentIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          )}
        </div>

        {/* Line 2-3: I turn ideas into visuals that stick. */}
        <h1 className="relative mt-6 text-[clamp(30px,6vw,44px)] md:text-[clamp(44px,7.5vw,74px)] font-medium leading-[1.05] text-black z-10 tracking-[-0.04em]">
          <StaggeredText
            text="I turn"
            delay={1.3}
            className="font-kyiv-sans font-medium text-[#000]"
          />
          <span className="inline-block">&nbsp;</span>
          <span className="relative inline-block font-kyiv font-bold text-[#6B21D9]">
            <StaggeredText text="ideas" delay={1.45} />
            <SparkIcon isMobile={isMobile} />
          </span>
          <br />
          <StaggeredText
            text="into"
            delay={1.6}
            className="font-kyiv-sans font-medium text-[#000]"
          />
          <span className="inline-block">&nbsp;</span>
          <span
            className="font-kyiv font-bold text-[#6B21D9]"
            style={{
              display: "inline-block",
            }}
          >
            <StaggeredText text="visuals" delay={1.7} />
          </span>
          <span className="inline-block">&nbsp;</span>
          <StaggeredText
            text="that stick."
            delay={1.85}
            className="font-kyiv-sans font-medium text-[#000]"
          />
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 16, delay: 2.0 }}
          className="relative mt-7 mx-auto max-w-[600px] text-[17px] font-light text-[#444] font-kyiv-sans z-10"
        >
          Working at the intersection of strategy and aesthetics to make that happen.
        </motion.p>

        {/* Magnetic CTA buttons */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 16, delay: 2.2 }}
          className="relative mt-14 flex flex-wrap items-center justify-center gap-4 z-10"
        >
          <MagneticButton
            as="a"
            href="#works"
            radius={60}
            className="h-[58px] px-7 rounded-full bg-white border border-[#6B21D9] text-[#6B21D9] text-[15px] font-medium font-kyiv-sans flex items-center gap-2 hover:bg-[#FAF6FF] transition-colors shadow-[0_4px_14px_rgba(107,33,217,0.08)] cursor-pointer"
          >
            <HugeiconsIcon icon={Briefcase02Icon} size={20} strokeWidth={2} /> View my works
          </MagneticButton>
          <MagneticButton
            as="a"
            href="#contact"
            radius={60}
            className="group h-[58px] px-7 rounded-full bg-[#6B21D9] text-white text-[15px] font-medium font-kyiv-sans flex items-center gap-2 hover:shadow-[0_10px_28px_rgba(107,33,217,0.5)] transition-shadow cursor-pointer"
          >
            Let&apos;s Talk
            <motion.span className="flex items-center" animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={2} />
            </motion.span>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
