"use client";

import type { VercelAnalytics } from "@/app/actions/analytics";

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, accent,
}: {
  label: string; value: string | number; sub?: string; accent?: boolean;
}) {
  return (
    <div className={`bg-[#161616] border rounded-2xl p-5 flex flex-col gap-2 ${
      accent ? "border-[#6B21D9]/30" : "border-white/6"
    }`}>
      <span className="text-xs font-semibold tracking-wide text-white/50">{label}</span>
      <span className={`text-4xl font-black font-mono leading-none ${
        accent ? "text-[#a78bfa]" : "text-white"
      }`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
      {sub && <span className="text-xs text-white/35">{sub}</span>}
    </div>
  );
}

// ── Setup Banner ──────────────────────────────────────────────────────────────
function SetupBanner() {
  return (
    <div className="bg-[#161616] border border-amber-500/20 rounded-2xl p-6 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-white mb-1">Connect Vercel Analytics</p>
          <p className="text-xs text-white/45 leading-relaxed">
            Add <code className="text-[#a78bfa] bg-white/5 px-1 py-0.5 rounded font-mono text-[10px]">VERCEL_API_TOKEN</code> and{" "}
            <code className="text-[#a78bfa] bg-white/5 px-1 py-0.5 rounded font-mono text-[10px]">VERCEL_PROJECT_ID</code> to your
            environment variables to see real human-only analytics here.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 pl-11">
        <div className="text-[10px] text-white/30 font-mono leading-relaxed bg-black/30 rounded-lg px-3 py-2 border border-white/5 space-y-0.5">
          <p><span className="text-white/50"># .env.local + Vercel dashboard</span></p>
          <p>VERCEL_API_TOKEN=<span className="text-amber-400/70">your_token_here</span></p>
          <p>VERCEL_PROJECT_ID=<span className="text-amber-400/70">prj_xxxxxxxxxxxxx</span></p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a
            href="https://vercel.com/account/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-semibold text-[#a78bfa] hover:text-white bg-[#6B21D9]/10 hover:bg-[#6B21D9]/20 border border-[#6B21D9]/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            Get API Token →
          </a>
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-semibold text-white/50 hover:text-white bg-white/5 hover:bg-white/8 border border-white/5 px-3 py-1.5 rounded-lg transition-colors"
          >
            Vercel Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Home Client ───────────────────────────────────────────────────────────────
export default function HomeClient({ analytics }: { analytics: VercelAnalytics }) {
  const { views, visitors, viewsToday, visitorsToday, topPages, available } = analytics;

  return (
    <div className="text-white space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white font-kyiv">Analytics</h1>
          <p className="text-xs text-white/30 mt-0.5">
            {available ? "Vercel Web Analytics · human-only · last 30 days" : "Vercel Web Analytics · not connected"}
          </p>
        </div>
        {available && (
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/8 text-white/70 hover:text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L24 22H0L12 1Z"/>
            </svg>
            Open in Vercel
          </a>
        )}
      </div>

      {/* Setup banner when env vars missing */}
      {!available && <SetupBanner />}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Page Views" value={views} sub="last 30 days" />
        <StatCard label="Unique Visitors" value={visitors} sub="human-only, bot-filtered" accent />
        <StatCard label="Views Today" value={viewsToday} sub="rolling calendar day" />
        <StatCard label="Visitors Today" value={visitorsToday} sub="unique humans" />
      </div>

      {/* Top Pages */}
      <div className="bg-[#161616] border border-white/6 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Top Pages</h2>
            <p className="text-[11px] text-white/30 mt-0.5">Most visited · last 30 days</p>
          </div>
          <span className="text-[10px] font-mono text-white/20 bg-white/4 border border-white/5 px-2 py-1 rounded-lg">
            {topPages.length} pages
          </span>
        </div>

        {!available || topPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-white/15">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <p className="text-sm font-bold text-white/40">
              {available ? "No page data yet" : "Not connected"}
            </p>
            <p className="text-xs text-white/20 max-w-[220px] leading-relaxed">
              {available
                ? "Page view data will appear once traffic comes in."
                : "Connect your Vercel API token to see top pages here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.035]">
            {topPages.map((page, i) => {
              const maxViews = topPages[0]?.views || 1;
              const pct = Math.round((page.views / maxViews) * 100);
              return (
                <div key={page.path} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.018] transition-colors">
                  <span className="text-xs font-mono text-white/25 w-5 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-white/90 font-medium truncate font-mono">{page.path}</span>
                      <span className="text-xs text-white/50 font-mono flex-shrink-0 ml-4">{page.views.toLocaleString()}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6B21D9] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Powered-by note */}
      <p className="text-center text-[10px] text-white/15 font-mono">
        Powered by Vercel Web Analytics · bot-filtered · privacy-first
      </p>
    </div>
  );
}
