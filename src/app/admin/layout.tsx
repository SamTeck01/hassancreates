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
        
        /* Definitive Native Cursor Overrides for Admin Panel */
        .admin-root, .admin-root *, .admin-root *::before, .admin-root *::after {
          cursor: auto !important;
        }
        .admin-root a,
        .admin-root button,
        .admin-root [role="button"],
        .admin-root label,
        .admin-root select,
        .admin-root summary,
        .admin-root [type="button"],
        .admin-root [type="submit"],
        .admin-root [type="file"] {
          cursor: pointer !important;
        }
        .admin-root input[type="text"],
        .admin-root input[type="email"],
        .admin-root input[type="password"],
        .admin-root input[type="number"],
        .admin-root input[type="search"],
        .admin-root input[type="tel"],
        .admin-root input[type="url"],
        .admin-root textarea {
          cursor: text !important;
        }
        .admin-root :disabled,
        .admin-root [disabled],
        .admin-root .cursor-not-allowed {
          cursor: not-allowed !important;
        }
      `}</style>

      <div className="admin-root text-white font-kyiv-sans selection:bg-[#6B21D9]/40 selection:text-white px-4 sm:px-6 pt-6 sm:pt-10">
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
