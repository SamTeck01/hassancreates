import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import { trackVisitor } from "@/app/actions/analytics";
import crypto from "crypto";

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

// ── Session Token Validation ──────────────────────────────────────────────────
function isValidSession(token: string, secret: string): boolean {
  // Token format: "admin:<expires>:<hmac-sig>"
  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [prefix, expiresStr, sig] = parts;
  if (prefix !== "admin") return false;

  const expires = parseInt(expiresStr, 10);
  if (isNaN(expires) || Date.now() > expires) return false;

  const payload = `admin:${expiresStr}`;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  try {
    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");
    if (sigBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    return false;
  }
}

function isAdminAuthorized(request: NextRequest): boolean {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  // If no session secret configured, allow access (unconfigured dev environment)
  if (!sessionSecret) return true;

  const token = request.cookies.get("admin_session")?.value;
  if (!token) return false;

  return isValidSession(token, sessionSecret);
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // ── Visitor tracking on homepage ──────────────────────────────────────────
  if (pathname === "/") {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ??
      request.headers.get("x-real-ip") ??
      "127.0.0.1";

    const country = request.headers.get("x-vercel-ip-country");
    const cityHeader = request.headers.get("x-vercel-ip-city");
    const city = cityHeader ? decodeURIComponent(cityHeader) : null;

    event.waitUntil(
      trackVisitor(ip, country, city).catch((err) => {
        console.error("Visitor tracking background request failed:", err);
      })
    );
  }

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

  // ── Rate limiting on all API routes ───────────────────────────────────────
  if (pathname.startsWith("/api/")) {
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
    if (isAdminAuthorized(request)) {
      const dashboardUrl = new URL("/admin", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  } else if (pathname.startsWith("/admin")) {
    if (!isAdminAuthorized(request)) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/api/:path*"],
};
