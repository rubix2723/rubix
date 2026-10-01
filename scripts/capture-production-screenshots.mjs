import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const screenshotsDir = path.resolve('E:/rubix-studio/screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const browser = await chromium.launch();

async function captureViewport(name, width, height, openMenu = false) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto('http://localhost:4321', { waitUntil: 'networkidle' });
  
  // Wait for all web fonts to load
  await page.evaluate(() => document.fonts.ready);
  
  // Wait for entrance animations to finish completely
  await page.waitForTimeout(800);
  
  // Enforce scroll position 0
  await page.evaluate(() => window.scrollTo(0, 0));

  if (openMenu) {
    const toggle = page.locator('#mobile-menu-toggle');
    await toggle.click();
    await page.waitForTimeout(300); // Allow drawer expansion transition
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  const filePath = path.join(screenshotsDir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`Captured: ${filePath}`);
  await page.close();
}

console.log('Capturing production-style screenshots from http://localhost:4321 ...');

// 1. Mobile 390x844 — hero closed
await captureViewport('390x844-hero-closed', 390, 844, false);

// 2. Mobile 390x844 — navigation open
await captureViewport('390x844-navigation-open', 390, 844, true);

// 3. Desktop 1440x900 — hero
await captureViewport('1440x900-hero', 1440, 900, false);

// 4. Wide Desktop 1920x1080 — hero
await captureViewport('1920x1080-hero', 1920, 1080, false);

await browser.close();
console.log('All requested screenshots captured successfully.');
