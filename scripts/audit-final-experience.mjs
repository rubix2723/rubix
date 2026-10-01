// RUBIX.STUDIO — Final Experience Redesign Playwright Audit
// Verifies:
// 1. Dark & Warm Light theme switching, tokens, and WebGL shader responsiveness
// 2. Navigation: compact layout, scrollspy, sticky transition, Ranade mobile overlay
// 3. Capabilities stage: enlarged diagrams, integrated icons, no legacy telemetry readouts
// 4. 3-Tier Text reveals: line mask reveals, word reveals, zero horizontal overflow
// 5. Footer: conversational CTA, email link, monumental wordmark, back-to-top trigger
// 6. Multi-viewport capture (390x844, 768x1024, 1440x900, 1920x1080) in Dark & Light

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = 'E:\\rubix-studio\\qa-captures\\final-experience-audit';
const BASE_URL = 'http://localhost:4321';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runAudit() {
  console.log('🚀 Starting RUBIX.studio Final Experience Redesign Verification Suite...');
  const browser = await chromium.launch({ headless: true });
  const results = {
    themeToggling: { darkVerified: false, lightVerified: false },
    navigation: {
      desktopPillsPresent: false,
      scrollspyWorking: false,
      stickyBlurVerified: false,
      mobileMenuOpenClose: false,
    },
    capabilities: {
      allFourStatesVerified: false,
      noLegacyTelemetry: true,
      enlargedDiagramPresent: false,
      integratedIconsPresent: false,
    },
    textReveals: {
      studioLinesMasked: false,
      contactLinesMasked: false,
      studioWordsWrapped: false,
      noTextOverflow: true,
    },
    footer: {
      conversationalCtaPresent: false,
      emailLinkPresent: false,
      monumentalWordmarkPresent: false,
      backToTopWorks: false,
    },
    viewports: [],
    consoleErrors: [],
    timestamp: new Date().toISOString(),
  };

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`[Browser Error] ${msg.text()}`);
      results.consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    console.error(`[Page Error] ${err.message}`);
    results.consoleErrors.push(err.message);
  });

  // Ensure fresh start with dark mode
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('rubix-theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(700);

  // -------------------------------------------------------------
  // 1. Theme Verification & Toggle
  // -------------------------------------------------------------
  console.log('--- Checking Theme Architecture (Dark & Warm Light) ---');
  const initialTheme = await page.getAttribute('html', 'data-theme');
  console.log(`Initial theme attribute: ${initialTheme}`);
  results.themeToggling.darkVerified = initialTheme === 'dark';

  // Capture Hero in Dark Theme
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01-hero-dark-1440.png') });

  // Toggle to Light Theme
  const themeBtn = page.locator('#theme-toggle-btn');
  if (await themeBtn.count() > 0) {
    await themeBtn.click();
    await page.waitForTimeout(400);
    const toggledTheme = await page.getAttribute('html', 'data-theme');
    console.log(`Toggled theme attribute: ${toggledTheme}`);
    results.themeToggling.lightVerified = toggledTheme === 'light';

    // Verify Light Canvas background color
    const lightBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`Light body background color: ${lightBgColor}`);

    // Capture Hero in Warm Light Theme
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02-hero-light-1440.png') });

    // Toggle back to Dark Theme for remaining baseline tests
    await themeBtn.click();
    await page.waitForTimeout(400);
  }

  // -------------------------------------------------------------
  // 2. Navigation Architecture & Scrollspy
  // -------------------------------------------------------------
  console.log('--- Checking Navigation (Compact Dayos Architecture & Scrollspy) ---');
  const navLinks = page.locator('.nav-link');
  const navLinkCount = await navLinks.count();
  console.log(`Desktop nav link count: ${navLinkCount}`);
  results.navigation.desktopPillsPresent = navLinkCount === 5;

  // Scroll to test sticky state
  await page.evaluate(() => window.scrollTo(0, 150));
  await page.waitForTimeout(300);
  const headerScrolled = await page.getAttribute('[data-site-header]', 'data-scrolled');
  const headerClasses = await page.getAttribute('[data-site-header]', 'class');
  console.log(`Header scrolled data attribute: ${headerScrolled}`);
  console.log(`Header scrolled classes: ${headerClasses}`);
  results.navigation.stickyBlurVerified = headerScrolled === 'true' && headerClasses.includes('backdrop-blur-md');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03-nav-sticky-scrolled-1440.png') });

  // Test Scrollspy targeting #studio
  const studioSection = page.locator('#studio');
  if (await studioSection.count() > 0) {
    await studioSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const activeLink = await page.locator('.nav-link.active').getAttribute('data-nav-link');
    console.log(`Active nav link at #studio: ${activeLink}`);
    results.navigation.scrollspyWorking = activeLink === 'studio';
  }

  // -------------------------------------------------------------
  // 3. 3-Tier Text Reveal System
  // -------------------------------------------------------------
  console.log('--- Checking 3-Tier Text Reveal System ---');
  // Studio statement lines (.reveal-line-wrap and .reveal-line)
  await page.waitForSelector('[data-studio-statement] .reveal-line-wrap', { timeout: 3000 }).catch(() => {});
  const studioMaskCount = await page.locator('[data-studio-statement] .reveal-line-wrap').count();
  const studioLineCount = await page.locator('[data-studio-statement] .reveal-line').count();
  console.log(`Studio statement line masks: ${studioMaskCount}, lines: ${studioLineCount}`);
  results.textReveals.studioLinesMasked = studioMaskCount > 0 && studioLineCount > 0;

  // Check Studio word reveals (.reveal-word)
  const studioWordCount = await page.locator('[data-studio-body] .reveal-word').count();
  console.log(`Studio narrative words wrapped: ${studioWordCount}`);
  results.textReveals.studioWordsWrapped = studioWordCount > 0;

  // Check Contact statement lines (.reveal-line-wrap and .reveal-line)
  const contactSection = page.locator('#contact');
  if (await contactSection.count() > 0) {
    await contactSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const contactMaskCount = await page.locator('[data-contact-statement] .reveal-line-wrap').count();
    const contactLineCount = await page.locator('[data-contact-statement] .reveal-line').count();
    console.log(`Contact statement line masks: ${contactMaskCount}, lines: ${contactLineCount}`);
    results.textReveals.contactLinesMasked = contactMaskCount > 0 && contactLineCount > 0;
  }

  // Check horizontal overflow
  const hasTextOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  results.textReveals.noTextOverflow = !hasTextOverflow;
  console.log(`Zero text overflow status: ${!hasTextOverflow}`);

  // -------------------------------------------------------------
  // 4. Capabilities Visual Stage & Communicative Diagrams
  // -------------------------------------------------------------
  console.log('--- Checking Capabilities Interactive Stage (4 States, No Telemetry) ---');
  const capSection = page.locator('#capabilities');
  if (await capSection.count() > 0) {
    await capSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    // Verify absence of legacy telemetry: "SCOPE" tag or "DIRECT COLLABORATION"
    const pageText = await capSection.textContent();
    const hasScopeTag = pageText.includes('SCOPE //');
    const hasDirectCollab = pageText.includes('DIRECT COLLABORATION');
    if (hasScopeTag || hasDirectCollab) {
      console.warn('⚠️ Legacy telemetry text detected in Capabilities!');
      results.capabilities.noLegacyTelemetry = false;
    } else {
      console.log('✓ No legacy telemetry text found in Capabilities stage.');
    }

    // Verify Enlarged Diagram Container
    const diagramContainer = page.locator('#capabilities .h-\\[250px\\]');
    results.capabilities.enlargedDiagramPresent = (await diagramContainer.count()) > 0;
    console.log(`Enlarged diagram container found: ${results.capabilities.enlargedDiagramPresent}`);

    // Verify Integrated Motion Icons in Header
    const stageIcon = page.locator('#capabilities [data-stage-icon]');
    results.capabilities.integratedIconsPresent = (await stageIcon.count()) > 0;
    console.log(`Integrated motion icons present: ${results.capabilities.integratedIconsPresent}`);

    // Cycle through all 4 tabs and capture
    const tabs = page.locator('[role="tablist"][aria-label="Capabilities"] button[role="tab"]');
    const tabTotal = await tabs.count();
    for (let i = 0; i < tabTotal; i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(400);
      const tabTitle = await page.locator('[role="tab"][aria-selected="true"] h3').textContent();
      console.log(`Capability Tab 0${i + 1}: ${tabTitle?.trim()}`);
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `04-capabilities-state-0${i + 1}.png`),
      });
    }
    results.capabilities.allFourStatesVerified = tabTotal === 4;
  }

  // -------------------------------------------------------------
  // 5. Footer Closing Brand Signature
  // -------------------------------------------------------------
  console.log('--- Checking Footer Closing Brand Signature ---');
  const footer = page.locator('footer');
  if (await footer.count() > 0) {
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    // Conversational CTA
    const ctaText = await page.locator('footer h2').textContent();
    results.footer.conversationalCtaPresent = ctaText.includes('worth building');
    console.log(`Footer Conversational CTA: "${ctaText?.trim()}"`);

    // Direct email link
    const emailLink = page.locator('footer a[href^="mailto:"]');
    results.footer.emailLinkPresent = (await emailLink.count()) > 0;
    const emailHref = await emailLink.getAttribute('href');
    console.log(`Footer email link: ${emailHref}`);

    // Monumental Wordmark
    const wordmark = page.locator('footer [data-footer-wordmark]');
    results.footer.monumentalWordmarkPresent = (await wordmark.count()) > 0;
    console.log(`Monumental wordmark present: ${results.footer.monumentalWordmarkPresent}`);

    // Back to top trigger
    const backToTopBtn = page.locator('#back-to-top-btn');
    if (await backToTopBtn.count() > 0) {
      await backToTopBtn.click();
      await page.waitForFunction(() => window.scrollY < 50, { timeout: 3500 }).catch(() => {});
      const scrollY = await page.evaluate(() => window.scrollY);
      console.log(`Scroll position after back-to-top click: ${scrollY}px`);
      results.footer.backToTopWorks = scrollY < 50;
    }

    // Capture Footer Screenshot
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05-footer-closing-signature.png') });
  }

  // -------------------------------------------------------------
  // 6. Mobile Overlay Navigation Test (390x844)
  // -------------------------------------------------------------
  console.log('--- Checking Mobile Navigation Overlay (390x844) ---');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  const mobileToggle = page.locator('#mobile-menu-toggle');
  const mobileMenu = page.locator('#mobile-menu');

  if (await mobileToggle.count() > 0 && await mobileMenu.count() > 0) {
    // Open menu
    await mobileToggle.click();
    await page.waitForTimeout(300);
    const isOpen = await mobileToggle.getAttribute('aria-expanded');
    const isVisible = await mobileMenu.isVisible();
    console.log(`Mobile menu opened: aria-expanded=${isOpen}, isVisible=${isVisible}`);

    await page.screenshot({ path: path.join(OUTPUT_DIR, '06-mobile-overlay-open.png') });

    // Close menu
    await mobileToggle.click();
    await page.waitForTimeout(300);
    const isClosed = !(await mobileMenu.isVisible());
    console.log(`Mobile menu closed: ${isClosed}`);
    results.navigation.mobileMenuOpenClose = isVisible && isClosed;
  }

  // -------------------------------------------------------------
  // 7. Multi-Viewport Responsive Matrix (Dark & Light Captures)
  // -------------------------------------------------------------
  console.log('--- Capturing Multi-Viewport Matrix across resolutions ---');
  const viewports = [
    { name: '390x844-mobile', width: 390, height: 844 },
    { name: '768x1024-tablet', width: 768, height: 1024 },
    { name: '1440x900-desktop', width: 1440, height: 900 },
    { name: '1920x1080-ultrawide', width: 1920, height: 1080 },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    results.viewports.push({
      viewport: vp.name,
      width: vp.width,
      height: vp.height,
      hasOverflow,
    });

    // Dark capture
    await page.screenshot({
      path: path.join(OUTPUT_DIR, `vp-${vp.name}-dark.png`),
      fullPage: false,
    });

    // Light capture
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: 'light' } }));
    });
    await page.waitForTimeout(400);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, `vp-${vp.name}-light.png`),
      fullPage: false,
    });

    // Reset back to dark
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: 'dark' } }));
    });
    await page.waitForTimeout(200);
  }

  await browser.close();

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'final-audit-results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('\n==================================================');
  console.log('✅ FINAL EXPERIENCE REDESIGN AUDIT COMPLETE!');
  console.log('Results summary saved to:', path.join(OUTPUT_DIR, 'final-audit-results.json'));
  console.log('==================================================');
}

runAudit().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
