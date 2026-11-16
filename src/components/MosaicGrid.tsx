"use client";

import React from "react";
import Link from "next/link";
import type { Project } from "@/types";
import { sized } from "@/lib/work";

/**
 * Banner under the hero: a mosaic of Hassan's own project covers
 * (it used to be a stock template image). Each tile opens its project.
 */
const LAYOUT = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
];

export default function MosaicGrid({ projects = [] }: { projects?: Project[] }) {
  const tiles = projects.filter((p) => p.coverImage).slice(0, LAYOUT.length);
  if (tiles.length < 3) return null;
  return (
    <section aria-label="Featured projects" className="w-full bg-white flex justify-center pb-6 pt-0 px-1 md:px-3">
      <div className="w-full max-w-[1400px] grid grid-cols-2 md:grid-cols-4 grid-rows-[repeat(4,minmax(0,1fr))] md:grid-rows-2 gap-1.5 md:gap-2 aspect-[3/4] md:aspect-[2848/1604] rounded-[24px] overflow-hidden">
        {tiles.map((p, i) => (
          <Link
            key={p.id}
            href={`/work/${p.id}`}
            className={`${LAYOUT[i]} group relative overflow-hidden bg-[#141414] ${i === 0 ? "rounded-none" : ""} focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sized(p.coverImage, i === 0 ? 1400 : 700)}
              alt=""
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
            />
            <span className="absolute left-3 bottom-3 md:left-4 md:bottom-4 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-[6px] text-white font-kyiv-sans text-[13px] leading-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 transition-all duration-300 max-md:opacity-100 max-md:translate-y-0">
              {p.clientName}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
