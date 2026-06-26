"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import StaggeredText from "./StaggeredText";

import { Service } from "@/types";
import { SERVICES_DATA } from "@/data/services";

/* ─────────────────────────────────────────────
   Arrow Icon Component (↗)
   ───────────────────────────────────────────── */
interface ArrowIconProps {
  className?: string;
}

function ArrowIcon({ className }: ArrowIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

interface ImageStackPreviewProps {
  service: Service;
  isMobile: boolean;
}

function ImageStackPreview({ service, isMobile }: ImageStackPreviewProps) {
  const backX = isMobile ? -8 : -14;
  const frontX = isMobile ? 8 : 14;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ transformStyle: "preserve-3d" }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      {/* Background shadow glow */}
      <div 
        className="absolute w-[60px] h-[60px] md:w-[110px] md:h-[140px] bg-purple-500/5 filter blur-xl md:blur-2xl rounded-full" 
        style={{ transform: "translateZ(-30px)" }}
      />

      {/* Back Image Card (Left side, tilted slightly backward in Z-space) */}
      <motion.div
        variants={{
          initial: { 
            opacity: 0, 
            scale: 0.85, 
            x: isMobile ? -14 : -20, 
            rotate: -15,
            clipPath: isMobile ? "none" : "inset(10% 10% 10% 10% round 8px)"
          },
          animate: { 
            opacity: 0.85, 
            scale: 0.95, 
            x: backX, 
            rotate: -6,
            clipPath: isMobile ? "none" : "inset(0% 0% 0% 0% round 8px)",
            transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
          },
          exit: { 
            opacity: 0, 
            scale: 0.85, 
            x: isMobile ? -14 : -20, 
            rotate: -15,
            clipPath: isMobile ? "none" : "inset(10% 10% 10% 10% round 8px)",
            transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
          }
        }}
        style={{ 
          transformStyle: "preserve-3d",
          z: -10
        }}
        className="absolute w-[50px] h-[65px] md:w-[110px] md:h-[140px] bg-[#0E0E10] rounded-[8px] md:rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden border border-white/5 z-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={service.image1}
          alt={`${service.title} preview illustration`}
          className="w-full h-full object-cover opacity-75"
        />
      </motion.div>

      {/* Front Image Card (Right side, overlapping, floating forward in Z-space) */}
      <motion.div
        variants={{
          initial: { 
            opacity: 0, 
            scale: 0.85, 
            x: isMobile ? 14 : 20, 
            rotate: 15,
            clipPath: isMobile ? "none" : "inset(10% 10% 10% 10% round 8px)"
          },
          animate: { 
            opacity: 1, 
            scale: 1, 
            x: frontX, 
            rotate: 6,
            clipPath: isMobile ? "none" : "inset(0% 0% 0% 0% round 8px)",
            transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.04 }
          },
          exit: { 
            opacity: 0, 
            scale: 0.85, 
            x: isMobile ? 14 : 20, 
            rotate: 15,
            clipPath: isMobile ? "none" : "inset(10% 10% 10% 10% round 8px)",
            transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
          }
        }}
        style={{ 
          transformStyle: "preserve-3d",
          z: 15
        }}
        className="absolute w-[50px] h-[65px] md:w-[110px] md:h-[140px] bg-white rounded-[8px] md:rounded-[12px] shadow-[0_12px_30px_rgba(0,0,0,0.12)] overflow-hidden border border-neutral-200/40 z-10"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={service.image2}
          alt={`${service.title} preview mockup`}
          className="w-full h-full object-cover"
        />
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Desktop & Mobile Row 3D Parallax Hover Container
   ───────────────────────────────────────────── */
interface RowPreviewContainerProps {
  isActive: boolean;
  service: Service;
  isMobile: boolean;
}

function RowPreviewContainer({ isActive, service, isMobile }: RowPreviewContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  
  // Motion values to keep mouse coordinates reactive without state updates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Springs for buttery smooth physics transitions
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [12, -12]), 
    { stiffness: 100, damping: 20 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-12, 12]), 
    { stiffness: 100, damping: 20 }
  );

  // Combine springs into a standard CSS transform property via useMotionTemplate
  const transform = useMotionTemplate`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    let rect = rectRef.current;
    if (!rect) {
      if (!containerRef.current) return;
      rect = containerRef.current.getBoundingClientRect();
      rectRef.current = rect;
    }
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    rectRef.current = null;
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transformStyle: "preserve-3d"
      }}
      className="relative w-[80px] h-[55px] md:w-[240px] md:h-[160px] flex items-center justify-center pointer-events-auto select-none"
    >
      <AnimatePresence>
        {isActive && (
          <ImageStackPreview service={service} isMobile={isMobile} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Main Services Component
   ───────────────────────────────────────────── */
export default function Services() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [services, setServices] = useState<Service[]>(SERVICES_DATA);
  const [isMobile, setIsMobile] = useState(false);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Monitor breakpoint states
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Viewport center intersection detector (Desktop & Mobile)
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-45% 0px -45% 0px", // Detect inside vertical 10% center band
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = rowRefs.current.findIndex((ref) => ref === entry.target);
          if (index !== -1) {
            setActiveIndex(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    rowRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, [services]); // Re-run observer if services change dynamically

  useEffect(() => {
    // Dynamic fetch from Next.js API Route handler
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        }
      })
      .catch((err) => console.error("Failed to load services from API:", err));
  }, []);

  // Click behavior transitions active state and scrolls views into center
  const handleRowClick = (index: number) => {
    setActiveIndex(index);
    rowRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <section
      id="about"
      className="bg-brand-bg text-text-main pb-[120px] pb-[80px] px-4 relative z-10 overflow-hidden"
    >
      <div className="max-w-[1080px] mx-auto flex flex-col">
        
        {/* Top Header Row (matching SelectedWorks heading design) */}
        <div className="flex flex-col items-center gap-3 w-full mb-6 border-b border-[#E3E3E8] pb-6">
          <p className="font-kyiv-sans text-[14px] font-normal leading-normal text-[#5C5C5C] m-0 select-none">
            (Services)
          </p>
          <div className="flex items-end">
            <h2 className="font-kyiv text-[clamp(48px,5.5vw,80px)] font-normal leading-none tracking-[-0.02em] m-0 bg-gradient-to-b from-[rgba(12,12,12,0.82)] to-[rgba(12,12,12,0.5)] bg-clip-text text-transparent select-none">
              Services
            </h2>
          </div>
        </div>

        {/* Section Headline */}
        <div className="mb-10 flex justify-center max-w-[90%] m-auto text-center">
          <h2 className="font-kyiv-serif text-[32px] md:text-[40px] font-bold leading-[1.1] text-[#0D0D0D] max-w-[90%] tracking-[-0.02em]">
            <StaggeredText
              text="Your Competitors Didn't Get Better."
              trigger="scroll"
              delay={0.1}
            />
            <span className="font-kyiv-serif text-[#888] font-normal ml-2 block md:inline">
              <StaggeredText
                text="They Just Rebranded First."
                trigger="scroll"
                delay={0.6}
              />
            </span>
          </h2>
        </div>

        {/* Services Showcase typographic rows */}
        <div className="flex flex-col border-b border-[#E3E3E8] relative z-10 w-full">
          {services.map((service, index) => {
            const isActive = activeIndex === index;
            
            // Animated color classes
            const numColorClass = isActive ? "text-[#0D0D0D]" : "text-[#9E9EA5] group-hover:text-[#5F5F65]";
            const titleColorClass = isActive ? "text-[#0D0D0D]" : "text-[#8A8A92] group-hover:text-[#4C4C52]";
            const descColorClass = isActive ? "text-[#55555C]" : "text-[#A1A1A8]";
            const arrowColorClass = isActive 
              ? "text-[#0D0D0D] opacity-100 scale-105" 
              : "text-[#B5B5BE] opacity-50 scale-100 group-hover:text-[#5F5F65] group-hover:opacity-100";

            return (
              <motion.button
                key={service.id}
                ref={(el) => {
                  rowRefs.current[index] = el;
                }}
                onClick={() => handleRowClick(index)}
                initial={{ opacity: 0, y: 50, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ 
                  duration: 0.7, 
                  ease: [0.16, 1, 0.3, 1],
                  delay: index * 0.08
                }}
                className="w-full text-left flex flex-col py-6 md:py-11 border-t border-[#E3E3E8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B21D9] focus-visible:ring-offset-2 relative transition-colors duration-300 group cursor-pointer"
                itemScope
                itemType="https://schema.org/Service"
              >
                <div className="w-full grid grid-cols-12 items-center gap-4 md:gap-6">
                  
                  {/* Left Column (Info / Description) */}
                  <div className="col-span-8 md:col-span-7 flex flex-col justify-center text-left">
                    <div className="flex items-center gap-3 md:gap-5 select-none">
                      {/* Number */}
                      <span className={`font-kyiv-sans font-bold text-lg md:text-[30px] tracking-tight transition-colors duration-300 ${numColorClass}`}>
                        {service.num}
                      </span>
                      {/* Em-dash */}
                      <span className="text-neutral-300 text-sm md:text-2xl font-light font-kyiv-sans select-none">—</span>
                      {/* Title + Count */}
                      <span className="relative flex items-start">
                        <span className={`font-kyiv-sans font-semibold text-lg md:text-[32px] tracking-tight transition-all duration-300 group-hover:translate-x-1.5 ${titleColorClass}`} itemProp="name">
                          {service.title}
                        </span>
                        <span className="text-[9px] md:text-[11px] font-kyiv-sans text-neutral-400 ml-1.5 self-start pt-0.5 md:pt-1 font-normal select-none">
                          {service.count}
                        </span>
                      </span>
                    </div>

                    {/* Description */}
                    <div className={`font-kyiv-sans text-[12px] md:text-[15px] font-light leading-relaxed mt-2 md:mt-4 transition-colors duration-300 ${descColorClass}`}>
                      {service.description}
                    </div>
                  </div>

                  {/* Middle Column (Row-integrated side-by-side image stack - Desktop & Mobile) */}
                  <div className="col-span-3 md:col-span-4 flex items-center justify-center select-none pointer-events-auto">
                    <RowPreviewContainer isActive={isActive} service={service} isMobile={isMobile} />
                  </div>

                  {/* Right Column (Arrow) */}
                  <div className="col-span-1 md:col-span-1 flex justify-end items-center select-none">
                    <ArrowIcon className={`w-5 h-5 md:w-9 md:h-9 transition-all duration-300 transform ${arrowColorClass} group-hover:translate-x-1 group-hover:-translate-y-1`} />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
