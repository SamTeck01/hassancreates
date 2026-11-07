"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { importBehanceProject } from "@/app/actions/projects";
import type { BehanceProject } from "@/lib/behanceBookmarklet";

type Row = BehanceProject & { include: boolean; role: string; status?: string; ok?: boolean };

function readHash(): BehanceProject[] | null {
  if (typeof window === "undefined" || window.location.hash.length < 3) return null;
  try {
    const data = JSON.parse(decodeURIComponent(window.location.hash.slice(1)));
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export default function ImportClient({ bookmarklet }: { bookmarklet: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const data = readHash();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL fragment only exists in the browser
    if (data) setRows(data.map((p) => ({ ...p, include: true, role: "Designer" })));
  }, []);

  const update = (i: number, patch: Partial<Row>) => setRows((r) => r && r.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const runImport = async () => {
    if (!rows) return;
    setBusy(true);
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.include || r.ok) continue;
      update(i, { status: `Copying ${r.images.length} image(s)…` });
      const res = await importBehanceProject({ url: r.url, title: r.title, description: r.description, year: r.year, role: r.role, images: r.images })
        .catch(() => ({ success: false, error: "Network error." }) as { success: false; error: string });
      update(i, res.success
        ? { ok: true, status: `✓ Imported${"failedImages" in res && res.failedImages ? ` (${res.failedImages} image(s) couldn't be copied)` : ""}` }
        : { ok: false, status: `✗ ${res.error}` });
    }
    setBusy(false);
    history.replaceState(null, "", window.location.pathname); // don't re-import on refresh
  };

  const copyCode = async () => {
    try { await navigator.clipboard.writeText(bookmarklet); setCopied(true); } catch { setCopied(false); }
  };

  const chosen = rows?.filter((r) => r.include && !r.ok).length ?? 0;
  const done = rows?.filter((r) => r.ok).length ?? 0;

  return (
    <div className="text-white max-w-3xl">
      <header className="mb-6">
        <Link href="/admin/works" className="text-xs text-white/40 hover:text-white">← Back to Works</Link>
        <h1 className="text-xl font-black tracking-tight font-kyiv mt-2">Import from Behance</h1>
      </header>

      {!rows ? (
        <section className="bg-[#161616] border border-white/6 rounded-2xl p-5 flex flex-col gap-4 text-sm text-white/75 leading-relaxed">
          <p>Add a one-tap <b className="text-white">&ldquo;Import to HassanCreates&rdquo;</b> bookmark to your browser (one-time setup), then tap it on your Behance page.</p>
          <ol className="list-decimal pl-5 flex flex-col gap-2">
            <li>
              <b className="text-white">Copy the bookmark code:</b>{" "}
              <button type="button" onClick={copyCode} className="ml-1 px-3 py-1.5 rounded-lg bg-[#6B21D9] text-white text-xs font-bold">
                {copied ? "✓ Copied" : "Copy code"}
              </button>
              <span className="block text-xs text-white/40 mt-1">On a computer you can instead drag this to your bookmarks bar: <a href={bookmarklet} className="underline text-[#a78bfa]" onClick={(e) => e.preventDefault()}>Import to HassanCreates</a></span>
            </li>
            <li><b className="text-white">Make the bookmark:</b> bookmark any page, then edit that bookmark — name it <b className="text-white">Import HC</b> and replace its address with the copied code.</li>
            <li><b className="text-white">Open your Behance profile</b> (behance.net/hassanokesanjo1) in the same browser and scroll to the bottom so all projects load.</li>
            <li><b className="text-white">Tap the bookmark:</b> type <b className="text-white">Import HC</b> in the address bar and tap the bookmark suggestion (on a computer, just click it). It reads your projects and brings you back here.</li>
          </ol>
          <p className="text-xs text-white/40">Tip: on a single Behance project page, the bookmark imports just that project.</p>
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <p className="text-sm text-white/60">
            Found <b className="text-white">{rows.length}</b> project{rows.length === 1 ? "" : "s"}. Untick any you don&apos;t want, check the names, then import.
            Images are copied to your Cloudinary. New projects go to the end of your Works — reorder them with ↑ ↓.
          </p>
          <ul className="flex flex-col gap-3">
            {rows.map((r, i) => (
              <li key={r.url + i} data-testid="import-row" className={`bg-[#161616] border rounded-2xl p-4 flex flex-col gap-3 ${r.ok ? "border-emerald-700/50" : "border-white/6"}`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={r.include} disabled={r.ok || busy} onChange={(e) => update(i, { include: e.target.checked })} aria-label={`Import ${r.title}`} className="mt-2 h-4 w-4 accent-[#6B21D9]" />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input value={r.title} onChange={(e) => update(i, { title: e.target.value })} disabled={r.ok || busy} aria-label="Project name" className="sm:col-span-2 bg-black/40 border border-white/8 rounded-lg px-3 py-2 text-sm" />
                    <input value={r.year} onChange={(e) => update(i, { year: e.target.value })} disabled={r.ok || busy} aria-label="Year" placeholder="Year" className="bg-black/40 border border-white/8 rounded-lg px-3 py-2 text-sm" />
                    <input value={r.role} onChange={(e) => update(i, { role: e.target.value })} disabled={r.ok || busy} aria-label="Your role" placeholder="Your role" className="sm:col-span-3 bg-black/40 border border-white/8 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {r.images.map((src, k) => (
                    <img key={src} src={src} alt={`${r.title} image ${k + 1}`} className={`h-20 w-28 flex-none object-cover rounded-lg border ${k === 0 ? "border-[#6B21D9]" : "border-white/10"}`} />
                  ))}
                </div>
                <p className="text-[11px] text-white/40">{r.images.length} image(s) · first one becomes the card image</p>
                {r.status && <p role="status" className={`text-xs ${r.ok ? "text-emerald-400" : r.status.startsWith("✗") ? "text-red-400" : "text-white/60"}`}>{r.status}</p>}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <button type="button" onClick={runImport} disabled={busy || chosen === 0} className="bg-[#6B21D9] hover:bg-[#7c3aed] text-white font-bold text-sm px-5 py-3 rounded-xl disabled:opacity-40">
              {busy ? "Importing…" : `Import ${chosen} project${chosen === 1 ? "" : "s"}`}
            </button>
            {done > 0 && !busy && <Link href="/admin/works" className="text-sm text-[#a78bfa] underline">See them in Works →</Link>}
          </div>
        </section>
      )}
    </div>
  );
}
