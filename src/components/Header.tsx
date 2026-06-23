"use client";

import React from "react";
import { motion } from "framer-motion";

const PURPLE = "#6B21D9";

interface HeaderProps {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}

export default function Header({ isMenuOpen, onToggleMenu }: HeaderProps) {
  return (
    <header className="absolute top-14 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
      <motion.div
        // Figma: 647×63, rounded-[31.5px], bg=#6B21D9, big layered shadow
        className="pointer-events-auto relative w-full max-w-[647px] flex items-center justify-between overflow-hidden cursor-pointer select-none"
        style={{
          height: 63,
          borderRadius: 31.5,
          backgroundColor: PURPLE,
          paddingLeft: 29,
          paddingRight: 14,
          boxShadow:
            "0px 18px 39px rgba(0,0,0,0.15), 0px 71px 71px rgba(0,0,0,0.13), 0px 160px 96px rgba(0,0,0,0.08)",
        }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
        whileHover={{ y: -2 }}
      >
        {/* Glossy highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 64% 35%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 35%, transparent 65%)",
          }}
        />

        {/* "Welcome to my Portfolio!" – Figma: KyivType Titling Medium 500, 20px, -0.03em */}
        <span
          className="relative z-10 text-white font-kyiv font-medium tracking-[-0.03em] leading-none"
          style={{ fontSize: 20 }}
        >
          Welcome to my{" "}
          <span className="custom-underline font-bold">Portfolio!</span>
        </span>

        {/* Palette Toggle Button */}
        <button
          onClick={onToggleMenu}
          className="relative z-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors focus:outline-none flex-shrink-0 cursor-pointer"
          style={{ width: 41, height: 41 }}
          aria-label="Toggle menu"
        >
          <motion.div
            animate={{ rotate: isMenuOpen ? [0, -10, 15, 0] : 0 }}
            whileHover={{ scale: 1.1, rotate: [0, -15, 15, 0] }}
            transition={{ duration: 0.5 }}
            className="text-white"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.35248 19.5 5.25 20.5 4.5 21C3.89679 21.4 3 21 3 20" />
              <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor" />
              <circle cx="11.5" cy="7.5" r="1.5" fill="currentColor" />
              <circle cx="16.5" cy="9.5" r="1.5" fill="currentColor" />
              <circle cx="15.5" cy="14.5" r="1.5" fill="currentColor" />
            </svg>
          </motion.div>
        </button>
      </motion.div>
    </header>
  );
}
