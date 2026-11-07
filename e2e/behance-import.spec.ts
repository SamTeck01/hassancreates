/**
 * Behance import bookmarklet, end to end against a FAKE behance.net served by
 * Playwright (we can't reach real Behance from CI). Checks: profile → project
 * discovery, title/description/year extraction, largest image size chosen,
 * escaped-JSON image links found, and the admin preview renders.
 */
import { test, expect } from "@playwright/test";
import { TEST_ADMIN } from "../playwright.config";
import { behanceBookmarklet } from "../src/lib/behanceBookmarklet";

test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "desktop only"));

const CDN = "https://mir-s3-cdn-cf.behance.net/project_modules";
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");

const project = (title: string, desc: string, ts: number, imgs: string) => `<!doctype html><html><head>
<title>${title} on Behance</title>
<meta property="og:title" content="${title} on Behance"><meta property="og:description" content="${desc}">
</head><body>${imgs}<script>window.__DATA__={"project":{"published_on":${ts}}}</script></body></html>`;

test("bookmarklet reads a Behance profile and opens the import preview", async ({ page, baseURL }) => {
  await page.route("https://www.behance.net/**", async (route) => {
    const u = route.request().url();
    if (u.includes("/gallery/111/")) return route.fulfill({ contentType: "text/html", body: project("Stance Branding", "Identity for Stance.", 1767225600,
      `<img src="${CDN}/max_808/aaa.png"><img src="${CDN}/1400/aaa.png" srcset="${CDN}/max_3840/aaa.png 2x"><img src="${CDN}/disp/bbb.jpg"><img src="${CDN}/1400/bbb.jpg">`) });
    if (u.includes("/gallery/222/")) return route.fulfill({ contentType: "text/html", body: project("MealRuns App", "Food delivery app.", 1735689600,
      `<script>var m={"src":"https:\\/\\/mir-s3-cdn-cf.behance.net\\/project_modules\\/fs\\/ccc.webp"}</script>`) });
    return route.fulfill({ contentType: "text/html", body: `<!doctype html><title>Hassan on Behance</title>
      <a href="https://www.behance.net/gallery/111/Stance-Branding?tracking=1">Stance</a>
      <a href="https://www.behance.net/gallery/111/Stance-Branding">dup</a>
      <a href="https://www.behance.net/gallery/222/MealRuns-App">MealRuns</a>` });
  });
  await page.route(`${CDN}/**`, (route) => route.fulfill({ contentType: "image/png", body: PNG }));

  // Log in first so the import page is reachable
  await page.goto("/admin/login");
  await page.getByPlaceholder("Enter username").fill(TEST_ADMIN.username);
  await page.getByPlaceholder("Enter password").fill(TEST_ADMIN.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((u) => u.pathname === "/admin");

  // Setup screen offers the bookmark
  await page.goto("/admin/works/import");
  await expect(page.getByRole("button", { name: "Copy code" })).toBeVisible();

  // "Tap" the bookmark on the fake Behance profile
  await page.goto("https://www.behance.net/hassanokesanjo1");
  const code = decodeURIComponent(behanceBookmarklet(new URL(baseURL!).origin).slice("javascript:".length));
  await page.evaluate(code);
  await page.waitForURL(/\/admin\/works\/import#/, { timeout: 20000 });

  const rows = page.getByTestId("import-row");
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0).getByLabel("Project name")).toHaveValue("Stance Branding");
  await expect(rows.nth(0).getByLabel("Year")).toHaveValue("2026");
  await expect(rows.nth(1).getByLabel("Project name")).toHaveValue("MealRuns App");
  await expect(rows.nth(1).getByLabel("Year")).toHaveValue("2025");

  const srcs = async (i: number) => rows.nth(i).locator("img").evaluateAll((els) => els.map((e) => e.getAttribute("src")));
  expect(await srcs(0)).toEqual([`${CDN}/max_3840/aaa.png`, `${CDN}/1400/bbb.jpg`]); // largest size, no duplicates, 'disp' skipped
  expect(await srcs(1)).toEqual([`${CDN}/fs/ccc.webp`]); // found inside escaped JSON
  await expect(page.getByRole("button", { name: "Import 2 projects" })).toBeEnabled();
  await rows.nth(1).getByLabel("Import MealRuns App").uncheck();
  await expect(page.getByRole("button", { name: "Import 1 project" })).toBeEnabled();
});

test("bookmarklet refuses to run outside Behance", async ({ page, baseURL }) => {
  await page.goto("/");
  const code = decodeURIComponent(behanceBookmarklet(new URL(baseURL!).origin).slice("javascript:".length));
  const dialog = page.waitForEvent("dialog");
  page.evaluate(code).catch(() => {});
  const d = await dialog;
  expect(d.message()).toContain("Open a Behance profile or project page first");
  await d.dismiss();
});
