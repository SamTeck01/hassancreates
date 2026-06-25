"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Zoom } from "swiper/modules";
import { Swiper as SwiperType } from "swiper";

// Import Swiper React styles
import "swiper/css";
import "swiper/css/zoom";

const NOISE_IMG =
  "https://framerusercontent.com/images/hiGYz6grmhAHSeZuNKHEuchTGTw.png";

import { Project } from "@/types";
import { PROJECTS_DATA } from "@/data/projects";

interface PhotoViewerProps {
  projectId: string;
  onClose: () => void;
}

export default function PhotoViewer({ projectId, onClose }: PhotoViewerProps) {
  const [projectData, setProjectData] = useState<Project>(() => {
    return PROJECTS_DATA.find((p) => p.id === projectId) || PROJECTS_DATA[0];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    // Dynamic fetch from API
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const found = data.find((p: Project) => p.id === projectId);
          if (found) {
            setProjectData(found);
          }
        }
      })
      .catch((err) => console.error("Failed to load project details from API:", err));
  }, [projectId]);

  const data = projectData;

  const handleNext = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  }, []);

  const handlePrev = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  }, []);

  // Lock scroll in background on mount, restore on unmount
  useEffect(() => {
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");

    // Pause Lenis smooth scroll
    if (typeof window !== "undefined" && (window as any).lenis) {
      (window as any).lenis.stop();
    }

    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
      // Resume Lenis smooth scroll
      if (typeof window !== "undefined" && (window as any).lenis) {
        (window as any).lenis.start();
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  // Close modal when clicking the background overlay space (anywhere outside the active image & control panels)
  const handleOverlayClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    // If target is the active lightbox image itself, toggle control visibility instead of closing
    if (
      target.tagName === "IMG" &&
      !target.dataset.noiseImage &&
      !target.dataset.bgImage
    ) {
      setShowControls((prev) => !prev);
      return;
    }

    // Traverse up to see if we clicked inside header, description panel, or zoom control
    let current: HTMLElement | null = target;
    while (current) {
      if (current.classList && typeof current.classList.contains === "function") {
        if (
          current.classList.contains("lightbox-header") ||
          current.classList.contains("description-panel") ||
          current.classList.contains("nav-arrow") ||
          current.classList.contains("icon-button")
        ) {
          return; // Do not close
        }
      }
      current = current.parentElement;
    }

    // Otherwise, close!
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[1000] bg-white backdrop-blur-[25px] flex flex-col overflow-hidden touch-none font-kyiv-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
      data-lenis-prevent
    >
      {/* Background Image Wrap (matching SelectedWorks card) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.bgImage}
          srcSet={data.bgSrcSet}
          alt="Background overlay"
          className="block w-full h-full object-cover object-center blur-[28px] scale-[1.1]"
          data-bg-image="true"
        />
      </div>

      {/* Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.18] pointer-events-none z-[1]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={NOISE_IMG}
          alt=""
          aria-hidden="true"
          className="block w-full h-full object-fill"
          data-noise-image="true"
        />
      </div>

      {/* Blur Tint Overlay */}
      <div className="absolute inset-0 bg-[#f5f0ff]/50 z-[2] pointer-events-none" />

      {/* 1. Header Bar */}
      <header
        className={`lightbox-header absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#f5f0ff]/50 to-transparent flex items-center justify-between px-6 z-[1110] text-[#08070d] pointer-events-auto transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${!showControls ? "-translate-y-full opacity-0 pointer-events-none" : ""
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="icon-button bg-transparent border-none text-[#08070d] cursor-pointer flex items-center justify-center p-2 rounded-full transition-[background-color,transform] duration-200 ease-in-out w-12 h-12 hover:bg-[#6B21D9]/8 hover:scale-105 active:scale-95"
            aria-label="Close photo viewer"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <h1 className="font-kyiv text-[18px] font-normal tracking-[-0.01em] text-[#08070d] m-0">{data.clientName}</h1>
        </div>

        <div className="flex items-center gap-4">
          {data.href && (
            <a
              href={data.href}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-button flex items-center justify-center gap-1.5 px-4 h-9 rounded-full bg-[#6B21D9] hover:bg-[#6B21D9]/90 text-white font-kyiv-sans text-[11px] font-medium uppercase tracking-[0.08em] transition-colors no-underline cursor-pointer select-none"
            >
              View Project
            </a>
          )}
          <span className="text-[13px] text-[#08070d]/65 tracking-[0.05em] font-medium">
            {currentIndex + 1} / {data.swiperImages.length}
          </span>
        </div>
      </header>

      {/* 2. Swiper Slides Section */}
      <div
        className="swiperContainer group/swiper flex-1 w-full h-full relative overflow-hidden z-10 [&_.swiper-zoom-container]:cursor-zoom-in [&_.swiper-slide-zoomed_.swiper-zoom-container]:cursor-grab [&_.swiper-slide-zoomed_.swiper-zoom-container:active]:cursor-grabbing"
        onClick={handleOverlayClick}
      >
        {/* Navigation Arrows (Desktop hover, positioned next to image container) */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className={`nav-arrow absolute top-1/2 -translate-y-1/2 z-[1110] w-12 h-12 rounded-full bg-white/85 border border-[#6B21D9]/15 text-[#6B21D9] flex items-center justify-center cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] backdrop-blur-[8px] hover:bg-[#6B21D9] hover:text-white hover:border-[#6B21D9] hover:shadow-[0_8px_24px_rgba(107,33,217,0.2)] left-[max(24px,calc(50%-330px))] hidden min-[810px]:group-hover/swiper:flex ${!showControls ? "!opacity-0 !pointer-events-none" : ""
              }`}
            aria-label="Previous slide"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {currentIndex < data.swiperImages.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className={`nav-arrow absolute top-1/2 -translate-y-1/2 z-[1110] w-12 h-12 rounded-full bg-white/85 border border-[#6B21D9]/15 text-[#6B21D9] flex items-center justify-center cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] backdrop-blur-[8px] hover:bg-[#6B21D9] hover:text-white hover:border-[#6B21D9] hover:shadow-[0_8px_24px_rgba(107,33,217,0.2)] right-[max(24px,calc(50%-330px))] hidden min-[810px]:group-hover/swiper:flex ${!showControls ? "!opacity-0 !pointer-events-none" : ""
              }`}
            aria-label="Next slide"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        <Swiper
          modules={[Zoom]}
          zoom={{ maxRatio: 3, toggle: true }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => {
            setCurrentIndex(swiper.activeIndex);
            setIsZoomed(false);
            setShowControls(true);
          }}
          onZoomChange={(swiper, scale) => {
            const zoomed = scale > 1;
            setIsZoomed(zoomed);
            if (zoomed) {
              setShowControls(false);
            } else {
              setShowControls(true);
            }
          }}
          onTap={(swiper, e) => {
            const target = e.target as HTMLElement;
            if (!target) return;

            // Toggle controls if we tap the active project image
            if (
              target.tagName === "IMG" &&
              !target.dataset.noiseImage &&
              !target.dataset.bgImage
            ) {
              setShowControls((prev) => !prev);
              return;
            }

            // Otherwise, close the modal! (backdrop click inside swiper slide)
            onClose();
          }}
          className="w-full h-full"
        >
          {data.swiperImages.map((imageSrc, idx) => (
            <SwiperSlide
              key={idx}
              className="flex-shrink-0 w-full h-full relative flex items-center justify-center overflow-hidden box-border pt-16 pb-[180px] max-[809px]:pb-[150px]"
              onClick={handleOverlayClick}
            >
              <div className="swiper-zoom-container" onClick={handleOverlayClick}>
                <Image
                  src={imageSrc}
                  alt={`${data.clientName} image slide ${idx + 1}`}
                  width={1400}
                  height={1000}
                  priority={idx === 0}
                  className="!max-w-full !max-h-[60vh] w-auto h-auto object-contain rounded-lg shadow-[0_16px_40px_rgba(107,33,217,0.08),0_4px_12px_rgba(8,7,13,0.04)] border border-[#6B21D9]/12 select-none bg-white/80 transition-[box-shadow,border-color] duration-300 ease-in-out cursor-zoom-in [.swiper-slide-zoomed_&]:cursor-grab [.swiper-slide-zoomed_&]:my-10 [.swiper-slide-zoomed_&]:active:cursor-grabbing"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 3. Bottom WhatsApp-Style Caption/Description Panel */}
      <div
        className={`description-panel absolute bottom-0 left-0 right-0 z-[1110] text-[#08070d] flex flex-col bg-gradient-to-t from-[#f5f0ff]/50 via-[#f5f0ff]/20 to-transparent pt-12 px-6 pb-6 max-h-[180px] overflow-hidden transition-[max-height,transform,opacity] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto max-[809px]:pt-8 max-[809px]:px-4 max-[809px]:pb-4 max-[809px]:max-h-[150px] ${isExpanded
            ? "!max-h-[70vh] bg-[#f5f0ff]/97 backdrop-blur-[20px] border-t border-[#6B21D9]/15 pt-6 max-[809px]:!max-h-[60vh]"
            : ""
          } ${!showControls ? "translate-y-full opacity-0 pointer-events-none" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#08070d]/15 [&::-webkit-scrollbar-thumb]:rounded-[2px]">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-kyiv text-[clamp(22px,3.5vw,28px)] font-normal text-[#08070d] m-0 tracking-[-0.01em]">{data.clientName}</h2>
            <span className="text-[13px] text-[#08070d]/50 font-medium tracking-[0.02em]">
              {data.year} &bull; {data.role}
            </span>
          </div>

          <div>
            <p className="text-[14px] leading-[1.65] text-[#444444] m-0 font-light max-w-[800px] whitespace-pre-line">
              {isExpanded
                ? `${data.description}\n\n${data.tagline}`
                : data.imageCaptions[currentIndex] || data.description}
              {" "}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="bg-transparent border-none text-[#6B21D9] text-[11px] font-semibold cursor-pointer p-2 -m-2 transition-opacity duration-200 tracking-[0.08em] uppercase hover:opacity-80 inline-block align-middle ml-1"
              >
                {isExpanded ? "See Less" : "See More"}
              </button>
            </p>
          </div>

          {isExpanded && (
            <div className="flex flex-wrap gap-2 mt-2">
              {data.services.map((srv) => (
                <span key={srv} className="text-[11px] font-normal bg-[#6B21D9]/6 text-[#6B21D9] py-1 px-3 rounded-full border border-[#6B21D9]/12">
                  {srv}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
