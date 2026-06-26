"use server";

// ── Vercel Analytics — pull real human-only stats via REST API ────────────────
// Vercel filters bots server-side before counting any view/visitor.
// Requires: VERCEL_API_TOKEN + VERCEL_PROJECT_ID in env vars.

export interface VercelAnalytics {
  views: number;
  visitors: number;
  viewsToday: number;
  visitorsToday: number;
  topPages: { path: string; views: number }[];
  available: boolean; // false when env vars are missing
}

const VERCEL_API = "https://api.vercel.com";

function todayRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to   = new Date(from.getTime() + 86400000 - 1);
  return {
    from: from.toISOString().slice(0, 10),
    to:   to.toISOString().slice(0, 10),
  };
}

function last30Range(): { from: string; to: string } {
  const to   = new Date();
  const from = new Date(to.getTime() - 30 * 86400000);
  return {
    from: from.toISOString().slice(0, 10),
    to:   to.toISOString().slice(0, 10),
  };
}

async function vercelFetch(path: string, token: string): Promise<Response> {
  return fetch(`${VERCEL_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 120 }, // cache for 2 min
  });
}

export async function getVercelAnalytics(): Promise<VercelAnalytics> {
  const token     = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) {
    console.warn("VERCEL_API_TOKEN or VERCEL_PROJECT_ID not set — analytics unavailable");
    return {
      views: 0, visitors: 0, viewsToday: 0, visitorsToday: 0,
      topPages: [], available: false,
    };
  }

  try {
    const { from: f30, to: t30 } = last30Range();
    const { from: fDay, to: tDay } = todayRange();

    const [summaryRes, todayRes, pagesRes] = await Promise.all([
      // 30-day totals
      vercelFetch(
        `/v1/web-analytics/${projectId}/summary?from=${f30}&to=${t30}`,
        token
      ),
      // Today totals
      vercelFetch(
        `/v1/web-analytics/${projectId}/summary?from=${fDay}&to=${tDay}`,
        token
      ),
      // Top pages (last 30 days)
      vercelFetch(
        `/v1/web-analytics/${projectId}/pages?from=${f30}&to=${t30}&limit=5`,
        token
      ),
    ]);

    const summary = summaryRes.ok ? await summaryRes.json() : null;
    const today   = todayRes.ok   ? await todayRes.json()   : null;
    const pages   = pagesRes.ok   ? await pagesRes.json()   : null;

    return {
      views:         summary?.pageviews ?? 0,
      visitors:      summary?.visitors  ?? 0,
      viewsToday:    today?.pageviews   ?? 0,
      visitorsToday: today?.visitors    ?? 0,
      topPages: (pages?.data ?? []).map((p: { path: string; pageviews: number }) => ({
        path:  p.path,
        views: p.pageviews,
      })),
      available: true,
    };
  } catch (err) {
    console.error("Failed to fetch Vercel analytics:", err);
    return {
      views: 0, visitors: 0, viewsToday: 0, visitorsToday: 0,
      topPages: [], available: false,
    };
  }
}
