import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = 'E:/rubix-studio/qa-captures/final';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: '00-compact-320x568', width: 320, height: 568 },
  { name: '01-mobile-375x667', width: 375, height: 667 },
  { name: '02-mobile-390x844', width: 390, height: 844 },
  { name: '03-mobile-430x932', width: 430, height: 932 },
  { name: '04-tablet-portrait-768x1024', width: 768, height: 1024 },
  { name: '05-tablet-landscape-1024x768', width: 1024, height: 768 },
  { name: '06-small-laptop-1280x800', width: 1280, height: 800 },
  { name: '07-desktop-1440x900', width: 1440, height: 900 },
  { name: '08-short-desktop-1440x700', width: 1440, height: 700 },
  { name: '09-wide-desktop-1920x1080', width: 1920, height: 1080 },
];

async function runQA() {
  const browser = await chromium.launch({ headless: true });
  const results = {
    viewports: [],
    overflowAudit: [],
    headingHierarchy: [],
    consoleErrors: [],
    anchorClearance: {},
    touchTargets: [],
    mobileMenuTest: {},
  };

  console.log('--- Starting Playwright Multi-Viewport QA & Visual Capture ---');

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

    await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });

    // Check horizontal overflow
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
      width: vp.width,
      ...overflow,
    });

    // Capture Full Page screenshots for key representative viewports
    if (['02-mobile-390x844', '03-mobile-430x932', '04-tablet-portrait-768x1024', '07-desktop-1440x900', '09-wide-desktop-1920x1080'].includes(vp.name)) {
      const fullpageName = vp.name === '02-mobile-390x844' ? '01-fullpage-390x844.png'
        : vp.name === '03-mobile-430x932' ? '02-fullpage-430x932.png'
        : vp.name === '04-tablet-portrait-768x1024' ? '03-fullpage-768x1024.png'
        : vp.name === '07-desktop-1440x900' ? '04-fullpage-1440x900.png'
        : '05-fullpage-1920x1080.png';

      await page.screenshot({
        path: path.join(OUT_DIR, fullpageName),
        fullPage: true,
      });
      console.log(`Captured fullpage: ${fullpageName}`);
    }

    // Capture section-specific screenshots on standard desktop (1440x900)
    if (vp.name === '07-desktop-1440x900') {
      const hero = page.locator('header + main > div > section:first-of-type, #main-content section:first-of-type');
      if (await hero.count() > 0) {
        await hero.screenshot({ path: path.join(OUT_DIR, 'hero-desktop.png') });
      }

      const work = page.locator('#work');
      if (await work.count() > 0) {
        await work.screenshot({ path: path.join(OUT_DIR, 'selected-work-desktop.png') });
      }

      const studio = page.locator('#studio');
      if (await studio.count() > 0) {
        await studio.screenshot({ path: path.join(OUT_DIR, 'studio-desktop.png') });
      }

      const capabilities = page.locator('#capabilities');
      if (await capabilities.count() > 0) {
        await capabilities.screenshot({ path: path.join(OUT_DIR, 'capabilities-desktop.png') });
      }

      const process = page.locator('#process');
      if (await process.count() > 0) {
        await process.screenshot({ path: path.join(OUT_DIR, 'process-desktop.png') });
      }

      const contact = page.locator('#contact');
      if (await contact.count() > 0) {
        await contact.screenshot({ path: path.join(OUT_DIR, 'contact-desktop.png') });
      }

      const footer = page.locator('footer');
      if (await footer.count() > 0) {
        await footer.screenshot({ path: path.join(OUT_DIR, 'footer-desktop.png') });
      }
    }

    if (pageErrors.length > 0) {
      results.consoleErrors.push({ viewport: vp.name, errors: pageErrors });
    }

    await page.close();
  }

  // Deep Test Anchor Navigation & Sticky Header Clearance on Desktop
  const navPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  await navPage.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });

  const anchors = ['#work', '#studio', '#capabilities', '#contact'];
  for (const anchor of anchors) {
    const link = navPage.locator(`nav[aria-label="Primary navigation"] a[href="${anchor}"]`);
    await link.click();
    await navPage.waitForTimeout(400); // Allow scroll settlement

    const sectionBox = await navPage.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { top: rect.top, visible: rect.top >= 0 && rect.top < 200 };
    }, anchor);

    results.anchorClearance[anchor] = {
      target: anchor,
      boundingTop: sectionBox ? Math.round(sectionBox.top) : null,
      clearsHeader: sectionBox ? sectionBox.top >= 60 : false,
    };
  }

  // Test Heading Hierarchy
  results.headingHierarchy = await navPage.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    return headings.map(h => ({
      tag: h.tagName.toLowerCase(),
      text: h.textContent.trim().replace(/\s+/g, ' '),
    }));
  });

  // Test Touch Targets on Mobile (390x844)
  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  await mobilePage.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });

  // Test mobile menu interaction
  const toggleBtn = mobilePage.locator('#mobile-menu-toggle');
  const toggleBox = await toggleBtn.boundingBox();
  results.touchTargets.push({
    element: 'Mobile Menu Hamburger Button',
    width: toggleBox.width,
    height: toggleBox.height,
    passes44px: toggleBox.width >= 44 && toggleBox.height >= 44,
  });

  await toggleBtn.click();
  await mobilePage.waitForTimeout(200);

  const menuVisible = await mobilePage.evaluate(() => {
    const m = document.getElementById('mobile-menu');
    return m && !m.classList.contains('hidden');
  });

  // Mobile menu links touch targets
  const mobileLinks = mobilePage.locator('.mobile-nav-link');
  const linkCount = await mobileLinks.count();
  for (let i = 0; i < linkCount; i++) {
    const link = mobileLinks.nth(i);
    const box = await link.boundingBox();
    const text = await link.textContent();
    results.touchTargets.push({
      element: `Mobile Nav: ${text.trim()}`,
      width: box.width,
      height: box.height,
      passes44px: box.height >= 44,
    });
  }

  // Test escape key closes mobile menu
  await mobilePage.keyboard.press('Escape');
  await mobilePage.waitForTimeout(200);
  const menuHiddenAfterEsc = await mobilePage.evaluate(() => {
    const m = document.getElementById('mobile-menu');
    return m && m.classList.contains('hidden');
  });

  results.mobileMenuTest = {
    opensOnClick: menuVisible,
    closesOnEscape: menuHiddenAfterEsc,
  };

  // Studio Action Link Touch Target
  const studioLink = mobilePage.locator('#studio a[href="#contact"]');
  const studioBox = await studioLink.boundingBox();
  results.touchTargets.push({
    element: 'Studio "Start a conversation" Link',
    width: Math.round(studioBox.width),
    height: Math.round(studioBox.height),
    passes44px: studioBox.height >= 44,
  });

  // Contact Email Link Touch Target
  const contactLink = mobilePage.locator('#contact a[href^="mailto:"]');
  const contactBox = await contactLink.boundingBox();
  results.touchTargets.push({
    element: 'Contact Email "hello@rubix.studio" Link',
    width: Math.round(contactBox.width),
    height: Math.round(contactBox.height),
    passes44px: contactBox.height >= 44,
  });

  // Footer Links Touch Targets
  const footerLinks = mobilePage.locator('footer a');
  const fCount = await footerLinks.count();
  for (let i = 0; i < fCount; i++) {
    const fLink = footerLinks.nth(i);
    const box = await fLink.boundingBox();
    const text = await fLink.textContent();
    results.touchTargets.push({
      element: `Footer: ${text.trim()}`,
      width: Math.round(box.width),
      height: Math.round(box.height),
      passes44px: box.height >= 44,
    });
  }

  // Save QA Results
  fs.writeFileSync(path.join(OUT_DIR, 'qa-results.json'), JSON.stringify(results, null, 2));
  console.log('Saved QA results to', path.join(OUT_DIR, 'qa-results.json'));

  await navPage.close();
  await mobilePage.close();
  await browser.close();

  console.log('--- Playwright QA Run Completed Successfully ---');
}

runQA().catch(err => {
  console.error('QA Script Error:', err);
  process.exit(1);
});
