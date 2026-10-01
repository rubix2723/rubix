import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('E:/rubix-studio/dist');
const screenshotsDir = path.resolve('E:/rubix-studio/screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Simple static server for dist
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

let server = null;
const isPortBusy = await fetch('http://localhost:4321').then(() => true).catch(() => false);

if (!isPortBusy) {
  server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(distDir, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  await new Promise((resolve) => server.listen(4321, resolve));
  console.log('Static test server listening on http://localhost:4321');
} else {
  console.log('Reusing active preview server on http://localhost:4321');
}

const viewports = [
  { name: 'mobile-375x667', width: 375, height: 667 },
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'mobile-430x932', width: 430, height: 932 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'tablet-1024x768', width: 1024, height: 768 },
  { name: 'desktop-1280x800', width: 1280, height: 800 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'wide-1920x1080', width: 1920, height: 1080 },
];

const browser = await chromium.launch();
const results = [];

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  
  const consoleMessages = [];
  page.on('console', (msg) => consoleMessages.push(msg.text()));
  page.on('pageerror', (err) => consoleMessages.push(`PAGE ERROR: ${err.message}`));

  await page.goto('http://localhost:4321', { waitUntil: 'networkidle' });

  // Evaluate metrics
  const evaluation = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const spans = h1 ? Array.from(h1.querySelectorAll('span.hero-line')).map((s) => ({
      text: s.textContent.trim(),
      width: s.getBoundingClientRect().width,
      height: s.getBoundingClientRect().height,
      fontSize: window.getComputedStyle(s).fontSize,
      fontWeight: window.getComputedStyle(s).fontWeight,
      color: window.getComputedStyle(s).color,
    })) : [];

    const cta = document.querySelector('.hero-cta');
    const ctaBox = cta ? cta.getBoundingClientRect() : null;

    const navLinks = Array.from(document.querySelectorAll('nav[aria-label="Primary navigation"] a')).map((a) => a.textContent.trim());

    const hasHorizontalOverflow = document.documentElement.scrollWidth > window.innerWidth;

    // Check fold visibility of section 01
    const workSection = document.getElementById('work');
    const workBox = workSection ? workSection.getBoundingClientRect() : null;
    const isWorkVisibleInFold = workBox ? workBox.top < window.innerHeight : false;

    return {
      h1Count: document.querySelectorAll('h1').length,
      spans,
      hasHorizontalOverflow,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      ctaBox: ctaBox ? { width: ctaBox.width, height: ctaBox.height, top: ctaBox.top } : null,
      navLinks,
      isWorkVisibleInFold,
      workTop: workBox ? workBox.top : null,
      windowHeight: window.innerHeight,
    };
  });

  // Capture screenshot
  const screenshotPath = path.join(screenshotsDir, `${vp.name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });

  // Test mobile menu if on mobile
  let mobileMenuTested = false;
  if (vp.width < 768) {
    const toggle = page.locator('#mobile-menu-toggle');
    const menu = page.locator('#mobile-menu');
    await toggle.click();
    const isMenuVisible = await menu.isVisible();
    const ariaExpanded = await toggle.getAttribute('aria-expanded');
    mobileMenuTested = isMenuVisible && ariaExpanded === 'true';
    await page.screenshot({ path: path.join(screenshotsDir, `${vp.name}-menu-open.png`) });
    await toggle.click(); // Close
  }

  results.push({
    viewport: vp.name,
    ...evaluation,
    mobileMenuTested,
    consoleErrors: consoleMessages.filter((m) => m.includes('ERROR')),
  });

  await page.close();
}

// Measure performance timings
const perfPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await perfPage.goto('http://localhost:4321', { waitUntil: 'load' });
const perfMetrics = await perfPage.evaluate(() => {
  const nav = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByType('paint');
  const fcp = paint.find((p) => p.name === 'first-contentful-paint')?.startTime || 0;
  return {
    domContentLoaded: nav ? nav.domContentLoadedEventEnd - nav.startTime : 0,
    loadEvent: nav ? nav.loadEventEnd - nav.startTime : 0,
    fcp,
  };
});
await perfPage.close();

await browser.close();
if (server) server.close();

console.log('=== VISUAL QA & AUDIT RESULTS ===');
console.log(JSON.stringify({ results, perfMetrics }, null, 2));
