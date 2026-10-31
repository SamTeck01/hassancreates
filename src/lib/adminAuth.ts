/**
 * Admin session verification, shared by the proxy (edge) and server actions /
 * route handlers (node). Uses Web Crypto so it runs in both runtimes.
 *
 * Token format (issued by /api/admin/login): "admin:<expiresMs>:<hmac-hex>"
 */
export const ADMIN_COOKIE = "admin_session";

async function hmacSha256(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function isValidSession(token: string, secret: string): Promise<boolean> {
  const parts = token.split(":");
  if (parts.length !== 3) return false;
  const [prefix, expiresStr, sig] = parts;
  if (prefix !== "admin") return false;
  const expires = parseInt(expiresStr, 10);
  if (isNaN(expires) || Date.now() > expires) return false;
  return timingSafeEqual(sig, await hmacSha256(`admin:${expiresStr}`, secret));
}

/**
 * True if the session cookie value is a valid admin session.
 * Fails CLOSED in production when ADMIN_SESSION_SECRET is missing; only a
 * local dev server without the secret is left open.
 */
export async function isAdminToken(token: string | undefined): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!token) return false;
  return isValidSession(token, secret);
}

/** For server actions / route handlers: is the current request an admin? */
export async function isAdminRequest(): Promise<boolean> {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  return isAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

export class UnauthorizedError extends Error {
  constructor() { super("Unauthorized"); }
}

/** Throws UnauthorizedError unless the current request is an admin. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminRequest())) throw new UnauthorizedError();
}
