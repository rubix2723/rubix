import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = 'E:\\rubix-studio\\qa-captures\\floating-hero-pass';
const BASE_URL = 'http://localhost:4321';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'iPhone-14', width: 390, height: 844 },
  { name: 'iPhone-14-Pro-Max', width: 430, height: 932 },
  { name: 'iPad-Portrait', width: 768, height: 1024 },
  { name: 'iPad-Landscape', width: 1024, height: 768 },
  { name: 'MacBook-13', width: 1280, height: 800 },
  { name: 'Desktop-1440', width: 1440, height: 900 },
  { name: 'FHD-Desktop-1920', width: 1920, height: 1080 },
];

async function runAudit() {
  console.log('🛸 Starting Floating Glass Navbar & Clean Hero Polish QA...\n');
  const browser = await chromium.launch({ headless: true });

  const results = {
    floatingNavbar: {},
    heroBackground: {},
    themeToggle: {},
    viewports: [],
    consoleErrors: [],
  };

  for (const theme of ['dark', 'light']) {
    console.log(`\n=== Auditing ${theme.toUpperCase()} THEME ===`);

    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        results.consoleErrors.push({ theme, text: msg.text() });
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('rubix-theme', t);
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: t } }));
    }, theme);

    await page.waitForTimeout(300);

    // 1. Inspect Floating Navbar
    const capsuleBox = await page.locator('[data-nav-capsule]').boundingBox();
    console.log(`Navbar Capsule Bounding Box (${theme}):`, capsuleBox);
    results.floatingNavbar[theme] = {
      capsuleBox,
      isFloating: capsuleBox ? capsuleBox.y > 10 && capsuleBox.y < 35 : false,
      isContained: capsuleBox ? capsuleBox.width < 1440 - 32 : false,
    };

    // 2. Inspect Hero Background (confirm NO mercury canvas, NO bounded square panel)
    const mercuryCanvas = await page.locator('#hero-section canvas').count();
    const mercuryContainer = await page.locator('[data-hero-mercury]').count();
    console.log(`Hero Mercury Canvas count (${theme}):`, mercuryCanvas);
    console.log(`Hero Mercury Container count (${theme}):`, mercuryContainer);
    results.heroBackground[theme] = {
      mercuryCanvasCount: mercuryCanvas,
      mercuryContainerCount: mercuryContainer,
      cleanCanvas: mercuryCanvas === 0 && mercuryContainer === 0,
    };

    // 3. Verify Hero Heading Text
    const h1Text = await page.locator('#hero-section h1').innerText();
    console.log(`Hero H1 Text (${theme}):\n${h1Text.trim()}`);

    // Capture Hero + Floating Navbar
    await page.screenshot({
      path: path.join(OUTPUT_DIR, `hero-floating-navbar-${theme}.png`),
      clip: { x: 0, y: 0, width: 1440, height: 850 },
    });

    // 4. Test Scroll Behavior
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, `scrolled-floating-navbar-${theme}.png`),
      clip: { x: 0, y: 0, width: 1440, height: 400 },
    });

    await context.close();
  }

  // 5. Test Responsive Viewports
  console.log('\n=== Testing Responsive Viewport Matrix ===');
  for (const vp of VIEWPORTS) {
    for (const theme of ['dark', 'light']) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();

      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.evaluate((t) => {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('rubix-theme', t);
        window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: t } }));
      }, theme);
      await page.waitForTimeout(200);

      // Check for horizontal overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      const shotPath = path.join(OUTPUT_DIR, `${vp.name}-${theme}.png`);
      await page.screenshot({
        path: shotPath,
        clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 800) },
      });

      results.viewports.push({
        name: vp.name,
        width: vp.width,
        height: vp.height,
        theme,
        overflow,
        shotPath,
      });

      console.log(`✓ [${vp.name}] ${theme.toUpperCase()} (overflow: ${overflow})`);

      // If mobile, also test mobile menu open
      if (vp.width <= 768 && theme === 'dark' && vp.name === 'iPhone-14') {
        const menuBtn = page.locator('#mobile-menu-toggle');
        if (await menuBtn.isVisible()) {
          await menuBtn.click();
          await page.waitForTimeout(200);
          await page.screenshot({
            path: path.join(OUTPUT_DIR, `mobile-menu-open-${theme}.png`),
          });
          console.log(`✓ [iPhone-14] Mobile menu open captured`);
        }
      }

      await context.close();
    }
  }

  await browser.close();

  fs.writeFileSync(path.join(OUTPUT_DIR, 'qa-summary.json'), JSON.stringify(results, null, 2));
  console.log(`\n🎉 Visual QA Complete. Results saved to ${OUTPUT_DIR}`);
}

runAudit().catch(console.error);
