"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

import StaggeredText from "./StaggeredText";

interface Project {
  number: string;
  client: string;
  description: string;
  image: string;
  year: string;
  role: string;
  services: string[];
}

const PROJECTS: Project[] = [
  {
    number: "01 / 03",
    client: "Archin",
    description:
      "We've helped businesses across industries achieve their goals. Here are some of our selected works.",
    image: "/works/archin-1.jpg",
    year: "2025",
    role: "Lead Designer",
    services: ["Website Design", "Product Design", "Branding", "Development"],
  },
  {
    number: "02 / 03",
    client: "VNTNR",
    description:
      "We've partnered with businesses across various industries to help them achieve their goals.",
    image: "/works/vntnr-1.jpg",
    year: "2018",
    role: "Logo Designer",
    services: ["Designing", "Branding", "Redesigning", "Development"],
  },
  {
    number: "03 / 03",
    client: "Aeorim",
    description:
      "We've collaborated with companies from diverse sectors to turn their visions into reality. Here's a look at some of our featured work.",
    image: "/works/solstice-1.jpg",
    year: "2023",
    role: "Website Designer",
    services: ["Branding", "Revamp", "Development", "Designing"],
  },
];

interface CardProps {
  project: Project;
  index: number;
  total: number;
}

function ProjectCard({ project, index, total }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Track how far this card has scrolled past the viewport top
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start start", "end start"],
  });

  // Non-last cards shrink/fade as user scrolls past them
  const isLast = index === total - 1;
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.6, 0.3]);

  // Each card sticks a little lower than the previous, creating the layered stack
  const STICKY_BASE = 80;
  const STICKY_STEP = 16;
  const stickyTop = `${STICKY_BASE + index * STICKY_STEP}px`;

  return (
    <div
      ref={cardRef}
      className="sticky w-full"
      style={{
        top: stickyTop,
        zIndex: 10 + index,
        /* Give enough scroll room so each card stacks before the next arrives */
        marginBottom: isLast ? "0" : "100vh",
      }}
    >
      <motion.div
        style={{
          scale: isLast ? 1 : scale,
          opacity: isLast ? 1 : opacity,
        }}
        className="relative w-full overflow-hidden rounded-[32px] md:rounded-[40px]"
      /* min-height matches reference: nearly full viewport height */
      /* aspect-ratio fallback for older browsers */
      >
        {/* ── FULL-BLEED BLURRED IMAGE BACKGROUND ───────────────── */}
        <div className="absolute inset-0 z-0">
          <Image
            src={project.image}
            alt=""
            fill
            className="object-cover scale-[1.08] blur-[56px] brightness-[0.55] saturate-[1.2]"
            priority={index === 0}
          />
          {/* Dark gradient overlays for readability */}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        </div>

        {/* ── CARD CONTENT ──────────────────────────────────────── */}
        <div className="relative z-10 w-full min-h-[460px] md:min-h-[520px] flex flex-col justify-stretch p-8 md:p-12 lg:p-16">
          {/* 3-Column Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-8 items-center">

            {/* LEFT: Description top + Number+ClientName bottom */}
            <div className="flex flex-col justify-between h-full gap-12 md:gap-0">
              {/* Description */}
              <p className="text-white/60 font-kyiv-sans font-light text-[14px] md:text-[15px] leading-relaxed max-w-[280px]">
                {project.description}
              </p>

              {/* Number + Client Name */}
              <div className="flex flex-col gap-1.5 mt-auto">
                <span className="text-white/35 font-kyiv-sans text-[13px] font-light tracking-[0.08em]">
                  {project.number}
                </span>
                <h3 className="font-kyiv font-bold text-white leading-[0.9] tracking-[-0.04em] text-[clamp(36px,6vw,80px)]">
                  {project.client}
                </h3>
              </div>
            </div>

            {/* CENTER: Portrait Project Mockup */}
            <div className="flex items-center justify-center order-first md:order-none">
              <div
                className="relative overflow-hidden rounded-[20px] md:rounded-[24px] shadow-[0_24px_64px_rgba(0,0,0,0.6)] border border-white/10"
                style={{ width: "clamp(180px, 22vw, 260px)", height: "clamp(240px, 30vw, 360px)" }}
              >
                <Image
                  src={project.image}
                  alt={project.client}
                  fill
                  sizes="(max-width: 768px) 200px, 260px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* RIGHT: Year / Role / Services */}
            <div className="flex flex-col justify-between h-full gap-8 md:gap-0 md:pl-8 lg:pl-16">
              {/* Year */}
              <div className="flex flex-col gap-1.5">
                <span className="text-white/40 font-kyiv-sans font-light text-[12px] tracking-[0.12em] uppercase">
                  Year
                </span>
                <span className="text-white font-kyiv font-bold text-[22px] md:text-[26px] leading-none">
                  {project.year}
                </span>
              </div>

              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <span className="text-white/40 font-kyiv-sans font-light text-[12px] tracking-[0.12em] uppercase">
                  Role
                </span>
                <span className="text-white font-kyiv font-bold text-[18px] md:text-[22px] leading-none">
                  {project.role}
                </span>
              </div>

              {/* Services — plain list, no border */}
              <div className="flex flex-col gap-2">
                <span className="text-white/40 font-kyiv-sans font-light text-[12px] tracking-[0.12em] uppercase">
                  Services
                </span>
                <div className="flex flex-col gap-1.5">
                  {project.services.map((srv) => (
                    <span
                      key={srv}
                      className="text-white font-kyiv font-bold text-[16px] md:text-[18px] leading-snug"
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function SelectedWorks() {
  return (
    <section
      id="works"
      className="relative bg-[#F8F8FA] text-black z-20"
      style={{ paddingTop: "96px", paddingBottom: 0 }}
    >
      {/* Section heading — full width with side padding */}
      <div className="w-full px-4 md:px-5 pb-16">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-2 text-left">
          <span className="text-[12px] uppercase tracking-[0.14em] text-black/35 font-kyiv font-light select-none">
            (Recent Works)
          </span>
          <h2 className="text-[40px] md:text-[58px] font-kyiv font-bold text-black tracking-[-0.03em] leading-none">
            <StaggeredText text="Recent Works" trigger="scroll" delay={0.1} />
          </h2>
        </div>
      </div>

      {/* Stacking cards container — full width, no horizontal padding */}
      <div className="w-full flex flex-col px-1.5 md:px-2 gap-0">
        {PROJECTS.map((project, index) => (
          <ProjectCard
            key={project.client}
            project={project}
            index={index}
            total={PROJECTS.length}
          />
        ))}
      </div>

      {/* Spacer so content after this section doesn't overlap the last sticky card */}
      <div style={{ height: "100px" }} />
    </section>
  );
}
