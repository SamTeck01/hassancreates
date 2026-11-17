import { test, expect } from "@playwright/test";

test.describe("SEO (crawler view, JavaScript disabled)", () => {
  test.use({ javaScriptEnabled: false });

  test("server HTML contains the real content", async ({ page, request }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
    const text = await page.evaluate(() => document.body.innerText);
    expect(text.length).toBeGreaterThan(1500);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("I turn ideas into visuals that stick.");
    const projects = await (await request.get("/api/projects")).json();
    const nospace = (x: string) => x.replace(/\s+/g, "");
    for (const p of projects.slice(0, 5)) expect(nospace(text)).toContain(nospace(p.clientName));
    // textContent, not innerText: the marquee is CSS-uppercased
    const raw = await page.evaluate(() => document.body.textContent ?? "");
    for (const s of ["What I do", "Recent Works", "4 Years of Experience"]) expect(raw).toContain(s);
    // every project is crawlable from /work, server-rendered
    await page.goto("/work");
    const work = nospace(await page.evaluate(() => document.body.innerText));
    for (const p of projects) expect(work).toContain(nospace(p.clientName));
  });

  test("metadata, canonical, JSON-LD, icons, share image", async ({ page, request, baseURL }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Hassan Okesanjo/);
    expect((await page.locator('meta[name="description"]').getAttribute("content"))!.length).toBeGreaterThan(50);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hassancreates.design");
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.length).toBeGreaterThan(0);
    for (const block of ld) expect(() => JSON.parse(block)).not.toThrow();
    const og = (await page.locator('meta[property="og:image"]').getAttribute("content"))!;
    expect(og).not.toContain("og-image.png");
    const local = (u: string) => u.replace(/^https?:\/\/[^/]+/, baseURL!);
    for (const u of [og, "/favicon.ico", "/icon.png", "/apple-icon.png"]) {
      const r = await request.get(u.startsWith("http") ? local(u) : u);
      expect(r.ok(), u).toBeTruthy();
      expect(r.headers()["content-type"]).toMatch(/image/);
    }
  });

  test("robots.txt and sitemap.xml", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Sitemap:/i);
    expect(robots).toMatch(/Disallow: \/admin/i);
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toContain("https://hassancreates.design");
  });
});
