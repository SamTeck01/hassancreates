"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Briefcase02Icon, Delete01Icon, Link01Icon } from "@hugeicons/core-free-icons";
import { addProject, updateProject, deleteProject } from "@/app/actions/projects";

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

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg bg-white/5 relative overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

// ── Image Upload Zone ─────────────────────────────────────────────────────────
function ImageUploadZone({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) onChange(data.url);
      else alert(data.error || "Upload failed.");
    } catch { alert("Upload error."); }
    finally { setUploading(false); }
  };

  const labelCls = "text-[10px] uppercase font-bold tracking-widest text-white/35 mb-1.5 block";

  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelCls}>{label}{required && " *"}</label>
      <div
        onDragEnter={handleDrag} onDragOver={handleDrag}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]); }}
        className={`relative h-24 border border-dashed rounded-xl flex flex-col items-center justify-center gap-1 p-3 transition-colors overflow-hidden ${
          dragActive ? "border-[#6B21D9] bg-[#6B21D9]/5" : "border-white/10 bg-black/20 hover:border-white/20"
        }`}
      >
        {value ? (
          <>
            <div className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url('${value.replace(/'/g, "%27")}')` }} />
            <div className="relative z-10 flex flex-col items-center gap-1 bg-black/70 px-3 py-1.5 rounded-lg border border-white/5 max-w-[90%]">
              <span className="text-[10px] text-white font-mono truncate max-w-full">{value.split("/").pop()?.slice(0, 36)}</span>
              <button type="button" onClick={() => onChange("")} className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase">Remove</button>
            </div>
          </>
        ) : uploading ? (
          <div className="flex flex-col items-center gap-1.5">
            <span className="h-4 w-4 rounded-full border-2 border-white/10 border-t-[#6B21D9] animate-spin" />
            <span className="text-[10px] text-white/40">Uploading…</span>
          </div>
        ) : (
          <>
            <span className="text-[11px] text-white/50 text-center">
              Drop or{" "}
              <label className="text-[#6B21D9] cursor-pointer hover:underline">
                browse
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} className="hidden" />
              </label>
            </span>
            <span className="text-[9px] text-white/25 font-mono">PNG, JPG, WEBP · max 10MB</span>
          </>
        )}
      </div>
    </div>
  );
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
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    // Overlay: fixed + overflow-hidden so page NEVER scrolls
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-hidden flex items-center justify-center p-4 sm:p-8"
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
    <div onClick={onCancel} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-hidden">
      <div onClick={(e) => e.stopPropagation()} className="bg-[#161616] border border-white/8 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
        <div className="w-10 h-10 rounded-full bg-red-950/25 border border-red-900/30 text-red-400 flex items-center justify-center mx-auto mb-4">
          <HugeiconsIcon icon={Delete01Icon} size={16} strokeWidth={2} />
        </div>
        <h3 className="text-sm font-bold text-white mb-2">Confirm Delete</h3>
        <p className="text-xs text-white/45 mb-6 leading-relaxed">
          Remove <strong className="text-white">{name}</strong>? This can't be undone.
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
  const [fSwiper, setFSwiper] = useState<string[]>([]);
  const [fCaptions, setFCaptions] = useState<string[]>([]);

  const reset = () => {
    setFName(""); setFYear(""); setFRole(""); setFServices("");
    setFDesc(""); setFTagline(""); setFHref(""); setFCover(""); setFBg("");
    setFSwiper([]); setFCaptions([]);
    setError(""); setSuccess(false); setEditing(null);
  };

  const openEdit = (p: Project) => {
    reset();
    setEditing(p);
    setFName(p.clientName); setFYear(p.year); setFRole(p.role);
    setFServices(p.services.join(", ")); setFDesc(p.description || "");
    setFTagline(p.tagline || ""); setFHref(p.href);
    setFCover(p.coverImage); setFBg(p.bgImage || "");
    setFSwiper(p.swiperImages || []); setFCaptions(p.imageCaptions || []);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName || !fYear || !fRole || !fDesc || !fCover || !fTagline || !fHref) {
      setError("Please fill in all required (*) fields."); return;
    }
    setSubmitting(true); setError("");
    const payload = {
      clientName: fName, year: fYear, role: fRole,
      services: fServices.split(",").map((s) => s.trim()).filter(Boolean),
      description: fDesc, tagline: fTagline, href: fHref,
      coverImage: fCover, coverSrcSet: `${fCover} 1024w`,
      bgImage: fBg || fCover, bgSrcSet: `${fBg || fCover} 2048w`,
      swiperImages: fSwiper.length ? fSwiper : [fCover],
      imageCaptions: fCaptions.length ? fCaptions : ["Project showcase."],
    };
    try {
      if (editing) {
        const r = await updateProject(editing.id, payload);
        if (r.success) {
          setSuccess(true);
          setList((p) => p.map((x) => x.id === editing.id ? { ...x, ...payload } : x));
          setTimeout(() => { setModalOpen(false); reset(); }, 1400);
        } else setError(r.error || "Update failed.");
      } else {
        const id = fName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4);
        const num = (list.length + 1).toString().padStart(2, "0");
        const full = { id, number: num, ...payload };
        const r = await addProject(full);
        if (r.success) {
          setSuccess(true);
          setList((p) => [...p, full]);
          setTimeout(() => { setModalOpen(false); reset(); }, 1400);
        } else setError(r.error || "Failed.");
      }
    } catch { setError("Unexpected error."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const r = await deleteProject(toDelete.id);
      if (r.success) { setList((p) => p.filter((x) => x.id !== toDelete.id)); setToDelete(null); }
      else alert(r.error || "Delete failed.");
    } catch { alert("Unexpected error."); }
    finally { setDeleting(false); }
  };

  const inputCls = "w-full bg-black/40 border border-white/6 rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-[#6B21D9]/60 focus:ring-1 focus:ring-[#6B21D9]/20 transition-colors";
  const labelCls = "block text-[10px] uppercase font-bold tracking-widest text-white/35 mb-1.5";

  return (
    <>
      <style>{`@keyframes shimmer { to { transform: translateX(200%); } }`}</style>
      <div className="text-white">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white font-kyiv">Works</h1>
            <p className="text-xs text-white/30 mt-0.5">{list.length} project{list.length !== 1 ? "s" : ""} live</p>
          </div>
          <button
            onClick={() => { reset(); setModalOpen(true); }}
            className="flex items-center gap-2 bg-[#6B21D9] hover:bg-[#7c3aed] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#6B21D9]/20"
          >
            + Upload Project
          </button>
        </header>

        {/* Grid */}
        {list.length === 0 ? (
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
            {list.map((p) => (
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
                    <span className="text-[13px] font-bold text-white truncate">{p.clientName}</span>
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
                  <button onClick={() => openEdit(p)} className="flex-grow py-2 bg-white/5 hover:bg-white/8 border border-white/5 text-[11px] font-semibold text-white/70 hover:text-white rounded-xl transition-colors">Edit</button>
                  <button onClick={() => setToDelete(p)} className="p-2 bg-red-950/15 hover:bg-red-950/30 border border-red-900/10 hover:border-red-900/25 text-red-500 hover:text-red-400 rounded-xl transition-colors">
                    <HugeiconsIcon icon={Delete01Icon} size={13} strokeWidth={2} />
                  </button>
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/8 border border-white/5 text-white/30 hover:text-white rounded-xl transition-colors">
                    <HugeiconsIcon icon={Link01Icon} size={13} strokeWidth={2} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ── Project Modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); reset(); }}
        title={editing ? `Edit: ${editing.clientName}` : "Upload New Project"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Client Name *</label><input className={inputCls} value={fName} onChange={(e) => setFName(e.target.value)} placeholder="e.g. Archin" required /></div>
            <div><label className={labelCls}>Year *</label><input className={inputCls} value={fYear} onChange={(e) => setFYear(e.target.value)} placeholder="2026" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Role *</label><input className={inputCls} value={fRole} onChange={(e) => setFRole(e.target.value)} placeholder="Lead Designer" required /></div>
            <div><label className={labelCls}>URL / Href *</label><input className={inputCls} value={fHref} onChange={(e) => setFHref(e.target.value)} placeholder="./works/archin" required /></div>
          </div>
          <div><label className={labelCls}>Services (comma-separated)</label><input className={inputCls} value={fServices} onChange={(e) => setFServices(e.target.value)} placeholder="Branding, UI/UX, Motion" /></div>
          <div><label className={labelCls}>Description *</label><textarea className={`${inputCls} h-20 resize-none`} value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="Brief project summary…" required /></div>
          <div><label className={labelCls}>Tagline *</label><textarea className={`${inputCls} h-20 resize-none`} value={fTagline} onChange={(e) => setFTagline(e.target.value)} placeholder="Expanded detail for the project view…" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <ImageUploadZone label="Cover Image *" value={fCover} onChange={setFCover} required />
            <ImageUploadZone label="Background Image" value={fBg} onChange={setFBg} />
          </div>

          {/* Slideshow images */}
          {fSwiper.length > 0 && (
            <div className="border-t border-white/5 pt-4">
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/25 mb-3">Slideshow</p>
              <div className="flex flex-col gap-2">
                {fSwiper.map((url, i) => (
                  <div key={i} className="flex gap-2 bg-black/20 border border-white/5 rounded-xl p-2.5 items-center">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/5 bg-zinc-900">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <input
                      type="text"
                      value={fCaptions[i] || ""}
                      onChange={(e) => setFCaptions((p) => p.map((c, idx) => idx === i ? e.target.value : c))}
                      placeholder="Caption…"
                      className="flex-grow bg-transparent border-b border-white/10 py-0.5 text-[11px] text-white focus:outline-none focus:border-[#6B21D9] transition-colors placeholder-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => { setFSwiper((p) => p.filter((_, j) => j !== i)); setFCaptions((p) => p.filter((_, j) => j !== i)); }}
                      className="text-red-500 hover:text-red-400 p-1 flex-shrink-0"
                    >
                      <HugeiconsIcon icon={Delete01Icon} size={11} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <ImageUploadZone
            label="Add Slideshow Image"
            value=""
            onChange={(url) => { if (url) { setFSwiper((p) => [...p, url]); setFCaptions((p) => [...p, ""]); } }}
          />

          {error && <p className="text-red-400 text-xs px-3 py-2 bg-red-950/20 border border-red-900/20 rounded-lg">{error}</p>}
          {success && <p className="text-emerald-400 text-xs px-3 py-2 bg-emerald-950/20 border border-emerald-900/20 rounded-lg">✓ {editing ? "Updated!" : "Uploaded!"}</p>}

          <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
            <button type="button" onClick={() => { setModalOpen(false); reset(); }} className="px-4 py-2 text-xs font-semibold text-white/45 hover:text-white transition-colors" disabled={submitting}>Cancel</button>
            <button type="submit" disabled={submitting} className="bg-[#6B21D9] hover:bg-[#7c3aed] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {submitting ? "Saving…" : editing ? "Save Changes" : "Upload Project"}
            </button>
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
