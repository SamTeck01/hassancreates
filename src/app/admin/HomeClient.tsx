"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { GlobeIcon } from "@hugeicons/core-free-icons";

interface Visitor {
  id: number;
  ip_hash: string;
  country: string | null;
  city: string | null;
  visited_at: Date | string;
}

function formatDate(dateInput: Date | string) {
  const date = new Date(dateInput);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  let h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  const t = `${h}:${m}${ampm}`;
  if (d.getTime() === today.getTime()) return `Today, ${t}`;
  if (d.getTime() === yesterday.getTime()) return `Yesterday, ${t}`;
  return `${date.toLocaleDateString("en-US", { month: "short" })} ${date.getDate()}, ${t}`;
}

export default function HomeClient({ visitors }: { visitors: Visitor[] }) {
  const uniqueCountries = new Set(visitors.map((v) => v.country).filter(Boolean)).size;

  return (
    <div className="text-white">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-[#161616] border border-white/6 rounded-2xl p-5 flex flex-col gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 flex items-center gap-1.5">
            <HugeiconsIcon icon={GlobeIcon} size={11} strokeWidth={2} /> Total Visitors
          </span>
          <span className="text-4xl font-black font-mono text-white leading-none">{visitors.length}</span>
          <span className="text-[10px] text-white/20">unique records</span>
        </div>
        <div className="bg-[#161616] border border-white/6 rounded-2xl p-5 flex flex-col gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Countries</span>
          <span className="text-4xl font-black font-mono text-white leading-none">{uniqueCountries}</span>
          <span className="text-[10px] text-white/20">represented</span>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-[#161616] border border-white/6 rounded-2xl p-5 flex flex-col gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Today</span>
          <span className="text-4xl font-black font-mono text-white leading-none">
            {visitors.filter((v) => {
              const d = new Date(v.visited_at);
              const now = new Date();
              return d.toDateString() === now.toDateString();
            }).length}
          </span>
          <span className="text-[10px] text-white/20">visits today</span>
        </div>
      </div>

      {/* Visitor log table */}
      <div className="bg-[#161616] border border-white/6 rounded-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Visitor Log</h2>
            <p className="text-[11px] text-white/30 mt-0.5">Latest unique visits</p>
          </div>
          <span className="text-[10px] font-mono text-white/20 bg-white/4 border border-white/5 px-2 py-1 rounded-lg">
            {visitors.length} total
          </span>
        </div>

        {visitors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center text-white/15">
              <HugeiconsIcon icon={GlobeIcon} size={22} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-bold text-white/40">No visitors yet</p>
            <p className="text-xs text-white/20 max-w-[240px] leading-relaxed">
              Visitor data will appear here once people browse your portfolio.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[380px]">
              <thead>
                <tr className="border-b border-white/4">
                  <th className="py-3 px-5 text-left text-[10px] font-bold uppercase tracking-widest text-white/20">#</th>
                  <th className="py-3 px-5 text-left text-[10px] font-bold uppercase tracking-widest text-white/20">Country</th>
                  <th className="py-3 px-5 text-left text-[10px] font-bold uppercase tracking-widest text-white/20">City</th>
                  <th className="py-3 px-5 text-left text-[10px] font-bold uppercase tracking-widest text-white/20">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.035]">
                {visitors.map((v, idx) => (
                  <tr key={v.id} className="hover:bg-white/[0.018] transition-colors">
                    <td className="py-3.5 px-5 text-[11px] font-mono text-white/20">{idx + 1}</td>
                    <td className="py-3.5 px-5 text-[13px] text-white font-medium">{v.country || "—"}</td>
                    <td className="py-3.5 px-5 text-[13px] text-white/45">{v.city || "—"}</td>
                    <td className="py-3.5 px-5 text-[11px] text-white/30 font-mono whitespace-nowrap">{formatDate(v.visited_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
