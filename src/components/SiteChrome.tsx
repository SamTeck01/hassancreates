"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Header from "./Header";
import Footer from "./Footer";

const MenuOverlay = dynamic(() => import("./MenuOverlay"), { ssr: false });

/** Header + footer + menu for every page other than the home page. */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative min-h-screen flex flex-col text-brand-text bg-white" style={{ overflowX: "clip" }}>
      <Header variant="nav" isMenuOpen={open} onToggleMenu={() => setOpen((o) => !o)} />
      <main id="main" className="flex-1">{children}</main>
      <Footer />
      <MenuOverlay isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
