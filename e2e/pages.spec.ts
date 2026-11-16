import { test, expect } from "@playwright/test";
import { trackErrors } from "./helpers";

test.describe("multi-page site", () => {
  test("work index lists every project and links to its page", async ({ page, request }) => {
    const projects = await (await request.get("/api/projects")).json();
    const t = trackErrors(page);
    await page.goto("/work", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: "Work" })).toBeVisible();
    const links = page.locator('main a[href^="/work/"]');
    await expect(links).toHaveCount(projects.length);
    // filter narrows the list and "All" restores it
    const chips = page.getByRole("group", { name: "Filter by discipline" }).getByRole("button");
    if (await chips.count() > 1) {
      await chips.nth(1).click();
      await expect(chips.nth(1)).toHaveAttribute("aria-pressed", "true");
      expect(await links.count()).toBeLessThanOrEqual(projects.length);
      await chips.first().click();
      await expect(links).toHaveCount(projects.length);
    }
    await links.first().click();
    await page.waitForURL(`**/work/${projects[0].id}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(projects[0].clientName);
    t.expectClean();
  });

  test("project page: details, every image, next project, metadata", async ({ page, request }) => {
    const projects = await (await request.get("/api/projects")).json();
    const p = projects[0];
    const t = trackErrors(page);
    const res = await page.goto(`/work/${p.id}`, { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(new RegExp(p.clientName));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.clientName);
    await expect(page.getByText(p.year, { exact: true }).first()).toBeVisible();
    const imgs = page.getByRole("region", { name: `${p.clientName} images` }).locator("img");
    await expect(imgs).toHaveCount((p.swiperImages?.length || 1));
    await expect(page.getByRole("heading", { name: "About this project" })).toBeVisible();
    if (projects.length > 1) await expect(page.getByRole("region", { name: "More by Hassan" })).toContainText(projects[1].clientName);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/work/${p.id}$`));
    t.expectClean();
  });

  test("unknown project → friendly 404", async ({ page }) => {
    const res = await page.goto("/work/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "This project isn't here" })).toBeVisible();
    await page.getByRole("link", { name: "See all work" }).click();
    await page.waitForURL("**/work");
  });

  test("about and contact pages render; nav marks the current page", async ({ page }) => {
    const t = trackErrors(page);
    await page.goto("/about", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("I design brands");
    await expect(page.getByRole("heading", { name: "Experience" })).toBeVisible();
    await page.goto("/contact", { waitUntil: "networkidle" });
    await expect(page.locator("#contact")).toBeVisible();
    const vw = page.viewportSize()!.width;
    if (vw >= 640) await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Contact" })).toHaveAttribute("aria-current", "page");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    t.expectClean();
  });

  test("sitemap lists the new pages and every project", async ({ request }) => {
    const projects = await (await request.get("/api/projects")).json();
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const path of ["/work", "/about", "/contact"]) expect(xml).toContain(`hassancreates.design${path}<`);
    for (const p of projects) expect(xml).toContain(`/work/${p.id}<`);
  });
});
