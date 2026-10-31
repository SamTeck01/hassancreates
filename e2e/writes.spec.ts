/**
 * Real write tests: add + delete projects/services, uploads, contact form.
 * They write to the database the server uses, then clean up after themselves
 * (and a safety net removes anything tagged E2E even if a test fails).
 * Cloudinary is a local stand-in (e2e/mock-services.mjs); everything
 * else — routes, auth, validation, DB, admin UI, public pages — is real.
 */
import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import { neon } from "@neondatabase/serverless";
import { TEST_ADMIN, MOCK } from "../playwright.config";
import { trackErrors } from "./helpers";

test.describe.configure({ mode: "serial" });
test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "writes run once (desktop)"));

// Tests that add/delete DB rows only run when explicitly allowed — point
// DATABASE_URL at a Neon *branch*, not production, then set E2E_ALLOW_DB_WRITES=1.
const DB_WRITES = process.env.E2E_ALLOW_DB_WRITES === "1";
const needsDbWrites = () => test.skip(!DB_WRITES, "set E2E_ALLOW_DB_WRITES=1 (use a Neon branch)");

const TAG = `E2E-${Date.now().toString(36)}`;
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

// 1×1 transparent PNG (valid magic bytes)
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByPlaceholder("Enter username").fill(TEST_ADMIN.username);
  await page.getByPlaceholder("Enter password").fill(TEST_ADMIN.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((u) => u.pathname === "/admin");
}
const mockRequests = async (r: APIRequestContext) => (await r.get(`${MOCK}/__requests`)).json();
const resetMock = async (r: APIRequestContext) => r.post(`${MOCK}/__reset`);

test.afterAll(async () => {
  if (!sql || !DB_WRITES) return;
  // Safety net: nothing from this run may be left in the real database.
  await sql`delete from services where title like ${TAG + "%"}`;
  await sql`delete from projects where client_name like ${TAG + "%"}`;
  await sql`delete from messages where name like ${TAG + "%"}`;
});

test.describe("uploads (/api/upload)", () => {
  test("validation + forwarding, as a logged-in admin", async ({ page, request }) => {
    await login(page);
    await resetMock(request);
    const up = (name: string, mimeType: string, buffer: Buffer) =>
      page.request.post("/api/upload", { multipart: { file: { name, mimeType, buffer } } });

    expect((await up("x.txt", "text/plain", Buffer.from("hello"))).status()).toBe(415);         // not an image
    expect((await up("fake.png", "image/png", Buffer.from("not really a png"))).status()).toBe(415); // wrong content
    expect((await up("evil.svg", "image/svg+xml", Buffer.from('<svg><script>alert(1)</script></svg>'))).status()).toBe(415);
    expect((await up("big.png", "image/png", Buffer.concat([PNG, Buffer.alloc(10 * 1024 * 1024)]))).status()).toBe(413);
    expect((await mockRequests(request)).length).toBe(0); // nothing rejected reached Cloudinary

    const ok = await up("ok.png", "image/png", PNG);
    expect(ok.status()).toBe(200);
    const body = await ok.json();
    expect(body.success).toBe(true);
    expect(body.url).toMatch(/^https:\/\/res\.cloudinary\.com\//);
    const sent = await mockRequests(request);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ service: "cloudinary", url: "/v1_1/e2e-cloud/image/upload", preset: "e2e-preset", folder: "hassancreates", hasFile: true });
  });

  test("rejected without login", async ({ request }) => {
    const r = await request.post("/api/upload", { multipart: { file: { name: "ok.png", mimeType: "image/png", buffer: PNG } } });
    expect(r.status()).toBe(401);
  });
});

test.describe("services: add → shows on site → delete", () => {
  test("full lifecycle through the admin UI", async ({ page, request }) => {
    needsDbWrites();
    const t = trackErrors(page);
    const before = await (await request.get("/api/services")).json();
    const title = `${TAG} Service`;

    await login(page);
    await page.goto("/admin/services", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "+ Add Service" }).click();
    const modal = page.locator("form").filter({ has: page.getByRole("button", { name: "Add Service", exact: true }) });
    await modal.locator("input").first().fill(title);
    await modal.locator("textarea").first().fill("Created by the automated test suite.");
    await modal.locator('input[type="file"]').first().setInputFiles({ name: "p1.png", mimeType: "image/png", buffer: PNG });
    await expect(modal.getByText(".png").first()).toBeVisible(); // uploaded preview chip
    await modal.getByRole("button", { name: "Add Service", exact: true }).click();
    await expect(page.getByText(title).first()).toBeVisible();

    // Persisted + public
    const mid = await (await request.get("/api/services")).json();
    const created = mid.find((s: { title: string }) => s.title === title);
    expect(created, "service saved to DB").toBeTruthy();
    expect(created.image1).toMatch(/^https:\/\/res\.cloudinary\.com\//);
    expect(created.num).toBe(String(before.length + 1).padStart(2, "0"));
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByText(title).first()).toBeAttached();

    // Delete
    await page.goto("/admin/services", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: `Delete ${title}` }).click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByText(title)).toHaveCount(0);
    expect(await (await request.get("/api/services")).json()).toEqual(before);
    t.expectClean();
  });
});

test.describe("projects: add with uploads → shows on site → delete", () => {
  test("full lifecycle through the admin UI", async ({ page, request }) => {
    needsDbWrites();
    const t = trackErrors(page);
    const before = await (await request.get("/api/projects")).json();
    const name = `${TAG} Project`;

    await login(page);
    await page.goto("/admin/works", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Upload Project|Add Project|\+ /i }).first().click();
    const form = page.locator("form").filter({ has: page.getByRole("button", { name: "Upload Project" }) });
    await form.getByPlaceholder(/./).first().fill(name);
    const fill = async (label: string, value: string) =>
      form.locator("div", { has: page.locator("label", { hasText: label }) }).locator("input, textarea").first().fill(value);
    await fill("Year *", "2026");
    await fill("Role *", "Lead Designer");
    await fill("URL / Href *", "https://example.com");
    await fill("Services (comma-separated)", "Branding, Web");
    await fill("Description *", "Created by the automated test suite.");
    await fill("Tagline *", "Test tagline.");
    await form.locator('input[type="file"]').first().setInputFiles({ name: "cover.png", mimeType: "image/png", buffer: PNG });
    await expect(form.getByText(/\.png/).first()).toBeVisible();
    await form.getByRole("button", { name: "Upload Project" }).click();
    await expect(page.getByText(name).first()).toBeVisible({ timeout: 15000 });

    const mid = await (await request.get("/api/projects")).json();
    const created = mid.find((p: { clientName: string }) => p.clientName === name);
    expect(created, "project saved to DB").toBeTruthy();
    expect(created.coverImage).toMatch(/^https:\/\/res\.cloudinary\.com\//);

    // Public site: new card + its gallery
    await page.goto("/", { waitUntil: "networkidle" });
    const btn = page.getByRole("button", { name: `Open ${name} gallery` });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await expect(page.getByRole("dialog").getByRole("heading", { level: 1 })).toHaveText(name);
    await page.keyboard.press("Escape");

    // Delete
    await page.goto("/admin/works", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: `Delete ${name}` }).click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByText(name)).toHaveCount(0);
    expect(await (await request.get("/api/projects")).json()).toEqual(before);
    t.expectClean();
  });
});

test.describe("contact form: real submit → DB → inbox → delete", () => {
  test("end to end; HTML in a message shows as plain text", async ({ page }) => {
    needsDbWrites();
    const name = `${TAG} <b>Visitor</b>`;
    const message = `Hi Hassan!\n<a href="https://evil.example">click me</a>`;

    await page.goto("/#contact", { waitUntil: "networkidle" });
    await page.getByPlaceholder("Enter your Name").fill(name);
    await page.getByPlaceholder("Enter the Email").fill("visitor@example.com");
    await page.getByPlaceholder("Type Here...").fill(message);
    await page.locator('#contact button[type="submit"]').click();
    await expect(page.getByText("Message sent!")).toBeVisible();

    // Saved to the real DB and visible in the admin inbox
    await login(page);
    await page.goto("/admin/inbox", { waitUntil: "networkidle" });
    const row = page.getByText(name).first();
    await expect(row).toBeVisible();
    await row.click();
    // Shown as literal text in the inbox, never rendered as a real link
    await expect(page.getByText('<a href="https://evil.example">click me</a>', { exact: false }).first()).toBeVisible();
    await expect(page.locator('a[href="https://evil.example"]')).toHaveCount(0);
    await page.getByRole("button", { name: /Mark (un)?read/ }).click();
    await page.getByRole("button", { name: "Delete message" }).click();
    await expect(page.getByText(name)).toHaveCount(0);
    if (sql) expect((await sql`select count(*)::int as n from messages where name like ${TAG + "%"}`)[0].n).toBe(0);
  });

  test("bad input and overlong fields rejected", async ({ request }) => {
    const post = (data: object) => request.post("/api/contact", { data });
    expect((await post({ name: "", email: "a@b.co", description: "x" })).status()).toBe(400);
    expect((await post({ name: "A", email: "nope", description: "x" })).status()).toBe(400);
    expect((await post({ name: "A".repeat(201), email: "a@b.co", description: "x" })).status()).toBe(400);
    expect((await post({ name: "A", email: "a@b.co", description: "x".repeat(5001) })).status()).toBe(400);
    expect((await post({ name: ["array"], email: "a@b.co", description: "x" })).status()).toBe(400);
  });
});
