import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = 'E:/rubix-studio/qa-captures/shader-icons';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: '00-compact-320x568', width: 320, height: 568 },
  { name: '01-mobile-390x844', width: 390, height: 844 },
  { name: '02-tablet-768x1024', width: 768, height: 1024 },
  { name: '03-desktop-1440x900', width: 1440, height: 900 },
  { name: '04-wide-1920x1080', width: 1920, height: 1080 },
];

async function runQA() {
  console.log('=== Starting Shader & Motion Icon System Playwright QA ===');
  const browser = await chromium.launch({ headless: true });
  const results = {
    viewports: [],
    overflowAudit: [],
    consoleErrors: [],
    interactions: [],
    webglStatus: {},
    iconAudit: {},
    reducedMotionTest: {},
  };

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });

    const pageErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') pageErrors.push(msg.text());
    });
    page.on('pageerror', err => {
      pageErrors.push(err.message);
    });

    await page.goto('http://127.0.0.1:4321/#capabilities', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800); // Allow hydration of client:visible

    // Horizontal overflow check
    const overflow = await page.evaluate(() => {
      const scrollW = document.documentElement.scrollWidth;
      const clientW = window.innerWidth;
      return {
        scrollWidth: scrollW,
        clientWidth: clientW,
        hasHorizontalOverflow: scrollW > clientW,
      };
    });

    results.overflowAudit.push({
      viewport: vp.name,
      ...overflow,
    });

    // Capture Capabilities section
    const capabilities = page.locator('#capabilities');
    if (await capabilities.count() > 0) {
      await capabilities.screenshot({
        path: path.join(OUT_DIR, `${vp.name}-capabilities.png`),
      });
      console.log(`Captured: ${vp.name}-capabilities.png`);
    }

    if (pageErrors.length > 0) {
      results.consoleErrors.push({ viewport: vp.name, errors: pageErrors });
    }

    await page.close();
  }

  // --- Interaction & State Test on Desktop (1440x900) ---
  console.log('Testing interactive capability rows & dynamic shader stage...');
  const desktopPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const desktopErrors = [];
  desktopPage.on('console', msg => {
    if (msg.type() === 'error') desktopErrors.push(msg.text());
  });
  desktopPage.on('pageerror', err => {
    desktopErrors.push(err.message);
  });

  await desktopPage.goto('http://127.0.0.1:4321/#capabilities', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);

  // Check WebGL Canvas
  const webglInfo = await desktopPage.evaluate(() => {
    const canvas = document.querySelector('#capabilities canvas');
    if (!canvas) return { canvasFound: false };
    return {
      canvasFound: true,
      width: canvas.width,
      height: canvas.height,
      clientWidth: canvas.clientWidth,
      clientHeight: canvas.clientHeight,
      ariaHidden: canvas.getAttribute('aria-hidden'),
    };
  });
  results.webglStatus = webglInfo;
  console.log('WebGL Canvas Status:', webglInfo);

  // Test interactive rows 0 to 3
  const rowSelectors = [
    'button:has-text("Interface & Product Design")',
    'button:has-text("Design Systems")',
    'button:has-text("Software Engineering")',
    'button:has-text("Interactive Web Experiences")',
  ];

  for (let i = 0; i < rowSelectors.length; i++) {
    const btn = desktopPage.locator(rowSelectors[i]);
    if (await btn.count() > 0) {
      await btn.click();
      await desktopPage.waitForTimeout(400); // Animation & uniform modulation time

      const stageInfo = await desktopPage.evaluate((index) => {
        const stage = document.querySelector('#capabilities');
        const activeBtn = stage?.querySelectorAll('button')[index];
        const isSelected = activeBtn?.getAttribute('aria-selected') === 'true';
        const activeBadge = stage?.querySelector('.font-mono.text-\\[\\#F97316\\]');
        return {
          index,
          isSelected,
          badgeText: activeBadge?.textContent?.trim(),
        };
      }, i);

      results.interactions.push(stageInfo);

      // Screenshot the interactive stage for each capability
      const capSection = desktopPage.locator('#capabilities');
      await capSection.screenshot({
        path: path.join(OUT_DIR, `interactive-state-0${i + 1}.png`),
      });
      console.log(`Captured: interactive-state-0${i + 1}.png`);
    }
  }

  // --- Icon System Geometry Audit ---
  const iconInfo = await desktopPage.evaluate(() => {
    const svgs = Array.from(document.querySelectorAll('#capabilities svg'));
    return svgs.map((s, idx) => ({
      index: idx,
      viewBox: s.getAttribute('viewBox'),
      width: s.getAttribute('width') || s.clientWidth,
      height: s.getAttribute('height') || s.clientHeight,
      strokeWidth: s.querySelector('path')?.getAttribute('stroke-width') || s.getAttribute('stroke-width'),
    }));
  });
  results.iconAudit = iconInfo;

  // --- Reduced Motion Compliance Test ---
  console.log('Testing reduced motion preference...');
  const reducedMotionPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  await reducedMotionPage.emulateMedia({ reducedMotion: 'reduce' });

  const rmErrors = [];
  reducedMotionPage.on('console', msg => {
    if (msg.type() === 'error') rmErrors.push(msg.text());
  });
  reducedMotionPage.on('pageerror', err => {
    rmErrors.push(err.message);
  });

  await reducedMotionPage.goto('http://127.0.0.1:4321/#capabilities', { waitUntil: 'networkidle' });
  await reducedMotionPage.waitForTimeout(600);

  const rmCanvas = await reducedMotionPage.evaluate(() => {
    const canvas = document.querySelector('#capabilities canvas');
    return {
      canvasPresent: !!canvas,
      width: canvas?.width,
      height: canvas?.height,
    };
  });

  results.reducedMotionTest = {
    canvasRendered: rmCanvas.canvasPresent,
    dimensions: rmCanvas,
    errors: rmErrors,
  };

  const capSectionRM = reducedMotionPage.locator('#capabilities');
  await capSectionRM.screenshot({
    path: path.join(OUT_DIR, `capabilities-reduced-motion.png`),
  });
  console.log('Captured: capabilities-reduced-motion.png');

  if (desktopErrors.length > 0) {
    results.consoleErrors.push({ viewport: 'desktop-interaction', errors: desktopErrors });
  }

  fs.writeFileSync(path.join(OUT_DIR, 'qa-results.json'), JSON.stringify(results, null, 2));
  console.log('Results written to:', path.join(OUT_DIR, 'qa-results.json'));

  await desktopPage.close();
  await reducedMotionPage.close();
  await browser.close();
  console.log('=== Playwright QA Finished Successfully ===');
}

runQA().catch(err => {
  console.error('QA Script failed:', err);
  process.exit(1);
});
