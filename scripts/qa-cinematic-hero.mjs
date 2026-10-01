import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/samee/.gemini/antigravity-cli/brain/b82e5286-a059-437d-90eb-c5440400b705/hero-cinematic';
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

const BASE_URL = 'http://localhost:4321';

const VIEWPORTS = [
  { name: 'iPhone-14-390', width: 390, height: 844 },
  { name: 'iPhone-ProMax-430', width: 430, height: 932 },
  { name: 'iPad-Portrait-768', width: 768, height: 1024 },
  { name: 'iPad-Landscape-1024', width: 1024, height: 768 },
  { name: 'ShortLaptop-1280x720', width: 1280, height: 720 },
  { name: 'Desktop-1440x900', width: 1440, height: 900 },
  { name: 'FHD-1920x1080', width: 1920, height: 1080 },
];

async function runQA() {
  console.log('--- STARTING RUBIX CINEMATIC HERO QA ---');
  const browser = await chromium.launch({ headless: true });
  const qaResults = {
    viewports: [],
    cycleCaptures: [],
    contrastScores: [],
    themeSwitchStable: false,
    reducedMotionPassed: false,
    zeroHorizontalOverflow: true,
    consoleErrors: [],
    failedRequests: [],
  };

  // 1. Loop Cycle Captures at 1440x900
  console.log('\n--- 1. Testing Video Loop Moments at 1440x900 (0%, 25%, 50%, 75%) ---');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('console', (msg) => {
      if (msg.type() === 'error') qaResults.consoleErrors.push(msg.text());
    });
    page.on('requestfailed', (req) => {
      qaResults.failedRequests.push(`${req.method()} ${req.url()}: ${req.failure()?.errorText}`);
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    // Seek to 0%, 25%, 50%, 75% of video loop (duration ~21.2s)
    const timestamps = [
      { label: '00pct', time: 0.1 },
      { label: '25pct', time: 5.3 },
      { label: '50pct', time: 10.6 },
      { label: '75pct', time: 15.9 },
    ];

    for (const ts of timestamps) {
      await page.evaluate((t) => {
        const vid = document.querySelector('[data-hero-video]');
        if (vid) {
          vid.pause();
          vid.currentTime = t;
        }
      }, ts.time);
      await page.waitForTimeout(200);

      const filePath = path.join(ARTIFACT_DIR, `Desktop-1440-dark-cycle-${ts.label}.png`);
      await page.screenshot({ path: filePath });
      qaResults.cycleCaptures.push({ label: ts.label, time: ts.time, file: filePath });
      console.log(`✓ Captured video loop at ${ts.label} (${ts.time}s) -> ${filePath}`);
    }
    await page.close();
  }

  // 2. Responsive Viewports: Dark Theme & Light Theme
  console.log('\n--- 2. Testing Responsive Viewports (Dark and Light) ---');
  for (const vp of VIEWPORTS) {
    for (const theme of ['dark', 'light']) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      page.on('console', (msg) => {
        if (msg.type() === 'error') qaResults.consoleErrors.push(`[${vp.name}-${theme}] ${msg.text()}`);
      });

      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      // Set theme
      await page.evaluate((t) => {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('rubix-theme', t);
      }, theme);
      await page.waitForTimeout(300);

      // Check metrics
      const metrics = await page.evaluate(() => {
        const docW = document.documentElement.scrollWidth;
        const winW = window.innerWidth;
        const line2 = document.querySelector('[data-hero-line="2"]'); // "Development."
        const line2Rect = line2 ? line2.getBoundingClientRect() : null;
        const cta = document.querySelector('[data-hero-cta]');
        const ctaRect = cta ? cta.getBoundingClientRect() : null;
        const h1 = document.querySelector('.hero-display');
        const h1Rect = h1 ? h1.getBoundingClientRect() : null;
        const vid = document.querySelector('[data-hero-video]');
        const vidPlaying = vid ? !vid.paused && vid.readyState >= 2 : false;

        return {
          overflow: docW > winW + 1,
          docW,
          winW,
          line2Width: line2Rect ? line2Rect.width : 0,
          line2Height: line2Rect ? line2Rect.height : 0,
          h1Top: h1Rect ? h1Rect.top : 0,
          h1Height: h1Rect ? h1Rect.height : 0,
          ctaVisible: ctaRect ? ctaRect.bottom <= window.innerHeight : false,
          ctaBottom: ctaRect ? ctaRect.bottom : 0,
          windowHeight: window.innerHeight,
          vidPlaying,
        };
      });

      if (metrics.overflow) qaResults.zeroHorizontalOverflow = false;

      const filename = `${vp.name}-${theme}-hero.png`;
      const filePath = path.join(ARTIFACT_DIR, filename);
      await page.screenshot({ path: filePath });
      qaResults.viewports.push({ ...vp, theme, metrics, file: filePath });
      console.log(
        `✓ ${vp.name} [${theme}]: H1-top=${metrics.h1Top.toFixed(0)}px, Dev-width=${metrics.line2Width.toFixed(0)}px, CTA-in-view=${metrics.ctaVisible} (${metrics.ctaBottom.toFixed(0)}px <= ${metrics.windowHeight}px), Overflow=${metrics.overflow}`
      );
      await page.close();
    }
  }

  // 3. CTA Interaction (Hover State RUBIX Orange)
  console.log('\n--- 3. Testing CTA Hover Interaction ---');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    const cta = page.locator('[data-hero-cta]');
    await cta.hover();
    await page.waitForTimeout(200);

    const ctaHoverStyle = await page.evaluate(() => {
      const el = document.querySelector('[data-hero-cta]');
      if (!el) return null;
      const s = window.getComputedStyle(el);
      return {
        bg: s.backgroundColor,
        color: s.color,
      };
    });

    const ctaHoverFile = path.join(ARTIFACT_DIR, 'Desktop-1440-cta-hover.png');
    await page.screenshot({ path: ctaHoverFile });
    console.log(`✓ CTA Hover Color: bg=${ctaHoverStyle?.bg}, color=${ctaHoverStyle?.color}`);
    await page.close();
  }

  // 4. Scroll Choreography & Exit Transition
  console.log('\n--- 4. Testing Scroll Transition (Hero -> Work) ---');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    // Scroll 50% through Hero
    await page.evaluate(() => window.scrollTo(0, 450));
    await page.waitForTimeout(300);

    const scrollFile = path.join(ARTIFACT_DIR, 'Desktop-1440-dark-scroll-transition.png');
    await page.screenshot({ path: scrollFile });
    console.log(`✓ Captured scroll transition -> ${scrollFile}`);
    await page.close();
  }

  // 5. Reduced Motion Test
  console.log('\n--- 5. Testing Prefers-Reduced-Motion ---');
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const vidState = await page.evaluate(() => {
      const vid = document.querySelector('[data-hero-video]');
      return {
        paused: vid ? vid.paused : false,
        hasPoster: vid ? Boolean(vid.poster) : false,
      };
    });

    qaResults.reducedMotionPassed = vidState.paused && vidState.hasPoster;
    console.log(`✓ Reduced motion test: Video paused = ${vidState.paused}, Has poster = ${vidState.hasPoster}`);
    const reducedFile = path.join(ARTIFACT_DIR, 'Desktop-1440-reduced-motion.png');
    await page.screenshot({ path: reducedFile });
    await page.close();
    await context.close();
  }

  // 6. Theme Switching Stability
  console.log('\n--- 6. Testing Theme Switching Video Stability ---');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    const initialVideoSrc = await page.evaluate(() => {
      const vid = document.querySelector('[data-hero-video]');
      return vid ? vid.currentSrc : '';
    });

    // Toggle theme to light then dark
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.waitForTimeout(200);
    const lightVideoSrc = await page.evaluate(() => {
      const vid = document.querySelector('[data-hero-video]');
      return vid ? vid.currentSrc : '';
    });

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.waitForTimeout(200);
    const darkVideoSrc = await page.evaluate(() => {
      const vid = document.querySelector('[data-hero-video]');
      return vid ? vid.currentSrc : '';
    });

    qaResults.themeSwitchStable = initialVideoSrc === lightVideoSrc && lightVideoSrc === darkVideoSrc;
    console.log(`✓ Theme switch stability: No media reload/re-render = ${qaResults.themeSwitchStable}`);
    await page.close();
  }

  await browser.close();

  // Write results summary json
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa-summary.json'), JSON.stringify(qaResults, null, 2));
  console.log('\n--- QA COMPLETE: ALL METRICS AND SCREENSHOTS CAPTURED ---');
}

runQA().catch((err) => {
  console.error('QA Script Error:', err);
  process.exit(1);
});
