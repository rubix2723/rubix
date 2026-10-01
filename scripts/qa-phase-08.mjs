import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = 'E:/rubix-studio/qa-captures/phase-08';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: '01-mobile-375x667', width: 375, height: 667 },
  { name: '02-mobile-390x844', width: 390, height: 844 },
  { name: '03-mobile-430x932', width: 430, height: 932 },
  { name: '04-tablet-portrait-768x1024', width: 768, height: 1024 },
  { name: '05-tablet-landscape-1024x768', width: 1024, height: 768 },
  { name: '06-desktop-1440x900', width: 1440, height: 900 },
  { name: '07-wide-desktop-1920x1080', width: 1920, height: 1080 },
];

async function runQA() {
  const browser = await chromium.launch({ headless: true });
  const results = {
    viewports: [],
    overflow: [],
    headingHierarchy: [],
    contrast: {},
    consoleErrors: [],
    clearance: {},
    hitTarget: {},
  };

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });

    const pageErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        pageErrors.push(msg.text());
      }
    });
    page.on('pageerror', err => {
      pageErrors.push(err.message);
    });

    await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

    // Scroll to studio section
    const studioSection = page.locator('#studio');
    await studioSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Capture Studio section view
    const sectionPath = path.join(OUT_DIR, `${vp.name}-studio.png`);
    await studioSection.screenshot({ path: sectionPath });

    // Also capture full viewport when scrolled to #studio
    const vpPath = path.join(OUT_DIR, `${vp.name}-viewport.png`);
    await page.screenshot({ path: vpPath });

    // Check horizontal overflow
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        hasOverflow: doc.scrollWidth > doc.clientWidth,
      };
    });

    // Check heading hierarchy
    const headings = await page.evaluate(() => {
      const hElements = Array.from(document.querySelectorAll('h1, h2, h3'));
      return hElements.map(el => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent.trim().replace(/\s+/g, ' ').substring(0, 40),
      }));
    });

    // Check sticky header clearance
    await page.evaluate(() => {
      location.hash = '#studio';
    });
    await page.waitForTimeout(200);

    const clearance = await page.evaluate(() => {
      const studio = document.getElementById('studio');
      const header = document.querySelector('header');
      if (!studio || !header) return null;
      const studioRect = studio.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      return {
        headerBottom: headerRect.bottom,
        studioTop: studioRect.top,
        clearancePx: studioRect.top - headerRect.bottom,
        isCleared: studioRect.top >= headerRect.bottom - 2,
      };
    });

    // Check CTA Hit Target
    const ctaTarget = await page.evaluate(() => {
      const cta = document.querySelector('#studio a[href="#contact"]');
      if (!cta) return null;
      const rect = cta.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0,
      };
    });

    // Check computed contrast
    const contrast = await page.evaluate(() => {
      const statement = document.querySelector('#studio p');
      const body = document.querySelectorAll('#studio p')[1];
      const metaLabel = document.querySelector('#studio dt');
      const metaVal = document.querySelector('#studio dd');
      return {
        statementColor: statement ? window.getComputedStyle(statement).color : null,
        bodyColor: body ? window.getComputedStyle(body).color : null,
        metaLabelColor: metaLabel ? window.getComputedStyle(metaLabel).color : null,
        metaValColor: metaVal ? window.getComputedStyle(metaVal).color : null,
      };
    });

    results.viewports.push(vp.name);
    results.overflow.push({ vp: vp.name, ...overflow });
    results.headingHierarchy = headings;
    results.contrast = contrast;
    results.clearance[vp.name] = clearance;
    results.hitTarget[vp.name] = ctaTarget;
    if (pageErrors.length > 0) {
      results.consoleErrors.push({ vp: vp.name, errors: pageErrors });
    }

    await page.close();
  }

  // Transitions Captures (1440x900 & 390x844)
  for (const vp of [
    { name: 'desktop-1440x900', width: 1440, height: 900 },
    { name: 'mobile-390x844', width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

    // Wait for all images to be decoded/rendered
    await page.evaluate(async () => {
      const images = Array.from(document.querySelectorAll('img'));
      await Promise.all(images.map(img => {
        if (img.complete) return;
        return new Promise(resolve => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', resolve);
        });
      }));
    });

    // Transition 1: Selected Work -> Studio (Show Project 06 ending + boundary hairline + Studio top)
    await page.evaluate(() => {
      const studio = document.getElementById('studio');
      if (studio) {
        const y = studio.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: y - 350, behavior: 'instant' });
      }
    });
    await page.waitForTimeout(200);
    const trans1Path = path.join(OUT_DIR, `${vp.name}-transition-work-to-studio.png`);
    await page.screenshot({ path: trans1Path });

    // Transition 2: Studio -> Bottom boundary (Show Studio bottom + boundary hairline)
    await page.evaluate(() => {
      const studio = document.getElementById('studio');
      if (studio) {
        const bottom = studio.getBoundingClientRect().bottom + window.scrollY;
        window.scrollTo({ top: bottom - 400, behavior: 'instant' });
      }
    });
    await page.waitForTimeout(200);
    const trans2Path = path.join(OUT_DIR, `${vp.name}-transition-studio-to-boundary.png`);
    await page.screenshot({ path: trans2Path });

    await page.close();
  }

  await browser.close();

  fs.writeFileSync(path.join(OUT_DIR, 'qa-results.json'), JSON.stringify(results, null, 2));
  console.log('QA run completed successfully. Results saved to qa-results.json');
}

runQA().catch(err => {
  console.error('QA run failed:', err);
  process.exit(1);
});
