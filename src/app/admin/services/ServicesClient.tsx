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
function ImageUploadZone({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (url: string) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase font-bold tracking-widest text-white/35">{label}</span>
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

// ── Modal (scroll fixed) ──────────────────────────────────────────────────────
function Modal({
  open, onClose, title, children,
}: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;
  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-hidden flex items-center justify-center p-4 sm:p-8">
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
    <div onClick={onCancel} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-hidden">
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

  const reset = () => {
    setSTitle(""); setSCount(""); setSDesc(""); setSImg1(""); setSImg2("");
    setError(""); setSuccess(false); setEditing(null);
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
          setTimeout(() => { setModalOpen(false); reset(); }, 1400);
        } else setError(r.error || "Update failed.");
      } else {
        const id = sTitle.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4);
        const num = (list.length + 1).toString().padStart(2, "0");
        const r = await addService({ id, num, title: sTitle, count: sCount || "(0)", description: sDesc, image1: sImg1, image2: sImg2 });
        if (r.success) {
          setSuccess(true);
          setList((p) => [...p, { id, num, title: sTitle, count: sCount || "(0)", description: sDesc, image1: sImg1, image2: sImg2 }]);
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
      const r = await deleteService(toDelete.id);
      if (r.success) { setList((p) => p.filter((x) => x.id !== toDelete.id)); setToDelete(null); }
      else alert(r.error || "Delete failed.");
    } catch { alert("Unexpected error."); }
    finally { setDeleting(false); }
  };

  const inputCls = "w-full bg-black/40 border border-white/6 rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-[#6B21D9]/60 focus:ring-1 focus:ring-[#6B21D9]/20 transition-colors";
  const labelCls = "block text-[10px] uppercase font-bold tracking-widest text-white/35 mb-1.5";

  return (
    <>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-4 text-white" style={{ cursor: "auto" }}>
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white font-kyiv">Services</h1>
            <p className="text-xs text-white/30 mt-0.5">{list.length} offering{list.length !== 1 ? "s" : ""} live</p>
          </div>
          <button
            onClick={() => { reset(); setModalOpen(true); }}
            className="flex items-center gap-2 bg-[#6B21D9] hover:bg-[#7c3aed] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#6B21D9]/20"
          >
            + Add Service
          </button>
        </header>

        {/* Grid */}
        {list.length === 0 ? (
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
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset(); }} title={editing ? `Edit: ${editing.title}` : "Add New Service"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><label className={labelCls}>Title *</label><input className={inputCls} value={sTitle} onChange={(e) => setSTitle(e.target.value)} placeholder="UI/UX Design" required /></div>
            <div><label className={labelCls}>Count</label><input className={inputCls} value={sCount} onChange={(e) => setSCount(e.target.value)} placeholder="(4)" /></div>
          </div>
          <div><label className={labelCls}>Description *</label><textarea className={`${inputCls} h-28 resize-none`} value={sDesc} onChange={(e) => setSDesc(e.target.value)} placeholder="What does this service include?" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <ImageUploadZone label="Preview Image 1" value={sImg1} onChange={setSImg1} />
            <ImageUploadZone label="Preview Image 2" value={sImg2} onChange={setSImg2} />
          </div>

          {error && <p className="text-red-400 text-xs px-3 py-2 bg-red-950/20 border border-red-900/20 rounded-lg">{error}</p>}
          {success && <p className="text-emerald-400 text-xs px-3 py-2 bg-emerald-950/20 border border-emerald-900/20 rounded-lg">✓ {editing ? "Service updated!" : "Service added!"}</p>}

          <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
            <button type="button" onClick={() => { setModalOpen(false); reset(); }} className="px-4 py-2 text-xs font-semibold text-white/45 hover:text-white transition-colors" disabled={submitting}>Cancel</button>
            <button type="submit" disabled={submitting} className="bg-[#6B21D9] hover:bg-[#7c3aed] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {submitting ? "Saving…" : editing ? "Save Changes" : "Add Service"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDelete open={!!toDelete} name={toDelete?.title ?? ""} onCancel={() => setToDelete(null)} onConfirm={handleDelete} busy={deleting} />
    </>
  );
}
