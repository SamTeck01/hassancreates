"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const HomeIcon = ({ filled }: { filled: boolean }) => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" fill={filled ? "rgba(255,255,255,0.25)" : "none"} stroke={filled ? "none" : "currentColor"} />
  </svg>
);

const BriefcaseIcon = ({ filled }: { filled: boolean }) => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" fill="none" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const SettingsIcon = ({ filled }: { filled: boolean }) => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" fill={filled ? "rgba(255,255,255,0.3)" : "none"} stroke={filled ? "none" : "currentColor"} />
  </svg>
);

const InboxIcon = ({ filled }: { filled: boolean }) => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const TABS = [
  { href: "/admin", label: "Visitors", exact: true, icon: HomeIcon },
  { href: "/admin/works", label: "Works", exact: false, icon: BriefcaseIcon },
  { href: "/admin/services", label: "Services", exact: false, icon: SettingsIcon },
  { href: "/admin/inbox", label: "Inbox", exact: false, icon: InboxIcon },
] as const;

export default function AdminBottomNav() {
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

  // Mobile-only — hidden on sm (640px+) and above
  return (
    <div className="sm:hidden">
      <nav
        aria-label="Admin navigation"
        className="fixed bottom-0 inset-x-0 z-40 flex justify-center px-3 pb-4"
        style={{ cursor: "auto" }}
      >
        <div
          className="flex items-center gap-0.5 bg-[#111111]/96 backdrop-blur border border-white/8 rounded-2xl px-1.5 py-1.5 shadow-2xl"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.8), 0 0 60px rgba(107,33,217,0.07)" }}
        >
          {TABS.map((tab) => {
            const active = isActive(tab);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex flex-col items-center justify-center gap-1 px-4 py-2.5 rounded-xl transition-all duration-150 select-none min-w-[64px] ${
                  active ? "text-white" : "text-white/30"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <span
                    className="absolute inset-0 rounded-xl bg-[#6B21D9]"
                    style={{ boxShadow: "0 0 18px rgba(107,33,217,0.45), inset 0 1px 0 rgba(255,255,255,0.12)" }}
                  />
                )}
                <span className="relative z-10">
                  <Icon filled={active} />
                </span>
                <span className={`relative z-10 text-[9px] font-bold tracking-wider uppercase leading-none ${active ? "opacity-100" : "opacity-50"}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}

          <div className="w-px h-7 bg-white/8 mx-0.5" />

          <button
            onClick={handleLogout}
            aria-label="Sign out"
            className="flex flex-col items-center justify-center gap-1 px-3.5 py-2.5 rounded-xl text-white/20 hover:text-red-400 hover:bg-red-950/20 transition-all duration-150 min-w-[52px] select-none"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="text-[9px] font-bold tracking-wider uppercase leading-none opacity-50">Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
