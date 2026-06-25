"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GlobeIcon,
  Briefcase02Icon,
  Settings02Icon,
  Message01Icon,
} from "@hugeicons/core-free-icons";

const TABS = [
  { href: "/admin", label: "Visitors", icon: GlobeIcon, exact: true },
  { href: "/admin/works", label: "Works", icon: Briefcase02Icon, exact: false },
  { href: "/admin/services", label: "Services", icon: Settings02Icon, exact: false },
  { href: "/admin/inbox", label: "Inbox", icon: Message01Icon, exact: false },
] as const;

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return null;

  const isActive = (tab: (typeof TABS)[number]) =>
    tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

  const handleLogout = async () => {
    try { await fetch("/api/admin/logout", { method: "POST" }); } catch { /* best effort */ }
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-white/5 pb-6 mb-8">
      {/* Brand + sign out */}
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          HassanCreates{" "}
          <span className="text-white/40 font-light text-xl">/ Dashboard</span>
        </h1>
        <button
          onClick={handleLogout}
          title="Sign out"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white/35 hover:text-red-400 border border-white/5 hover:border-red-900/30 hover:bg-red-950/15 transition-all cursor-pointer"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>

      {/* Desktop tab navigation — hidden on mobile (sm:flex) */}
      <nav className="hidden sm:flex space-x-1 bg-[#1a1a1a] p-1.5 rounded-xl border border-white/5">
        {TABS.map((tab) => {
          const active = isActive(tab);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
                active
                  ? "bg-[#6B21D9] text-white shadow-md shadow-[#6B21D9]/10"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <HugeiconsIcon icon={tab.icon} size={13} strokeWidth={2} />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
