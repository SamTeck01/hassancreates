// Run: npm run build && npx next start -p 3123, then: node e2e/seo.check.js
// Checks what search engines see: server HTML (no JS), metadata, icons, and
// that hydration produces no React errors.
const BASE = process.env.BASE || "http://localhost:3123";
const { chromium } = require("playwright");
let fails = 0;
const check = (ok, msg) => { console.log((ok ? "PASS " : "FAIL ") + msg); if (!ok) fails++; };

(async () => {
  const browser = await chromium.launch();

  // 1) Crawler view: JavaScript disabled
  const noJs = await browser.newContext({ javaScriptEnabled: false, userAgent: "Googlebot/2.1" });
  const p1 = await noJs.newPage();
  const res = await p1.goto(BASE + "/");
  check(res.status() === 200, "home returns 200");
  const text = await p1.evaluate(() => document.body.innerText);
  check(text.length > 1500, `server HTML has real content (${text.length} chars)`);
  // accessible name = what screen readers announce (letter spans are aria-hidden)
  const h1 = await p1.locator("h1").first().ariaSnapshot();
  check(/I turn ideas into visuals that stick/.test(h1.replace(/\s+/g, " ")), `h1 readable as words: "${h1.replace(/\s+/g, " ").trim().slice(0, 60)}"`);
  for (const s of ["Hassan", "Services", "Recent Works", "Stance"]) check(text.includes(s), `content includes "${s}"`);
  const meta = await p1.evaluate(() => ({
    title: document.title,
    desc: document.querySelector('meta[name="description"]')?.content,
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    ogImage: document.querySelector('meta[property="og:image"]')?.content,
    icons: [...document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]')].map(l => l.getAttribute("href")),
    jsonLd: !!document.querySelector('script[type="application/ld+json"]'),
  }));
  console.log("  meta:", meta);
  check(/Hassan/.test(meta.title) && meta.desc?.length > 50, "title + description present");
  check(!!meta.canonical, "canonical link present");
  check(meta.jsonLd, "JSON-LD present");
  check(meta.ogImage && !/og-image\.png/.test(meta.ogImage), "og:image uses generated opengraph-image");
  check(meta.icons.some(h => /icon/.test(h)), "favicon/icon links present");

  // fetch og image + icons (rewrite absolute prod URL to local)
  const local = u => u.replace(/^https?:\/\/[^/]+/, BASE);
  for (const u of [meta.ogImage, "/favicon.ico", "/icon.png", "/apple-icon.png"]) {
    const r = await p1.request.get(u.startsWith("http") ? local(u) : BASE + u);
    check(r.ok() && /image/.test(r.headers()["content-type"]), `${u.replace(/\?.*/, "")} serves an image`);
  }
  await noJs.close();

  // 2) Real browser: hydration must be clean
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p2 = await ctx.newPage();
  const errs = [];
  p2.on("pageerror", e => errs.push(e.message));
  p2.on("console", m => m.type() === "error" && !/_vercel|404/.test(m.text() + (m.location().url || "")) && errs.push(m.text()));
  await p2.goto(BASE + "/", { waitUntil: "networkidle" });
  await p2.waitForTimeout(2500);
  check(!errs.some(e => /hydrat|did not match|#418|#423|#425/i.test(e)), "no hydration errors");
  check(errs.length === 0, `no console errors ${errs.length ? JSON.stringify(errs.slice(0, 3)) : ""}`);
  const heroVisible = await p2.evaluate(() => getComputedStyle(document.querySelector("h1 [aria-hidden] span span")).opacity);
  check(heroVisible === "1", "hero letters animate in after hydration");

  await browser.close();
  console.log(fails ? `\n${fails} FAILED` : "\nALL PASSED");
  process.exit(fails ? 1 : 0);
})();
