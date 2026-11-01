import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, isAdminToken } from "@/lib/adminAuth";

// ── Rate Limiting Store (in-memory, resets on cold start) ────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

// Stricter limit for login endpoint (anti-brute-force at edge)
const loginRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const LOGIN_RATE_LIMIT_MAX = 10;

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
}

function checkRateLimit(
  map: Map<string, { count: number; resetAt: number }>,
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = map.get(key);

  if (!entry || now > entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  entry.count += 1;
  const remaining = Math.max(0, max - entry.count);
  return { allowed: entry.count <= max, remaining };
}

async function isAdminAuthorized(request: NextRequest): Promise<boolean> {
  return isAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Stricter rate limiting on login endpoint ──────────────────────────────
  if (pathname === "/api/admin/login") {
    const key = getRateLimitKey(request);
    const { allowed } = checkRateLimit(loginRateLimitMap, key, LOGIN_RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Too many login attempts. Please wait a minute." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
    return NextResponse.next();
  }

  // ── Uploads are admin-only (they spend the Cloudinary quota) ─────────────
  if (pathname === "/api/upload" && !(await isAdminAuthorized(request))) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Rate limiting on API routes that change things ────────────────────────
  // Read-only GETs (/api/projects, /api/services) are loaded on every page
  // view; limiting them per IP broke the site for visitors sharing one IP
  // (mobile carriers / offices behind NAT).
  if (pathname.startsWith("/api/") && request.method !== "GET" && request.method !== "HEAD") {
    const key = getRateLimitKey(request);
    const { allowed, remaining } = checkRateLimit(rateLimitMap, key, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Rate limit exceeded. Please wait before making more requests." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX));
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    return response;
  }

  // ── Protect Admin Routes (redirect logged-in users from login page, others from dashboard) ──
  if (pathname === "/admin/login") {
    if (await isAdminAuthorized(request)) {
      const dashboardUrl = new URL("/admin", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  } else if (pathname.startsWith("/admin")) {
    if (!(await isAdminAuthorized(request))) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/api/:path*"],
};
