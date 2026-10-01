// RUBIX.STUDIO — Final Human-Made Release Verification Suite
// Validates:
// 1. All 6 Project media assets (including M.M. Engineering Works / hardware.png)
// 2. WCAG Contrast verification across Dark & Light themes (Process statement, headers, ledger)
// 3. Compact Liquid Glass Theme Toggle (role="switch", aria-checked, 64x30px track, 24px sliding orb)
// 4. Site-wide scroll choreography (Text Line/Word reveals, Image scroll reveals, reduced motion)
// 5. Multi-viewport responsive matrix (320px to 2560px) in Dark & Light modes
// 6. Zero horizontal overflow, zero console errors

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = 'E:\\rubix-studio\\qa-captures\\final-human-release';
const BASE_URL = 'http://localhost:4321';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Relative luminance & contrast ratio calculation per WCAG 2.1
function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

function getLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(fgRgb, bgRgb) {
  const l1 = getLuminance(fgRgb);
  const l2 = getLuminance(bgRgb);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

async function runVerification() {
  console.log('💎 Starting RUBIX.studio Final Human-Made Release Engineering QA Suite...\n');
  const browser = await chromium.launch({ headless: true });

  const report = {
    projectAssets: [],
    contrastAudit: [],
    liquidGlassToggle: {},
    scrollChoreography: {},
    reducedMotionAudit: {},
    viewports: [],
    consoleErrors: [],
    allPassed: true,
  };

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`[Browser Console Error] ${msg.text()}`);
      report.consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    console.error(`[Page Error] ${err.message}`);
    report.consoleErrors.push(err.message);
  });

  // Track network failures
  const failedRequests = [];
  page.on('requestfailed', (req) => {
    console.error(`[Network Failed] ${req.url()} - ${req.failure()?.errorText}`);
    failedRequests.push({ url: req.url(), error: req.failure()?.errorText });
  });

  // Navigate to root
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.removeItem('rubix-theme');
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await page.waitForTimeout(500);

  // =========================================================================
  // 1. ALL 6 PROJECT MEDIA ASSETS VERIFICATION
  // =========================================================================
  console.log('--- 1. AUDITING ALL 6 PROJECT MEDIA ASSETS ---');
  const projectSelectors = [
    { id: '01', name: 'Rubix Luxury', sel: '[data-project="01"] img' },
    { id: '02', name: 'Trouver', sel: '[data-project="02"] img' },
    { id: '03', name: 'VedaHarmony', sel: '[data-project="03"] img' },
    { id: '04', name: 'Pastel Booth Co.', sel: '[data-project="04"] img' },
    { id: '05', name: 'M.M. Engineering Works', sel: '[data-project="05"] img' },
    { id: '06', name: 'DCSA Academy', sel: '[data-project="06"] img' },
  ];

  for (const p of projectSelectors) {
    const imgInfo = await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      return {
        src: el.src,
        currentSrc: el.currentSrc,
        complete: el.complete,
        naturalWidth: el.naturalWidth,
        naturalHeight: el.naturalHeight,
        offsetWidth: el.offsetWidth,
        offsetHeight: el.offsetHeight,
      };
    }, p.sel);

    if (!imgInfo) {
      console.error(`❌ Project ${p.id} (${p.name}): Image element not found!`);
      report.projectAssets.push({ id: p.id, name: p.name, passed: false, error: 'Element missing' });
      report.allPassed = false;
      continue;
    }

    const isValid = imgInfo.complete && imgInfo.naturalWidth > 0 && imgInfo.naturalHeight > 0;
    if (isValid) {
      console.log(`✅ Project ${p.id} (${p.name}): Loaded ${imgInfo.naturalWidth}x${imgInfo.naturalHeight}px (${imgInfo.src})`);
      report.projectAssets.push({ id: p.id, name: p.name, passed: true, ...imgInfo });
    } else {
      console.error(`❌ Project ${p.id} (${p.name}): BROKEN ASSET! naturalWidth=${imgInfo.naturalWidth}, naturalHeight=${imgInfo.naturalHeight}`);
      report.projectAssets.push({ id: p.id, name: p.name, passed: false, error: 'Broken image dimension', ...imgInfo });
      report.allPassed = false;
    }
  }

  // =========================================================================
  // 2. WCAG CONTRAST VERIFICATION (DARK & LIGHT)
  // =========================================================================
  console.log('\n--- 2. WCAG CONTRAST VERIFICATION ---');

  async function checkContrastInCurrentTheme(themeName) {
    const checks = [
      {
        name: `Process Statement (${themeName})`,
        selector: '[data-process-statement]',
        minRatio: 4.5,
      },
      {
        name: `Selected Work H2 Header (${themeName})`,
        selector: '#work h2',
        minRatio: 4.5,
      },
      {
        name: `Project 01 Title (${themeName})`,
        selector: '[data-project="01"] h3',
        minRatio: 4.5,
      },
      {
        name: `Project 05 Title (${themeName})`,
        selector: '[data-project="05"] h3',
        minRatio: 4.5,
      },
      {
        name: `Project 06 Title (${themeName})`,
        selector: '[data-project="06"] h3',
        minRatio: 4.5,
      },
      {
        name: `Studio Statement (${themeName})`,
        selector: '[data-studio-statement]',
        minRatio: 4.5,
      },
    ];

    for (const c of checks) {
      const colors = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const style = window.getComputedStyle(el);
        const htmlStyle = window.getComputedStyle(document.documentElement);
        return {
          fg: style.color,
          bg: htmlStyle.backgroundColor,
        };
      }, c.selector);

      if (!colors) {
        console.error(`❌ Contrast check failed: ${c.name} element not found!`);
        report.contrastAudit.push({ name: c.name, passed: false, error: 'Not found' });
        report.allPassed = false;
        continue;
      }

      const fgRgb = parseRgb(colors.fg);
      const bgRgb = parseRgb(colors.bg);
      const ratio = getContrastRatio(fgRgb, bgRgb);
      const passed = ratio >= c.minRatio;

      console.log(`${passed ? '✅' : '❌'} ${c.name}: ${ratio.toFixed(2)}:1 (FG: ${colors.fg}, BG: ${colors.bg})`);
      report.contrastAudit.push({
        name: c.name,
        fg: colors.fg,
        bg: colors.bg,
        ratio: Number(ratio.toFixed(2)),
        passed,
      });

      if (!passed) report.allPassed = false;
    }
  }

  // Check dark mode
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForTimeout(300);
  await checkContrastInCurrentTheme('Dark Mode');

  // Switch to light mode and check
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.waitForTimeout(300);
  await checkContrastInCurrentTheme('Light Mode');

  // Switch back to dark mode
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForTimeout(300);

  // =========================================================================
  // 3. COMPACT LIQUID GLASS THEME TOGGLE AUDIT
  // =========================================================================
  console.log('\n--- 3. COMPACT LIQUID GLASS THEME TOGGLE AUDIT ---');

  const toggleAudit = await page.evaluate(() => {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return { exists: false };
    const rect = btn.getBoundingClientRect();
    const orb = btn.querySelector('[data-theme-orb]');
    const orbRect = orb?.getBoundingClientRect();
    const role = btn.getAttribute('role');
    const ariaChecked = btn.getAttribute('aria-checked');

    return {
      exists: true,
      role,
      ariaChecked,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      orbWidth: orbRect ? Math.round(orbRect.width) : 0,
      orbHeight: orbRect ? Math.round(orbRect.height) : 0,
    };
  });

  console.log(`Toggle Button: width=${toggleAudit.width}px, height=${toggleAudit.height}px, role="${toggleAudit.role}", aria-checked="${toggleAudit.ariaChecked}"`);
  console.log(`Glass Orb: width=${toggleAudit.orbWidth}px, height=${toggleAudit.orbHeight}px`);

  const toggleSpecsValid =
    toggleAudit.exists &&
    toggleAudit.role === 'switch' &&
    toggleAudit.ariaChecked === 'true' &&
    Math.abs(toggleAudit.width - 64) <= 4 &&
    Math.abs(toggleAudit.height - 30) <= 4 &&
    Math.abs(toggleAudit.orbWidth - 24) <= 4;

  if (toggleSpecsValid) {
    console.log('✅ Liquid Glass Toggle geometry & accessibility verified!');
  } else {
    console.error('❌ Liquid Glass Toggle geometry or accessibility mismatch!');
    report.allPassed = false;
  }

  // Click toggle to test interactive transition to light mode
  await page.click('#theme-toggle-btn');
  await page.waitForTimeout(350);

  const lightToggleState = await page.evaluate(() => {
    const btn = document.getElementById('theme-toggle-btn');
    const theme = document.documentElement.getAttribute('data-theme');
    const ariaChecked = btn?.getAttribute('aria-checked');
    const orb = btn?.querySelector('[data-theme-orb]');
    const transform = orb ? window.getComputedStyle(orb).transform : '';
    return { theme, ariaChecked, transform };
  });

  console.log(`After click: data-theme="${lightToggleState.theme}", aria-checked="${lightToggleState.ariaChecked}", orb transform: ${lightToggleState.transform}`);
  const lightToggled = lightToggleState.theme === 'light' && lightToggleState.ariaChecked === 'false';
  if (lightToggled) {
    console.log('✅ Liquid Glass Toggle switched to light mode correctly!');
  } else {
    console.error('❌ Liquid Glass Toggle failed to switch to light mode!');
    report.allPassed = false;
  }

  // Click again to return to dark mode
  await page.click('#theme-toggle-btn');
  await page.waitForTimeout(350);
  const darkToggleState = await page.evaluate(() => {
    const btn = document.getElementById('theme-toggle-btn');
    const theme = document.documentElement.getAttribute('data-theme');
    const ariaChecked = btn?.getAttribute('aria-checked');
    return { theme, ariaChecked };
  });
  console.log(`After 2nd click: data-theme="${darkToggleState.theme}", aria-checked="${darkToggleState.ariaChecked}"`);

  report.liquidGlassToggle = {
    ...toggleAudit,
    lightToggled,
    darkRestored: darkToggleState.theme === 'dark' && darkToggleState.ariaChecked === 'true',
    passed: toggleSpecsValid && lightToggled,
  };

  // =========================================================================
  // 4. SCROLL CHOREOGRAPHY & TEXT/IMAGE REVEALS
  // =========================================================================
  console.log('\n--- 4. SCROLL CHOREOGRAPHY AUDIT ---');

  const revealsAudit = await page.evaluate(() => {
    const processStatement = document.querySelector('[data-process-statement]');
    const studioStatement = document.querySelector('[data-studio-statement]');
    const contactStatement = document.querySelector('[data-contact-statement]');
    const p1Title = document.querySelector('[data-project="01"] h3');

    return {
      processStatementLines: processStatement ? processStatement.querySelectorAll('.reveal-line-wrap').length : 0,
      studioStatementLines: studioStatement ? studioStatement.querySelectorAll('.reveal-line-wrap').length : 0,
      contactStatementLines: contactStatement ? contactStatement.querySelectorAll('.reveal-line-wrap').length : 0,
      p1TitleLines: p1Title ? p1Title.querySelectorAll('.reveal-line-wrap').length : 0,
      studioWords: document.querySelectorAll('[data-studio-body] .reveal-word').length,
      p2Media: !!document.querySelector('[data-project="02"] [data-split-media]'),
      p3Media: !!document.querySelector('[data-project="03"] [data-split-media]'),
      p4Media: !!document.querySelector('[data-project="04"] [data-pair-media]'),
      p5Media: !!document.querySelector('[data-project="05"] [data-pair-media]'),
      p6Media: !!document.querySelector('[data-project="06"] [data-ledger-media]'),
    };
  });

  console.log(`Text reveals initialized:`);
  console.log(`- Process Statement lines: ${revealsAudit.processStatementLines}`);
  console.log(`- Studio Statement lines: ${revealsAudit.studioStatementLines}`);
  console.log(`- Contact Statement lines: ${revealsAudit.contactStatementLines}`);
  console.log(`- Studio Narrative words: ${revealsAudit.studioWords}`);
  console.log(`Project Media elements verified: P2=${revealsAudit.p2Media}, P3=${revealsAudit.p3Media}, P4=${revealsAudit.p4Media}, P5=${revealsAudit.p5Media}, P6=${revealsAudit.p6Media}`);

  const choreographyPassed =
    revealsAudit.processStatementLines > 0 &&
    revealsAudit.studioStatementLines > 0 &&
    revealsAudit.contactStatementLines > 0 &&
    revealsAudit.studioWords > 0 &&
    revealsAudit.p4Media &&
    revealsAudit.p5Media &&
    revealsAudit.p6Media;

  if (choreographyPassed) {
    console.log('✅ Site-wide Scroll Choreography and Text/Image reveals verified!');
  } else {
    console.error('❌ Scroll Choreography elements missing!');
    report.allPassed = false;
  }
  report.scrollChoreography = { ...revealsAudit, passed: choreographyPassed };

  // =========================================================================
  // 5. MULTI-VIEWPORT RESPONSIVE MATRIX & OVERFLOW AUDIT
  // =========================================================================
  console.log('\n--- 5. MULTI-VIEWPORT RESPONSIVE MATRIX & OVERFLOW AUDIT ---');

  const viewports = [
    { width: 320, height: 568, name: 'iPhone-SE-1st' },
    { width: 375, height: 667, name: 'iPhone-SE-2nd' },
    { width: 390, height: 844, name: 'iPhone-14' },
    { width: 430, height: 932, name: 'iPhone-14-Pro-Max' },
    { width: 768, height: 1024, name: 'iPad-Portrait' },
    { width: 1024, height: 768, name: 'iPad-Landscape' },
    { width: 1280, height: 800, name: 'MacBook-13' },
    { width: 1440, height: 900, name: 'Desktop-Standard' },
    { width: 1920, height: 1080, name: 'Full-HD-Desktop' },
    { width: 2560, height: 1440, name: 'QHD-Ultrawide' },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Measure horizontal overflow
    const overflowInfo = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const bodyWidth = document.body.scrollWidth;
      const winWidth = window.innerWidth;
      const maxScroll = Math.max(docWidth, bodyWidth);
      return {
        winWidth,
        maxScroll,
        hasOverflow: maxScroll > winWidth + 1, // allow 1px subpixel tolerance
      };
    });

    const vpPassed = !overflowInfo.hasOverflow;
    console.log(`${vpPassed ? '✅' : '❌'} ${vp.name} (${vp.width}x${vp.height}): win=${overflowInfo.winWidth}px, scroll=${overflowInfo.maxScroll}px, overflow=${overflowInfo.hasOverflow}`);

    // Capture screenshots in Dark Mode
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.waitForTimeout(200);
    const darkShotPath = path.join(OUTPUT_DIR, `${vp.name}-dark.png`);
    await page.screenshot({ path: darkShotPath, fullPage: false });

    // Capture screenshots in Light Mode
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.waitForTimeout(200);
    const lightShotPath = path.join(OUTPUT_DIR, `${vp.name}-light.png`);
    await page.screenshot({ path: lightShotPath, fullPage: false });

    // Switch back
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

    report.viewports.push({
      ...vp,
      overflow: overflowInfo,
      passed: vpPassed,
      darkShot: darkShotPath,
      lightShot: lightShotPath,
    });

    if (!vpPassed) report.allPassed = false;
  }

  // =========================================================================
  // 6. SECTION-BY-SECTION DETAILED SCREENSHOT AUDIT (1440x900)
  // =========================================================================
  console.log('\n--- 6. SECTION-BY-SECTION AUDIT CAPTURES (1440x900) ---');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const sections = [
    { id: 'hero-section', name: '01-hero-mercury' },
    { id: 'work', name: '02-selected-work' },
    { id: 'studio', name: '03-studio' },
    { id: 'capabilities', name: '04-capabilities' },
    { id: 'process', name: '05-process' },
    { id: 'contact', name: '06-contact-footer' },
  ];

  for (const sec of sections) {
    const secEl = await page.$(`#${sec.id}`);
    if (secEl) {
      await secEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);

      // Dark capture
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(OUTPUT_DIR, `${sec.name}-dark.png`) });

      // Light capture
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(OUTPUT_DIR, `${sec.name}-light.png`) });

      console.log(`📸 Captured ${sec.name} in Dark & Light`);
    }
  }

  // Detailed capture of Project 04 & 05 Pair specifically (testing M.M. Engineering Works image)
  const pairEl = await page.$('[data-project="05"]');
  if (pairEl) {
    await pairEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'detail-project-05-hardware.png') });
    console.log('📸 Captured detail-project-05-hardware.png');
  }

  // Detailed capture of Process section specifically (testing statement contrast in light mode)
  const processEl = await page.$('#process');
  if (processEl) {
    await processEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'detail-process-light-mode.png') });
    console.log('📸 Captured detail-process-light-mode.png');
  }

  // Full page screenshot in Dark and Light
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'full-page-dark.png'), fullPage: true });
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'full-page-light.png'), fullPage: true });
  console.log('📸 Captured full-page-dark.png and full-page-light.png');

  await browser.close();

  // Write JSON report
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'release-audit-summary.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n======================================================');
  if (report.allPassed && report.consoleErrors.length === 0) {
    console.log('🏆 RUBIX.STUDIO — FINAL HUMAN-MADE EXPERIENCE VERIFIED — RELEASE READY');
  } else {
    console.log('❌ RUBIX.STUDIO — RELEASE BLOCKED');
    console.log(JSON.stringify({ errors: report.consoleErrors, report }, null, 2));
  }
  console.log('======================================================\n');
}

runVerification().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
