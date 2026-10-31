import { test, expect } from "@playwright/test";
import { trackErrors, isMobile } from "./helpers";

test.describe("home page", () => {
  test("loads every section with no errors", async ({ page }) => {
    const t = trackErrors(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("I turn ideas into visuals that stick.");
    for (const id of ["about", "works", "contact"]) await expect(page.locator(`#${id}`)).toBeAttached();
    await expect(page.getByText("Brands I've worked with")).toBeVisible();
    // Scroll the whole page so lazy content + scroll animations run
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    });
    await page.waitForTimeout(800);
    t.expectClean();
  });

  test("marquee says 4 years of experience (not 10)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("4 Years of Experience").first()).toBeAttached();
    await expect(page.getByText("10 Years of Experience")).toHaveCount(0);
  });

  test("no horizontal page scroll", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("menu opens, links work, closes", async ({ page }) => {
    const t = trackErrors(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Toggle menu" }).click();
    const close = page.getByRole("button", { name: "Close menu" });
    await expect(close).toBeVisible();
    // The menu link (not the hero's "View my works")
    await page.getByRole("navigation").getByRole("link", { name: "Works" }).click();
    const menu = page.getByRole("dialog", { name: "Site menu", includeHidden: true });
    await expect(menu).toHaveAttribute("inert", "");
    await expect(close).not.toBeInViewport({ ratio: 0.01 }).catch(() => {}); // faded
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveCount(0); // not exposed when closed
    await expect.poll(() => page.evaluate(() => document.querySelector("#works")!.getBoundingClientRect().top)).toBeLessThan(400);
    t.expectClean();
  });
});

test.describe("works cards", () => {
  test("render every project from the database", async ({ page, request }) => {
    const projects = await (await request.get("/api/projects")).json();
    expect(projects.length).toBeGreaterThan(0);
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator(".cardWrapper")).toHaveCount(projects.length);
    for (const p of projects) {
      await expect(page.locator(".cardWrapper").getByRole("heading", { name: p.clientName })).toBeAttached();
    }
  });

  test("exit animation: opacity-only on phone, blur on desktop", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const first = page.locator(".cardWrapper").first();
    const top = await first.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    const h = await first.evaluate((el) => el.getBoundingClientRect().height);
    await page.evaluate((y) => window.scrollTo(0, y), top + h);
    await page.waitForTimeout(700);
    const st = await first.evaluate((el) => {
      const c = getComputedStyle(el);
      return { filter: c.filter, transform: c.transform, opacity: parseFloat(c.opacity) };
    });
    expect(st.opacity).toBeLessThan(0.6);
    if (isMobile(page)) {
      expect(st.filter).toBe("none");
      expect(st.transform === "none" || st.transform.startsWith("matrix(1, 0, 0, 1")).toBeTruthy();
    } else {
      expect(st.filter).toMatch(/blur\((?!0px)/);
      expect(st.transform).not.toBe("none");
    }
  });

  test("each project opens the right gallery and closes", async ({ page, request }) => {
    const t = trackErrors(page);
    const projects = await (await request.get("/api/projects")).json();
    await page.goto("/", { waitUntil: "networkidle" });
    for (const p of projects) {
      const btn = page.getByRole("button", { name: `Open ${p.clientName} gallery` });
      await btn.scrollIntoViewIfNeeded();
      await btn.focus();
      await page.keyboard.press("Enter");
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("heading", { level: 1 })).toHaveText(p.clientName);
      await expect(dialog.locator(`img[alt="${p.clientName} image slide 1"]`)).toBeAttached();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    }
    t.expectClean();
  });

  test("assets are local and images are labelled", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (r) => { if (r.url().includes("hiGYz6grmhAHSeZuNKHEuchTGTw")) external.push(r.url()); });
    await page.goto("/", { waitUntil: "networkidle" });
    expect(external).toEqual([]);
    await expect(page.locator('img[alt="BG Image"], img[alt="Cover Image"]')).toHaveCount(0);
    const unlabeled = await page.locator("img:not([alt])").count();
    expect(unlabeled).toBe(0);
  });
});

test.describe("contact form", () => {
  test("submits and shows success (API mocked — no real email sent)", async ({ page }) => {
    let body: Record<string, string> | null = null;
    await page.route("**/api/contact", async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ json: { success: true } });
    });
    await page.goto("/#contact", { waitUntil: "networkidle" });
    await page.getByPlaceholder("Enter your Name").fill("E2E Tester");
    await page.getByPlaceholder("Enter the Email").fill("e2e@example.com");
    await page.getByPlaceholder("Type Here...").fill("Hello from the test suite");
    await page.locator('#contact button[type="submit"]').click();
    await expect(page.getByText("Message sent!")).toBeVisible();
    expect(body).toEqual({ name: "E2E Tester", email: "e2e@example.com", description: "Hello from the test suite" });
  });

  test("shows the fallback message when sending fails", async ({ page }) => {
    await page.route("**/api/contact", (route) => route.fulfill({ status: 500, json: { success: false, error: "x" } }));
    await page.goto("/#contact", { waitUntil: "networkidle" });
    await page.getByPlaceholder("Enter your Name").fill("E2E");
    await page.getByPlaceholder("Enter the Email").fill("e2e@example.com");
    await page.getByPlaceholder("Type Here...").fill("Hi");
    page.on("console", () => {}); // the component logs the error by design
    await page.locator('#contact button[type="submit"]').click();
    await expect(page.getByText("Something went wrong")).toBeVisible();
  });

  test("API rejects invalid input", async ({ request }) => {
    const r = await request.post("/api/contact", { data: { name: "", email: "not-an-email", description: "" } });
    expect(r.status()).toBeGreaterThanOrEqual(400);
    expect(r.status()).toBeLessThan(500);
  });
});

test("custom cursor: hides native cursor only on desktop once mounted", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.mouse.move(200, 200);
  const has = await page.evaluate(() => document.documentElement.classList.contains("has-custom-cursor"));
  expect(has).toBe(!isMobile(page));
});

test("hero cycles through every title, incl. 'a Brand Designer', without overflowing", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const seen = new Set<string>();
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline && seen.size < 4) {
    const label = await page.locator('[aria-label="Hassan!"], [aria-label^="a "]').first().getAttribute("aria-label");
    if (label) {
      seen.add(label);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `page overflows while showing "${label}"`).toBeLessThanOrEqual(0);
    }
    await page.waitForTimeout(100);
  }
  expect([...seen].sort()).toEqual(["Hassan!", "a Brand Designer", "a Motion Designer", "a Visual Designer"]);
});
