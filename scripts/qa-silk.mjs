import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = 'qa-captures/liquid-silk';
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: 'iPhone-14', w: 390, h: 844 },
  { name: 'iPhone-14-Pro-Max', w: 430, h: 932 },
  { name: 'iPad-Portrait', w: 768, h: 1024 },
  { name: 'iPad-Landscape', w: 1024, h: 768 },
  { name: 'MacBook-13', w: 1280, h: 800 },
  { name: 'Desktop-1440', w: 1440, h: 900 },
  { name: 'FHD-1920', w: 1920, h: 1080 },
];

async function run() {
  const browser = await chromium.launch();
  const results = [];

  for (const theme of ['dark', 'light']) {
    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('http://localhost:4321', { waitUntil: 'networkidle' });
      await page.evaluate(t => {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('rubix-theme', t);
        window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: t } }));
      }, theme);

      // Wait for shader initialization and a couple animation frames
      await page.waitForTimeout(600);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      const canvasCount = await page.evaluate(() => document.querySelectorAll('canvas').length);
      const silkCanvas = await page.evaluate(() => {
        const el = document.querySelector('[data-slot="liquid-silk-gradient"] canvas');
        return el ? { w: el.width, h: el.height } : null;
      });

      // 1. Initial Hero Capture
      const initialPath = `${outDir}/${vp.name}-${theme}-initial.png`;
      await page.screenshot({ path: initialPath });

      // 2. Mid-Scroll Capture (scroll down 300px)
      await page.evaluate(() => window.scrollTo(0, 320));
      await page.waitForTimeout(300);
      const midPath = `${outDir}/${vp.name}-${theme}-midscroll.png`;
      await page.screenshot({ path: midPath });

      // 3. Hero Exit Capture (scroll down 650px)
      await page.evaluate(() => window.scrollTo(0, 700));
      await page.waitForTimeout(300);
      const exitPath = `${outDir}/${vp.name}-${theme}-exit.png`;
      await page.screenshot({ path: exitPath });

      results.push({
        viewport: vp.name,
        theme,
        overflow,
        canvasCount,
        silkCanvas,
        consoleErrors: consoleErrors.length,
      });

      console.log(`[QA] ${vp.name} (${theme}): Canvas=${JSON.stringify(silkCanvas)}, Overflow=${overflow}, Errors=${consoleErrors.length}`);
      await page.close();
    }
  }

  // Interactive Theme Switching Check on Desktop
  const themePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await themePage.goto('http://localhost:4321', { waitUntil: 'networkidle' });
  await themePage.waitForTimeout(500);
  // Toggle theme button
  await themePage.click('button[aria-label*="theme" i], [data-theme-toggle], button:has-text("theme")').catch(() => {});
  await themePage.waitForTimeout(400);
  await themePage.screenshot({ path: `${outDir}/theme-switch-transition.png` });
  await themePage.close();

  await browser.close();
  console.log('ALL QA COMPLETED');
}

run().catch(console.error);
