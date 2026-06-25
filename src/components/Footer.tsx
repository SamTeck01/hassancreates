"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import StaggeredText from "./StaggeredText";
import footerBg from "../../public/Footer bg.png"

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  // Dynamic London clock
  const [londonTime, setLondonTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const timeStr = new Date().toLocaleTimeString("en-GB", {
        timeZone: "Europe/London",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setLondonTime(timeStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" },
    visible: {
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      transition: {
        duration: 0.9,
        ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
      },
    },
  };

  const contentVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 0.3,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer ref={ref} className="w-full relative z-10 bg-brand-bg px-1 md:px-2 pb-1 pt-8 overflow-hidden select-none">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="bg-[#0D0D0D] text-white pt-12 px-6 md:px-12 flex flex-col justify-between w-full min-h-[90vh] rounded-[32px] relative overflow-hidden border border-white/5"
        style={{
          background: "radial-gradient(circle at 50% 100%, rgba(107, 33, 217, 0.18) 0%, rgba(13, 13, 13, 0) 55%), #0D0D0D"
        }}
      >
        {/* Covering Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none rounded-[22px] overflow-hidden">
          <Image
            src={footerBg}
            alt="Footer-Image"
            fill
            sizes="100vw"
            className="object-cover object-center opacity-85"
            priority
          />
        </div>

        <motion.div
          variants={contentVariants}
          className="max-w-[1300px] w-full mx-auto flex flex-col justify-between h-full flex-grow gap-12 relative z-10"
        >
          {/* Top Row: Links Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 text-left">
            {/* Column 1: Navigation */}
            <div className="flex flex-col items-start">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-kyiv-sans font-semibold mb-6 select-none">
                Navigation
              </span>
              <div className="flex flex-col gap-4">
                {[
                  { label: "About", href: "#about" },
                  { label: "Works", href: "#works" },
                  { label: "Services", href: "#about" },
                  { label: "Blog", href: "#" }
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group relative text-white hover:text-white/80 font-kyiv text-lg font-bold tracking-tight transition-colors leading-none block pb-1 flex flex-col items-start"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 opacity-50" />
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Social */}
            <div className="flex flex-col items-start">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-kyiv-sans font-semibold mb-6 select-none">
                Social
              </span>
              <div className="flex flex-col gap-4">
                {[
                  { label: "LinkedIn", href: "https://linkedin.com/in/hassan-okesanjo-46a948353" },
                  { label: "Behance", href: "https://behance.net/hassanokesanjo1" }
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative text-white hover:text-white/80 font-kyiv text-lg font-bold tracking-tight transition-colors leading-none block pb-1 flex flex-col items-start"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 opacity-50" />
                  </a>
                ))}
              </div>
            </div>

            {/* Column 3: Legals */}
            <div className="flex flex-col items-start col-span-2 md:col-span-1">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-kyiv-sans font-semibold mb-6 select-none">
                Legals
              </span>
              <div className="flex flex-col gap-4">
                {[
                  { label: "Privacy Policy", href: "#" },
                  { label: "Term of Service", href: "#" }
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group relative text-white hover:text-white/80 font-kyiv text-lg font-bold tracking-tight transition-colors leading-none block pb-1 flex flex-col items-start"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 opacity-50" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Row: Meta info (Copyright, Live Clock, Back to Top) */}
          <div className="flex flex-col md:flex-row items-center justify-between text-white/50 text-xs md:text-sm font-kyiv-sans font-light border-t border-white/5 pt-8 select-none gap-6 relative z-10">
            <div>
              &copy; {new Date().getFullYear()} HassanCreates &middot; All rights reserved.
            </div>

            <div className="font-mono tracking-wider">
              London &rarr; {londonTime || "12:00:00"}
            </div>

            <a
              href="#top"
              onClick={scrollToTop}
              className="text-white font-kyiv font-bold hover:text-white/80 transition-colors cursor-pointer select-none"
            >
              Back to top
            </a>
          </div>

          {/* Giant Bottom Wordmark */}
          <div className="w-full text-center relative overflow-hidden select-none mt-5 z-10">
            <h1 className="font-kyiv text-[clamp(60px,16vw,190px)] font-bold leading-none text-white tracking-[-0.04em]">
              <StaggeredText
                text="HassanCreates"
                trigger="scroll"
                delay={0.1}
                letterStyle={{
                  background: "linear-gradient(180deg, #FFFFFF 30%, rgba(255,255,255,0.15) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              />
            </h1>
          </div>
        </motion.div>

        {/* Progressive Blur Layer */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2 pointer-events-none z-20"
          style={{
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(220, 220, 220, 0.01)",
            borderBottomLeftRadius: "32px",
            borderBottomRightRadius: "32px",
          }}
        />
      </motion.div>
    </footer>
  );
}
