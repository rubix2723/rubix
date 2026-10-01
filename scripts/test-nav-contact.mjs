import { chromium } from 'playwright';

async function testNav() {
  const browser = await chromium.launch();
  for (const theme of ['dark', 'light']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:4321', { waitUntil: 'networkidle' });
    await page.evaluate(t => {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('rubix-theme', t);
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: t } }));
    }, theme);
    await page.waitForTimeout(400);

    // Click Contact in floating navbar
    await page.click('nav a[href="#contact"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `qa-captures/final-cleanup/nav-contact-target-${theme}.png` });

    // Also check mobile 390
    const mobPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobPage.goto('http://localhost:4321#contact', { waitUntil: 'networkidle' });
    await mobPage.evaluate(t => {
      document.documentElement.setAttribute('data-theme', t);
    }, theme);
    await mobPage.waitForTimeout(1000);
    await mobPage.screenshot({ path: `qa-captures/final-cleanup/mobile-contact-target-${theme}.png` });
    await mobPage.close();

    await page.close();
  }
  await browser.close();
  console.log('Nav contact test passed successfully.');
}

testNav().catch(console.error);
