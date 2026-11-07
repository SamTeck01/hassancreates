import { test, expect } from "@playwright/test";
import { TEST_ADMIN } from "../playwright.config";
import { normaliseBehanceUrl, parseBehanceHtml } from "../src/lib/behance";

const CDN = "https://mir-s3-cdn-cf.behance.net/project_modules";

test("normaliseBehanceUrl accepts project links only", () => {
  expect(normaliseBehanceUrl("https://www.behance.net/gallery/123/Stance?tracking_source=x")).toBe("https://www.behance.net/gallery/123/Stance");
  expect(normaliseBehanceUrl("behance.net/gallery/123/Stance")).toBeNull(); // needs a scheme…
  expect(normaliseBehanceUrl("https://behance.net/gallery/123")).toBe("https://www.behance.net/gallery/123");
  for (const bad of ["https://www.behance.net/hassanokesanjo1", "https://evil.com/gallery/1/x", "not a url", ""]) expect(normaliseBehanceUrl(bad), bad).toBeNull();
});

test("parseBehanceHtml extracts title, description, year, tags, cover, images", () => {
  const html = `<title>X on Behance</title><meta property="og:title" content="Stance &amp; Co on Behance">
<meta content="Identity work." property="og:description"><meta property="og:image" content="https://mir-s3-cdn-cf.behance.net/projects/404/c.png">
<img src="${CDN}/max_808/a.png"><img src="${CDN}/max_3840/a.png"><img src="${CDN}/source/a.png"><img src="${CDN}/disp/b.jpg"><img src="${CDN}/1400/b.jpg">
<script>{"published_on":1735689600,"tags":[{"title":"Branding"},{"title":"Logo"}],"x":"https:\\/\\/mir-s3-cdn-cf.behance.net\\/project_modules\\/fs\\/c.webp"}</script>`;
  const d = parseBehanceHtml(html, "https://www.behance.net/gallery/1/x");
  expect(d.title).toBe("Stance & Co");
  expect(d.description).toBe("Identity work.");
  expect(d.year).toBe("2025");
  expect(d.tags).toEqual(["Branding", "Logo"]);
  expect(d.cover).toBe("https://mir-s3-cdn-cf.behance.net/projects/404/c.png");
  expect(d.images).toEqual([`${CDN}/max_3840/a.png`, `${CDN}/1400/b.jpg`, `${CDN}/fs/c.webp`]);
});

test.describe("admin import flow (fake Behance + fake Cloudinary)", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "desktop only"));

  test("paste link → editor opens pre-filled as a draft", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByPlaceholder("Enter username").fill(TEST_ADMIN.username);
    await page.getByPlaceholder("Enter password").fill(TEST_ADMIN.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL((u) => u.pathname === "/admin");
    await page.goto("/admin/works", { waitUntil: "networkidle" });

    // Bad link → friendly error
    await page.getByRole("button", { name: "Import from Behance" }).click();
    await page.getByLabel("Behance project link").fill("https://www.behance.net/hassanokesanjo1");
    await page.getByRole("button", { name: "Import project" }).click();
    await expect(page.getByRole("status")).toContainText("isn't a Behance project link");

    // Missing project → friendly error
    await page.getByLabel("Behance project link").fill("https://www.behance.net/gallery/999/Gone");
    await page.getByRole("button", { name: "Import project" }).click();
    await expect(page.getByRole("status")).toContainText("doesn't exist");

    // Real (fake) project
    await page.getByLabel("Behance project link").fill("https://www.behance.net/gallery/111/Stance-Branding?tracking=1");
    await page.getByRole("button", { name: "Import project" }).click();
    const form = page.locator("form").filter({ has: page.getByRole("button", { name: "Save as draft" }) });
    await expect(form).toBeVisible({ timeout: 20000 });
    await expect(form.getByLabel("Project / client name *")).toHaveValue("Stance Branding");
    await expect(form.getByLabel("Year *")).toHaveValue("2026");
    await expect(form.getByLabel("Services")).toHaveValue("Branding, Packaging");
    await expect(form.getByLabel(/Short description/)).toHaveValue("Identity & packaging for Stance.");
    await expect(form.getByText("Imported from Behance")).toBeVisible();
    await expect(form.getByText("Currently a draft")).toBeVisible();
    // cover (not in gallery) + 3 gallery images, cover is the card image
    const tiles = form.getByTestId("project-image");
    await expect(tiles).toHaveCount(4);
    await expect(tiles.nth(0).getByText("CARD IMAGE", { exact: true })).toBeVisible();
    await expect(tiles.nth(0).getByRole("button", { name: "Not in gallery" })).toBeVisible();
    await expect(tiles.nth(1).getByRole("button", { name: "✓ In gallery" })).toBeVisible();
    // Role is required before saving
    await form.getByRole("button", { name: "Save as draft" }).click();
    await expect(form.getByText("Please add: role.")).toBeVisible();
  });
});
