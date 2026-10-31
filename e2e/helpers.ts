import { expect, type Page, type ConsoleMessage } from "@playwright/test";

/** Ignore only the Vercel Analytics script, which exists solely on Vercel. */
const IGNORED = /_vercel\/insights|_vercel\/speed-insights/;

/** Collects page errors + console errors; call `expectClean()` at the end. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m: ConsoleMessage) => {
    if (m.type() !== "error") return;
    const where = m.location()?.url ?? "";
    if (IGNORED.test(where) || IGNORED.test(m.text())) return;
    errors.push(`console: ${m.text()} @ ${where}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400 && !IGNORED.test(r.url())) errors.push(`HTTP ${r.status()} ${r.url()}`);
  });
  return {
    errors,
    expectClean: () => expect(errors, errors.join("\n")).toEqual([]),
  };
}

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 810;
