"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Project, Service } from "@/types";
import { SERVICES_DATA } from "@/data/services";
import { projectImages, sized } from "@/lib/work";

/** Words that tie a service to a project's fields / role. */
const MATCH: Record<string, string[]> = {
  brand: ["brand", "logo", "identity", "rebrand"],
  identity: ["brand", "logo", "identity"],
  logo: ["logo", "brand"],
  visual: ["visual", "graphic", "illustration", "social", "web3", "thread", "cover"],
  graphic: ["graphic", "visual", "illustration"],
  social: ["social", "thread", "cover", "visual"],
  motion: ["motion", "animation", "video", "after effects"],
  event: ["event", "merch"],
  ad: ["advert", "ads", "ad ", "campaign", "packaging"],
  ads: ["advert", "ads", "campaign"],
  pitch: ["pitch", "deck", "presentation"],
  deck: ["pitch", "deck", "presentation"],
  web: ["web", "website", "ui", "landing"],
  ui: ["ui", "ux", "interface", "app"],
};

function projectsFor(service: Service, projects: Project[]): Project[] {
  const words = service.title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  // generic words ("design", "branding") would match everything — skip them
  const GENERIC = new Set(["design", "designs", "designer", "branding", "and", "the", "for", "services"]);
  const keys = [...new Set(words.flatMap((w) => MATCH[w] ?? (w.length > 3 && !GENERIC.has(w) ? [w] : [])))];
  if (!keys.length) return [];
  // only the project's own fields: every role says "designer", so it can't tell services apart
  return projects.filter((p) => {
    const hay = ` ${p.services.join(" ").toLowerCase()} `;
    return keys.some((k) => hay.includes(k));
  });
}

/** Images per service: admin-set ones first, else the covers of matching
 *  projects (finished, framed pictures), then a still from their galleries. */
function imagesFor(service: Service, matched: Project[]): string[] {
  const own = [service.image1, service.image2].filter((u) => u && /^https?:\/\//.test(u));
  if (own.length >= 2) return own;
  const still = (u: string) => !!u && !/\.gif($|\?)/i.test(u);
  const out: string[] = [...own];
  // one image per client first ("Fhenix" and "Fhenix Motion" share a look)
  const brand = (p: Project) => p.clientName.trim().split(/\s+/)[0].toLowerCase();
  const seen = new Set<string>();
  for (const p of matched) {
    if (seen.has(brand(p)) || !still(p.coverImage) || out.includes(p.coverImage)) continue;
    seen.add(brand(p));
    out.push(p.coverImage);
  }
  for (const p of matched) {
    const g = projectImages(p).filter(still);
    const pick = g[Math.min(1, g.length - 1)];
    if (pick && !out.includes(pick)) out.push(pick);
  }
  return out.slice(0, 3);
}

export default function Services({ projects = [] }: { projects?: Project[] }) {
  const [services, setServices] = useState<Service[]>(SERVICES_DATA);
  const [active, setActive] = useState(0);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const reduce = useReducedMotion();

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d) && d.length) setServices(d); })
      .catch(() => {});
  }, []);

  // The row nearest the middle of the screen is the active one
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          const i = rows.current.indexOf(e.target as HTMLLIElement);
          if (i !== -1) setActive(i);
        }
      }),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    rows.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, [services]);

  const data = useMemo(() => services.map((s) => {
    const matched = projectsFor(s, projects);
    return { s, matched, images: imagesFor(s, matched) };
  }), [services, projects]);
  const current = data[active] ?? data[0];

  return (
    <section id="about" aria-labelledby="services-title" className="w-full bg-white py-24 md:py-32">
      <div className="px-4 sm:px-6 lg:px-10 max-w-[1400px] mx-auto">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-end mb-12 md:mb-20">
          <h2 id="services-title" className="font-kyiv font-normal tracking-[-0.04em] leading-[0.92] text-[clamp(48px,7vw,104px)] text-brand-text">
            What I do
          </h2>
          <p className="max-w-[48ch] font-kyiv-serif text-[clamp(18px,1.6vw,22px)] leading-[1.5] text-brand-gray">
            Your competitors didn&apos;t get better. They just rebranded first. Here&apos;s how I help teams get there before them.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
          {/* Sticky preview (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-28 h-[min(70vh,680px)] w-full rounded-[28px] overflow-hidden bg-[#0b0b0f]">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={current?.s.id}
                  className="absolute inset-0"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0.2 : 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  {current?.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sized(current.images[0], 1200)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  {current?.images[1] && (
                    <div className="absolute right-6 bottom-6 w-[42%] aspect-[4/3] rounded-[18px] overflow-hidden ring-1 ring-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sized(current.images[1], 700)} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent" />
                  <p className="absolute left-6 top-6 font-kyiv-sans text-[14px] text-white/90">
                    {current?.matched.length ? `From ${current.matched.slice(0, 3).map((p) => p.clientName).join(", ")}` : current?.s.title}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* The list */}
          <ol className="border-t border-brand-border">
            {data.map(({ s, matched, images }, i) => {
              const on = i === active;
              return (
                <li
                  key={s.id}
                  ref={(el) => { rows.current[i] = el; }}
                  onMouseEnter={() => setActive(i)}
                  className="border-b border-brand-border py-8 md:py-10 lg:min-h-[42vh] lg:flex lg:items-center"
                >
                  <div className="flex items-baseline gap-4 md:gap-6">
                    <span className={`font-kyiv-sans text-[14px] tabular-nums transition-colors ${on ? "text-brand-purple" : "text-brand-gray/60"}`}>{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-kyiv font-normal tracking-[-0.035em] leading-[0.98] text-[clamp(34px,4.6vw,64px)] transition-colors duration-300 ${on ? "text-brand-text" : "text-brand-text/35"}`}>
                        {s.title}
                      </h3>
                      <p className="mt-4 max-w-[52ch] font-kyiv-sans text-[16px] md:text-[17px] leading-[1.65] text-brand-gray">{s.description}</p>

                      {/* images inline on phones and tablets */}
                      {images.length > 0 && (
                        <div className="lg:hidden mt-6 grid grid-cols-2 gap-2">
                          {images.slice(0, 2).map((src) => (
                            <div key={src} className="relative aspect-[4/3] rounded-[16px] overflow-hidden bg-[#f2f0f8]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={sized(src, 700)} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      {matched.length > 0 && (
                        <p className="mt-5 font-kyiv-sans text-[14px] text-brand-gray">
                          <span className="text-brand-gray/80">Seen in </span>
                          {matched.slice(0, 4).map((p, k) => (
                            <React.Fragment key={p.id}>
                              {k > 0 && ", "}
                              <Link href={`/work/${p.id}`} className="text-brand-text underline decoration-brand-border underline-offset-4 hover:decoration-brand-purple hover:text-brand-purple transition-colors">{p.clientName}</Link>
                            </React.Fragment>
                          ))}
                          {matched.length > 4 && <span> and {matched.length - 4} more</span>}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
