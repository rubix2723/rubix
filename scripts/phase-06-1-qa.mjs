import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('E:/rubix-studio/dist');
const outDir = path.resolve('E:/rubix-studio/screenshots/phase-06.1');
const brainScreenshotsDir = path.resolve('C:/Users/samee/.gemini/antigravity-cli/brain/b82e5286-a059-437d-90eb-c5440400b705/screenshots');
const distScreenshotsDir = path.resolve('E:/rubix-studio/dist/screenshots');
const publicScreenshotsDir = path.resolve('E:/rubix-studio/public/screenshots');

[outDir, brainScreenshotsDir, distScreenshotsDir, publicScreenshotsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
};

// Check if port 4321 is serving
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
  console.log('✓ Test server active on http://localhost:4321');
} else {
  console.log('✓ Reusing server on http://localhost:4321');
}

const browser = await chromium.launch();

try {
  // 1. ANCHOR OFFSET CHECK (1440x900)
  console.log('\n--- 1. ANCHOR & STICKY NAV OVERLAP CHECK ---');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    // Click "View selected work" CTA in Hero
    const cta = page.getByRole('link', { name: 'View selected work' });
    await cta.click();
    await page.waitForTimeout(600); // smooth scroll allowance

    const workSection = page.locator('#work');
    const box = await workSection.boundingBox();
    const nav = page.locator('header');
    const navBox = await nav.boundingBox();

    console.log(`Sticky Navbar bottom: ${navBox.y + navBox.height}px`);
    console.log(`Work Section top after click: ${box.y}px`);
    const clearance = box.y - (navBox.y + navBox.height);
    console.log(`Clearance below navbar: ${clearance}px`);
    if (clearance >= 16) {
      console.log('✓ PASS: Work heading has healthy clearance below sticky nav.');
    } else {
      console.error(`✗ FAIL: Clearance is only ${clearance}px, potential header overlap.`);
    }
    await page.close();
  }

  // 2. RESPONSIVE VIEWPORT & HORIZONTAL OVERFLOW CHECK
  console.log('\n--- 2. HORIZONTAL OVERFLOW & TOUCH TARGET CHECK ---');
  const viewportsToCheck = [
    { name: '375x667', width: 375, height: 667 },
    { name: '390x844', width: 390, height: 844 },
    { name: '430x932', width: 430, height: 932 },
    { name: '1440x900', width: 1440, height: 900 },
    { name: '1920x1080', width: 1920, height: 1080 },
  ];

  for (const vp of viewportsToCheck) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    console.log(`Viewport ${vp.name}: overflow = ${overflow ? 'FAIL' : 'PASS (0 horizontal scroll)'}`);

    if (vp.width <= 430) {
      // Check touch target heights of project links
      const linkHeights = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('#work article a'));
        return links.map(a => {
          const rect = a.getBoundingClientRect();
          return rect.height;
        });
      });
      const allAccessible = linkHeights.every(h => h >= 44);
      console.log(`  Touch targets (min 44px): ${allAccessible ? 'PASS' : 'WARN'} (heights: ${linkHeights.map(h => Math.round(h)).join(', ')})`);
    }

    await page.close();
  }

  // 3. CAPTURE REQUIRED PRODUCTION SCREENSHOTS
  console.log('\n--- 3. CAPTURING REQUIRED SCREENSHOTS ---');

  // A. 390x844 — full mobile Selected Work sequence
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto('http://localhost:4321/#work');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const workSection = page.locator('#work');
    const outPath = path.join(outDir, 'A-mobile-390x844-work-sequence.png');
    await workSection.screenshot({ path: outPath });
    console.log(`✓ Captured: ${outPath}`);
    await page.close();
  }

  // Desktop Viewport (1440x900) Captures
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // B. 1440x900 — Project 01
    const p1 = page.locator('.project-featured');
    await p1.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const p1Path = path.join(outDir, 'B-project-01-rubix-luxury-1440x900.png');
    await p1.screenshot({ path: p1Path });
    console.log(`✓ Captured: ${p1Path}`);

    // C. 1440x900 — Projects 02 + 03 (Split layouts)
    const p2 = page.locator('.project-split').first();
    await p2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const splitsPath = path.join(outDir, 'C-projects-02-03-splits-1440x900.png');
    await page.screenshot({ path: splitsPath });
    console.log(`✓ Captured: ${splitsPath}`);

    // D. 1440x900 — Projects 04 + 05 (Pair)
    const pair = page.locator('.project-pair');
    await pair.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const pairPath = path.join(outDir, 'D-projects-04-05-pair-1440x900.png');
    await pair.screenshot({ path: pairPath });
    console.log(`✓ Captured: ${pairPath}`);

    // E. 1440x900 — Project 06 (Ledger)
    const ledger = page.locator('.project-ledger');
    await ledger.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const ledgerPath = path.join(outDir, 'E-project-06-ledger-1440x900.png');
    await ledger.screenshot({ path: ledgerPath });
    console.log(`✓ Captured: ${ledgerPath}`);

    await page.close();
  }

  // F. 1920x1080 — Project 01
  {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const p1 = page.locator('.project-featured');
    await p1.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const p1WidePath = path.join(outDir, 'F-wide-1920x1080-project-01.png');
    await p1.screenshot({ path: p1WidePath });
    console.log(`✓ Captured: ${p1WidePath}`);

    await page.close();
  }

  // Copy captured screenshots to brain directory, dist/screenshots, and public/screenshots
  const files = fs.readdirSync(outDir);
  for (const f of files) {
    const srcF = path.join(outDir, f);
    fs.copyFileSync(srcF, path.join(brainScreenshotsDir, f));
    fs.copyFileSync(srcF, path.join(distScreenshotsDir, f));
    fs.copyFileSync(srcF, path.join(publicScreenshotsDir, f));
  }
  console.log(`✓ Synced ${files.length} screenshots to dist, public, and brain storage.`);

} finally {
  await browser.close();
  if (server) {
    server.close();
    console.log('Closed test server.');
  }
}
