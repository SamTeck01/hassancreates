/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "framerusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // ── HTTP Security Headers ──────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking (OWASP A05)
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME sniffing attacks
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Strict HTTPS enforcement (HSTS) — 1 year, includes subdomains
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Control referrer information to prevent data leakage
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Restrict browser features / APIs (Permissions Policy)
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          // Cross-Origin Opener Policy — prevent cross-origin window attacks
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          // Content Security Policy — defence-in-depth against XSS
          // Covers script-src, style-src, img-src, font-src, connect-src
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self + inline (needed for Next.js hydration) + Vercel live toolbar
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
              // Styles: self + inline (Tailwind / CSS-in-JS require this)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts: self + Google Fonts
              "font-src 'self' https://fonts.gstatic.com data:",
              // Images: self + Cloudinary + Framer + local data URIs
              "img-src 'self' data: blob: https://res.cloudinary.com https://framerusercontent.com https://mir-s3-cdn-cf.behance.net",
              // Media: allow data: URIs (e.g. audio playback via base64)
              "media-src 'self' data: blob:",
              // API/Fetch connections: self + Cloudinary + Vercel Analytics + Vercel Live
              "connect-src 'self' https://res.cloudinary.com https://vitals.vercel-insights.com https://vercel.live wss://vercel.live",
              // No object embeds
              "object-src 'none'",
              // Block base tag hijacking
              "base-uri 'self'",
              // All forms must submit to self
              "form-action 'self'",
              // Upgrade insecure requests in production. Omitted only for the
              // local Playwright build, which is served over plain http.
              ...(process.env.E2E_LOCAL_HTTP ? [] : ["upgrade-insecure-requests"]),
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
