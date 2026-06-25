"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  // Lock scroll in background when open, restore on close or unmount
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");

      // Pause Lenis smooth scroll
      if (typeof window !== "undefined" && (window as any).lenis) {
        (window as any).lenis.stop();
      }
    } else {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");

      // Resume Lenis smooth scroll
      if (typeof window !== "undefined" && (window as any).lenis) {
        (window as any).lenis.start();
      }
    }

    // Cleanup: always remove scroll lock class and resume Lenis scroll when unmounted
    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
      if (typeof window !== "undefined" && (window as any).lenis) {
        (window as any).lenis.start();
      }
    };
  }, [isOpen]);

  const listVariants = {
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
    hidden: {},
  };

  const itemVariants = {
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
    hidden: {
      y: 40,
      opacity: 0,
    },
  };

  return (
    <motion.div
      onClick={onClose} // Tap anywhere to close
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 cursor-pointer"
      style={{ backgroundColor: "rgba(8,7,13,0.97)" }}
      initial={{ opacity: 0, pointerEvents: "none" }}
      animate={
        isOpen
          ? { opacity: 1, pointerEvents: "auto" }
          : { opacity: 0, pointerEvents: "none" }
      }
      transition={{ duration: 0.35 }}
      data-lenis-prevent
    >
      {/* Explicit Close (X) Button in Top Right */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent trigger tap-anywhere close twice
          onClose();
        }}
        className="absolute top-8 right-8 md:top-12 md:right-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors focus:outline-none cursor-pointer"
        style={{ width: 48, height: 48 }}
        aria-label="Close menu"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Nav links */}
      <motion.nav
        variants={listVariants}
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}
        className="flex flex-col gap-8 text-center cursor-default"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking links wrapper
      >
        {[
          { label: "Works", href: "#works" },
          { label: "About", href: "#about" },
          { label: "Contact", href: "#contact" },
        ].map((item) => (
          <motion.div key={item.href} variants={itemVariants}>
            <motion.a
              href={item.href}
              onClick={onClose}
              className="text-white font-kyiv font-medium tracking-[-0.02em] hover:text-[#cdb4f7] transition-colors block text-[40px] leading-tight"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.2 }}
            >
              {item.label}
            </motion.a>
          </motion.div>
        ))}
      </motion.nav>
    </motion.div>
  );
}
