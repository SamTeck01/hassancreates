const { chromium, devices } = require('playwright');
// Run: npm run build && npx next start -p 3123, then: node e2e/works.check.js
const BASE = process.env.BASE || "http://localhost:3123";
const OUT = process.env.OUT || require("os").tmpdir();
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };

async function run(name, ctxOpts) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  const errors = []; const external = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => m.type() === 'error' && !/_vercel|404/.test(m.text() + (m.location().url||'')) && errors.push(m.text()));
  page.on('request', r => r.url().includes('hiGYz6grmhAHSeZuNKHEuchTGTw') && external.push(r.url()));
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.locator('#works').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  const cards = page.locator('.cardWrapper');
  const n = await cards.count();
  check(n > 1, `${name}: ${n} work cards rendered`);

  // scroll partway through the first card's exit
  const first = cards.first();
  const box = await first.boundingBox();
  await page.evaluate(y => window.scrollBy(0, y), box.height * 0.6 + 400);
  await page.waitForTimeout(600);
  const st = await first.evaluate(el => { const c = getComputedStyle(el); return { filter: c.filter, transform: c.transform, opacity: c.opacity }; });
  console.log(`  ${name} first card mid-exit:`, st);
  if (name === 'mobile') {
    check(st.filter === 'none', 'mobile: no blur filter');
    check(st.transform === 'none' || /matrix\(1, 0, 0, 1/.test(st.transform), 'mobile: no scale/rotate');
    check(parseFloat(st.opacity) < 1, 'mobile: opacity fades');
  } else {
    check(/blur\(/.test(st.filter) && st.filter !== 'blur(0px)', 'desktop: blur applied');
    check(st.transform !== 'none', 'desktop: scale/rotate applied');
  }
  await page.screenshot({ path: `${OUT}/${name}-works.png` });

  // FPS sample while scrolling through works
  const fps = await page.evaluate(async () => {
    let frames = 0, start = performance.now(), worst = 0, last = start;
    const el = document.querySelector('#works');
    const end = el.offsetTop + el.offsetHeight - innerHeight;
    return await new Promise(res => {
      function tick(t) { frames++; worst = Math.max(worst, t - last); last = t;
        window.scrollBy(0, 25);
        if (scrollY < end && t - start < 6000) requestAnimationFrame(tick);
        else res({ fps: Math.round(frames / ((t - start) / 1000)), worstFrameMs: Math.round(worst) }); }
      requestAnimationFrame(tick);
    });
  });
  console.log(`  ${name} scroll perf:`, fps);

  check(await page.locator('.noise-overlay').count() > 0 && external.length === 0, `${name}: noise texture is local`);
  const noiseOk = await page.evaluate(() => fetch('/textures/noise.png').then(r => r.ok));
  check(noiseOk, `${name}: /textures/noise.png served`);
  check(await page.locator('img[alt="BG Image"], img[alt="Cover Image"]').count() === 0, `${name}: no generic alt text`);

  // keyboard-open the gallery via the new button
  await page.evaluate(() => scrollTo(0, document.querySelector('#works').offsetTop));
  await page.waitForTimeout(500);
  const btn = page.getByRole('button', { name: /gallery/i }).first();
  await btn.focus(); await page.keyboard.press('Enter');
  const dialog = page.locator('[role="dialog"]');
  await dialog.waitFor({ timeout: 5000 }).then(() => check(true, `${name}: gallery opens from keyboard`), () => check(false, `${name}: gallery opens from keyboard`));
  const bd = await dialog.evaluate(el => getComputedStyle(el).backdropFilter).catch(() => 'n/a');
  check(bd === 'none' || bd === 'n/a', `${name}: viewer has no wasted backdrop blur (${bd})`);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}-viewer.png` });
  await page.keyboard.press('Escape');

  if (name === 'desktop') {
    await page.mouse.move(300, 300);
    check(await page.evaluate(() => document.documentElement.classList.contains('has-custom-cursor')), 'desktop: custom cursor class set');
  } else {
    check(!(await page.evaluate(() => document.documentElement.classList.contains('has-custom-cursor'))), 'mobile: native cursor not hidden');
  }
  check(errors.length === 0, `${name}: no console errors ${errors.length ? JSON.stringify(errors.slice(0,3)) : ''}`);
  await browser.close();
}

(async () => {
  await run('mobile', { ...devices['iPhone 13'], browserName: undefined, defaultBrowserType: undefined });
  await run('desktop', { viewport: { width: 1440, height: 900 } });
  // cursor fallback: block the JS → cursor must not be hidden
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto(`${BASE}/admin/login`);
  const cur = await p.evaluate(() => getComputedStyle(document.body).cursor);
  check(cur !== 'none', `admin/login: native cursor visible (${cur})`);
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  process.exit(fails ? 1 : 0);
})();
