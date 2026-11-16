"use client";

import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/types";
import CaseStudy from "./CaseStudy";
import { pauseSmoothScroll, resumeSmoothScroll } from "@/lib/smoothScroll";

/**
 * A project's case study in a sheet that slides up from the bottom.
 * The address bar follows (/work/<id>) so it can be shared; Back closes it.
 */
export default function CaseStudySheet({
  projectId,
  projects,
  onChange,
  onClose,
}: {
  projectId: string;
  projects: Project[];
  onChange: (id: string) => void;
  onClose: () => void;
}) {
  const project = projects.find((p) => p.id === projectId);
  const scroller = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const startUrl = useRef<string>("");

  // Lock the page behind, focus the sheet, restore focus after
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
    pauseSmoothScroll();
    closeBtn.current?.focus({ preventScroll: true });
    startUrl.current = window.location.pathname + window.location.search + window.location.hash;
    return () => {
      document.documentElement.classList.remove("modal-open");
      document.body.classList.remove("modal-open");
      resumeSmoothScroll();
      prev?.focus?.({ preventScroll: true });
    };
  }, []);

  // Keep the address in step with the open project; Back closes the sheet
  useEffect(() => {
    if (!project) return;
    const url = `/work/${project.id}`;
    if (window.location.pathname !== url) window.history.pushState({ hcSheet: project.id }, "", url);
    document.title = `${project.clientName} | hassancreates`;
    scroller.current?.scrollTo({ top: 0 });
  }, [project]);
  useEffect(() => {
    const onPop = () => onClose();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [onClose]);

  const close = () => {
    if (window.history.state?.hcSheet) window.history.back(); // popstate → onClose
    else onClose();
  };
  useEffect(() => () => {
    // Closed some other way (e.g. unmount): put the home address back
    if (window.location.pathname.startsWith("/work/") && startUrl.current && !startUrl.current.startsWith("/work/")) {
      window.history.replaceState(null, "", startUrl.current);
      document.title = "Hassan Okesanjo — Visual & Brand Designer";
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      // keep Tab inside the sheet
      if (e.key === "Tab" && scroller.current) {
        const f = scroller.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!project) return null;
  const headingId = `sheet-title-${project.id}`;

  return (
    <div className="fixed inset-0 z-[200]">
      <motion.div
        className="absolute inset-0 bg-[#08070D]/55 backdrop-blur-[2px]"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={close}
        aria-hidden="true"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="absolute inset-x-0 bottom-0 top-3 sm:top-6 sm:inset-x-3 lg:inset-x-6 bg-white rounded-t-[28px] shadow-[0_-24px_80px_rgba(8,7,13,0.25)] flex flex-col overflow-hidden"
        initial={reduce ? { opacity: 0 } : { y: "100%" }}
        animate={reduce ? { opacity: 1 } : { y: 0 }}
        exit={reduce ? { opacity: 0 } : { y: "100%" }}
        transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 32, mass: 0.9 }}
      >
        {/* Bar: grab handle, project, open full page, close */}
        <div className="relative shrink-0 flex items-center gap-3 px-4 sm:px-6 h-16 border-b border-brand-border bg-white/90 backdrop-blur">
          <span aria-hidden="true" className="absolute left-1/2 top-2 -translate-x-1/2 w-10 h-1 rounded-full bg-brand-border" />
          <p className="font-kyiv text-[18px] tracking-[-0.02em] text-brand-text truncate">{project.clientName}</p>
          <span className="font-kyiv-sans text-[13px] text-brand-gray hidden sm:inline">{project.year}</span>
          <div className="ml-auto flex items-center gap-2">
            <a href={`/work/${project.id}`} className="inline-flex h-10 items-center px-3 sm:px-4 rounded-full border border-brand-border font-kyiv-sans text-[14px] text-brand-text hover:border-brand-text/30 transition-colors">
              Open full page
            </a>
            <button ref={closeBtn} type="button" onClick={close} aria-label="Close case study"
              className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-brand-text text-white hover:bg-brand-purple transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <div ref={scroller} data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain">
          <CaseStudy project={project} others={projects} onOpen={onChange} headingId={headingId} />
        </div>
      </motion.div>
    </div>
  );
}
