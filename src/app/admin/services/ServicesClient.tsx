"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Settings02Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import { addService, updateService, deleteService } from "@/app/actions/services";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Service {
  id: string;
  num: string;
  title: string;
  count: string;
  description: string;
  image1: string;
  image2: string;
}

// ── Image Upload Zone ─────────────────────────────────────────────────────────
// Single-slot zone — but accepts multiple files if the parent supplies onBulk.
// When multiple files are dropped/selected: first 2 are uploaded in parallel
// and the parent can route them to image1 / image2 automatically.
function ImageUploadZone({
  label, value, onChange, onBulk,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Called with an array of uploaded URLs when >1 file is dropped/selected */
  onBulk?: (urls: string[]) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);

  const uploadOne = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) return data.url as string;
      else { alert(data.error || "Upload failed."); return null; }
    } catch {
      alert("Upload error.");
      return null;
    }
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setUploading(true);
    setUploadProgress(files.length > 1 ? { done: 0, total: files.length } : null);

    if (files.length === 1) {
      // Single file — original behaviour
      const url = await uploadOne(files[0]);
      if (url) onChange(url);
    } else if (onBulk) {
      // Multiple files — upload in parallel
      let done = 0;
      const urls = await Promise.all(
        files.slice(0, 2).map(async (f) => {
          const url = await uploadOne(f);
          done++;
          setUploadProgress({ done, total: files.length });
          return url;
        })
      );
      onBulk(urls.filter(Boolean) as string[]);
    } else {
      // Fallback: upload only the first file
      const url = await uploadOne(files[0]);
      if (url) onChange(url);
    }

    setUploading(false);
    setUploadProgress(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-wide text-white/60 mb-1 block">{label}</span>
      <div
        onDragEnter={handleDrag} onDragOver={handleDrag}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragActive(false);
          const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
          if (files.length > 0) uploadFiles(files);
        }}
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
            {uploadProgress ? (
              <span className="text-[10px] text-white/40">
                Uploading {uploadProgress.done}/{uploadProgress.total}…
              </span>
            ) : (
              <span className="text-[10px] text-white/40">Uploading…</span>
            )}
          </div>
        ) : (
          <>
            <span className="text-[11px] text-white/50 text-center">
              Drop or{" "}
              <label className="text-[#6B21D9] cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    if (files.length > 0) uploadFiles(files);
                  }}
                  className="hidden"
                />
              </label>
            </span>
            <span className="text-[9px] text-white/25 font-mono">PNG, JPG, WEBP · max 10MB · select multiple</span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Modal (scroll fixed) ──────────────────────────────────────────────────────
function Modal({
  open, onClose, title, children,
}: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");

    // Pause Lenis smooth scroll
    if (typeof window !== "undefined" && (window as any).lenis) {
      (window as any).lenis.stop();
    }

    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
      // Resume Lenis smooth scroll
      if (typeof window !== "undefined" && (window as any).lenis) {
        (window as any).lenis.start();
      }
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-hidden flex items-center justify-center p-4 sm:p-8" data-lenis-prevent>
      <div
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="bg-[#161616] border border-white/8 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col"
        style={{ maxHeight: "90dvh" }}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/6 flex-shrink-0">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain flex-grow px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Confirm Delete ─────────────────────────────────────────────────────────────
function ConfirmDelete({ open, name, onCancel, onConfirm, busy }: {
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
        <h3 className="text-sm font-bold text-white mb-2">Delete Service</h3>
        <p className="text-xs text-white/45 mb-6 leading-relaxed">Remove <strong className="text-white">{name}</strong>? This can't be undone.</p>
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
function DraftServiceCard({ draft, onEdit, onPublish, onDiscard, busy }: {
  draft: { sTitle: string; sCount: string; sDesc: string; sImg1: string; sImg2: string };
  onEdit: () => void; onPublish: () => void; onDiscard: () => void; busy: boolean;
}) {
  return (
    <article className="bg-[#161616] border border-dashed border-[#6B21D9]/40 rounded-2xl overflow-hidden flex flex-col">
      <div className="h-20 bg-zinc-900/50 border-b border-white/5 flex overflow-hidden relative">
        {draft.sImg1 && <div className="w-1/2 border-r border-white/5 overflow-hidden"><img src={draft.sImg1} alt="" className="w-full h-full object-cover opacity-40" /></div>}
        {draft.sImg2 && <div className="w-1/2 overflow-hidden"><img src={draft.sImg2} alt="" className="w-full h-full object-cover opacity-40" /></div>}
        {!draft.sImg1 && !draft.sImg2 && <div className="w-full h-full flex items-center justify-center text-white/8"><HugeiconsIcon icon={Settings02Icon} size={28} strokeWidth={1.5} /></div>}
        <span className="absolute top-2 left-2 bg-[#6B21D9] text-white text-[9px] font-bold h-5 px-2 rounded-full flex items-center uppercase tracking-wider">Draft</span>
      </div>
      <div className="p-4 flex-grow flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-white/60">{draft.sTitle || "Untitled Draft"}</span>
        <p className="text-[11px] text-white/30 leading-relaxed line-clamp-3">{draft.sDesc || "No description yet."}</p>
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <button onClick={onEdit} className="flex-1 py-2 bg-[#6B21D9]/10 hover:bg-[#6B21D9]/20 border border-[#6B21D9]/20 text-[11px] font-semibold text-[#a78bfa] hover:text-white rounded-xl transition-colors">Edit</button>
        <button onClick={onPublish} disabled={busy} className="flex-1 py-2 bg-[#6B21D9] hover:bg-[#7c3aed] text-[11px] font-bold text-white rounded-xl transition-colors disabled:opacity-50">Publish</button>
        <button onClick={onDiscard} className="p-2 bg-red-950/15 hover:bg-red-950/30 border border-red-900/10 hover:border-red-900/25 text-red-500 hover:text-red-400 rounded-xl transition-colors">
          <HugeiconsIcon icon={Delete01Icon} size={13} strokeWidth={2} />
        </button>
      </div>
    </article>
  );
}

// ── Services Client ───────────────────────────────────────────────────────────
export default function ServicesClient({ initialServices }: { initialServices: Service[] }) {
  const [list, setList] = useState<Service[]>(initialServices);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [toDelete, setToDelete] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [sTitle, setSTitle] = useState("");
  const [sCount, setSCount] = useState("");
  const [sDesc, setSDesc] = useState("");
  const [sImg1, setSImg1] = useState("");
  const [sImg2, setSImg2] = useState("");

  const [draft, setDraft] = useState<{ sTitle: string; sCount: string; sDesc: string; sImg1: string; sImg2: string } | null>(null);

  // Load draft card from localStorage on mount
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("hc-service-draft") : null;
    if (!raw) return;
    try {
      const d = JSON.parse(raw);
      if (d.sTitle || d.sDesc) setDraft(d);
    } catch {}
  }, []);

  const reset = () => {
    setSTitle(""); setSCount(""); setSDesc(""); setSImg1(""); setSImg2("");
    setError(""); setSuccess(false); setEditing(null);
  };

  const saveDraft = () => {
    const d = { sTitle, sCount, sDesc, sImg1, sImg2 };
    localStorage.setItem("hc-service-draft", JSON.stringify(d));
    setDraft(d);
    setModalOpen(false);
  };

  const openDraft = () => {
    if (!draft) return;
    setSTitle(draft.sTitle); setSCount(draft.sCount); setSDesc(draft.sDesc);
    setSImg1(draft.sImg1); setSImg2(draft.sImg2);
    setEditing(null);
    setModalOpen(true);
  };

  const discardDraft = () => {
    localStorage.removeItem("hc-service-draft");
    setDraft(null);
  };

  const publishDraft = async () => {
    if (!draft || !draft.sTitle || !draft.sDesc) { alert("Draft needs at least a title and description."); return; }
    setSubmitting(true);
    try {
      const id = draft.sTitle.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4);
      const num = (list.length + 1).toString().padStart(2, "0");
      const r = await addService({ id, num, title: draft.sTitle, count: draft.sCount || "(0)", description: draft.sDesc, image1: draft.sImg1, image2: draft.sImg2 });
      if (r.success) {
        setList((p) => [...p, { id, num, title: draft.sTitle, count: draft.sCount || "(0)", description: draft.sDesc, image1: draft.sImg1, image2: draft.sImg2 }]);
        localStorage.removeItem("hc-service-draft"); setDraft(null);
      } else alert(r.error || "Publish failed.");
    } catch { alert("Unexpected error."); }
    finally { setSubmitting(false); }
  };

  const openEdit = (s: Service) => {
    reset();
    setEditing(s);
    setSTitle(s.title); setSCount(s.count); setSDesc(s.description);
    setSImg1(s.image1); setSImg2(s.image2);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sTitle || !sDesc) { setError("Title and description are required."); return; }
    setSubmitting(true); setError("");
    try {
      if (editing) {
        const r = await updateService(editing.id, { title: sTitle, count: sCount || "(0)", description: sDesc, image1: sImg1, image2: sImg2 });
        if (r.success) {
          setSuccess(true);
          setList((p) => p.map((x) => x.id === editing.id ? { ...x, title: sTitle, count: sCount, description: sDesc, image1: sImg1, image2: sImg2 } : x));
          setTimeout(() => { setModalOpen(false); reset(); localStorage.removeItem("hc-service-draft"); setDraft(null); }, 1400);
        } else setError(r.error || "Update failed.");
      } else {
        const id = sTitle.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4);
        const num = (list.length + 1).toString().padStart(2, "0");
        const r = await addService({ id, num, title: sTitle, count: sCount || "(0)", description: sDesc, image1: sImg1, image2: sImg2 });
        if (r.success) {
          setSuccess(true);
          setList((p) => [...p, { id, num, title: sTitle, count: sCount || "(0)", description: sDesc, image1: sImg1, image2: sImg2 }]);
          setTimeout(() => { setModalOpen(false); reset(); localStorage.removeItem("hc-service-draft"); setDraft(null); }, 1400);
        } else setError(r.error || "Failed.");
      }
    } catch { setError("Unexpected error."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const r = await deleteService(toDelete.id);
      if (r.success) { setList((p) => p.filter((x) => x.id !== toDelete.id)); setToDelete(null); }
      else alert(r.error || "Delete failed.");
    } catch { alert("Unexpected error."); }
    finally { setDeleting(false); }
  };

  const inputCls = "w-full bg-black/40 border border-white/8 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#6B21D9]/60 focus:ring-1 focus:ring-[#6B21D9]/20 transition-colors";
  const labelCls = "block text-xs font-semibold tracking-wide text-white/60 mb-1.5";

  return (
    <>
      <div className="text-white">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white font-kyiv">Services</h1>
            <p className="text-xs text-white/30 mt-0.5">{list.length} offering{list.length !== 1 ? "s" : ""} live</p>
          </div>
          <button
            onClick={() => { if (editing !== null) reset(); setModalOpen(true); }}
            className="flex items-center gap-2 bg-[#6B21D9] hover:bg-[#7c3aed] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#6B21D9]/20"
          >
            + Add Service
          </button>
        </header>

        {/* Grid */}
        {list.length === 0 && !draft ? (
          <div className="bg-[#161616] border border-white/6 rounded-2xl">
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center text-white/15">
                <HugeiconsIcon icon={Settings02Icon} size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white/40 mb-1">No services yet</h3>
                <p className="text-xs text-white/20 max-w-[240px] leading-relaxed">Add your first service offering using the button above.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {draft && <DraftServiceCard draft={draft} onEdit={openDraft} onPublish={publishDraft} onDiscard={discardDraft} busy={submitting} />}
            {list.map((s) => (
              <article key={s.id} className="bg-[#161616] border border-white/6 rounded-2xl overflow-hidden flex flex-col hover:border-white/10 transition-colors">
                {/* Dual preview */}
                <div className="h-20 bg-zinc-900 border-b border-white/5 flex overflow-hidden relative">
                  {s.image1 && <div className="w-1/2 border-r border-white/5 overflow-hidden"><img src={s.image1} alt="" className="w-full h-full object-cover opacity-70" /></div>}
                  {s.image2 && <div className="w-1/2 overflow-hidden"><img src={s.image2} alt="" className="w-full h-full object-cover opacity-70" /></div>}
                  {!s.image1 && !s.image2 && <div className="w-full h-full flex items-center justify-center text-white/8"><HugeiconsIcon icon={Settings02Icon} size={28} strokeWidth={1.5} /></div>}
                  <span className="absolute top-2 left-2 bg-black/80 text-white font-mono text-[9px] font-bold h-5 px-2 rounded-full flex items-center border border-white/5">{s.num}</span>
                  <span className="absolute top-2 right-2 bg-black/70 text-white/35 text-[9px] font-mono h-5 px-2 rounded-full flex items-center border border-white/4">{s.count}</span>
                </div>
                <div className="p-4 flex-grow flex flex-col gap-1.5">
                  <span className="text-[13px] font-bold text-white">{s.title}</span>
                  <p className="text-[11px] text-white/35 leading-relaxed line-clamp-3">{s.description}</p>
                </div>
                <div className="px-4 pb-4 flex gap-2">
                  <button onClick={() => openEdit(s)} className="flex-grow py-2 bg-white/5 hover:bg-white/8 border border-white/5 text-[11px] font-semibold text-white/70 hover:text-white rounded-xl transition-colors">Edit</button>
                  <button onClick={() => setToDelete(s)} className="p-2 bg-red-950/15 hover:bg-red-950/30 border border-red-900/10 hover:border-red-900/25 text-red-500 hover:text-red-400 rounded-xl transition-colors">
                    <HugeiconsIcon icon={Delete01Icon} size={13} strokeWidth={2} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ── Service Modal ── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit: ${editing.title}` : "Add New Service"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><label className={labelCls}>Title *</label><input className={inputCls} value={sTitle} onChange={(e) => setSTitle(e.target.value)} placeholder="UI/UX Design" required /></div>
            <div><label className={labelCls}>Count</label><input className={inputCls} value={sCount} onChange={(e) => setSCount(e.target.value)} placeholder="(4)" /></div>
          </div>
          <div><label className={labelCls}>Description *</label><textarea className={`${inputCls} h-28 resize-none`} value={sDesc} onChange={(e) => setSDesc(e.target.value)} placeholder="What does this service include?" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <ImageUploadZone
              label="Preview Image 1"
              value={sImg1}
              onChange={setSImg1}
              onBulk={(urls) => {
                if (urls[0]) setSImg1(urls[0]);
                if (urls[1]) setSImg2(urls[1]);
              }}
            />
            <ImageUploadZone
              label="Preview Image 2"
              value={sImg2}
              onChange={setSImg2}
              onBulk={(urls) => {
                if (urls[0]) setSImg2(urls[0]);
                if (urls[1]) setSImg1(urls[1]);
              }}
            />
          </div>

          {error && <p className="text-red-400 text-xs px-3 py-2 bg-red-950/20 border border-red-900/20 rounded-lg">{error}</p>}
          {success && <p className="text-emerald-400 text-xs px-3 py-2 bg-emerald-950/20 border border-emerald-900/20 rounded-lg">✓ {editing ? "Service updated!" : "Service added!"}</p>}

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
                {submitting ? "Saving…" : editing ? "Save Changes" : "Add Service"}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDelete open={!!toDelete} name={toDelete?.title ?? ""} onCancel={() => setToDelete(null)} onConfirm={handleDelete} busy={deleting} />
    </>
  );
}
