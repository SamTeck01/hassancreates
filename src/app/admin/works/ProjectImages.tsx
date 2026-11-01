"use client";

import { useRef, useState } from "react";

export interface ProjectImage {
  url: string;
  caption: string;
  /** Shown in the gallery after "Click to View" */
  inGallery: boolean;
}

interface Props {
  images: ProjectImage[];
  cover: string;
  background: string;
  onChange: (next: { images: ProjectImage[]; cover: string; background: string }) => void;
}

async function uploadOne(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || "Upload failed.");
  return data.url as string;
}

/**
 * One place for all of a project's images. Upload many at once, then pick
 * which one is the card image (cover) and which is the blurred background.
 */
export default function ProjectImages({ images, cover, background, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState("");

  const emit = (nextImages: ProjectImage[], nextCover = cover, nextBg = background) => {
    const urls = nextImages.map((i) => i.url);
    // Cover/background must always point at an image that still exists
    const c = urls.includes(nextCover) ? nextCover : urls[0] ?? "";
    const b = urls.includes(nextBg) ? nextBg : c;
    onChange({ images: nextImages, cover: c, background: b });
  };

  const addFiles = async (files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    if (!imgs.length) return;
    setError("");
    setProgress({ done: 0, total: imgs.length });
    let next = images;
    const failed: string[] = [];
    for (let i = 0; i < imgs.length; i++) {
      try {
        const url = await uploadOne(imgs[i]);
        next = [...next, { url, caption: "", inGallery: true }];
        emit(next);
      } catch (e) {
        failed.push(`${imgs[i].name}: ${(e as Error).message}`);
      }
      setProgress({ done: i + 1, total: imgs.length });
    }
    setProgress(null);
    if (failed.length) setError(failed.join(" · "));
  };

  const update = (i: number, patch: Partial<ProjectImage>) =>
    emit(images.map((img, j) => (j === i ? { ...img, ...patch } : img)));
  const remove = (i: number) => emit(images.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    emit(next);
  };

  const btn = "px-2 py-1 rounded-md text-[10px] font-semibold border transition-colors";
  const on = "bg-[#6B21D9] border-[#6B21D9] text-white";
  const off = "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10";

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="block text-xs font-semibold tracking-wide text-white/80">Images *</p>
        <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">
          Add all the images for this project. Then choose the <b className="text-white/70">Card image</b> (shown on the
          project card) and the <b className="text-white/70">Background</b> (blurred behind the card). Images marked
          &ldquo;In gallery&rdquo; appear when visitors click &ldquo;Click to View&rdquo;.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(Array.from(e.dataTransfer.files)); }}
        onClick={() => !progress && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
        aria-label="Add images"
        className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer text-center transition-colors ${
          drag ? "border-[#6B21D9] bg-[#6B21D9]/10" : "border-white/10 hover:border-white/25 bg-black/20"
        }`}
      >
        {progress ? (
          <>
            <span className="h-5 w-5 rounded-full border-2 border-white/10 border-t-[#6B21D9] animate-spin" />
            <span className="text-xs text-white/60">Uploading {progress.done + 1 > progress.total ? progress.total : progress.done + 1} of {progress.total}…</span>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-white/80">+ Add images</span>
            <span className="text-[11px] text-white/40">Click to choose, or drag them here · you can pick several · max 10 MB each</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          data-testid="project-images-input"
          onChange={(e) => { addFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }}
        />
      </div>

      {error && <p className="text-red-400 text-xs px-3 py-2 bg-red-950/20 border border-red-900/20 rounded-lg">{error}</p>}

      {/* Tiles */}
      {images.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {images.map((img, i) => {
            const isCover = img.url === cover;
            const isBg = img.url === background;
            return (
              <li key={img.url + i} className={`rounded-xl overflow-hidden border bg-black/30 ${isCover ? "border-[#6B21D9]" : "border-white/8"}`} data-testid="project-image">
                <div className="relative aspect-[16/10] bg-zinc-900">
                  <img src={img.url} alt={img.caption || `Image ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 flex gap-1">
                    {isCover && <span className="bg-[#6B21D9] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">CARD IMAGE</span>}
                    {isBg && <span className="bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/20">BACKGROUND</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label={`Remove image ${i + 1}`}
                    className="absolute top-2 right-2 bg-black/80 hover:bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20"
                  >
                    Remove
                  </button>
                </div>
                <div className="p-2.5 flex flex-col gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <button type="button" className={`${btn} ${isCover ? on : off}`} aria-pressed={isCover} onClick={() => emit(images, img.url, background)}>
                      {isCover ? "✓ Card image" : "Use as card image"}
                    </button>
                    <button type="button" className={`${btn} ${isBg ? on : off}`} aria-pressed={isBg} onClick={() => emit(images, cover, img.url)}>
                      {isBg ? "✓ Background" : "Use as background"}
                    </button>
                    <button type="button" className={`${btn} ${img.inGallery ? on : off}`} aria-pressed={img.inGallery} onClick={() => update(i, { inGallery: !img.inGallery })}>
                      {img.inGallery ? "✓ In gallery" : "Not in gallery"}
                    </button>
                  </div>
                  {img.inGallery && (
                    <input
                      value={img.caption}
                      onChange={(e) => update(i, { caption: e.target.value })}
                      placeholder="Caption (optional)"
                      aria-label={`Caption for image ${i + 1}`}
                      className="w-full bg-transparent border-b border-white/10 py-1 text-[11px] text-white focus:outline-none focus:border-[#6B21D9] placeholder-white/25"
                    />
                  )}
                  <div className="flex justify-between text-[10px] text-white/40">
                    <span>Image {i + 1} of {images.length}</span>
                    <span className="flex gap-1">
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move image ${i + 1} left`} className="px-1.5 hover:text-white disabled:opacity-25">←</button>
                      <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label={`Move image ${i + 1} right`} className="px-1.5 hover:text-white disabled:opacity-25">→</button>
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
