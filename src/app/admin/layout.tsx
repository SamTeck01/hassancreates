import type { Metadata } from "next";
import AdminHeader from "./AdminHeader";
import AdminBottomNav from "./BottomNav";

export const metadata: Metadata = {
  title: "Admin · hassancreates",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ cursor: "auto", scrollBehavior: "auto" }}
      className="min-h-screen bg-[#0D0D0D] antialiased"
    >
      {/* Reset custom scrollbar inside admin to native browser default */}
      <style>{`
        .admin-root ::-webkit-scrollbar { width: 8px; height: 8px; }
        .admin-root ::-webkit-scrollbar-track { background: transparent; }
        .admin-root ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.10); border-radius: 99px; }
        .admin-root ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
      `}</style>

      <div className="admin-root text-white font-kyiv-sans selection:bg-[#6B21D9]/40 selection:text-white">
        <AdminHeader />
        <main className="max-w-[1300px] mx-auto px-6 pb-24 sm:pb-16">
          {children}
        </main>
        {/* Bottom nav — mobile only */}
        <AdminBottomNav />
      </div>
    </div>
  );
}
