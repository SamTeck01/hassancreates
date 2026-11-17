import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";
import Services from "@/components/Services";
import ClientLogos from "@/components/ClientLogos";
import { getProjects } from "@/lib/projects";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About",
  description: "Hassan Okesanjo is a visual and brand designer in Lagos, Nigeria — Lead Designer at Switch Labs, with four years of work for Web3 teams like Fhenix, Zama, Arcium and Drosera.",
  alternates: { canonical: "/about" },
};

const EXPERIENCE = [
  { role: "Lead Designer", org: "Switch Labs", place: "Lagos, Nigeria" },
  { role: "Visual and Motion Designer", org: "Fhenix", place: "Remote" },
  { role: "Designer", org: "The Afrinix", place: "" },
  { role: "Graphic Designer", org: "BeatCoin", place: "" },
];

export default async function AboutPage() {
  const projects = await getProjects();
  const clients = [...new Set(projects.map((p) => p.clientName.replace(/ (Events|Motion)$/, "")))];

  return (
    <SiteChrome>
      <div className="px-4 sm:px-6 lg:px-10 pt-36 sm:pt-44 max-w-[1400px] mx-auto">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end">
          <h1 className="font-kyiv font-normal tracking-[-0.04em] leading-[0.95] text-[clamp(44px,7.4vw,112px)] text-brand-text">
            I design brands that hold up everywhere they show up.
          </h1>
          <div className="relative w-full max-w-[420px] aspect-square rounded-[32px] overflow-hidden bg-[#f2f0f8] lg:justify-self-end">
            <Image src="/avatar.png" alt="Hassan Okesanjo" fill sizes="(min-width: 1024px) 420px, 90vw" className="object-cover" priority />
          </div>
        </div>

        <div className="mt-16 sm:mt-24 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] border-t border-brand-border pt-10">
          <p className="font-kyiv-sans text-[15px] text-brand-gray">About me</p>
          <div className="max-w-[62ch] space-y-6 font-kyiv-serif text-[clamp(19px,1.8vw,24px)] leading-[1.55] text-brand-text">
            <p>I&apos;m Hassan Okesanjo, a visual and brand designer in Lagos. For four years I&apos;ve helped Web3 teams look as serious as the technology they&apos;re building — identities, launch campaigns, event branding and motion.</p>
            <p>Right now I lead design at Switch Labs. Before that I designed visuals and motion for Fhenix, and I&apos;ve made work for {clients.slice(0, 6).join(", ")} and others.</p>
            <p className="font-kyiv-sans text-[17px] leading-[1.7] text-brand-gray">I&apos;m available for freelance projects and full-time roles, and I work remotely with teams in any time zone.</p>
          </div>
        </div>

        <div className="mt-16 sm:mt-24 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] border-t border-brand-border pt-10">
          <h2 className="font-kyiv-sans text-[15px] font-normal text-brand-gray">Experience</h2>
          <ol className="divide-y divide-brand-border">
            {EXPERIENCE.map((e) => (
              <li key={e.org} className="py-5 first:pt-0 grid sm:grid-cols-[1fr_auto] gap-1 sm:gap-6">
                <p className="font-kyiv text-[clamp(22px,2.4vw,30px)] tracking-[-0.02em] leading-tight text-brand-text">{e.role}, {e.org}</p>
                {e.place && <p className="font-kyiv-sans text-[15px] text-brand-gray sm:text-right self-end">{e.place}</p>}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-20 sm:mt-28"><ClientLogos /></div>
      <Services projects={projects} />

      <div className="px-4 sm:px-6 lg:px-10 max-w-[1400px] mx-auto py-24 sm:py-32 text-center">
        <p className="font-kyiv tracking-[-0.04em] leading-[0.95] text-[clamp(40px,7vw,104px)] text-brand-text">Have a project in mind?</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="inline-flex h-12 items-center px-7 rounded-full bg-brand-purple text-white font-kyiv-sans text-[16px] hover:bg-brand-purple-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple">Start a project</Link>
          <Link href="/work" className="inline-flex h-12 items-center px-7 rounded-full border border-brand-border text-brand-text font-kyiv-sans text-[16px] hover:border-brand-text/30 transition-colors">See the work</Link>
        </div>
      </div>
    </SiteChrome>
  );
}
