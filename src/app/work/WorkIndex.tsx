"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import type { Project } from "@/types";
import { disciplines, projectImages, sized } from "@/lib/work";

export default function WorkIndex({ projects }: { projects: Project[] }) {
  const filters = useMemo(() => disciplines(projects), [projects]);
  const [filter, setFilter] = useState<string | null>(null);
  const shown = filter ? projects.filter((p) => p.services.some((s) => s.trim().replace(/\.$/, "") === filter)) : projects;

  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-36 sm:pt-44 pb-24 max-w-[1400px] mx-auto">
      <header className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end mb-12 sm:mb-16">
        <div>
          <h1 className="font-kyiv font-normal tracking-[-0.04em] leading-[0.9] text-[clamp(56px,11vw,168px)] text-brand-text">Work</h1>
          <p className="mt-6 max-w-[46ch] font-kyiv-sans text-[17px] leading-[1.6] text-brand-gray">
            {projects.length} projects in brand identity, visual and motion design — mostly for Web3 teams, plus a few brands closer to home.
          </p>
        </div>
        {filters.length > 0 && (
          <div role="group" aria-label="Filter by discipline" className="flex flex-wrap gap-2 lg:justify-end lg:max-w-[440px]">
            {[null, ...filters].map((f) => {
              const on = filter === f;
              return (
                <button key={f ?? "all"} type="button" aria-pressed={on} onClick={() => setFilter(f)}
                  className={`h-9 px-4 rounded-full font-kyiv-sans text-[14px] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple ${on ? "bg-brand-text text-white border-brand-text" : "border-brand-border text-brand-gray hover:text-brand-text hover:border-brand-text/30"}`}>
                  {f ?? "All"}
                </button>
              );
            })}
          </div>
        )}
      </header>

      <ul className="grid gap-x-6 gap-y-14 sm:gap-y-20 md:grid-cols-2">
        {shown.map((p, i) => (
          <li key={p.id} className={i % 2 === 1 ? "md:translate-y-24" : ""}>
            <Link href={`/work/${p.id}`} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-purple rounded-[24px]">
              <div className="relative overflow-hidden rounded-[24px] bg-[#f2f0f8] aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sized(p.coverImage, 1200)} alt={`${p.clientName} — cover`} loading={i < 2 ? "eager" : "lazy"} decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] motion-reduce:transition-none" />
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h2 className="font-kyiv font-normal tracking-[-0.03em] leading-none text-[clamp(28px,3.4vw,44px)] text-brand-text">{p.clientName}</h2>
                <span className="font-kyiv-sans text-[14px] text-brand-gray tabular-nums shrink-0">{p.year}</span>
              </div>
              <p className="mt-2 font-kyiv-sans text-[15px] text-brand-gray">
                {p.services.slice(0, 3).join(", ") || p.role}
                <span className="text-brand-gray/60"> — {projectImages(p).length} {projectImages(p).length === 1 ? "image" : "images"}</span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {!shown.length && <p className="font-kyiv-sans text-brand-gray">No projects in this discipline yet. <button className="underline" onClick={() => setFilter(null)}>Show all work</button></p>}
    </div>
  );
}
