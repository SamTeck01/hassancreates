/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
              // Scripts: self + inline (needed for Next.js hydration chunks)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Styles: self + inline (Tailwind / CSS-in-JS require this)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts: self + Google Fonts
              "font-src 'self' https://fonts.gstatic.com data:",
              // Images: self + Cloudinary + Framer + local data URIs
              "img-src 'self' data: blob: https://res.cloudinary.com https://framerusercontent.com",
              // API/Fetch connections: self + Neon DB only goes through server-side
              "connect-src 'self' https://res.cloudinary.com",
              // No object embeds
              "object-src 'none'",
              // Block base tag hijacking
              "base-uri 'self'",
              // All forms must submit to self
              "form-action 'self'",
              // Upgrade insecure requests in production
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
