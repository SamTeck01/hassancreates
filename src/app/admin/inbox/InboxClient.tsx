"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Message01Icon, Mail01Icon, UserIcon, Tick01Icon, Delete01Icon } from "@hugeicons/core-free-icons";

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

function formatDate(dateInput: string) {
  const date = new Date(dateInput);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  let h = date.getHours();
  const mi = date.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  const t = `${h}:${mi}${ampm}`;
  if (d.getTime() === today.getTime()) return `Today, ${t}`;
  if (d.getTime() === yesterday.getTime()) return `Yesterday, ${t}`;
  return `${date.toLocaleDateString("en-US", { month: "short" })} ${date.getDate()}, ${t}`;
}

export default function InboxClient() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [selected, setSelected] = useState<typeof MOCK_MESSAGES[0] | null>(null);
  const unread = messages.filter((m) => !m.read).length;

  const openMsg = (msg: typeof MOCK_MESSAGES[0]) => {
    setSelected(msg);
    if (!msg.read) setMessages((p) => p.map((m) => m.id === msg.id ? { ...m, read: true } : m));
  };

  const delMsg = (id: number) => {
    setMessages((p) => p.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const toggleRead = (id: number) => {
    setMessages((p) => p.map((m) => m.id === id ? { ...m, read: !m.read } : m));
  };

  return (
    <div className="text-white">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-[#161616] border border-white/6 rounded-2xl p-5 flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-wide text-white/50 flex items-center gap-1.5">
            <HugeiconsIcon icon={Message01Icon} size={11} strokeWidth={2} /> Total
          </span>
          <span className="text-4xl font-black font-mono text-white leading-none">{messages.length}</span>
          <span className="text-xs text-white/40">messages</span>
        </div>
        <div className="bg-[#161616] border border-white/6 rounded-2xl p-5 flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-wide text-white/50">Unread</span>
          <span className="text-4xl font-black font-mono text-[#6B21D9] leading-none">{unread}</span>
          <span className="text-xs text-white/40">pending</span>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-[#161616] border border-white/6 rounded-2xl p-5 flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-wide text-white/50">Read</span>
          <span className="text-4xl font-black font-mono text-white leading-none">{messages.length - unread}</span>
          <span className="text-xs text-white/40">reviewed</span>
        </div>
      </div>

      {/* Two-panel layout: list + reader */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5">

        {/* Message list */}
        <div className="lg:col-span-5 bg-[#161616] border border-white/6 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Client Inbox
                {unread > 0 && (
                  <span className="bg-[#6B21D9] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {unread}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-white/30 mt-0.5">Portfolio inquiries</p>
            </div>
          </div>

          <div className="overflow-y-auto overscroll-contain flex-grow p-3 space-y-2">
            {messages.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center text-white/15">
                  <HugeiconsIcon icon={Message01Icon} size={22} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-bold text-white/40">Inbox empty</p>
                <p className="text-xs text-white/20">No messages yet.</p>
              </div>
            ) : (
              messages.map((m) => (
                <button
                  key={m.id}
                  onClick={() => openMsg(m)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-colors relative ${
                    selected?.id === m.id
                      ? "bg-[#6B21D9]/10 border-[#6B21D9]/30"
                      : "bg-black/15 border-white/4 hover:border-white/8"
                  }`}
                >
                  {!m.read && (
                    <span className="absolute top-4 right-3.5 h-1.5 w-1.5 rounded-full bg-[#6B21D9]" />
                  )}
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="h-7 w-7 rounded-full bg-white/6 border border-white/8 flex items-center justify-center text-[11px] font-bold text-white/50 flex-shrink-0">
                      {m.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{m.name}</p>
                      <p className="text-[11px] text-white/40 font-mono truncate">{formatDate(m.receivedAt)}</p>
                    </div>
                  </div>
                  <p className="text-[12px] font-semibold text-white/80 truncate mb-0.5">{m.subject}</p>
                  <p className="text-[11px] text-white/40 line-clamp-1">{m.message}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message reader */}
        <div className="lg:col-span-7">
          {selected ? (
            <div className="bg-[#161616] border border-white/6 rounded-2xl overflow-hidden flex flex-col h-full">
              {/* Reader header */}
              <div className="flex items-start justify-between gap-3 p-5 border-b border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-[#6B21D9]/10 border border-[#6B21D9]/20 flex items-center justify-center text-sm font-bold text-[#6B21D9] flex-shrink-0">
                    {selected.name.charAt(0)}
                  </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{selected.name}</p>
                      <p className="text-xs text-white/50 font-mono truncate flex items-center gap-1.5">
                        <HugeiconsIcon icon={Mail01Icon} size={10} strokeWidth={2} className="flex-shrink-0" />
                        {selected.email}
                      </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleRead(selected.id)}
                    className="p-2 rounded-lg hover:bg-white/5 text-white/25 hover:text-[#6B21D9] transition-colors"
                    title={selected.read ? "Mark unread" : "Mark read"}
                  >
                    <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => delMsg(selected.id)}
                    className="p-2 rounded-lg hover:bg-red-950/20 text-white/25 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div className="px-5 py-3 bg-black/15 border-b border-white/4">
                <p className="text-sm font-semibold text-white">{selected.subject}</p>
                <p className="text-xs text-white/40 font-mono mt-0.5">
                  {new Date(selected.receivedAt).toLocaleString()}
                </p>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto overscroll-contain flex-grow">
                <p className="text-sm text-white/80 leading-relaxed font-normal">{selected.message}</p>
              </div>

              {/* Reply */}
              <div className="px-5 pb-5 pt-3 border-t border-white/5">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  className="inline-flex items-center gap-2 bg-[#6B21D9] hover:bg-[#7c3aed] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                >
                  <HugeiconsIcon icon={Mail01Icon} size={13} strokeWidth={2} />
                  Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-[#161616] border border-white/6 rounded-2xl flex items-center justify-center h-full min-h-[300px]">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center text-white/10">
                  <HugeiconsIcon icon={UserIcon} size={22} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-bold text-white/25">Select a message</p>
                <p className="text-xs text-white/15 max-w-[200px] leading-relaxed">
                  Click a message on the left to read it here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
