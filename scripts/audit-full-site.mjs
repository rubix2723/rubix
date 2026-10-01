import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = 'E:\\rubix-studio\\qa-captures\\final-redesign-audit';
const BASE_URL = 'http://localhost:4321';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runAudit() {
  console.log('🔍 Launching Inch-by-Inch Visual Audit across all 10 viewports and scenes...');
  const browser = await chromium.launch({ headless: true });
  
  const viewports = [
    { name: '320x568', width: 320, height: 568 },
    { name: '375x667', width: 375, height: 667 },
    { name: '390x844', width: 390, height: 844 },
    { name: '430x932', width: 430, height: 932 },
    { name: '768x1024', width: 768, height: 1024 },
    { name: '1024x768', width: 1024, height: 768 },
    { name: '1280x720', width: 1280, height: 720 },
    { name: '1280x800', width: 1280, height: 800 },
    { name: '1440x900', width: 1440, height: 900 },
    { name: '1920x1080', width: 1920, height: 1080 },
  ];

  // 1. Detailed Section-by-Section Capture on 1440x900
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  console.log('Capturing detailed desktop sections...');

  // Hero
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'desktop-01-hero.png') });
  
  // Hero mid-scroll
  await page.evaluate(() => window.scrollTo(0, 350));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'desktop-02-hero-mid.png') });

  // Hero exit
  await page.evaluate(() => window.scrollTo(0, 750));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'desktop-03-hero-exit.png') });

  // Selected Work beginning / Project 01
  const workEl = page.locator('#work');
  if (await workEl.count() > 0) {
    await workEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'desktop-04-work-p01.png') });
  }

  // Work Project 02/03 Split
  const p2El = page.locator('[data-project="02"]');
  if (await p2El.count() > 0) {
    await p2El.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'desktop-05-work-split.png') });
  }

  // Work Project 04/05 Pair
  const p4El = page.locator('[data-project="04"]');
  if (await p4El.count() > 0) {
    await p4El.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'desktop-06-work-pair.png') });
  }

  // Work Project 06 Ledger
  const p6El = page.locator('[data-project="06"]');
  if (await p6El.count() > 0) {
    await p6El.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'desktop-07-work-ledger.png') });
  }

  // Studio
  const studioEl = page.locator('#studio');
  if (await studioEl.count() > 0) {
    await studioEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'desktop-08-studio.png') });
  }

  // Capabilities states 01 to 04
  const capSection = page.locator('#capabilities');
  if (await capSection.count() > 0) {
    await capSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    
    const tabs = page.locator('[data-capability-tab]');
    const tabCount = await tabs.count();
    for (let i = 0; i < Math.min(tabCount, 4); i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(OUTPUT_DIR, `desktop-09-capabilities-state-0${i+1}.png`) });
    }
  }

  // Process
  const procEl = page.locator('#process');
  if (await procEl.count() > 0) {
    await procEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'desktop-10-process.png') });
  }

  // Contact
  const contactEl = page.locator('#contact');
  if (await contactEl.count() > 0) {
    await contactEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'desktop-11-contact.png') });
  }

  // Footer
  const footerEl = page.locator('footer');
  if (await footerEl.count() > 0) {
    await footerEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'desktop-12-footer.png') });
  }

  await context.close();

  // 2. Full-Page and Viewport Audits across all 10 resolutions
  console.log('Capturing responsive viewports and full-page screenshots...');
  for (const vp of viewports) {
    const vpContext = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const vpPage = await vpContext.newPage();
    await vpPage.goto(BASE_URL, { waitUntil: 'networkidle' });
    await vpPage.waitForTimeout(500);

    // Initial Hero viewport
    await vpPage.screenshot({
      path: path.join(OUTPUT_DIR, `vp-${vp.name}-hero.png`),
      fullPage: false,
    });

    // Full page for key viewports
    if (['390x844', '768x1024', '1440x900', '1920x1080'].includes(vp.name)) {
      await vpPage.screenshot({
        path: path.join(OUTPUT_DIR, `fullpage-${vp.name}.png`),
        fullPage: true,
      });
    }

    await vpContext.close();
  }

  await browser.close();
  console.log('✅ Audit capture complete! Images saved to:', OUTPUT_DIR);
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
