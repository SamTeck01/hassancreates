"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { GlobeIcon, Message01Icon, Mail01Icon, UserIcon, Tick01Icon, Delete01Icon } from "@hugeicons/core-free-icons";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Visitor {
  id: number;
  ip_hash: string;
  country: string | null;
  city: string | null;
  visited_at: Date | string;
}

const MOCK_MESSAGES = [
  {
    id: 1,
    name: "Elena Rostova",
    email: "elena@rostova.design",
    subject: "Branding Collaboration Request",
    message: "Hi Hassan! I followed your work on Archin, and the geometric layout was incredibly inspiring. I'd love to discuss a potential partnership on a new branding project for a high-end architectural firm in Stockholm.",
    receivedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
  },
  {
    id: 2,
    name: "Marcus Sterling",
    email: "m.sterling@capital-tech.com",
    subject: "Freelance UI Development (Next.js)",
    message: "Hey Hassan, We are seeking a freelance front-end developer/designer to support the revamp of our SaaS landing page. It needs the kind of micro-interactions and smooth scroll performance you've showcased. Do you have availability for a 3-month contract starting next month?",
    receivedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    read: false,
  },
  {
    id: 3,
    name: "Liam O'Connor",
    email: "liam@oconnor-group.ie",
    subject: "Service Inquiry — Webflow Redesign",
    message: "Hello, we are looking to migrate our marketing site from WordPress to Webflow or Next.js. We need a high-performance, beautifully interactive digital storefront. Please send your rates and package options.",
    receivedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    read: true,
  },
];

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
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [selected, setSelected] = useState<typeof MOCK_MESSAGES[0] | null>(null);
  const unread = messages.filter((m) => !m.read).length;

  const open = (msg: typeof MOCK_MESSAGES[0]) => {
    setSelected(msg);
    if (!msg.read) setMessages((p) => p.map((m) => m.id === msg.id ? { ...m, read: true } : m));
  };

  const del = (id: number) => {
    setMessages((p) => p.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="text-white">

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-[#161616] border border-white/6 rounded-2xl p-5 flex flex-col gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 flex items-center gap-1.5">
            <HugeiconsIcon icon={GlobeIcon} size={11} strokeWidth={2} /> Visitors
          </span>
          <span className="text-4xl font-black font-mono text-white leading-none">{visitors.length}</span>
          <span className="text-[10px] text-white/20">unique records</span>
        </div>
        <div className="bg-[#161616] border border-white/6 rounded-2xl p-5 flex flex-col gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 flex items-center gap-1.5">
            <HugeiconsIcon icon={Message01Icon} size={11} strokeWidth={2} /> Inbox
          </span>
          <span className="text-4xl font-black font-mono text-white leading-none">{messages.length}</span>
          <span className="text-[10px] text-white/20">{unread} unread</span>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-[#161616] border border-white/6 rounded-2xl p-5 flex flex-col gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Countries</span>
          <span className="text-4xl font-black font-mono text-white leading-none">
            {new Set(visitors.map((v) => v.country).filter(Boolean)).size}
          </span>
          <span className="text-[10px] text-white/20">represented</span>
        </div>
      </div>

      {/* ── Main content: visitors table + inbox ── */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5">

        {/* Visitors table */}
        <div className="lg:col-span-7 bg-[#161616] border border-white/6 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Visitor Log</h2>
              <p className="text-[11px] text-white/30 mt-0.5">Latest unique visits</p>
            </div>
            <span className="text-[10px] font-mono text-white/20 bg-white/4 border border-white/5 px-2 py-1 rounded-lg">{visitors.length} total</span>
          </div>
          <div className="overflow-y-auto max-h-[440px] sm:max-h-[520px]">
            {visitors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center text-white/15">
                  <HugeiconsIcon icon={GlobeIcon} size={22} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-bold text-white/40">No visitors yet</p>
                <p className="text-xs text-white/20 max-w-[240px] leading-relaxed">Visitor data will appear here once people browse your portfolio.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[340px]">
                  <thead>
                    <tr className="border-b border-white/4">
                      <th className="py-3 px-5 text-left text-[10px] font-bold uppercase tracking-widest text-white/20">Country</th>
                      <th className="py-3 px-5 text-left text-[10px] font-bold uppercase tracking-widest text-white/20">City</th>
                      <th className="py-3 px-5 text-left text-[10px] font-bold uppercase tracking-widest text-white/20">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.035]">
                    {visitors.map((v) => (
                      <tr key={v.id} className="hover:bg-white/[0.018] transition-colors">
                        <td className="py-3.5 px-5 text-[13px] text-white font-medium">{v.country || "—"}</td>
                        <td className="py-3.5 px-5 text-[13px] text-white/45">{v.city || "—"}</td>
                        <td className="py-3.5 px-5 text-[11px] text-white/30 font-mono">{formatDate(v.visited_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Inbox */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="bg-[#161616] border border-white/6 rounded-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  Client Inbox
                  {unread > 0 && <span className="bg-[#6B21D9] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unread}</span>}
                </h2>
                <p className="text-[11px] text-white/30 mt-0.5">Portfolio inquiries</p>
              </div>
            </div>

            {/* Message list */}
            <div className="overflow-y-auto max-h-[260px] p-3 space-y-2">
              {messages.length === 0 ? (
                <div className="py-10 flex flex-col items-center gap-2 text-center">
                  <HugeiconsIcon icon={Message01Icon} size={20} strokeWidth={1.5} className="text-white/15" />
                  <p className="text-xs text-white/25">Inbox empty</p>
                </div>
              ) : (
                messages.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => open(m)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors relative ${
                      selected?.id === m.id
                        ? "bg-[#6B21D9]/10 border-[#6B21D9]/30"
                        : "bg-black/15 border-white/4 hover:border-white/8"
                    }`}
                  >
                    {!m.read && <span className="absolute top-3.5 right-3 h-1.5 w-1.5 rounded-full bg-[#6B21D9]" />}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-6 w-6 rounded-full bg-white/6 border border-white/8 flex items-center justify-center text-[10px] font-bold text-white/50 flex-shrink-0">
                        {m.name.charAt(0)}
                      </div>
                      <p className="text-[12px] font-bold text-white truncate">{m.name}</p>
                    </div>
                    <p className="text-[11px] font-semibold text-white/70 truncate mb-0.5">{m.subject}</p>
                    <p className="text-[10px] text-white/30 line-clamp-1">{m.message}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message reader */}
          {selected ? (
            <div className="bg-[#161616] border border-white/6 rounded-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 p-4 border-b border-white/5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-[#6B21D9]/10 border border-[#6B21D9]/20 flex items-center justify-center text-sm font-bold text-[#6B21D9] flex-shrink-0">
                    {selected.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-white truncate">{selected.name}</p>
                    <p className="text-[10px] text-white/35 font-mono truncate flex items-center gap-1">
                      <HugeiconsIcon icon={Mail01Icon} size={10} strokeWidth={2} className="flex-shrink-0" />
                      {selected.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setMessages((p) => p.map((m) => m.id === selected.id ? { ...m, read: !m.read } : m))}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/25 hover:text-[#6B21D9] transition-colors"
                    title="Toggle read"
                  >
                    <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => del(selected.id)}
                    className="p-1.5 rounded-lg hover:bg-red-950/20 text-white/25 hover:text-red-400 transition-colors"
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
              {/* Subject */}
              <div className="px-4 py-2.5 bg-black/15 border-b border-white/4">
                <p className="text-[12px] font-semibold text-white">{selected.subject}</p>
                <p className="text-[9px] text-white/25 font-mono mt-0.5">{new Date(selected.receivedAt).toLocaleString()}</p>
              </div>
              {/* Body */}
              <div className="p-4 max-h-[180px] overflow-y-auto overscroll-contain">
                <p className="text-[12px] text-white/60 leading-relaxed">{selected.message}</p>
              </div>
              {/* Reply */}
              <div className="px-4 pb-4">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  className="inline-flex items-center gap-1.5 bg-[#6B21D9] hover:bg-[#7c3aed] text-white font-bold text-[11px] px-3.5 py-2 rounded-xl transition-colors"
                >
                  <HugeiconsIcon icon={Mail01Icon} size={12} strokeWidth={2} />
                  Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-[#161616] border border-white/6 rounded-2xl flex items-center justify-center py-10">
              <div className="flex flex-col items-center gap-2 text-center">
                <HugeiconsIcon icon={UserIcon} size={20} strokeWidth={1.5} className="text-white/10" />
                <p className="text-[11px] text-white/20">Select a message to read</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
