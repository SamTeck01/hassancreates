"use client";

import { useState, useEffect } from "react";
import { useStoredDraft } from "@/lib/useStoredDraft";
import { HugeiconsIcon } from "@hugeicons/react";
import { Briefcase02Icon, Delete01Icon, Link01Icon } from "@hugeicons/core-free-icons";
import { addProject, updateProject, deleteProject, reorderProjects } from "@/app/actions/projects";
import { pauseSmoothScroll, resumeSmoothScroll } from "@/lib/smoothScroll";
import ProjectImages, { type ProjectImage } from "./ProjectImages";
import { projectLink } from "@/lib/projectLink";

/** Existing project → one image list (gallery images + cover/background if they aren't in the gallery). */
function projectToImages(p: { swiperImages?: string[]; imageCaptions?: string[]; coverImage?: string; bgImage?: string }): ProjectImage[] {
  const list: ProjectImage[] = (p.swiperImages ?? []).map((url, i) => ({ url, caption: p.imageCaptions?.[i] ?? "", inGallery: true }));
  const has = (u?: string) => !u || list.some((x) => x.url === u);
  if (!has(p.bgImage)) list.unshift({ url: p.bgImage!, caption: "", inGallery: false });
  if (!has(p.coverImage)) list.unshift({ url: p.coverImage!, caption: "", inGallery: false });
  return list;
}

/** One image list → the fields the site uses. */
function imagesToFields(images: ProjectImage[], cover: string, bg: string) {
  const gallery = images.filter((i) => i.inGallery);
  const c = cover || images[0]?.url || "";
  const b = bg || c;
  return {
    coverImage: c, coverSrcSet: `${c} 1024w`,
    bgImage: b, bgSrcSet: `${b} 2048w`,
    swiperImages: gallery.length ? gallery.map((i) => i.url) : [c],
    imageCaptions: gallery.length ? gallery.map((i) => i.caption || "") : [""],
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Project {
  id: string;
  number: string;
  clientName: string;
  year: string;
  role: string;
  services: string[];
  coverImage: string;
  href: string;
  description: string;
  tagline: string;
  swiperImages: string[];
  imageCaptions: string[];
  bgImage?: string;
}

// ── Modal — SCROLL FIXED: overlay is overflow-hidden, inner box scrolls ──────
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");

    // Pause Lenis smooth scroll
    pauseSmoothScroll();

    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
      // Resume Lenis smooth scroll
      resumeSmoothScroll();
    };
  }, [open]);

  if (!open) return null;

  return (
    // Overlay: fixed + overflow-hidden so page NEVER scrolls
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-hidden flex items-center justify-center p-4 sm:p-8"
      data-lenis-prevent
    >
      {/* Inner box: scrolls independently, blocks wheel from reaching page */}
      <div
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="bg-[#161616] border border-white/8 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: "90dvh" }}
      >
        {/* Sticky header inside modal */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/6 flex-shrink-0">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors flex-shrink-0"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {/* Scrollable content area */}
        <div className="overflow-y-auto overscroll-contain flex-grow px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Confirm Delete ─────────────────────────────────────────────────────────────
function ConfirmDelete({
  open, name, onCancel, onConfirm, busy,
}: {
  open: boolean; name: string; onCancel: () => void; onConfirm: () => void; busy: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-hidden">
      <div onClick={(e) => e.stopPropagation()} className="bg-[#161616] border border-white/8 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
        <div className="w-10 h-10 rounded-full bg-red-950/25 border border-red-900/30 text-red-400 flex items-center justify-center mx-auto mb-4">
          <HugeiconsIcon icon={Delete01Icon} size={16} strokeWidth={2} />
        </div>
        <h3 className="text-sm font-bold text-white mb-2">Confirm Delete</h3>
        <p className="text-xs text-white/45 mb-6 leading-relaxed">
          Remove <strong className="text-white">{name}</strong>? This can&apos;t be undone.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} disabled={busy} className="px-4 py-2 text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/8 border border-white/5 rounded-xl transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={busy} className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors disabled:opacity-50">
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Draft Card ────────────────────────────────────────────────────────────────
type ProjectDraft = Partial<{
  fName: string; fYear: string; fRole: string; fServices: string; fDesc: string;
  fTagline: string; fHref: string; fCover: string; fBg: string;
  fImages: ProjectImage[];
  /** legacy drafts */
  fSwiper: string[]; fCaptions: string[];
}>;

function DraftProjectCard({ draft, onEdit, onPublish, onDiscard, busy }: {
  draft: ProjectDraft;
  onEdit: () => void; onPublish: () => void; onDiscard: () => void; busy: boolean;
}) {
  return (
    <article className="bg-[#161616] border border-dashed border-[#6B21D9]/40 rounded-2xl overflow-hidden flex flex-col group">
      <div className="relative aspect-[16/10] bg-zinc-900/50 overflow-hidden border-b border-white/5">
        {draft.fCover ? (
          <img src={draft.fCover} alt={draft.fName || "Draft"} className="w-full h-full object-cover opacity-40" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/8">
            <HugeiconsIcon icon={Briefcase02Icon} size={32} strokeWidth={1.5} />
          </div>
        )}
        <span className="absolute top-2.5 left-2.5 bg-[#6B21D9] text-white text-[9px] font-bold h-5 px-2 rounded-full flex items-center uppercase tracking-wider">Draft</span>
      </div>
      <div className="p-4 flex-grow flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-bold text-white/60 truncate">{draft.fName || "Untitled Draft"}</span>
          {draft.fYear && <span className="text-[10px] font-mono text-white/25 flex-shrink-0">{draft.fYear}</span>}
        </div>
        {draft.fRole && <span className="text-[10px] font-bold text-[#6B21D9] uppercase tracking-wider">{draft.fRole}</span>}
        <p className="text-[11px] text-white/30 line-clamp-2 leading-relaxed mt-auto pt-2 border-t border-white/4">{draft.fDesc || "No description yet."}</p>
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <button onClick={onEdit} className="flex-1 py-2 bg-[#6B21D9]/10 hover:bg-[#6B21D9]/20 border border-[#6B21D9]/20 text-[11px] font-semibold text-[#a78bfa] hover:text-white rounded-xl transition-colors">Edit</button>
        <button onClick={onPublish} disabled={busy} className="flex-1 py-2 bg-[#6B21D9] hover:bg-[#7c3aed] text-[11px] font-bold text-white rounded-xl transition-colors disabled:opacity-50">Publish</button>
        <button onClick={onDiscard} aria-label="Discard draft" title="Discard draft" className="p-2 bg-red-950/15 hover:bg-red-950/30 border border-red-900/10 hover:border-red-900/25 text-red-500 hover:text-red-400 rounded-xl transition-colors">
          <HugeiconsIcon icon={Delete01Icon} size={13} strokeWidth={2} />
        </button>
      </div>
    </article>
  );
}

// ── Works Client ──────────────────────────────────────────────────────────────
export default function WorksClient({ initialProjects }: { initialProjects: Project[] }) {
  const [list, setList] = useState<Project[]>(initialProjects);

  // Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [toDelete, setToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fields
  const [fName, setFName] = useState("");
  const [fYear, setFYear] = useState("");
  const [fRole, setFRole] = useState("");
  const [fServices, setFServices] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fTagline, setFTagline] = useState("");
  const [fHref, setFHref] = useState("");
  const [fCover, setFCover] = useState("");
  const [fBg, setFBg] = useState("");
  const [fImages, setFImages] = useState<ProjectImage[]>([]);

  const [draft, setDraft] = useStoredDraft<ProjectDraft>("hc-project-draft", (d) => !!(d.fName || d.fDesc));

  const reset = () => {
    setFName(""); setFYear(""); setFRole(""); setFServices("");
    setFDesc(""); setFTagline(""); setFHref(""); setFCover(""); setFBg("");
    setFImages([]);
    setError(""); setSuccess(false); setEditing(null);
  };

  const saveDraft = () => {
    const d = { fName, fYear, fRole, fServices, fDesc, fTagline, fHref, fCover, fBg, fImages };
    setDraft(d);
    setModalOpen(false);
  };

  const openDraft = () => {
    if (!draft) return;
    setFName(draft.fName ?? ""); setFYear(draft.fYear ?? ""); setFRole(draft.fRole ?? "");
    setFServices(draft.fServices ?? ""); setFDesc(draft.fDesc ?? ""); setFTagline(draft.fTagline ?? "");
    setFHref(draft.fHref ?? ""); setFCover(draft.fCover ?? ""); setFBg(draft.fBg ?? "");
    setFImages(draft.fImages ?? projectToImages({ swiperImages: draft.fSwiper, imageCaptions: draft.fCaptions, coverImage: draft.fCover, bgImage: draft.fBg }));
    setEditing(null);
    setModalOpen(true);
  };

  const discardDraft = () => {
    setDraft(null);
  };

  const publishDraft = async () => {
    const dImages = draft?.fImages ?? projectToImages({ swiperImages: draft?.fSwiper, imageCaptions: draft?.fCaptions, coverImage: draft?.fCover, bgImage: draft?.fBg });
    if (!draft || !draft.fName || !draft.fDesc || !dImages.length) {
      alert("Draft needs at least a name, a short description and one image."); return;
    }
    setSubmitting(true);
    try {
      const id = draft.fName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4);
      const num = (list.length + 1).toString().padStart(2, "0");
      const payload = {
        clientName: draft.fName, year: draft.fYear ?? "", role: draft.fRole ?? "",
        services: (draft.fServices || "").split(",").map((s: string) => s.trim()).filter(Boolean),
        description: draft.fDesc, tagline: draft.fTagline || draft.fDesc, href: draft.fHref || "#",
        ...imagesToFields(dImages, draft.fCover ?? "", draft.fBg ?? ""),
      };
      const full = { id, number: num, ...payload };
      const r = await addProject(full);
      if (r.success) {
        setList((p) => [...p, full]);
        setDraft(null);
      } else alert(r.error || "Publish failed.");
    } catch { alert("Unexpected error."); }
    finally { setSubmitting(false); }
  };

  const openEdit = (p: Project) => {
    reset();
    setEditing(p);
    setFName(p.clientName); setFYear(p.year); setFRole(p.role);
    setFServices(p.services.join(", ")); setFDesc(p.description || "");
    setFTagline(p.tagline || ""); setFHref(p.href);
    setFCover(p.coverImage); setFBg(p.bgImage || p.coverImage);
    setFImages(projectToImages(p));
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = [
      !fName && "name", !fYear && "year", !fRole && "role",
      !fDesc && "short description", !fImages.length && "at least one image",
    ].filter(Boolean);
    if (missing.length) { setError(`Please add: ${missing.join(", ")}.`); return; }
    setSubmitting(true); setError("");
    const payload = {
      clientName: fName, year: fYear, role: fRole,
      services: fServices.split(",").map((s) => s.trim()).filter(Boolean),
      description: fDesc, tagline: fTagline.trim() || fDesc, href: fHref.trim() || "#",
      ...imagesToFields(fImages, fCover, fBg),
    };
    try {
      if (editing) {
        const r = await updateProject(editing.id, payload);
        if (r.success) {
          setSuccess(true);
          setList((p) => p.map((x) => x.id === editing.id ? { ...x, ...payload } : x));
          setTimeout(() => { setModalOpen(false); reset(); setDraft(null); }, 1400);
        } else setError(r.error || "Update failed.");
      } else {
        const id = fName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4);
        const num = (list.length + 1).toString().padStart(2, "0");
        const full = { id, number: num, ...payload };
        const r = await addProject(full);
        if (r.success) {
          setSuccess(true);
          setList((p) => [...p, full]);
          setTimeout(() => { setModalOpen(false); reset(); setDraft(null); }, 1400);
        } else setError(r.error || "Failed.");
      }
    } catch { setError("Unexpected error."); }
    finally { setSubmitting(false); }
  };

  // ── Reorder: move a project up/down; saves immediately ──
  const [orderMsg, setOrderMsg] = useState("");
  const [reordering, setReordering] = useState(false);
  const move = async (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= list.length || reordering) return;
    const prev = list;
    const next = [...list];
    [next[index], next[j]] = [next[j], next[index]];
    const renumbered = next.map((p, i) => ({ ...p, number: String(i + 1).padStart(2, "0") }));
    setList(renumbered);
    setReordering(true);
    setOrderMsg("Saving order…");
    const r = await reorderProjects(renumbered.map((p) => p.id)).catch(() => ({ success: false, error: "Network error." }));
    setReordering(false);
    if (r.success) setOrderMsg("✓ Order saved. The website shows the new order.");
    else { setList(prev); setOrderMsg(`✗ ${r.error || "Could not save the order."}`); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const r = await deleteProject(toDelete.id);
      if (r.success) {
        setList((p) => p.filter((x) => x.id !== toDelete.id).map((x, i) => ({ ...x, number: String(i + 1).padStart(2, "0") })));
        setToDelete(null);
      }
      else alert(r.error || "Delete failed.");
    } catch { alert("Unexpected error."); }
    finally { setDeleting(false); }
  };

  const inputCls = "w-full bg-black/40 border border-white/8 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#6B21D9]/60 focus:ring-1 focus:ring-[#6B21D9]/20 transition-colors";
  const labelCls = "block text-xs font-semibold tracking-wide text-white/60 mb-1.5";

  return (
    <>
      <style>{`@keyframes shimmer { to { transform: translateX(200%); } }`}</style>
      <div className="text-white">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white font-kyiv">Works</h1>
            <p className="text-xs text-white/30 mt-0.5">{list.length} project{list.length !== 1 ? "s" : ""} live · use ↑ ↓ on a card to change the order on the website</p>
            {orderMsg && <p role="status" className={`text-xs mt-1 ${orderMsg.startsWith("✗") ? "text-red-400" : orderMsg.startsWith("✓") ? "text-emerald-400" : "text-white/50"}`}>{orderMsg}</p>}
          </div>
          <button
            onClick={() => { if (editing !== null) reset(); if (!fYear) setFYear(String(new Date().getFullYear())); setModalOpen(true); }}
            className="flex items-center gap-2 bg-[#6B21D9] hover:bg-[#7c3aed] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#6B21D9]/20"
          >
            + Upload Project
          </button>
        </header>

        {/* Grid */}
        {list.length === 0 && !draft ? (
          <div className="bg-[#161616] border border-white/6 rounded-2xl">
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center text-white/15">
                <HugeiconsIcon icon={Briefcase02Icon} size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white/40 mb-1">No projects yet</h3>
                <p className="text-xs text-white/20 max-w-[240px] leading-relaxed">Upload your first case study using the button above.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {draft && <DraftProjectCard draft={draft} onEdit={openDraft} onPublish={publishDraft} onDiscard={discardDraft} busy={submitting} />}
            {list.map((p, index) => (
              <article key={p.id} className="bg-[#161616] border border-white/6 rounded-2xl overflow-hidden flex flex-col hover:border-white/10 transition-colors group">
                {/* Cover */}
                <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden border-b border-white/5">
                  {p.coverImage ? (
                    <img src={p.coverImage} alt={p.clientName} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/8">
                      <HugeiconsIcon icon={Briefcase02Icon} size={32} strokeWidth={1.5} />
                    </div>
                  )}
                  <span className="absolute top-2.5 left-2.5 bg-black/80 text-white font-mono text-[10px] font-bold h-5 px-2 rounded-full flex items-center border border-white/5">{p.number}</span>
                </div>
                {/* Meta */}
                <div className="p-4 flex-grow flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-bold text-white truncate min-w-0">{p.clientName}</span>
                    <span className="text-[10px] font-mono text-white/25 flex-shrink-0">{p.year}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#6B21D9] uppercase tracking-wider">{p.role}</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {p.services.slice(0, 3).map((s, i) => (
                      <span key={i} className="text-[9px] font-mono text-white/30 bg-white/4 border border-white/4 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                  <p className="text-[11px] text-white/35 line-clamp-2 leading-relaxed mt-auto pt-2 border-t border-white/4">{p.description}</p>
                </div>
                {/* Actions */}
                <div className="px-4 pb-4 flex gap-2">
                  <button onClick={() => move(index, -1)} disabled={index === 0 || reordering} aria-label={`Move ${p.clientName} up`} title="Move up (earlier on the website)" className="px-2.5 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-[12px] font-bold text-white/70 hover:text-white rounded-xl transition-colors disabled:opacity-25 disabled:cursor-not-allowed">↑</button>
                  <button onClick={() => move(index, 1)} disabled={index === list.length - 1 || reordering} aria-label={`Move ${p.clientName} down`} title="Move down (later on the website)" className="px-2.5 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-[12px] font-bold text-white/70 hover:text-white rounded-xl transition-colors disabled:opacity-25 disabled:cursor-not-allowed">↓</button>
                  <button onClick={() => openEdit(p)} className="flex-grow py-2 bg-white/5 hover:bg-white/8 border border-white/5 text-[11px] font-semibold text-white/70 hover:text-white rounded-xl transition-colors">Edit</button>
                  <button onClick={() => setToDelete(p)} aria-label={`Delete ${p.clientName}`} title="Delete" className="p-2 bg-red-950/15 hover:bg-red-950/30 border border-red-900/10 hover:border-red-900/25 text-red-500 hover:text-red-400 rounded-xl transition-colors">
                    <HugeiconsIcon icon={Delete01Icon} size={13} strokeWidth={2} />
                  </button>
{projectLink(p.href) && (
                  <a href={projectLink(p.href)!} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/8 border border-white/5 text-white/30 hover:text-white rounded-xl transition-colors">
                    <HugeiconsIcon icon={Link01Icon} size={13} strokeWidth={2} />
                  </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ── Project Modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit: ${editing.clientName}` : "Upload New Project"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="project-client-name" className={labelCls}>Project / client name *</label><input id="project-client-name" className={inputCls} value={fName} onChange={(e) => setFName(e.target.value)} placeholder="e.g. Stance" /></div>
            <div><label htmlFor="project-year" className={labelCls}>Year *</label><input id="project-year" className={inputCls} value={fYear} onChange={(e) => setFYear(e.target.value)} placeholder="2026" inputMode="numeric" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="project-role" className={labelCls}>Your role *</label><input id="project-role" className={inputCls} value={fRole} onChange={(e) => setFRole(e.target.value)} placeholder="Brand Designer" /></div>
            <div><label htmlFor="project-services" className={labelCls}>Services</label><input id="project-services" className={inputCls} value={fServices} onChange={(e) => setFServices(e.target.value)} placeholder="Branding, Logo Design" /></div>
          </div>
          <div><label htmlFor="project-description" className={labelCls}>Short description * <span className="font-normal text-white/35">— shows on the project card</span></label><textarea id="project-description" className={`${inputCls} h-20 resize-none`} value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="One or two sentences about the project…" /></div>

          <ProjectImages
            images={fImages}
            cover={fCover}
            background={fBg}
            onChange={({ images, cover, background }) => { setFImages(images); setFCover(cover); setFBg(background); }}
          />

          <details className="group border-t border-white/5 pt-3">
            <summary className="cursor-pointer text-xs font-semibold text-white/50 hover:text-white select-none">More options (optional)</summary>
            <div className="flex flex-col gap-3 mt-3">
              <div><label htmlFor="project-tagline" className={labelCls}>Gallery text <span className="font-normal text-white/35">— shown when visitors open the project. Uses the short description if empty.</span></label><textarea id="project-tagline" className={`${inputCls} h-20 resize-none`} value={fTagline} onChange={(e) => setFTagline(e.target.value)} placeholder="Tell the longer story…" /></div>
              <div><label htmlFor="project-link" className={labelCls}>Project link <span className="font-normal text-white/35">— e.g. the live website</span></label><input id="project-link" className={inputCls} value={fHref} onChange={(e) => setFHref(e.target.value)} placeholder="https://…" /></div>
            </div>
          </details>

          {error && <p className="text-red-400 text-xs px-3 py-2 bg-red-950/20 border border-red-900/20 rounded-lg">{error}</p>}
          {success && <p className="text-emerald-400 text-xs px-3 py-2 bg-emerald-950/20 border border-emerald-900/20 rounded-lg">✓ {editing ? "Updated!" : "Uploaded!"}</p>}

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-white/45 hover:text-white transition-colors" disabled={submitting}>Cancel</button>
            <div className="flex gap-3">
              {!editing && (
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/8 border border-white/5 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Save Draft
                </button>
              )}
              <button type="submit" disabled={submitting} className="bg-[#6B21D9] hover:bg-[#7c3aed] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">
                {submitting ? "Saving…" : editing ? "Save Changes" : "Upload Project"}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── Confirm Delete ── */}
      <ConfirmDelete
        open={!!toDelete}
        name={toDelete?.clientName ?? ""}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        busy={deleting}
      />
    </>
  );
}
