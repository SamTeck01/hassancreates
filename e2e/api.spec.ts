import { test, expect } from "@playwright/test";

test("GET /api/projects returns sorted projects", async ({ request }) => {
  const r = await request.get("/api/projects");
  expect(r.ok()).toBeTruthy();
  const list = await r.json();
  expect(Array.isArray(list) && list.length > 0).toBeTruthy();
  const nums = list.map((p: { number: string }) => p.number);
  expect(nums).toEqual([...nums].sort());
  for (const p of list) for (const k of ["id", "clientName", "coverImage", "bgImage"]) expect(p[k], k).toBeTruthy();
});

test("GET /api/services returns services", async ({ request }) => {
  const r = await request.get("/api/services");
  expect(r.ok()).toBeTruthy();
  const list = await r.json();
  expect(list.length).toBeGreaterThan(0);
  for (const s of list) for (const k of ["id", "num", "title", "description"]) expect(s[k], k).toBeTruthy();
});

test("admin pages + upload require login", async ({ request }) => {
  for (const path of ["/admin", "/admin/works", "/admin/services", "/admin/inbox"]) {
    const r = await request.get(path, { maxRedirects: 0 });
    expect([302, 303, 307, 308], path).toContain(r.status());
    expect(r.headers()["location"], path).toContain("/admin/login");
  }
  const up = await request.post("/api/upload", { multipart: { file: { name: "x.png", mimeType: "image/png", buffer: Buffer.from("x") } } });
  expect(up.status()).toBe(401);
});

test("wrong admin password is rejected", async ({ request }) => {
  const r = await request.post("/api/admin/login", { data: { username: "nope", password: "nope" }, headers: { "x-forwarded-for": "10.9.9.9" } });
  expect(r.status()).toBe(401);
});

test("unknown page returns 404", async ({ request }) => {
  expect((await request.get("/this-page-does-not-exist")).status()).toBe(404);
});
