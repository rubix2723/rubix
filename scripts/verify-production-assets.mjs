import { chromium } from 'playwright';

async function verifyProductionAssets() {
  console.log('--- Verifying Production Assets on http://localhost:4321 ---');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const failedRequests = [];
  const consoleErrors = [];

  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 400) {
      failedRequests.push({ url, status });
    }
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('http://localhost:4321', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Scroll to #work section and down page to ensure lazy-loaded images are triggered
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight / 3);
    await new Promise((r) => setTimeout(r, 400));
    window.scrollTo(0, (document.body.scrollHeight * 2) / 3);
    await new Promise((r) => setTimeout(r, 400));
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 400));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 200));
  });

  await page.waitForLoadState('networkidle');

  // Verify fonts
  const fontLoaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return {
      ranade16: document.fonts.check('16px Ranade'),
      ranadeDisplay: document.fonts.check('500 48px Ranade'),
      totalFonts: document.fonts.size,
    };
  });

  // Verify project images
  const imageAudit = await page.evaluate(() => {
    const workImages = Array.from(document.querySelectorAll('#work img, [data-slot="project-card"] img'));
    return workImages.map((img) => ({
      src: img.src,
      alt: img.alt,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      visible: img.offsetWidth > 0 && img.offsetHeight > 0,
    }));
  });

  // Verify favicons
  const faviconChecks = await page.evaluate(async () => {
    const icons = Array.from(document.querySelectorAll('link[rel*="icon"]')).map((el) => el.href);
    const results = [];
    for (const href of icons) {
      try {
        const res = await fetch(href);
        results.push({ href, status: res.status, ok: res.ok });
      } catch (err) {
        results.push({ href, error: err.message });
      }
    }
    return results;
  });

  await browser.close();

  console.log('\n[FONTS]');
  console.log(`Ranade loaded: ${fontLoaded.ranade16} (total loaded font faces: ${fontLoaded.totalFonts})`);

  console.log('\n[PRODUCTION PROJECT IMAGES]');
  let allImagesValid = true;
  imageAudit.forEach((img, idx) => {
    const valid = img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
    if (!valid) allImagesValid = false;
    console.log(`  ${idx + 1}. [${valid ? 'PASS' : 'FAIL'}] ${img.alt || 'No alt'} | src: ${img.src} | natural: ${img.naturalWidth}x${img.naturalHeight} | complete: ${img.complete}`);
  });

  console.log('\n[FAVICONS]');
  faviconChecks.forEach((fav) => {
    console.log(`  Status ${fav.status}: ${fav.href}`);
  });

  console.log('\n[NETWORK FAILURES (404/500)]');
  console.log(`  Count: ${failedRequests.length}`);
  failedRequests.forEach((req) => console.log(`  - ${req.status}: ${req.url}`));

  console.log('\n[CONSOLE ERRORS]');
  console.log(`  Count: ${consoleErrors.length}`);
  consoleErrors.forEach((err) => console.log(`  - ${err}`));

  const passed =
    fontLoaded.ranade16 &&
    allImagesValid &&
    imageAudit.length >= 6 &&
    failedRequests.length === 0 &&
    consoleErrors.length === 0;

  console.log(`\nOverall Result: ${passed ? 'VERIFIED PASSED' : 'VERIFICATION FAILED'}`);
  process.exit(passed ? 0 : 1);
}

verifyProductionAssets().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
