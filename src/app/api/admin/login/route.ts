import { NextResponse } from "next/server";
import crypto from "crypto";

// ── Brute-force Protection ────────────────────────────────────────────────────
// Track failed attempts per IP in memory (resets on cold start)
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function getIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
}

function isLockedOut(ip: string): boolean {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() < entry.lockedUntil) return true;
  // Lockout expired — reset
  failedAttempts.delete(ip);
  return false;
}

function recordFailure(ip: string): void {
  const entry = failedAttempts.get(ip);
  const count = (entry?.count ?? 0) + 1;
  failedAttempts.set(ip, {
    count,
    lockedUntil: count >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0,
  });
}

function clearFailures(ip: string): void {
  failedAttempts.delete(ip);
}

// ── Timing-safe string comparison ─────────────────────────────────────────────
function safeCompare(a: string, b: string): boolean {
  // Pad to equal length before comparing to prevent timing side-channels
  const bufA = Buffer.from(a.padEnd(Math.max(a.length, b.length)));
  const bufB = Buffer.from(b.padEnd(Math.max(a.length, b.length)));
  return (
    bufA.length === bufB.length &&
    crypto.timingSafeEqual(bufA, bufB)
  );
}

export async function POST(request: Request) {
  const ip = getIp(request);

  // Check lockout first
  if (isLockedOut(ip)) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { username, password } = body;

  // Validate input presence
  if (!username || !password || typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  // Enforce max lengths to prevent DoS via huge strings
  if (username.length > 100 || password.length > 200) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const expectedUsername = process.env.ADMIN_USERNAME ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  const sessionSecret = process.env.ADMIN_SESSION_SECRET ?? "fallback-dev-secret";

  // Timing-safe comparison to prevent username enumeration
  const usernameMatch = safeCompare(username, expectedUsername);
  const passwordMatch = safeCompare(password, expectedPassword);

  if (!usernameMatch || !passwordMatch) {
    recordFailure(ip);
    const entry = failedAttempts.get(ip);
    const remaining = Math.max(0, MAX_ATTEMPTS - (entry?.count ?? 0));

    console.warn(`[Admin Login] Failed attempt from ${ip} — ${entry?.count}/${MAX_ATTEMPTS}`);

    return NextResponse.json(
      {
        error: "Invalid username or password.",
        attemptsRemaining: remaining,
      },
      { status: 401 }
    );
  }

  // ── Success — issue session cookie ──────────────────────────────────────────
  clearFailures(ip);
  console.log(`[Admin Login] Successful login from ${ip}`);

  // Sign a simple token: HMAC-SHA256 of "admin" + timestamp
  const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const payload = `admin:${expires}`;
  const sig = crypto
    .createHmac("sha256", sessionSecret)
    .update(payload)
    .digest("hex");
  const token = `${payload}:${sig}`;

  const response = NextResponse.json({ success: true });

  response.cookies.set("admin_session", token, {
    httpOnly: true,        // Not accessible from JS — prevents XSS token theft
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "lax",       // CSRF protection
    maxAge: 60 * 60 * 24,  // 24 hours
    path: "/",
  });

  return response;
}
