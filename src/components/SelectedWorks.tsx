"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionTemplate, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
const PhotoViewer = dynamic(() => import("./PhotoViewer"), {
  ssr: false,
});
import { Project } from "@/types";
import { PROJECTS_DATA } from "@/data/projects";

const NOISE_IMG =
  "https://framerusercontent.com/images/hiGYz6grmhAHSeZuNKHEuchTGTw.png";

function WorkCard({
  project,
  isLast,
  isMobile,
  onSelect,
}: {
  project: Project & { stickyTop: number; zIndex: number };
  isLast: boolean;
  isMobile: boolean;
  onSelect: (projectId: string) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end start"],
  });

  // Exit: shrink → tilt left → blur away over 60vh
  // blur capped at 8px (fixing-motion-performance rule 7: never large-surface blur >8px)
  const scale   = useTransform(scrollYProgress, [0, 1], [1, 0.80]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.4, 0]);
  const rotate  = useTransform(scrollYProgress, [0, 1], [0, -8]); // tilt left
  const blurPx  = useTransform(scrollYProgress, [0, 1], [0, 8]);  // ≤8px per perf skill
  const filter  = useMotionTemplate`blur(${blurPx}px)`;

  return (
    <motion.div
      ref={wrapperRef}
      id={project.id}
      className="cardWrapper sticky w-full will-change-transform max-[809px]:!filter-none"
      style={{
        top: isMobile ? 64 : project.stickyTop,
        position: "sticky",
        zIndex: project.zIndex,
        scale:   isLast ? 1 : scale,
        opacity: isLast ? 1 : opacity,
        rotate:  isLast ? 0 : rotate,
        filter:  isMobile || isLast ? "none" : filter,
        // 60vh of scroll space for the full exit animation on desktop; tighter 40vh on mobile
        marginBottom: isLast ? 0 : (isMobile ? "10vh" : "20vh"),
        transformOrigin: "center center",
      }}
    >
      {/* framer-AJQo7 framer-v-1ba6yrb */}
      <div className="w-full rounded-[32px]">
        {/* framer-148g6gm */}
        <div className="workCard relative rounded-[32px] overflow-hidden w-full min-h-[560px] flex flex-col min-[1440px]:min-h-[680px] max-[809px]:min-h-0">

          {/* BG image — absolute fill */}
          <div className="absolute inset-0 rounded-[inherit] z-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              decoding="auto"
              width={2848}
              height={1588}
              sizes="(min-width: 1440px) max(max(min(100vw, 1920px) - 16px, 1px), 1px), (min-width: 810px) and (max-width: 1439.98px) max(max(min(100vw, 1920px) - 16px, 1px), 1px), (max-width: 809.98px) max(calc(min(100vw, 1920px) - 16px), 1px)"
              srcSet={project.bgSrcSet}
              src={project.bgImage}
              alt="BG Image"
              className="block w-full h-full rounded-[inherit] object-cover object-center blur-[28px] scale-[1.1]"
            />
          </div>

          {/* Noise overlay — framer-z3ltis */}
          <div className="absolute inset-0 rounded-[inherit] opacity-[0.18] pointer-events-none z-[1]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              decoding="auto"
              width={2848}
              height={1588}
              src={NOISE_IMG}
              alt=""
              aria-hidden="true"
              className="block w-full h-full rounded-[inherit] object-fill"
            />
          </div>

          {/* Blur overlay — framer-1w7zods */}
          <div className="absolute inset-0 rounded-[inherit] bg-[#0c0c0c]/40 z-[2] pointer-events-none" />

          {/* Inner content — framer-165nn3j */}
          <div className="relative z-[3] flex flex-row items-stretch flex-1 w-full p-10 gap-8 box-border min-h-[inherit] max-[809px]:flex-col max-[809px]:p-5 max-[809px]:gap-4 max-[809px]:min-h-0">

            {/* LEFT — framer-1mzphu2 */}
            <div className="flex flex-col justify-between shrink-0 basis-[280px] min-w-0 gap-8 min-[1440px]:basis-[360px] max-[809px]:flex-none max-[809px]:gap-3 max-[809px]:justify-start">

              {/* Content — framer-9niauw / framer-16geo85 */}
              <div className="flex">
                <p className="font-kyiv-sans text-[13px] font-normal leading-[1.6] text-white/64 m-0">
                  {project.description}
                </p>
              </div>

              {/* Brand — framer-1pir4kz */}
              <div 
                className="flex flex-col gap-3"
                onClick={() => onSelect(project.id)}
                style={{ cursor: "pointer" }}
              >

                {/* Counter row — framer-r999pn */}
                <div className="flex flex-row items-center gap-0.5 pb-3 border-b border-white/20">
                  {/* framer-k15jqr */}
                  <p className="font-kyiv-sans text-[13px] font-normal text-white m-0">{project.number}</p>
                  {/* framer-1eo6faf */}
                  <p className="font-kyiv-sans text-[13px] font-normal text-white/64 m-0">&nbsp;/ 03</p>
                </div>

                {/* Client name h2 — framer-mtdgxz / framer-styles-preset-13pym41 */}
                <h2 className="font-kyiv text-[clamp(64px,9vw,130px)] font-normal leading-[0.95] tracking-[-0.03em] text-white m-0 max-[809px]:text-[clamp(38px,8vw,52px)]">
                  <span className="whitespace-nowrap">
                    {project.clientName.split("").map((char, i) => (
                      <span key={i} className="inline-block opacity-100 transform-none will-change-transform">
                        {char}
                      </span>
                    ))}
                  </span>
                </h2>
              </div>
            </div>

            {/* RIGHT — framer-90jchk */}
            <div className="flex flex-row items-stretch flex-1 gap-6 justify-end min-w-0 max-[809px]:gap-4 max-[809px]:justify-start">

              {/* Image + Click to View Button Container */}
              <div className="flex flex-col gap-3 shrink-0 w-[300px] min-[1440px]:w-[456px] max-[809px]:w-[160px] max-[809px]:shrink-0 self-stretch">
                <a
                  href={project.href}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(project.id);
                  }}
                  className="block relative rounded-[24px] overflow-hidden border border-[#0c0c0c]/82 no-underline flex-1"
                  aria-label={`View ${project.clientName} project`}
                >
                  {/* Inner border highlight — framer-cy9ysw */}
                  <div className="absolute inset-0 rounded-[24px] border border-white/10 z-[1] pointer-events-none" />
                  {/* Image fill — framer-1a1qf3u */}
                  <div className="absolute inset-0 rounded-[24px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      decoding="auto"
                      width={912}
                      height={1140}
                      sizes="(min-width: 1440px) 456px, (min-width: 810px) and (max-width: 1439.98px) 300px, (max-width: 809.98px) 300px"
                      srcSet={project.coverSrcSet}
                      src={project.coverImage}
                      alt="Cover Image"
                      className="block w-full h-full rounded-[inherit] object-cover object-center"
                    />
                  </div>
                </a>

                <motion.button
                  onClick={() => onSelect(project.id)}
                  className="w-full py-2.5 px-4 rounded-[16px] bg-white/8 border border-white/10 text-white font-kyiv-sans text-[11px] font-normal tracking-[0.08em] uppercase cursor-pointer text-center select-none"
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  Click to View
                </motion.button>
              </div>

              {/* Stats panel — framer-5i263h */}
              <div className="flex flex-col justify-between gap-6 shrink-0 basis-[160px] min-w-0 min-[1440px]:basis-[200px] max-[809px]:justify-start max-[809px]:gap-3 max-[809px]:flex-none">

                {/* Top stats — framer-rwuc2c */}
                <div className="flex flex-col gap-7">
                  {/* Year — framer-1dvkm6c */}
                  <div className="flex flex-col gap-1.5">
                    {/* framer-gpmcii */}
                    <p className="font-kyiv-sans text-[12px] font-normal text-white/64 m-0">Year</p>
                    {/* framer-1ye5dlq / framer-styles-preset-13e92k5 */}
                    <p className="font-kyiv-sans text-[15px] font-medium text-white m-0">{project.year}</p>
                  </div>
                  {/* Role — framer-25oos7 */}
                  <div className="flex flex-col gap-1.5">
                    {/* framer-6pp3pc */}
                    <p className="font-kyiv-sans text-[12px] font-normal text-white/64 m-0">Role</p>
                    {/* framer-x4df5s */}
                    <p className="font-kyiv-sans text-[15px] font-medium text-white m-0">{project.role}</p>
                  </div>
                </div>

                {/* Services — framer-15okfae */}
                <div className="flex flex-col gap-1.5">
                  {/* framer-10fme74 */}
                  <p className="font-kyiv-sans text-[12px] font-normal text-white/64 mb-1">Services</p>
                  {/* framer-1tfezv5 / framer-dzuyjn / framer-1ny8fgc / framer-12n5dvj */}
                  {project.services.map((srv) => (
                    <p key={srv} className="font-kyiv-sans text-[13px] font-normal leading-[1.4] text-white m-0">
                      {srv}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function SelectedWorks() {
  const [isMobile, setIsMobile] = useState(false);
  const [projects, setProjects] = useState<Project[]>(PROJECTS_DATA);
  const [activePhotoProject, setActivePhotoProject] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 810);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Dynamic fetch from Next.js API Route handler
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort((a, b) => a.number.localeCompare(b.number));
          setProjects(sorted);
        }
      })
      .catch((err) => console.error("Failed to load projects from API:", err));
  }, []);

  return (
    /* framer-s0bx2r */
    <>
      <section id="works" className="w-full bg-white pt-24 px-2.5 pb-2.5 overflow-hidden max-[809px]:pt-12 max-[809px]:px-0" data-framer-name="Works-Section">
        {/* framer-3u9vmd */}
        <div className="w-[calc(min(100vw,1920px)-16px)] mx-auto flex flex-col gap-14 max-[809px]:gap-8" data-framer-name="Container">

          {/* framer-c6tfrg — flex-row: label left, heading right */}
          <div className="flex flex-col items-center gap-2.5 w-full max-w-[1080px] mx-auto px-4 box-border max-[809px]:items-start max-[809px]:gap-2 max-[809px]:px-6" data-framer-name="Top">
            {/* framer-1u53hr0 */}
            <p className="font-kyiv-sans text-[14px] font-normal leading-normal text-[#5c5c5c] m-0 shrink-0">(Recent Works)</p>

            {/* framer-1raj7xj */}
            <div className="flex items-end" data-framer-name="Heading">
              {/* framer-1df4roe / framer-benisz */}
              {/* framer-styles-preset-nv8ngd with data-text-fill gradient */}
              <h2 className="font-kyiv text-[clamp(48px,5.5vw,80px)] font-normal leading-none tracking-[-0.02em] m-0 bg-clip-text text-transparent bg-gradient-to-b from-[#0c0c0c]/82 to-[#0c0c0c]/50">Recent Works</h2>
            </div>
          </div>

          {/* framer-oh5ifz */}
          <div className="flex flex-col relative" data-framer-name="Bottom">
            {projects.map((project, index) => {
              const layoutProject = {
                ...project,
                stickyTop: 80 + index * 16,
                zIndex: 10 + index,
              };

              return (
                <WorkCard
                  key={project.id}
                  project={layoutProject}
                  isLast={index === projects.length - 1}
                  isMobile={isMobile}
                  onSelect={setActivePhotoProject}
                />
              );
            })}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activePhotoProject && (
          <PhotoViewer
            projectId={activePhotoProject}
            onClose={() => setActivePhotoProject(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
