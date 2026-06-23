"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import StaggeredText from "./StaggeredText";

/* ─────────────────────────────────────────────
   TypeScript Types
   ───────────────────────────────────────────── */
interface ServiceItem {
  id: string;
  num: string;
  title: string;
  count: string;
  description: string;
  image1: string;
  image2: string;
}

/* ─────────────────────────────────────────────
   Service Data (Exactly matching reference screenshot)
   ───────────────────────────────────────────── */
const SERVICES: ServiceItem[] = [
  {
    id: "ui-ux",
    num: "01",
    title: "UI/UX Design",
    count: "(4)",
    description: "Creating clean, modern, and user-centered interfaces focused on usability, accessibility, and seamless user experience.",
    image1: "/works/archin-1.jpg",
    image2: "/works/archin-2.jpg",
  },
  {
    id: "web-design",
    num: "02",
    title: "Website Design",
    count: "(8)",
    description: "Designing responsive and visually polished websites that reflect brand identity while improving engagement and conversion.",
    image1: "/works/vntnr-1.jpg",
    image2: "/works/vntnr-2.jpg",
  },
  {
    id: "mobile-app",
    num: "03",
    title: "Mobile App Design",
    count: "(4)",
    description: "Crafting intuitive mobile app experiences with smooth navigation, consistent layouts, and user-friendly interactions.",
    image1: "/works/solstice-1.jpg",
    image2: "/works/solstice-2.jpg",
  },
  {
    id: "wireframing",
    num: "04",
    title: "Wireframing & Prototyping",
    count: "(7)",
    description: "Transforming ideas into structured wireframes and interactive prototypes to visualize user flow before development.",
    image1: "/works/blackopal-1.jpg",
    image2: "/works/blackopal-2.jpg",
  },
  {
    id: "design-systems",
    num: "05",
    title: "Design Systems",
    count: "(3)",
    description: "Building scalable design systems with reusable components, typography, spacing, and consistent visual guidelines.",
    image1: "/works/amber-1.jpg",
    image2: "/works/amber-2.jpg",
  },
  {
    id: "user-research",
    num: "06",
    title: "User Research",
    count: "(2)",
    description: "Understanding user behavior, pain points, and goals to create more effective and meaningful product experiences.",
    image1: "/works/apex-1.jpg",
    image2: "/works/apex-2.jpg",
  },
];

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

/* ─────────────────────────────────────────────
   Overlapping Double Card Preview Component (Desktop)
   - Performs composite-only scale and opacity reveals.
   - Utilizes GPU-accelerated clipPath transitions.
   - Implements Z-axis depth layers for real 3D spacing when container tilts.
   ───────────────────────────────────────────── */
interface ImageStackPreviewProps {
  service: ServiceItem;
}

function ImageStackPreview({ service }: ImageStackPreviewProps) {
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
        className="absolute w-[110px] h-[140px] bg-purple-500/5 filter blur-2xl rounded-full" 
        style={{ transform: "translateZ(-30px)" }}
      />

      {/* Back Image Card (Left side, tilted slightly backward in Z-space) */}
      <motion.div
        variants={{
          initial: { 
            opacity: 0, 
            scale: 0.85, 
            x: -20, 
            rotate: -15,
            clipPath: "inset(10% 10% 10% 10% round 12px)"
          },
          animate: { 
            opacity: 0.85, 
            scale: 0.95, 
            x: -14, 
            rotate: -6,
            clipPath: "inset(0% 0% 0% 0% round 12px)",
            transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
          },
          exit: { 
            opacity: 0, 
            scale: 0.85, 
            x: -20, 
            rotate: -15,
            clipPath: "inset(10% 10% 10% 10% round 12px)",
            transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
          }
        }}
        style={{ 
          transformStyle: "preserve-3d",
          z: -10
        }}
        className="absolute w-[110px] h-[140px] bg-[#0E0E10] rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden border border-white/5 z-0"
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
            x: 20, 
            rotate: 15,
            clipPath: "inset(10% 10% 10% 10% round 12px)"
          },
          animate: { 
            opacity: 1, 
            scale: 1, 
            x: 14, 
            rotate: 6,
            clipPath: "inset(0% 0% 0% 0% round 12px)",
            transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.04 }
          },
          exit: { 
            opacity: 0, 
            scale: 0.85, 
            x: 20, 
            rotate: 15,
            clipPath: "inset(10% 10% 10% 10% round 12px)",
            transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
          }
        }}
        style={{ 
          transformStyle: "preserve-3d",
          z: 15
        }}
        className="absolute w-[110px] h-[140px] bg-white rounded-[12px] shadow-[0_12px_30px_rgba(0,0,0,0.12)] overflow-hidden border border-neutral-200/40 z-10"
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
   Desktop Row 3D Parallax Hover Container
   - Tracks mouse movements inside the active preview row.
   - Smoothly rotates on X/Y axes without triggering component re-renders.
   ───────────────────────────────────────────── */
interface RowPreviewContainerProps {
  isActive: boolean;
  service: ServiceItem;
}

function RowPreviewContainer({ isActive, service }: RowPreviewContainerProps) {
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
      className="relative w-[240px] h-[160px] flex items-center justify-center pointer-events-auto select-none"
    >
      <AnimatePresence>
        {isActive && (
          <ImageStackPreview service={service} />
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

        {/* Services Showcase typopraphic rows */}
        <div className="flex flex-col border-b border-[#E3E3E8] relative z-10 w-full">
          {SERVICES.map((service, index) => {
            const isActive = activeIndex === index;
            
            // Animated color classes
            const numColorClass = isActive ? "text-[#0D0D0D]" : "text-[#9E9EA5] group-hover:text-[#5F5F65]";
            const titleColorClass = isActive ? "text-[#0D0D0D]" : "text-[#8A8A92] group-hover:text-[#4C4C52]";
            const descColorClass = isActive ? "text-[#55555C]" : "text-[#A1A1A8]";
            const arrowColorClass = isActive 
              ? "text-[#0D0D0D] opacity-100 scale-105" 
              : "text-[#B5B5BE] opacity-50 scale-100 group-hover:text-[#5F5F65] group-hover:opacity-100";
            const arrowRotate = (isMobile && isActive) ? "rotate-90" : "rotate-0";

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
                className="w-full text-left flex flex-col py-9 md:py-11 border-t border-[#E3E3E8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B21D9] focus-visible:ring-offset-2 relative transition-colors duration-300 group cursor-pointer"
                aria-expanded={isMobile ? isActive : undefined}
                aria-controls={isMobile ? `service-content-${index}` : undefined}
              >
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-6">
                  
                  {/* Left Column (Info / Description) */}
                  <div className="col-span-1 lg:col-span-7 flex flex-col justify-center text-left">
                    <div className="flex items-center gap-3.5 md:gap-5 select-none">
                      {/* Number */}
                      <span className={`font-kyiv-sans font-bold text-xl md:text-[30px] tracking-tight transition-colors duration-300 ${numColorClass}`}>
                        {service.num}
                      </span>
                      {/* Em-dash */}
                      <span className="text-neutral-300 text-lg md:text-2xl font-light font-kyiv-sans select-none">—</span>
                      {/* Title + Count */}
                      <span className="relative flex items-start">
                        <span className={`font-kyiv-sans font-semibold text-2xl md:text-[32px] tracking-tight transition-all duration-300 group-hover:translate-x-1.5 ${titleColorClass}`}>
                          {service.title}
                        </span>
                        <span className="text-[10px] md:text-[11px] font-kyiv-sans text-neutral-400 ml-1.5 self-start pt-1 font-normal select-none">
                          {service.count}
                        </span>
                      </span>
                    </div>

                    {/* Desktop Description */}
                    {!isMobile && (
                      <div className={`font-sans text-[14px] md:text-[15px] font-light leading-relaxed mt-4 max-w-[540px] transition-colors duration-300 ${descColorClass}`}>
                        {service.description}
                      </div>
                    )}
                  </div>

                  {/* Middle Column (Row-integrated side-by-side image stack - Desktop only) */}
                  {!isMobile && (
                    <div className="lg:col-span-4 flex items-center justify-center select-none pointer-events-auto">
                      <RowPreviewContainer isActive={isActive} service={service} />
                    </div>
                  )}

                  {/* Right Column (Arrow - Desktop & Mobile Row Header) */}
                  <div className="col-span-1 lg:col-span-1 flex justify-end items-center select-none">
                    <ArrowIcon className={`w-7 h-7 md:w-9 md:h-9 transition-all duration-300 transform ${arrowColorClass} ${arrowRotate} group-hover:translate-x-1 group-hover:-translate-y-1`} />
                  </div>
                </div>

                {/* Mobile-only Accordion expanded panel */}
                {isMobile && (
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        id={`service-content-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ 
                          height: "auto", 
                          opacity: 1,
                          transition: { 
                            height: { duration: 0.35, ease: "easeOut" },
                            opacity: { duration: 0.25, delay: 0.05 } 
                          }
                        }}
                        exit={{ 
                          height: 0, 
                          opacity: 0,
                          transition: { 
                            height: { duration: 0.3, ease: "easeIn" },
                            opacity: { duration: 0.2 } 
                          }
                        }}
                        className="overflow-hidden w-full text-left"
                      >
                        <div className="pb-4 pt-4 flex flex-col gap-6">
                          {/* Accordion description */}
                          <p className={`font-sans text-[14px] leading-relaxed transition-colors duration-300 ${descColorClass}`}>
                            {service.description}
                          </p>

                          {/* Mobile Overlapping Preview */}
                          <div className="relative h-[220px] w-full flex items-center justify-center overflow-visible my-3 select-none pointer-events-none">
                            <div className="absolute w-24 h-24 bg-purple-500/10 filter blur-xl rounded-full" />

                            <div className="absolute w-[130px] h-[170px] bg-[#0E0E10] rounded-[12px] shadow-lg overflow-hidden border border-white/5 -rotate-8 -translate-x-10 opacity-80">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={service.image1}
                                alt=""
                                className="w-full h-full object-cover opacity-75"
                              />
                            </div>

                            <div className="absolute w-[130px] h-[170px] bg-white rounded-[12px] shadow-lg overflow-hidden border border-neutral-200/40 rotate-8 translate-x-10 z-10">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={service.image2}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
