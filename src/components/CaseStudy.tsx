"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/types";
import { externalLink, isBehance, projectImages, sized } from "@/lib/work";

/**
 * One project, laid out like a Behance project page: title + owner + fields,
 * the story, every image in order, then "about this project" and more work.
 * Used by the slide-up sheet on the home page and by /work/[slug].
 */
export default function CaseStudy({
  project: p,
  others,
  onOpen,
  headingId,
}: {
  project: Project;
  /** other live projects, for "More by Hassan" */
  others: Project[];
  /** inside the sheet: open another project in place instead of navigating */
  onOpen?: (id: string) => void;
  headingId?: string;
}) {
  const images = projectImages(p);
  const link = externalLink(p);
  const hasStory = !!p.description && p.description.trim() !== p.clientName.trim();
  const story = p.tagline && p.tagline !== p.description && p.tagline !== p.clientName ? p.tagline : "";
  const lead = hasStory
    ? p.description
    : p.services.length
      ? `${p.services.slice(0, 3).join(", ")} for ${p.clientName}.`
      : `Design work for ${p.clientName}.`;
  const more = others.filter((o) => o.id !== p.id).slice(0, 4);
  const go = (id: string) => (e: React.MouseEvent) => {
    if (!onOpen || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onOpen(id);
  };

  return (
    <article className="bg-white">
      {/* ── Header: title, owner, fields ── */}
      <header className="px-5 sm:px-8 lg:px-12 pt-10 sm:pt-14 pb-10 max-w-[1400px] mx-auto">
        <h1 id={headingId} className="font-kyiv font-normal tracking-[-0.045em] leading-[0.9] text-[clamp(48px,9vw,148px)] text-brand-text break-words">
          {p.clientName}
        </h1>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link href="/about" className="flex items-center gap-3 group">
            <span className="relative w-10 h-10 rounded-full overflow-hidden bg-[#f2f0f8] shrink-0">
              <Image src="/avatar.png" alt="" fill sizes="40px" className="object-cover" />
            </span>
            <span className="font-kyiv-sans text-[15px] leading-tight">
              <span className="block text-brand-text group-hover:underline underline-offset-4">Hassan Okesanjo</span>
              <span className="block text-brand-gray">{p.role}</span>
            </span>
          </Link>
          {p.services.length > 0 && (
            <ul aria-label="Fields" className="flex flex-wrap gap-2">
              {p.services.map((s) => (
                <li key={s} className="h-8 px-3.5 inline-flex items-center rounded-full bg-[#f2f0f8] font-kyiv-sans text-[13px] text-brand-text">{s.replace(/\.$/, "")}</li>
              ))}
            </ul>
          )}
          <span className="font-kyiv-sans text-[14px] text-brand-gray tabular-nums sm:ml-auto">{p.year}</span>
        </div>
        <p className="mt-10 max-w-[64ch] font-kyiv-serif text-[clamp(19px,1.9vw,25px)] leading-[1.55] text-brand-text">{lead}</p>
      </header>

      {/* ── The work, in order ── */}
      <section aria-label={`${p.clientName} images`} className="max-w-[1400px] mx-auto px-2 sm:px-4 flex flex-col gap-1.5 sm:gap-2">
        {images.map((src, i) => (
          <figure key={src + i} className="overflow-hidden bg-[#f2f0f8] first:rounded-t-[18px] last:rounded-b-[18px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sized(src, 1600)}
              srcSet={src.includes("res.cloudinary.com") ? `${sized(src, 800)} 800w, ${sized(src, 1600)} 1600w, ${sized(src, 2400)} 2400w` : undefined}
              sizes="(min-width: 1400px) 1400px, 100vw"
              alt={p.imageCaptions?.[i] || `${p.clientName} — image ${i + 1} of ${images.length}`}
              loading={i < 2 ? "eager" : "lazy"}
              decoding="async"
              className="block w-full h-auto"
            />
            {p.imageCaptions?.[i] && <figcaption className="px-4 py-3 font-kyiv-sans text-[14px] text-brand-gray bg-white">{p.imageCaptions[i]}</figcaption>}
          </figure>
        ))}
      </section>

      {/* ── About this project ── */}
      <section aria-labelledby={`${p.id}-about`} className="px-5 sm:px-8 lg:px-12 max-w-[1400px] mx-auto mt-16 sm:mt-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] border-t border-brand-border pt-10">
          <div>
            <h2 id={`${p.id}-about`} className="font-kyiv text-[clamp(28px,3vw,40px)] tracking-[-0.03em] leading-tight text-brand-text">About this project</h2>
            <p className="mt-5 max-w-[62ch] font-kyiv-sans text-[17px] leading-[1.7] text-brand-gray whitespace-pre-line">
              {story || (hasStory ? p.description : lead)}
            </p>
          </div>
          <div className="rounded-[24px] bg-[#f7f6fb] p-6 sm:p-8 self-start">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 font-kyiv-sans text-[15px]">
              <div><dt className="text-brand-gray">Client</dt><dd className="mt-1 text-brand-text">{p.clientName}</dd></div>
              <div><dt className="text-brand-gray">Year</dt><dd className="mt-1 text-brand-text">{p.year}</dd></div>
              <div className="col-span-2"><dt className="text-brand-gray">Role</dt><dd className="mt-1 text-brand-text">{p.role}</dd></div>
              {p.services.length > 0 && <div className="col-span-2"><dt className="text-brand-gray">Fields</dt><dd className="mt-1 text-brand-text">{p.services.map((s) => s.replace(/\.$/, "")).join(", ")}</dd></div>}
              <div className="col-span-2"><dt className="text-brand-gray">Images</dt><dd className="mt-1 text-brand-text">{images.length}</dd></div>
            </dl>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex h-11 items-center px-5 rounded-full bg-brand-purple text-white font-kyiv-sans text-[15px] hover:bg-brand-purple-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple">
                Work with Hassan
              </Link>
              {link && (
                <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center px-5 rounded-full border border-brand-border text-brand-text font-kyiv-sans text-[15px] hover:border-brand-text/30 transition-colors">
                  {isBehance(link) ? "View on Behance" : "Visit the live site"}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── More by Hassan ── */}
      {more.length > 0 && (
        <section aria-labelledby={`${p.id}-more`} className="px-5 sm:px-8 lg:px-12 max-w-[1400px] mx-auto mt-20 sm:mt-28 pb-16">
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <h2 id={`${p.id}-more`} className="font-kyiv text-[clamp(28px,3vw,40px)] tracking-[-0.03em] leading-tight text-brand-text">More by Hassan</h2>
            <Link href="/work" className="font-kyiv-sans text-[15px] text-brand-purple underline underline-offset-4 decoration-brand-purple/30 hover:decoration-brand-purple">See all work</Link>
          </div>
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {more.map((o) => (
              <li key={o.id}>
                <Link href={`/work/${o.id}`} onClick={go(o.id)} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-purple rounded-[16px]">
                  <span className="block relative overflow-hidden rounded-[16px] aspect-[4/3] bg-[#f2f0f8]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sized(o.coverImage, 600)} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none" />
                  </span>
                  <span className="mt-3 block font-kyiv text-[20px] tracking-[-0.02em] text-brand-text">{o.clientName}</span>
                  <span className="block font-kyiv-sans text-[13px] text-brand-gray">{o.services.slice(0, 2).join(", ") || o.role}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
