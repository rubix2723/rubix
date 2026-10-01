import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = 'E:\\rubix-studio\\qa-captures\\liquid-mercury-pass';
const BASE_URL = 'http://localhost:4321';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runArtDirectionQA() {
  console.log('🚀 Starting RUBIX Liquid Mercury Art-Direction & Performance Audit...');
  const browser = await chromium.launch({ headless: true });
  const results = {
    viewportsTested: [],
    scrollStages: [],
    webglAudit: {},
    contrastCheck: {},
    consoleErrors: [],
    overflowFailures: [],
    timestamp: new Date().toISOString(),
  };

  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`[Browser Console Error] ${msg.text()}`);
      results.consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    console.error(`[Browser Page Error] ${err.message}`);
    results.consoleErrors.push(err.message);
  });

  // 1. Audit Desktop 1440x900 Scroll Stages
  console.log('--- Testing Desktop 1440x900 Scroll Stages ---');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Initial Hero (Scroll 0)
  await page.screenshot({
    path: path.join(OUTPUT_DIR, '01-desktop-hero-initial.png'),
    fullPage: false,
  });

  // Hero 25% scroll (~250px)
  await page.evaluate(() => window.scrollTo(0, 250));
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, '02-desktop-hero-scroll-25.png'),
    fullPage: false,
  });

  // Hero 50% scroll (~500px)
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, '03-desktop-hero-scroll-50.png'),
    fullPage: false,
  });

  // Hero Exit / Work Entrance (~850px)
  await page.evaluate(() => window.scrollTo(0, 850));
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, '04-desktop-work-entrance.png'),
    fullPage: false,
  });

  // Check Mercury opacity at scroll 850px
  const mercuryOpacityAtExit = await page.evaluate(() => {
    const el = document.querySelector('[data-hero-mercury]');
    return el ? window.getComputedStyle(el).opacity : 'not found';
  });
  console.log(`Mercury container opacity at Hero exit (850px): ${mercuryOpacityAtExit}`);

  // 2. Audit WebGL contexts and canvas count on page
  const webglMetrics = await page.evaluate(() => {
    const canvases = Array.from(document.querySelectorAll('canvas'));
    return {
      canvasCount: canvases.length,
      heroCanvasPresent: !!document.querySelector('#hero-section canvas'),
      capabilitiesCanvasPresent: !!document.querySelector('#capabilities canvas'),
    };
  });
  console.log('WebGL DOM Metrics:', webglMetrics);
  results.webglAudit = webglMetrics;

  // 3. Test Viewports for Zero Overflow and Composition
  const viewports = [
    { name: 'mobile-390x844', width: 390, height: 844 },
    { name: 'mobile-430x932', width: 430, height: 932 },
    { name: 'tablet-768x1024', width: 768, height: 1024 },
    { name: 'tablet-1024x768', width: 1024, height: 768 },
    { name: 'laptop-1280x720', width: 1280, height: 720 },
    { name: 'laptop-1280x800', width: 1280, height: 800 },
    { name: 'desktop-1440x900', width: 1440, height: 900 },
    { name: 'wide-1920x1080', width: 1920, height: 1080 },
  ];

  console.log('--- Testing Responsive Viewports ---');
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    if (overflow) {
      console.error(`❌ Overflow detected on ${vp.name}!`);
      results.overflowFailures.push(vp.name);
    } else {
      console.log(`✓ ${vp.name} passed zero-overflow check.`);
      results.viewportsTested.push(vp.name);
    }

    await page.screenshot({
      path: path.join(OUTPUT_DIR, `hero-${vp.name}.png`),
      fullPage: false,
    });
  }

  // 4. Test /liquid-mercury Material Study Page
  console.log('--- Testing /liquid-mercury Material Study Route ---');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/liquid-mercury`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'material-study-liquid-mercury.png'),
    fullPage: false,
  });

  const demoHasTelemetry = await page.evaluate(() => {
    const text = document.body.innerText;
    return /60 FPS|Raymarched SDF|Telemetry|Linear-style|Version/i.test(text);
  });
  console.log(`Demo route contains fake telemetry: ${demoHasTelemetry}`);

  // 5. Test Reduced Motion Safety
  console.log('--- Testing prefers-reduced-motion ---');
  const rmContext = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 1440, height: 900 },
  });
  const rmPage = await rmContext.newPage();
  await rmPage.goto(BASE_URL, { waitUntil: 'networkidle' });
  await rmPage.waitForTimeout(500);
  await rmPage.screenshot({
    path: path.join(OUTPUT_DIR, 'hero-reduced-motion.png'),
    fullPage: false,
  });

  await browser.close();
  await rmContext.close();

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'qa-results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('📊 ART DIRECTION QA COMPLETE!');
  console.log(`Console errors: ${results.consoleErrors.length}`);
  console.log(`Overflow failures: ${results.overflowFailures.length}`);
}

runArtDirectionQA().catch((err) => {
  console.error('QA Harness Error:', err);
  process.exit(1);
});
