import { chromium } from 'playwright';

async function check() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:4321', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  console.log('Initial scrollY:', await page.evaluate(() => window.scrollY));

  // Click Contact link in navbar
  await page.click('nav a[href="#contact"]');
  await page.waitForTimeout(2500);

  const res = await page.evaluate(() => {
    const contact = document.getElementById('contact');
    const rect = contact.getBoundingClientRect();
    const statement = document.querySelector('[data-contact-statement]');
    const sRect = statement ? statement.getBoundingClientRect() : null;
    return {
      scrollY: window.scrollY,
      contactRect: { top: rect.top, bottom: rect.bottom, height: rect.height },
      statementRect: sRect ? { top: sRect.top, bottom: sRect.bottom } : null,
    };
  });

  console.log('After clicking Contact (dark):', JSON.stringify(res, null, 2));
  await page.screenshot({ path: 'qa-captures/final-cleanup/debug-contact-click-dark.png' });

  // Light mode
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('rubix-theme', 'light');
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: 'light' } }));
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'qa-captures/final-cleanup/debug-contact-click-light.png' });
  await browser.close();
}

check().catch(console.error);
