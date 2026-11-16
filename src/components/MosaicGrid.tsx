"use client";

import React, { useMemo } from "react";
import type { Project } from "@/types";
import { sized } from "@/lib/work";

/**
 * Banner under the hero — same design as the original: a black panel of
 * rounded cards in staggered columns, tilted on a diagonal and fading into
 * black at the edges. Filled with images from Hassan's client projects.
 */
const COLUMNS = 5;
const PER_COLUMN = 5;
// card shapes per column, so neighbouring columns never line up
const SHAPES = ["aspect-[4/3]", "aspect-[16/11]", "aspect-[1/1]", "aspect-[16/10]", "aspect-[5/4]"];
const OFFSETS = ["-12%", "-2%", "-18%", "-6%", "-14%"]; // vertical stagger per column

function pickImages(projects: Project[], count: number): string[] {
  // round-robin across projects so every client shows up, skipping covers
  // that repeat the card image, then fall back to covers
  const pools = projects.map((p) => {
    const g = (p.swiperImages ?? []).filter(Boolean);
    const step = Math.max(1, Math.floor(g.length / 4));
    const picks: string[] = [];
    for (let i = Math.min(1, g.length - 1); i < g.length && picks.length < 4; i += step) picks.push(g[i]);
    return picks.length ? picks : [p.coverImage];
  });
  const out: string[] = [];
  for (let round = 0; out.length < count && round < 6; round++) {
    for (const pool of pools) {
      if (pool[round] && !out.includes(pool[round])) out.push(pool[round]);
      if (out.length >= count) break;
    }
  }
  while (out.length && out.length < count) out.push(out[out.length % Math.max(1, out.length)]);
  return out;
}

export default function MosaicGrid({ projects = [] }: { projects?: Project[] }) {
  const images = useMemo(() => pickImages(projects, COLUMNS * PER_COLUMN), [projects]);
  if (images.length < 6) return null;
  const columns = Array.from({ length: COLUMNS }, (_, c) => images.slice(c * PER_COLUMN, (c + 1) * PER_COLUMN));

  return (
    <section aria-label="A selection of client work" className="w-full bg-white flex justify-center pb-6 pt-0 px-1 md:px-3">
      <div className="relative w-full max-w-[1400px] overflow-hidden rounded-[24px] aspect-[2848/1604] max-sm:aspect-[4/5] bg-[#050505]">
        {/* the tilted wall of work */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 w-[150%] max-sm:w-[260%] flex gap-[1.4%] max-sm:gap-[2.4%]"
          style={{ transform: "translate(-50%, -50%) perspective(2400px) rotateX(12deg) rotateZ(-14deg)" }}
        >
          {columns.map((col, c) => (
            <div key={c} className="flex-1 flex flex-col gap-[7%] max-sm:gap-[5%]" style={{ transform: `translateY(${OFFSETS[c]})` }}>
              {col.map((src, r) => (
                <div
                  key={r}
                  className={`relative ${SHAPES[(c + r) % SHAPES.length]} rounded-[clamp(10px,1.6vw,26px)] overflow-hidden bg-[#141414] shadow-[0_30px_60px_rgba(0,0,0,0.55)]`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sized(src, 640)} alt="" loading={c < 3 ? "eager" : "lazy"} decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                  {/* glassy rim, like the original cards */}
                  <span className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/12 bg-gradient-to-b from-white/[0.06] to-transparent" />
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* edges fade into black */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_75%_70%_at_55%_45%,transparent_45%,rgba(5,5,5,0.55)_80%,#050505_100%)]" />
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-[12%] pointer-events-none bg-gradient-to-r from-[#050505]/80 to-transparent" />
      </div>
    </section>
  );
}
