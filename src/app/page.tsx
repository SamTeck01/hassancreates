"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useSpring, useMotionValue, useTransform, MotionValue } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Briefcase02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

// Brand purple pulled directly from the design file (rgb(107,33,217))
const PURPLE = "#6B21D9";

// ----------------------------------------------------------------------------
// Avatar — small circular line-art portrait that sits inline between "I'm" and
// "Hassan!". White disc, solid purple ring, simple hand-drawn face.
// ----------------------------------------------------------------------------
const CustomAvatar = ({ mouseX, mouseY }: { mouseX: MotionValue<number>; mouseY: MotionValue<number> }) => {
  const rotateX = useTransform(mouseY, [0, 800], [8, -8]);
  const rotateY = useTransform(mouseX, [0, 1200], [-8, 8]);

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative inline-flex items-center justify-center w-8 h-8 md:w-11 md:h-11 rounded-full mx-1 md:mx-1.5 align-middle overflow-hidden bg-white border-[2.5px] border-[#6B21D9] shadow-[0_4px_10px_rgba(107,33,217,0.25)] cursor-pointer select-none"
      whileHover={{ scale: 1.15, boxShadow: "0px 10px 20px rgba(107,33,217,0.35)" }}
      whileTap={{ scale: 0.95 }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Shirt */}
        <path d="M 18 100 Q 50 78 82 100 L 82 100 L 18 100 Z" fill="#FFFFFF" />
        <path d="M 18 100 Q 50 78 82 100" fill="none" stroke="#0f172a" strokeWidth="1.6" opacity="0.55" />
        <path d="M 40 82 Q 50 92 60 82" fill="none" stroke="#0f172a" strokeWidth="1.4" opacity="0.5" />

        {/* Neck */}
        <rect x="43" y="62" width="14" height="14" rx="5" fill="#E8A874" />

        {/* Head */}
        <circle cx="50" cy="50" r="25" fill="#F3BD8E" />

        {/* Cheek blush */}
        <ellipse cx="36" cy="56" rx="5" ry="3.2" fill="#E8845A" opacity="0.45" />
        <ellipse cx="64" cy="56" rx="5" ry="3.2" fill="#E8845A" opacity="0.45" />

        {/* Hair */}
        <path
          d="M 24 46 Q 24 20 50 19 Q 76 20 76 46 Q 70 34 58 33 Q 50 38 42 33 Q 30 34 24 46 Z"
          fill="#1c1410"
        />

        {/* Eyebrows */}
        <path d="M 38 47 Q 42 44 46 46.5" fill="none" stroke="#1c1410" strokeWidth="2" strokeLinecap="round" />
        <path d="M 54 46.5 Q 58 44 62 47" fill="none" stroke="#1c1410" strokeWidth="2" strokeLinecap="round" />

        {/* Eyes */}
        <circle cx="42" cy="53" r="1.8" fill="#1c1410" />
        <circle cx="58" cy="53" r="1.8" fill="#1c1410" />

        {/* Nose */}
        <path d="M 50 53 Q 48.5 59 51 60.5" fill="none" stroke="#1c1410" strokeWidth="1.3" opacity="0.5" strokeLinecap="round" />

        {/* Smile */}
        <path d="M 41 63 Q 50 70 59 63" fill="none" stroke="#1c1410" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
};

// ----------------------------------------------------------------------------
// Spark — small 3-stroke burst that sits beside "ideas" (not a full asterisk)
// ----------------------------------------------------------------------------
const SparkIcon = () => {
  return (
    <motion.svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className="absolute -top-1 -right-5 md:-top-1 md:-right-7 text-[#6B21D9]"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 10, -6, 0],
      }}
      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <line x1="6" y1="11" x2="4" y2="14" />
      <line x1="11" y1="9" x2="11" y2="4" />
      <line x1="16" y1="11" x2="19" y2="8" />
    </motion.svg>
  );
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const rawMouseX = useMotionValue(600);
  const rawMouseY = useMotionValue(300);

  const glowX = useSpring(rawMouseX, { damping: 45, stiffness: 120 });
  const glowY = useSpring(rawMouseY, { damping: 45, stiffness: 120 });

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));

    rawMouseX.set(window.innerWidth / 2);
    rawMouseY.set(window.innerHeight / 2);

    const handleMouseMove = (e: MouseEvent) => {
      rawMouseX.set(e.clientX);
      rawMouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      cancelAnimationFrame(handle);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [rawMouseX, rawMouseY]);

  const topGlowX = useTransform(glowX, (x) => x - 150);
  const topGlowY = useTransform(glowY, (y) => y - 150);
  const secondGlowX = useTransform(glowX, (x) => x - 200);
  const secondGlowY = useTransform(glowY, (y) => y - 200);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-white text-[#08070D] font-sans selection:bg-[#6B21D9]/20 selection:text-[#6B21D9] overflow-hidden">
      {/* Background designer mockup texture */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05] select-none mix-blend-multiply">
        <Image src="/bg-hero.png" alt="" fill priority className="object-cover object-center" />
      </div>

      {/* Cursor-follow ambient glow */}
      <motion.div
        style={{ left: topGlowX, top: topGlowY }}
        className="ambient-glow w-[300px] h-[300px] bg-[#cdb4f7] opacity-[0.35]"
      />
      <motion.div
        style={{ left: secondGlowX, top: secondGlowY }}
        className="ambient-glow w-[400px] h-[400px] bg-[#c4a4f5] opacity-[0.2]"
      />

      {/* Static top vignette */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[420px] bg-gradient-to-b from-[#6B21D9]/[0.07] to-transparent rounded-full filter blur-[120px] pointer-events-none z-0" />

      {/* ===================== Header ===================== */}
      <header className="w-full flex justify-center pt-8 px-6 z-40 relative">
        <motion.div
          className="relative w-full max-w-[460px] h-12 md:h-14 flex items-center justify-between pl-6 pr-4 rounded-full border border-white/15 shadow-[0_14px_28px_rgba(107,33,217,0.28)] select-none cursor-pointer overflow-hidden"
          style={{ backgroundColor: PURPLE }}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -2, boxShadow: "0px 18px 34px rgba(107,33,217,0.36)" }}
        >
          {/* Glossy highlight — matches the soft light patch right-of-center in the design */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 64% 35%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 35%, transparent 65%)",
            }}
          />

          <span className="relative text-white text-xs md:text-sm font-medium tracking-wide z-10">
            Welcome to my <span className="custom-underline after:bg-white after:h-[1.5px] font-semibold">Portfolio!</span>
          </span>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative z-10 w-8 h-8 md:w-9 md:h-9 flex flex-col items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            <div className="w-4 h-3 flex flex-col justify-between relative">
              <motion.span
                animate={isMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                className="w-full h-[2px] bg-white rounded-full origin-center"
              />
              <motion.span
                animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-3/4 h-[2px] bg-white rounded-full self-end"
              />
              <motion.span
                animate={isMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                className="w-full h-[2px] bg-white rounded-full origin-center"
              />
            </div>
          </button>
        </motion.div>
      </header>

      {/* ===================== Hero copy ===================== */}
      <main className="flex-1 w-full flex flex-col items-center justify-center px-6 py-10 md:py-16 z-10 relative">
        <div className="w-full max-w-4xl flex flex-col items-center text-center">
          <h1 className="text-black font-kyiv leading-[1.1] select-none tracking-tight">
            {/* Row 1: Hi, I'm [avatar] Hassan! */}
            <motion.div
              className="flex items-center justify-center flex-wrap text-[32px] sm:text-[45px] md:text-[68px] font-normal"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="mr-2 md:mr-3">Hi,</span>
              <span className="text-[#6B21D9] font-semibold">I&apos;m</span>
              <CustomAvatar mouseX={rawMouseX} mouseY={rawMouseY} />
              <span className="text-[#6B21D9] font-semibold italic pl-1">Hassan!</span>
            </motion.div>

            {/* Row 2: I turn ideas */}
            <motion.div
              className="flex items-center justify-center flex-wrap text-[32px] sm:text-[45px] md:text-[68px] font-normal mt-1 md:mt-2"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="mr-2 md:mr-4">I turn</span>
              <span className="relative text-[#6B21D9] font-semibold italic">
                ideas
                <SparkIcon />
              </span>
            </motion.div>

            {/* Row 3: into visuals that stick. */}
            <motion.div
              className="flex items-center justify-center flex-wrap text-[32px] sm:text-[45px] md:text-[68px] font-normal mt-1 md:mt-2"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="mr-2 md:mr-4">into</span>
              <span className="text-[#6B21D9] font-semibold italic border-b-[4px] md:border-b-[5px] border-[#6B21D9] pb-[2px] md:pb-1">
                visuals
              </span>
              <span className="ml-2 md:ml-4">that stick.</span>
            </motion.div>
          </h1>

          <motion.p
            className="mt-6 md:mt-8 max-w-lg text-[#555555] text-xs sm:text-sm md:text-base font-light tracking-wide leading-relaxed font-sans px-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            Working at the intersection of strategy and aesthetics to make that happen.
          </motion.p>
        </div>
      </main>

      {/* ===================== Arc + CTAs + Tags ===================== */}
      <footer className="w-full flex flex-col items-center z-20 relative pb-0">
        <div className="relative w-full max-w-[1440px] h-[230px] md:h-[300px]">
          {/* Glowing arc — bleeds past the viewport edges and bottom (clipped by overflow-hidden on root) */}
          <svg
            className="absolute left-1/2 -translate-x-1/2 top-0 w-[1500px] max-w-none md:w-[1700px] h-[480px] md:h-[620px] pointer-events-none"
            viewBox="0 0 1440 620"
            preserveAspectRatio="xMidYMin slice"
          >
            <defs>
              <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(107,33,217,0)" />
                <stop offset="20%" stopColor="rgba(107,33,217,0.5)" />
                <stop offset="50%" stopColor="rgba(107,33,217,0.95)" />
                <stop offset="80%" stopColor="rgba(107,33,217,0.5)" />
                <stop offset="100%" stopColor="rgba(107,33,217,0)" />
              </linearGradient>
            </defs>

            {/* Outer soft halo */}
            <motion.path
              d="M -60 580 Q 720 10 1500 580"
              fill="none"
              stroke="url(#arc-gradient)"
              strokeWidth="60"
              className="blur-[35px] opacity-40"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
            />
            {/* Mid glow */}
            <motion.path
              d="M -60 580 Q 720 10 1500 580"
              fill="none"
              stroke="url(#arc-gradient)"
              strokeWidth="22"
              className="blur-[10px] opacity-60"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
            />
            {/* Sharp core */}
            <motion.path
              d="M -60 580 Q 720 10 1500 580"
              fill="none"
              stroke="url(#arc-gradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
            />
            {/* Traveling highlight */}
            <motion.path
              d="M -60 580 Q 720 10 1500 580"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="70 900"
              animate={{ strokeDashoffset: [-970, 970] }}
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              className="opacity-60 filter drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]"
            />
          </svg>

          {/* Left tag: Motion Designer */}
          <motion.div
            className="absolute left-[4%] sm:left-[9%] md:left-[12%] top-[118px] md:top-[150px] flex items-center h-8 md:h-10 px-4 md:px-5 bg-white border-[1.5px] rounded-full shadow-subtle text-xs md:text-sm font-semibold font-kyiv tracking-wide hover:text-white transition-all duration-300 cursor-pointer select-none"
            style={{ borderColor: PURPLE, color: PURPLE }}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.06, y: -4, backgroundColor: PURPLE, boxShadow: "0px 10px 20px rgba(107,33,217,0.2)" }}
          >
            Motion Designer
          </motion.div>

          {/* Right tag: Visual Designer */}
          <motion.div
            className="absolute right-[4%] sm:right-[9%] md:right-[12%] top-[88px] md:top-[112px] flex items-center h-8 md:h-10 px-4 md:px-5 bg-white border-[1.5px] rounded-full shadow-subtle text-xs md:text-sm font-semibold font-kyiv tracking-wide hover:text-white transition-all duration-300 cursor-pointer select-none"
            style={{ borderColor: PURPLE, color: PURPLE }}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.06, y: -4, backgroundColor: PURPLE, boxShadow: "0px 10px 20px rgba(107,33,217,0.2)" }}
          >
            Visual Designer
          </motion.div>

          {/* CTA pair — two SEPARATE rounded pills with a small gap, sitting on the arc's peak */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-3 md:gap-4 z-30 select-none">
            <motion.a
              href="#works"
              className="flex items-center h-10 md:h-12 px-5 md:px-6 bg-white border-[1.5px] rounded-full shadow-subtle text-[13px] md:text-[15px] font-semibold font-kyiv tracking-wide group focus:outline-none"
              style={{ borderColor: PURPLE, color: PURPLE }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{
                y: -3,
                backgroundColor: "#FAF6FF",
                boxShadow: "0px 10px 20px rgba(107,33,217,0.15)",
                transition: { duration: 0.2 },
              }}
            >
              <motion.div
                whileHover={{ rotate: [-5, 5, -5, 0] }}
                transition={{ duration: 0.4 }}
                className="mr-2 flex items-center"
              >
                <HugeiconsIcon icon={Briefcase02Icon} size={17} strokeWidth={2} />
              </motion.div>
              View my works
            </motion.a>

            <motion.a
              href="#contact"
              className="flex items-center h-10 md:h-12 px-5 md:px-6 text-white rounded-full text-[13px] md:text-[15px] font-semibold font-kyiv tracking-wide group focus:outline-none"
              style={{
                backgroundColor: PURPLE,
                boxShadow: "0 0 0 2px #ffffff, 0 0 0 3.5px #1B0742, 0 10px 24px rgba(86,17,210,0.4)",
              }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{
                y: -3,
                boxShadow: "0 0 0 2px #ffffff, 0 0 0 3.5px #1B0742, 0 14px 30px rgba(86,17,210,0.55)",
                transition: { duration: 0.2 },
              }}
            >
              Let&apos;s Talk
              <motion.div
                className="ml-2 flex items-center"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.5} />
              </motion.div>
            </motion.a>
          </div>
        </div>
      </footer>

      {/* ===================== Full-screen menu overlay ===================== */}
      <motion.div
        className="fixed inset-0 bg-[#08070D]/98 z-50 flex flex-col items-center justify-center p-6"
        initial={{ opacity: 0, pointerEvents: "none" }}
        animate={isMenuOpen ? { opacity: 1, pointerEvents: "auto" } : { opacity: 0, pointerEvents: "none" }}
        transition={{ duration: 0.4 }}
      >
        <nav className="flex flex-col gap-6 text-center">
          {[
            { label: "Works", href: "#works" },
            { label: "About", href: "#about" },
            { label: "Contact", href: "#contact" },
          ].map((item) => (
            <motion.a
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-white text-3xl font-kyiv hover:text-[#cdb4f7] transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              {item.label}
            </motion.a>
          ))}
        </nav>
      </motion.div>
    </div>
  );
}
