import { test, expect, type Page } from "@playwright/test";
import { TEST_ADMIN } from "../playwright.config";
import { trackErrors } from "./helpers";

// Admin tests write to the real database, so only run them once (desktop),
// and only as no-op edits: every value is saved back unchanged.
test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "desktop only"));

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByPlaceholder("Enter username").fill(TEST_ADMIN.username);
  await page.getByPlaceholder("Enter password").fill(TEST_ADMIN.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((u) => u.pathname === "/admin", { timeout: 15000 });
}

test("login, visit every admin page, logout", async ({ page }) => {
  const t = trackErrors(page);
  await login(page);
  for (const path of ["/admin/works", "/admin/services", "/admin/inbox", "/admin"]) {
    const r = await page.goto(path, { waitUntil: "networkidle" });
    expect(r?.status(), path).toBe(200);
    expect(page.url()).toContain(path);
  }
  await page.getByRole("button", { name: "Sign out" }).first().click();
  await page.waitForURL(/\/admin\/login/);
  const r = await page.goto("/admin/works");
  expect(page.url()).toContain("/admin/login");
  expect(r?.status()).toBe(200);
  t.expectClean();
});

test("editing a service saves (regression: 'Service number is required')", async ({ page, request }) => {
  const before = await (await request.get("/api/services")).json();
  const t = trackErrors(page);
  await login(page);
  await page.goto("/admin/services", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Edit", exact: true }).first().click();
  await expect(page.getByText(/^Edit: /)).toBeVisible();
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByText("Service number is required")).toHaveCount(0);
  await expect(page.getByText(/^Edit: /)).toBeHidden({ timeout: 10000 });
  const after = await (await request.get("/api/services")).json();
  expect(after).toEqual(before); // no-op edit left data unchanged
  t.expectClean();
});

test("editing a project saves", async ({ page, request }) => {
  const before = await (await request.get("/api/projects")).json();
  const t = trackErrors(page);
  await login(page);
  await page.goto("/admin/works", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Edit", exact: true }).first().click();
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByRole("button", { name: "Save Changes" })).toBeHidden({ timeout: 10000 });
  const after = await (await request.get("/api/projects")).json();
  expect(after).toEqual(before);
  t.expectClean();
});

test("drafts persist in the browser and can be discarded", async ({ page }) => {
  await login(page);
  await page.goto("/admin/services", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Add Service/ }).first().click();
  await page.getByLabel("Title *").fill("E2E Draft Service");
  await page.getByLabel("Description *").fill("Draft description");
  await page.getByRole("button", { name: "Save Draft" }).click();
  await expect(page.getByText("E2E Draft Service")).toBeVisible();
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByText("E2E Draft Service")).toBeVisible();
  await page.getByRole("button", { name: "Discard draft" }).click();
  await expect(page.getByText("E2E Draft Service")).toHaveCount(0);
});
