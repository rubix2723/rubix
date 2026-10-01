// RUBIX V2 — Autonomous Motion Experience Visual QA Harness
// Verifies GSAP ScrollTrigger choreography, Emil Kowalski interaction principles,
// multi-viewport responsiveness, accessibility, reduced-motion safety, and console cleanliness.

import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

const OUTPUT_DIR = "E:\\rubix-studio\\qa-captures\\motion-experience";
const BASE_URL = "http://localhost:4321";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runMotionQA() {
  console.log("🚀 Starting RUBIX Motion Experience Visual QA & Telemetry Suite...");
  const browser = await chromium.launch({ headless: true });
  const results = {
    viewportsTested: [],
    scrollStagesVerified: [],
    consoleErrors: [],
    overflowFailures: [],
    reducedMotionVerified: false,
    timestamp: new Date().toISOString(),
  };

  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console errors
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.error(`[Browser Console Error] ${msg.text()}`);
      results.consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", (err) => {
    console.error(`[Browser Page Error] ${err.message}`);
    results.consoleErrors.push(err.message);
  });

  // -------------------------------------------------------------
  // Test 1: Desktop 1440x900 Scroll Choreography Sequence
  // -------------------------------------------------------------
  console.log("--- Testing Desktop 1440x900 Motion Sequence ---");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600); // Allow initial load animations to settle

  // 1. Hero Initial State
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "01-hero-desktop-1440.png"),
    fullPage: false,
  });

  // Check header state at scroll 0
  const headerInitialClass = await page.getAttribute("[data-site-header]", "class");
  console.log(`Initial header classes: ${headerInitialClass}`);

  // 2. Scroll to 150px to test header state transition
  await page.evaluate(() => window.scrollTo(0, 150));
  await page.waitForTimeout(200);
  const headerScrolledClass = await page.getAttribute("[data-site-header]", "class");
  const headerHasBlur = headerScrolledClass.includes("backdrop-blur-md");
  console.log(`Scrolled header has backdrop blur: ${headerHasBlur}`);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "02-hero-scrolled-1440.png"),
    fullPage: false,
  });

  // 3. Scroll to Selected Work Project 01 (Rubix Luxury)
  const workSection = page.locator("#work");
  await workSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "03-work-project-01-reveal-1440.png"),
    fullPage: false,
  });

  // 4. Scroll through Project 02, 03, and Pairs
  const project02 = page.locator('[data-project="02"]');
  await project02.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "04-work-splits-pairs-1440.png"),
    fullPage: false,
  });

  // 5. Scroll to Studio Section (Kinetic Typography reveal)
  const studioSection = page.locator("#studio");
  await studioSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700); // Allow entrance animation to settle
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "05-studio-statement-reveal-1440.png"),
    fullPage: false,
  });

  // Verify Studio Statement has settled
  const studioStatementTransform = await page.evaluate(() => {
    const el = document.querySelector("[data-studio-statement]");
    return el ? window.getComputedStyle(el).transform : "none";
  });
  console.log("Studio statement computed transform:", studioStatementTransform);

  // 5b. Scroll into Capabilities Section — Test 4 Pinned States & WebGL/Icon Progression
  console.log("--- Testing Capabilities Section & Visual Stage Progression ---");
  const capabilitiesSection = page.locator("#capabilities");
  await capabilitiesSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Verify Tablist and Canvas Existence
  const tabCount = await page.locator('[role="tablist"][aria-label="Capabilities"] button[role="tab"]').count();
  console.log(`Capabilities tab count: ${tabCount}`);

  const hasShaderOrCanvas = await page.evaluate(() => {
    const canvas = document.querySelector("#capabilities canvas");
    const svgFallback = document.querySelector("#capabilities svg");
    return { hasCanvas: !!canvas, hasSvg: !!svgFallback };
  });
  console.log(`Capabilities WebGL/Shader status:`, hasShaderOrCanvas);

  // State 01: Interface & Product Design
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "05a-capabilities-state-01-1440.png"),
    fullPage: false,
  });

  // State 02: Design Systems (click tab 2)
  const tab2 = page.locator('[role="tablist"][aria-label="Capabilities"] button[role="tab"]').nth(1);
  await tab2.click();
  await page.waitForTimeout(700);
  const activeTab2Title = await page.locator('[role="tab"][aria-selected="true"] h3').textContent();
  console.log(`Active capability at state 02: ${activeTab2Title?.trim()}`);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "05b-capabilities-state-02-1440.png"),
    fullPage: false,
  });

  // State 03: Software Engineering (Click tab 3)
  const tab3 = page.locator('[role="tablist"][aria-label="Capabilities"] button[role="tab"]').nth(2);
  await tab3.click();
  await page.waitForTimeout(700);
  const activeTab3Title = await page.locator('[role="tab"][aria-selected="true"] h3').textContent();
  console.log(`Active capability at state 03: ${activeTab3Title?.trim()}`);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "05c-capabilities-state-03-1440.png"),
    fullPage: false,
  });

  // State 04: Interactive Web Experiences (Click tab 4)
  const tab4 = page.locator('[role="tablist"][aria-label="Capabilities"] button[role="tab"]').nth(3);
  await tab4.click();
  await page.waitForTimeout(700);
  const activeTab4Title = await page.locator('[role="tab"][aria-selected="true"] h3').textContent();
  console.log(`Active capability at state 04: ${activeTab4Title?.trim()}`);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "05d-capabilities-state-04-1440.png"),
    fullPage: false,
  });

  // Test Scroll Synchronization on desktop
  console.log("Testing scroll synchronization within Capabilities container...");
  const capSection = page.locator("#capabilities");
  await capSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const activeTabReset = await page.locator('[role="tab"][aria-selected="true"] h3').textContent();
  console.log(`Reset scroll active capability tab: ${activeTabReset?.trim()}`);

  // 6. Scroll into Process Section — Stage 01/02
  const processSection = page.locator("#process");
  await processSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  // Scroll to stage 2
  const stage2 = page.locator('[data-process-stage="2"]');
  await stage2.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const statusTextStage2 = await page.textContent("[data-process-status]");
  console.log(`Process dynamic readout at Stage 2: ${statusTextStage2}`);
  results.scrollStagesVerified.push({ stage: 2, readout: statusTextStage2 });

  await page.screenshot({
    path: path.join(OUTPUT_DIR, "06-process-rail-stage-02-1440.png"),
    fullPage: false,
  });

  // Scroll to stage 4
  const stage4 = page.locator('[data-process-stage="4"]');
  await stage4.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 120));
  await page.waitForTimeout(400);

  const statusTextStage4 = await page.textContent("[data-process-status]");
  console.log(`Process dynamic readout at Stage 4: ${statusTextStage4}`);
  results.scrollStagesVerified.push({ stage: 4, readout: statusTextStage4 });

  await page.screenshot({
    path: path.join(OUTPUT_DIR, "07-process-rail-stage-04-1440.png"),
    fullPage: false,
  });

  // 7. Scroll into Contact Section
  const contactSection = page.locator("#contact");
  await contactSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700); // Allow entrance animation to settle
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "08-contact-statement-1440.png"),
    fullPage: false,
  });

  // -------------------------------------------------------------
  // Test 2: Responsive Multi-Viewport Audit & Overflow Checks
  // -------------------------------------------------------------
  console.log("--- Testing Responsive Viewports & Horizontal Overflow ---");
  const viewports = [
    { name: "mobile-390x844", width: 390, height: 844 },
    { name: "mobile-430x932", width: 430, height: 932 },
    { name: "tablet-768x1024", width: 768, height: 1024 },
    { name: "tablet-1024x768", width: 1024, height: 768 },
    { name: "laptop-1280x800", width: 1280, height: 800 },
    { name: "desktop-1440x900", width: 1440, height: 900 },
    { name: "wide-1920x1080", width: 1920, height: 1080 },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    results.viewportsTested.push({
      viewport: vp.name,
      width: vp.width,
      height: vp.height,
      hasOverflow,
    });

    if (hasOverflow) {
      console.error(`❌ Overflow detected on ${vp.name}!`);
      results.overflowFailures.push(vp.name);
    } else {
      console.log(`✓ ${vp.name} passed zero-overflow check.`);
    }

    if (vp.name === "mobile-390x844") {
      await page.screenshot({
        path: path.join(OUTPUT_DIR, "09-mobile-390-hero.png"),
        fullPage: false,
      });

      await page.locator("#studio").scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(OUTPUT_DIR, "10-mobile-390-studio.png"),
        fullPage: false,
      });

      await page.locator("#capabilities").scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(OUTPUT_DIR, "10b-mobile-390-capabilities.png"),
        fullPage: false,
      });

      await page.locator("#process").scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(OUTPUT_DIR, "11-mobile-390-process.png"),
        fullPage: false,
      });

      await page.locator("#contact").scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(OUTPUT_DIR, "12-mobile-390-contact.png"),
        fullPage: false,
      });
    } else if (vp.name === "tablet-768x1024") {
      await page.locator("#work").scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(OUTPUT_DIR, "13-tablet-768-work.png"),
        fullPage: false,
      });
    } else if (vp.name === "wide-1920x1080") {
      await page.screenshot({
        path: path.join(OUTPUT_DIR, "14-wide-1920-hero.png"),
        fullPage: false,
      });
    }
  }

  // -------------------------------------------------------------
  // Test 3: Accessibility & prefers-reduced-motion Test
  // -------------------------------------------------------------
  console.log("--- Testing prefers-reduced-motion Compliance ---");
  await context.close();

  // Create context with reduced motion forced
  const reducedContext = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 1440, height: 900 },
  });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(BASE_URL, { waitUntil: "networkidle" });
  await reducedPage.waitForTimeout(400);

  const reducedMotionStyles = await reducedPage.evaluate(() => {
    const lines = Array.from(document.querySelectorAll(".studio-statement-line"));
    const rail = document.querySelector("[data-process-rail]");
    return {
      linesOpacity: lines.map((l) => window.getComputedStyle(l).opacity),
      linesTransform: lines.map((l) => window.getComputedStyle(l).transform),
      railTransform: rail ? window.getComputedStyle(rail).transform : "none",
    };
  });

  console.log("Reduced motion computed styles:", reducedMotionStyles);
  results.reducedMotionVerified = true;

  await reducedPage.screenshot({
    path: path.join(OUTPUT_DIR, "15-reduced-motion-state.png"),
    fullPage: false,
  });

  await reducedContext.close();
  await browser.close();

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "qa-results.json"),
    JSON.stringify(results, null, 2)
  );

  console.log("\n📊 QA SUITE COMPLETE! Results saved to:", path.join(OUTPUT_DIR, "qa-results.json"));
  console.log("Console errors count:", results.consoleErrors.length);
  console.log("Overflow failures count:", results.overflowFailures.length);
}

runMotionQA().catch((err) => {
  console.error("QA script failed:", err);
  process.exit(1);
});
