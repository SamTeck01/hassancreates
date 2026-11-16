import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import { getProjects } from "@/lib/projects";
import { externalLink, isBehance, projectImages, sized } from "@/lib/work";

export const revalidate = 60;

async function load(slug: string) {
  const projects = await getProjects();
  const i = projects.findIndex((p) => p.id === slug);
  if (i < 0) return null;
  return { project: projects[i], next: projects[(i + 1) % projects.length], index: i, total: projects.length };
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
  const { project: p, next } = d;
  const images = projectImages(p);
  const link = externalLink(p);
  const hasStory = !!p.description && p.description !== p.clientName;
  const story = p.tagline && p.tagline !== p.description && p.tagline !== p.clientName ? p.tagline : "";

  return (
    <SiteChrome>
      <article className="px-4 sm:px-6 lg:px-10 pt-36 sm:pt-44 max-w-[1400px] mx-auto">
        <nav aria-label="Breadcrumb" className="font-kyiv-sans text-[14px] text-brand-gray mb-6">
          <Link href="/work" className="hover:text-brand-text underline-offset-4 hover:underline">Work</Link>
          <span aria-hidden="true"> / </span>
          <span className="text-brand-text">{p.clientName}</span>
        </nav>

        <h1 className="font-kyiv font-normal tracking-[-0.045em] leading-[0.88] text-[clamp(56px,12vw,200px)] text-brand-text break-words">
          {p.clientName}
        </h1>

        <div className="mt-12 sm:mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] border-t border-brand-border pt-8">
          <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-x-6 gap-y-6 font-kyiv-sans text-[15px] content-start">
            <div><dt className="text-brand-gray/80">Year</dt><dd className="mt-1 text-brand-text">{p.year}</dd></div>
            <div><dt className="text-brand-gray/80">Role</dt><dd className="mt-1 text-brand-text">{p.role}</dd></div>
            {p.services.length > 0 && (
              <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                <dt className="text-brand-gray/80">Services</dt>
                <dd className="mt-1 text-brand-text">{p.services.join(", ")}</dd>
              </div>
            )}
            {link && (
              <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                <dt className="text-brand-gray/80">Link</dt>
                <dd className="mt-1">
                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-brand-purple underline underline-offset-4 decoration-brand-purple/30 hover:decoration-brand-purple">
                    {isBehance(link) ? "View on Behance" : "Visit the live site"}
                  </a>
                </dd>
              </div>
            )}
          </dl>
          <div className="max-w-[62ch]">
            {hasStory ? (
              <p className="font-kyiv-serif text-[clamp(20px,2vw,26px)] leading-[1.5] text-brand-text">{p.description}</p>
            ) : (
              <p className="font-kyiv-serif text-[clamp(20px,2vw,26px)] leading-[1.5] text-brand-text">
                {p.services.length ? `${p.services.slice(0, 3).join(", ")} for ${p.clientName}.` : `Design work for ${p.clientName}.`}
              </p>
            )}
            {story && <p className="mt-6 font-kyiv-sans text-[17px] leading-[1.7] text-brand-gray whitespace-pre-line">{story}</p>}
          </div>
        </div>
      </article>

      <section aria-label={`${p.clientName} images`} className="mt-16 sm:mt-24 px-2 sm:px-3 max-w-[1600px] mx-auto flex flex-col gap-2 sm:gap-3">
        {images.map((src, i) => (
          <figure key={src + i} className="overflow-hidden rounded-[16px] sm:rounded-[24px] bg-[#f2f0f8]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sized(src, 1600)}
              srcSet={src.includes("res.cloudinary.com") ? `${sized(src, 800)} 800w, ${sized(src, 1600)} 1600w, ${sized(src, 2400)} 2400w` : undefined}
              sizes="(min-width: 1600px) 1600px, 100vw"
              alt={p.imageCaptions?.[i] || `${p.clientName} — image ${i + 1} of ${images.length}`}
              loading={i < 2 ? "eager" : "lazy"}
              decoding="async"
              className="block w-full h-auto"
            />
            {p.imageCaptions?.[i] && <figcaption className="px-4 py-3 font-kyiv-sans text-[14px] text-brand-gray">{p.imageCaptions[i]}</figcaption>}
          </figure>
        ))}
      </section>

      {next && next.id !== p.id && (
        <nav aria-label="Next project" className="px-4 sm:px-6 lg:px-10 max-w-[1400px] mx-auto mt-24 sm:mt-32 mb-8">
          <Link href={`/work/${next.id}`} className="group grid gap-6 sm:grid-cols-[1fr_minmax(0,420px)] items-end border-t border-brand-border pt-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-purple rounded-sm">
            <div>
              <p className="font-kyiv-sans text-[15px] text-brand-gray">Next project</p>
              <p className="mt-3 font-kyiv font-normal tracking-[-0.04em] leading-[0.9] text-[clamp(44px,8vw,120px)] text-brand-text group-hover:text-brand-purple transition-colors">{next.clientName}</p>
            </div>
            <div className="overflow-hidden rounded-[20px] aspect-[4/3] bg-[#f2f0f8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sized(next.coverImage, 900)} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none" />
            </div>
          </Link>
        </nav>
      )}
    </SiteChrome>
  );
}
