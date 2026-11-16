import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import { getProjects } from "@/lib/projects";
import { sized } from "@/lib/work";
import CaseStudy from "@/components/CaseStudy";

export const revalidate = 60;

async function load(slug: string) {
  const projects = await getProjects();
  const i = projects.findIndex((p) => p.id === slug);
  if (i < 0) return null;
  return { project: projects[i], all: projects };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = await load(slug);
  if (!d) return { title: "Project not found" };
  const p = d.project;
  const description = p.description && p.description !== p.clientName
    ? p.description
    : `${p.clientName} — ${p.services.slice(0, 3).join(", ") || p.role} by Hassan Okesanjo (${p.year}).`;
  return {
    title: p.clientName,
    description,
    alternates: { canonical: `/work/${p.id}` },
    openGraph: { title: `${p.clientName} — Hassan Okesanjo`, description, images: [{ url: sized(p.coverImage, 1200) }] },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await load(slug);
  if (!d) notFound();
  return (
    <SiteChrome>
      <div className="pt-24 sm:pt-28">
        <nav aria-label="Breadcrumb" className="px-5 sm:px-8 lg:px-12 max-w-[1400px] mx-auto pt-6 font-kyiv-sans text-[14px] text-brand-gray">
          <Link href="/work" className="hover:text-brand-text underline-offset-4 hover:underline">Work</Link>
          <span aria-hidden="true"> / </span>
          <span className="text-brand-text">{d.project.clientName}</span>
        </nav>
        <CaseStudy project={d.project} others={d.all} />
      </div>
    </SiteChrome>
  );
}
