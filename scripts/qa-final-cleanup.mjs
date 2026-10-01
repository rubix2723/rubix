import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = 'qa-captures/final-cleanup';
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: 'Mobile-320', w: 320, h: 568 },
  { name: 'iPhone-14-390', w: 390, h: 844 },
  { name: 'iPhone-ProMax-430', w: 430, h: 932 },
  { name: 'iPad-Portrait-768', w: 768, h: 1024 },
  { name: 'iPad-Landscape-1024', w: 1024, h: 768 },
  { name: 'MacBook-1280', w: 1280, h: 800 },
  { name: 'Desktop-1440', w: 1440, h: 900 },
  { name: 'FHD-1920', w: 1920, h: 1080 },
];

async function verify() {
  const browser = await chromium.launch();
  const summary = [];

  for (const theme of ['dark', 'light']) {
    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('http://localhost:4321', { waitUntil: 'networkidle' });
      await page.evaluate(t => {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('rubix-theme', t);
        window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: t } }));
      }, theme);

      // Wait for WebGL initialization and stable rendering
      await page.waitForTimeout(600);

      const checks = await page.evaluate(() => {
        const text = document.body.innerText;
        const hasEngagementInquiries = text.includes('Engagement Inquiries');
        const hasHaveSomethingWorthBuilding = text.includes('Have something worth building?');
        const hasDirectLine = text.includes('Direct Line');
        const mailtoLinks = Array.from(document.querySelectorAll('a[href^="mailto:"]')).map(a => a.getAttribute('href'));
        const overflow = document.documentElement.scrollWidth > window.innerWidth;
        const contactSection = document.getElementById('contact');
        const heroSection = document.getElementById('hero-section');
        const canvas = document.querySelector('[data-slot="liquid-silk-gradient"] canvas');

        return {
          hasEngagementInquiries,
          hasHaveSomethingWorthBuilding,
          hasDirectLine,
          mailtoCount: mailtoLinks.length,
          mailtoLinks,
          overflow,
          hasContact: !!contactSection,
          hasHero: !!heroSection,
          hasCanvas: !!canvas,
          canvasDimensions: canvas ? { w: canvas.width, h: canvas.height } : null,
        };
      });

      // 1. Capture Hero
      const heroPath = `${outDir}/${vp.name}-${theme}-hero.png`;
      await page.screenshot({ path: heroPath });

      // 2. Scroll to Contact & Footer with ample animation settle time
      await page.evaluate(() => {
        const contact = document.getElementById('contact');
        if (contact) {
          const y = contact.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo(0, y);
        }
      });
      await page.waitForTimeout(1100);

      const contactPath = `${outDir}/${vp.name}-${theme}-contact.png`;
      await page.screenshot({ path: contactPath });

      // 3. Scroll to full Footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(400);
      const footerPath = `${outDir}/${vp.name}-${theme}-footer.png`;
      await page.screenshot({ path: footerPath });

      summary.push({
        viewport: vp.name,
        theme,
        errors: consoleErrors.length,
        ...checks,
      });

      console.log(`[PASS] ${vp.name} (${theme}): mailtoCount=${checks.mailtoCount}, overflow=${checks.overflow}, engagementInquiriesGone=${!checks.hasEngagementInquiries}, errors=${consoleErrors.length}`);
      await page.close();
    }
  }

  // Final check: hover test on contact email
  const testPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await testPage.goto('http://localhost:4321', { waitUntil: 'networkidle' });
  await testPage.evaluate(() => {
    const contact = document.getElementById('contact');
    if (contact) contact.scrollIntoView({ behavior: 'instant' });
  });
  await testPage.waitForTimeout(300);
  const emailLink = testPage.locator('#contact a[href^="mailto:"]');
  await emailLink.hover();
  await testPage.waitForTimeout(200);
  await testPage.screenshot({ path: `${outDir}/email-hover-state.png` });
  await testPage.close();

  await browser.close();

  fs.writeFileSync(`${outDir}/summary.json`, JSON.stringify(summary, null, 2));
  console.log('\n=== ALL VERIFICATION CHECKS COMPLETE ===');
  console.log('Results written to', `${outDir}/summary.json`);
}

verify().catch(console.error);
