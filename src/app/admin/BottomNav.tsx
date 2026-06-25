"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const HomeIcon = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" strokeWidth={filled ? 0 : 1.8} fill={filled ? "white" : "none"} opacity={filled ? 0.3 : 1} />
  </svg>
);

const BriefcaseIcon = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" strokeWidth="1.8" stroke="currentColor" fill="none" />
  </svg>
);

const ServicesIcon = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" strokeWidth="1.8" stroke="currentColor" fill="none" />
  </svg>
);

const TABS = [
  { href: "/admin", label: "Home", exact: true, icon: HomeIcon },
  { href: "/admin/works", label: "Works", exact: false, icon: BriefcaseIcon },
  { href: "/admin/services", label: "Services", exact: false, icon: ServicesIcon },
] as const;

export default function AdminBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Never show on login page
  if (pathname === "/admin/login") return null;

  const isActive = (tab: typeof TABS[number]) =>
    tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

  const handleLogout = async () => {
    try { await fetch("/api/admin/logout", { method: "POST" }); } catch { /* best effort */ }
    router.push("/admin/login");
    router.refresh();
  };

  // Mobile-only — hidden on sm (640px) and above
  return (
    <div className="sm:hidden">
      <nav
        aria-label="Admin navigation"
        className="fixed bottom-0 inset-x-0 z-40 flex justify-center px-4 pb-4"
        style={{ cursor: "auto" }}
      >
        <div
          className="relative flex items-center gap-1 bg-[#111111]/95 backdrop-blur border border-white/8 rounded-2xl px-2 py-2 shadow-2xl"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.7), 0 0 80px rgba(107,33,217,0.06)" }}
        >
          {TABS.map((tab) => {
            const active = isActive(tab);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex flex-col items-center justify-center gap-1 px-5 py-2.5 rounded-xl transition-all duration-200 select-none min-w-[72px] ${
                  active ? "text-white" : "text-white/30 hover:text-white/60"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <span
                    className="absolute inset-0 rounded-xl bg-[#6B21D9]"
                    style={{ boxShadow: "0 0 20px rgba(107,33,217,0.5), inset 0 1px 0 rgba(255,255,255,0.1)" }}
                  />
                )}
                <span className={`relative z-10 ${active ? "scale-105" : "scale-100"}`}>
                  <Icon filled={active} />
                </span>
                <span className={`relative z-10 text-[10px] font-bold tracking-wider uppercase leading-none ${active ? "opacity-100" : "opacity-60"}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}

          <div className="w-px h-8 bg-white/8 mx-1" />

          <button
            onClick={handleLogout}
            aria-label="Sign out"
            className="flex flex-col items-center justify-center gap-1 px-4 py-2.5 rounded-xl text-white/25 hover:text-red-400 hover:bg-red-950/20 transition-all duration-200 min-w-[60px] select-none"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="text-[10px] font-bold tracking-wider uppercase leading-none">Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
