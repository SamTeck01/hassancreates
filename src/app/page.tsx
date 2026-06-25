"use client";

import React, { useState, useEffect } from "react";

// Components
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MosaicGrid from "@/components/MosaicGrid";
import ClientLogos from "@/components/ClientLogos";
import DoubleMarquee from "@/components/DoubleMarquee";
import Services from "@/components/Services";
import SelectedWorks from "@/components/SelectedWorks";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
const MenuOverlay = dynamic(() => import("@/components/MenuOverlay"), {
  ssr: false,
});

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen flex flex-col justify-between text-brand-text bg-white" style={{ overflowX: "clip" }}>
      {/* Welcome Pill Navigation Bar */}
      <Header isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen(!isMenuOpen)} />

      {/* Hero Section */}
      <Hero />

      {/* Mosaic Grid */}
      <MosaicGrid />

      {/* Client Logos */}
      <ClientLogos />

      {/* Double Marquee */}
      <DoubleMarquee />

      {/* Services Section */}
      <Services />

      {/* Selected Works Section */}
      <SelectedWorks />

      {/* Contact Section */}
      <Contact />

      {/* Footer Section */}
      <Footer />

      {/* Full-screen Menu Overlay */}
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
