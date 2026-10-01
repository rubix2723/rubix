// RUBIX V2 — Architectural Motion & Scroll Choreography
// Driven by GSAP & ScrollTrigger with Emil Kowalski interaction principles
// Respects prefers-reduced-motion, eliminates layout shifts, zero horizontal overflow

import { getGSAP } from "./gsap";
import { prefersReducedMotion, onReducedMotionChange } from "./motion-preferences";

let activeTriggers: any[] = [];
let cleanupReducedMotion: (() => void) | null = null;

/**
 * Safely split text into lines based on computed layout after fonts load.
 * Wraps each line in .reveal-line-wrap (overflow hidden) and .reveal-line (transform block).
 */
function splitIntoLines(element: HTMLElement): HTMLElement[] {
  const existing = element.querySelectorAll<HTMLElement>(".reveal-line");
  if (existing.length > 0) return Array.from(existing);

  const text = element.textContent?.trim() || "";
  if (!text) return [];

  const words = text.split(/\s+/);
  element.innerHTML = "";

  // Temporary inline word elements to measure render line coordinates
  const wordSpans = words.map((word) => {
    const span = document.createElement("span");
    span.textContent = word + " ";
    span.style.display = "inline";
    element.appendChild(span);
    return span;
  });

  const lines: HTMLElement[][] = [];
  let currentLine: HTMLElement[] = [];
  let currentTop = -1;

  wordSpans.forEach((span) => {
    const top = span.offsetTop;
    if (Math.abs(top - currentTop) > 4) {
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      currentLine = [span];
      currentTop = top;
    } else {
      currentLine.push(span);
    }
  });
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  // Clear and reconstruct with protective line masks
  element.innerHTML = "";
  const lineEls: HTMLElement[] = [];

  lines.forEach((lineWords) => {
    const lineText = lineWords.map((w) => w.textContent).join("").trim();
    const wrap = document.createElement("span");
    wrap.className = "reveal-line-wrap block overflow-hidden";
    wrap.style.display = "block";
    wrap.style.overflow = "hidden";

    const inner = document.createElement("span");
    inner.className = "reveal-line inline-block will-change-transform";
    inner.style.display = "inline-block";
    inner.textContent = lineText;

    wrap.appendChild(inner);
    element.appendChild(wrap);
    lineEls.push(inner);
  });

  return lineEls;
}

/**
 * Split element into individual words wrapped in .reveal-word for tier-2 reveals.
 */
function splitIntoWords(element: HTMLElement): HTMLElement[] {
  const existing = element.querySelectorAll<HTMLElement>(".reveal-word");
  if (existing.length > 0) return Array.from(existing);

  const text = element.textContent?.trim() || "";
  if (!text) return [];

  const words = text.split(/\s+/);
  element.innerHTML = "";

  const wordEls: HTMLElement[] = [];
  words.forEach((word, i) => {
    const wrap = document.createElement("span");
    wrap.className = "reveal-word inline-block will-change-transform";
    wrap.style.display = "inline-block";
    wrap.textContent = word + (i < words.length - 1 ? "\u00A0" : "");
    element.appendChild(wrap);
    wordEls.push(wrap);
  });

  return wordEls;
}

export function initScrollScenes() {
  if (typeof window === "undefined") return;

  // Clean up any previously registered triggers and listeners
  activeTriggers.forEach((st) => st.kill && st.kill());
  activeTriggers = [];
  if (cleanupReducedMotion) {
    cleanupReducedMotion();
    cleanupReducedMotion = null;
  }

  const { gsap, ScrollTrigger } = getGSAP();

  // Handle Reduced Motion preferences
  const isReduced = prefersReducedMotion();
  if (isReduced) {
    applyReducedMotion();
    cleanupReducedMotion = onReducedMotionChange((reduced) => {
      if (!reduced) {
        initScrollScenes();
      }
    });
    return;
  }

  // Subscribe to changes in reduced motion preference
  cleanupReducedMotion = onReducedMotionChange((reduced) => {
    if (reduced) {
      applyReducedMotion();
    } else {
      initScrollScenes();
    }
  });

  // Custom Emil Kowalski easing curve
  const EMIL_EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

  // -------------------------------------------------------------
  // 1. Global Header: Scrolled State (Floating Capsule)
  // -------------------------------------------------------------
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  const capsule = document.querySelector<HTMLElement>("[data-nav-capsule]");
  if (header) {
    const headerST = ScrollTrigger.create({
      start: "top -30px",
      onUpdate: (self) => {
        const isScrolled = self.progress > 0;
        header.setAttribute("data-scrolled", isScrolled ? "true" : "false");
        if (capsule) {
          capsule.setAttribute("data-scrolled", isScrolled ? "true" : "false");
        }
      },
    });
    activeTriggers.push(headerST);
  }

  // -------------------------------------------------------------
  // 2. Responsive MatchMedia Choreography
  // -------------------------------------------------------------
  const mm = gsap.matchMedia();

  // DESKTOP (>= 1024px)
  mm.add("(min-width: 1024px)", () => {
    // --- Hero Section Parallax Triad ---
    const line1 = document.querySelector<HTMLElement>('[data-hero-line="1"]');
    const line2 = document.querySelector<HTMLElement>('[data-hero-line="2"]');
    const line3 = document.querySelector<HTMLElement>('[data-hero-line="3"]');
    const heroSupport = document.querySelector<HTMLElement>("[data-hero-support]");
    const heroMeta = document.querySelector<HTMLElement>("[data-hero-meta]");
    const heroMercury = document.querySelector<HTMLElement>("[data-hero-mercury]");

    if (line1 && line2 && line3) {
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });

      heroTl
        .to(line1, { xPercent: -3.0, ease: "none" }, 0)
        .to(line2, { xPercent: 4.0, ease: "none" }, 0)
        .to(line3, { xPercent: -1.8, ease: "none" }, 0);

      if (heroMercury) {
        heroTl.to(
          heroMercury,
          {
            yPercent: -6,
            scale: 0.96,
            opacity: 0.04,
            ease: "none",
          },
          0
        );
      }

      if (heroSupport) {
        heroTl.to(heroSupport, { yPercent: 12, opacity: 0.65, ease: "none" }, 0);
      }
      if (heroMeta) {
        heroTl.to(heroMeta, { yPercent: 18, opacity: 0.5, ease: "none" }, 0);
      }
    }

    // --- Selected Work: Project 01 (Rubix Luxury) Cinematic Reveal ---
    const p1Media = document.querySelector<HTMLElement>('[data-project="01"] [data-project-media]');
    const p1Img = document.querySelector<HTMLElement>('[data-project="01"] [data-project-img]');
    if (p1Media && p1Img) {
      gsap.fromTo(
        p1Media,
        { clipPath: "inset(4% round 8px)" },
        {
          clipPath: "inset(0% round 8px)",
          ease: "none",
          scrollTrigger: {
            trigger: '[data-project="01"]',
            start: "top 85%",
            end: "top 35%",
            scrub: 0.6,
          },
        }
      );

      gsap.fromTo(
        p1Img,
        { scale: 1.04 },
        {
          scale: 1.0,
          ease: "none",
          scrollTrigger: {
            trigger: '[data-project="01"]',
            start: "top 85%",
            end: "top 35%",
            scrub: 0.6,
          },
        }
      );
    }

    // --- Selected Work: Project 02 (Trouver) Asymmetric Split ---
    const p2Media = document.querySelector<HTMLElement>('[data-project="02"] [data-split-media]');
    const p2Text = document.querySelector<HTMLElement>('[data-project="02"] [data-split-text]');
    if (p2Media && p2Text) {
      gsap.fromTo(
        p2Media,
        { y: 35 },
        {
          y: -25,
          ease: "none",
          scrollTrigger: {
            trigger: '[data-project="02"]',
            start: "top 90%",
            end: "bottom 10%",
            scrub: 0.8,
          },
        }
      );
      gsap.fromTo(
        p2Text,
        { y: -15 },
        {
          y: 20,
          ease: "none",
          scrollTrigger: {
            trigger: '[data-project="02"]',
            start: "top 90%",
            end: "bottom 10%",
            scrub: 0.8,
          },
        }
      );
    }

    // --- Selected Work: Project 03 (VedaHarmony) Inverted Split ---
    const p3Media = document.querySelector<HTMLElement>('[data-project="03"] [data-split-media]');
    const p3Text = document.querySelector<HTMLElement>('[data-project="03"] [data-split-text]');
    if (p3Media && p3Text) {
      gsap.fromTo(
        p3Media,
        { y: -20 },
        {
          y: 25,
          ease: "none",
          scrollTrigger: {
            trigger: '[data-project="03"]',
            start: "top 90%",
            end: "bottom 10%",
            scrub: 0.8,
          },
        }
      );
      gsap.fromTo(
        p3Text,
        { y: 25 },
        {
          y: -15,
          ease: "none",
          scrollTrigger: {
            trigger: '[data-project="03"]',
            start: "top 90%",
            end: "bottom 10%",
            scrub: 0.8,
          },
        }
      );
    }

    // --- Selected Work: Pair (Projects 04 & 05) Counterpoint ---
    const p4 = document.querySelector<HTMLElement>('[data-project="04"]');
    const p5 = document.querySelector<HTMLElement>('[data-project="05"]');
    if (p4 && p5) {
      gsap.fromTo(
        p5,
        { y: 45 },
        {
          y: -20,
          ease: "none",
          scrollTrigger: {
            trigger: ".project-pair",
            start: "top 85%",
            end: "bottom 15%",
            scrub: 0.8,
          },
        }
      );
    }
  });

  // TABLET ((min-width: 768px) and (max-width: 1023px))
  mm.add("(min-width: 768px) and (max-width: 1023px)", () => {
    // Subtle vertical parallax without horizontal shift
    const p1Media = document.querySelector<HTMLElement>('[data-project="01"] [data-project-media]');
    if (p1Media) {
      gsap.fromTo(
        p1Media,
        { clipPath: "inset(2% round 8px)" },
        {
          clipPath: "inset(0% round 8px)",
          ease: "none",
          scrollTrigger: {
            trigger: '[data-project="01"]',
            start: "top 90%",
            end: "top 45%",
            scrub: 0.5,
          },
        }
      );
    }
  });

  // ALL VIEWPORTS (Desktop, Tablet & Mobile)
  mm.add("(min-width: 0px)", () => {
    // Hero Mercury Scroll Fade on non-desktop screens (< 1024px)
    const heroMercuryMobile = document.querySelector<HTMLElement>("[data-hero-mercury]");
    if (heroMercuryMobile && window.innerWidth < 1024) {
      gsap.to(heroMercuryMobile, {
        yPercent: -4,
        opacity: 0.04,
        ease: "none",
        scrollTrigger: {
          trigger: "#hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }

    // -------------------------------------------------------------
    // 2. Image Scroll Choreography (All 6 Projects)
    // -------------------------------------------------------------
    const setupProjectImageReveals = () => {
      // Project 02: Split Image scale entrance
      const p2Img = document.querySelector<HTMLElement>('[data-project="02"] [data-split-img]');
      if (p2Img) {
        const st = ScrollTrigger.create({
          trigger: '[data-project="02"]',
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.fromTo(
              p2Img,
              { scale: 1.04 },
              { scale: 1.0, duration: 0.85, ease: EMIL_EASE }
            );
          },
        });
        activeTriggers.push(st);
      }

      // Project 03: Split Image scale entrance
      const p3Img = document.querySelector<HTMLElement>('[data-project="03"] [data-split-img]');
      if (p3Img) {
        const st = ScrollTrigger.create({
          trigger: '[data-project="03"]',
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.fromTo(
              p3Img,
              { scale: 1.04 },
              { scale: 1.0, duration: 0.85, ease: EMIL_EASE }
            );
          },
        });
        activeTriggers.push(st);
      }

      // Project 04 & 05: Pair media reveals
      const p4Media = document.querySelector<HTMLElement>('[data-project="04"] [data-pair-media]');
      const p4Img = document.querySelector<HTMLElement>('[data-project="04"] [data-pair-img]');
      if (p4Media && p4Img) {
        const st = ScrollTrigger.create({
          trigger: '[data-project="04"]',
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.fromTo(
              p4Media,
              { opacity: 0, y: 24, clipPath: "inset(3% round 8px)" },
              { opacity: 1, y: 0, clipPath: "inset(0% round 8px)", duration: 0.85, ease: EMIL_EASE }
            );
            gsap.fromTo(
              p4Img,
              { scale: 1.04 },
              { scale: 1.0, duration: 0.85, ease: EMIL_EASE }
            );
          },
        });
        activeTriggers.push(st);
      }

      const p5Media = document.querySelector<HTMLElement>('[data-project="05"] [data-pair-media]');
      const p5Img = document.querySelector<HTMLElement>('[data-project="05"] [data-pair-img]');
      if (p5Media && p5Img) {
        const st = ScrollTrigger.create({
          trigger: '[data-project="05"]',
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.fromTo(
              p5Media,
              { opacity: 0, y: 24, clipPath: "inset(3% round 8px)" },
              { opacity: 1, y: 0, clipPath: "inset(0% round 8px)", duration: 0.85, ease: EMIL_EASE }
            );
            gsap.fromTo(
              p5Img,
              { scale: 1.04 },
              { scale: 1.0, duration: 0.85, ease: EMIL_EASE }
            );
          },
        });
        activeTriggers.push(st);
      }

      // Project 06: Ledger media reveal
      const p6Media = document.querySelector<HTMLElement>('[data-project="06"] [data-ledger-media]');
      const p6Img = document.querySelector<HTMLElement>('[data-project="06"] [data-ledger-img]');
      if (p6Media && p6Img) {
        const st = ScrollTrigger.create({
          trigger: '[data-project="06"]',
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.fromTo(
              p6Media,
              { opacity: 0, y: 24, clipPath: "inset(3% round 8px)" },
              { opacity: 1, y: 0, clipPath: "inset(0% round 8px)", duration: 0.85, ease: EMIL_EASE }
            );
            gsap.fromTo(
              p6Img,
              { scale: 1.04 },
              { scale: 1.0, duration: 0.85, ease: EMIL_EASE }
            );
          },
        });
        activeTriggers.push(st);
      }
    };
    setupProjectImageReveals();

    // -------------------------------------------------------------
    // 3. Text Reveal Choreography (Awaits document.fonts.ready)
    // -------------------------------------------------------------
    const setupTextReveals = async () => {
      if (document.fonts) {
        try {
          await document.fonts.ready;
        } catch {
          // Proceed if fonts.ready fails or is unavailable
        }
      }

      // Tier 1: Line reveal for Studio Statement
      const studioStatement = document.querySelector<HTMLElement>("[data-studio-statement]");
      if (studioStatement) {
        const lines = splitIntoLines(studioStatement);
        if (lines.length > 0) {
          const st = ScrollTrigger.create({
            trigger: studioStatement,
            start: "top 85%",
            once: true,
            onEnter: () => {
              gsap.fromTo(
                lines,
                { yPercent: 110, opacity: 0 },
                {
                  yPercent: 0,
                  opacity: 1,
                  duration: 0.85,
                  stagger: 0.08,
                  ease: EMIL_EASE,
                }
              );
            },
          });
          activeTriggers.push(st);
        }
      }

      // Tier 1: Line reveal for Contact Statement
      const contactStatement = document.querySelector<HTMLElement>("[data-contact-statement]");
      if (contactStatement) {
        const lines = splitIntoLines(contactStatement);
        if (lines.length > 0) {
          const st = ScrollTrigger.create({
            trigger: contactStatement,
            start: "top 90%",
            once: true,
            onEnter: () => {
              gsap.fromTo(
                lines,
                { yPercent: 110, opacity: 0 },
                {
                  yPercent: 0,
                  opacity: 1,
                  duration: 0.85,
                  stagger: 0.08,
                  ease: EMIL_EASE,
                }
              );
            },
          });
          activeTriggers.push(st);
        }
      }

      // Tier 1: Line reveal for Process Statement
      const processStatement = document.querySelector<HTMLElement>("[data-process-statement]");
      if (processStatement) {
        const lines = splitIntoLines(processStatement);
        if (lines.length > 0) {
          const st = ScrollTrigger.create({
            trigger: processStatement,
            start: "top 85%",
            once: true,
            onEnter: () => {
              gsap.fromTo(
                lines,
                { yPercent: 110, opacity: 0 },
                {
                  yPercent: 0,
                  opacity: 1,
                  duration: 0.85,
                  stagger: 0.08,
                  ease: EMIL_EASE,
                }
              );
            },
          });
          activeTriggers.push(st);
        }
      }

      // Tier 1: Line reveal for Project 01 Title
      const p1Title = document.querySelector<HTMLElement>('[data-project="01"] h3');
      if (p1Title) {
        const lines = splitIntoLines(p1Title);
        if (lines.length > 0) {
          const st = ScrollTrigger.create({
            trigger: '[data-project="01"]',
            start: "top 85%",
            once: true,
            onEnter: () => {
              gsap.fromTo(
                lines,
                { yPercent: 110, opacity: 0 },
                {
                  yPercent: 0,
                  opacity: 1,
                  duration: 0.85,
                  stagger: 0.08,
                  ease: EMIL_EASE,
                }
              );
            },
          });
          activeTriggers.push(st);
        }
      }

      // Tier 2: Word reveal for Studio narrative paragraphs
      const studioParas = document.querySelectorAll<HTMLElement>("[data-studio-p]");
      if (studioParas.length > 0) {
        const allWords: HTMLElement[] = [];
        studioParas.forEach((p) => {
          allWords.push(...splitIntoWords(p));
        });
        if (allWords.length > 0) {
          const st = ScrollTrigger.create({
            trigger: "[data-studio-body]",
            start: "top 85%",
            once: true,
            onEnter: () => {
              gsap.fromTo(
                allWords,
                { y: 14, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.55,
                  stagger: 0.012,
                  ease: EMIL_EASE,
                }
              );
            },
          });
          activeTriggers.push(st);
        }
      }
    };
    setupTextReveals();

    // Tier 3: Fade for studio ledger rows
    const ledgerRows = document.querySelectorAll<HTMLElement>("[data-ledger-row]");
    if (ledgerRows.length > 0) {
      gsap.fromTo(
        ledgerRows,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.07,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "[data-studio-ledger]",
            start: "top 85%",
            once: true,
          },
        }
      );
    }

    // -------------------------------------------------------------
    // 4. Process: Continuous Rail Scrub & Dynamic Telemetry
    // -------------------------------------------------------------
    const processRail = document.querySelector<HTMLElement>("[data-process-rail]");
    const processStatus = document.querySelector<HTMLElement>("[data-process-status]");
    const stageElements = document.querySelectorAll<HTMLElement>(".process-stage");

    const stageNames = [
      "01 / 04 · Frame",
      "02 / 04 · Design",
      "03 / 04 · Build",
      "04 / 04 · Refine",
    ];

    if (processRail) {
      gsap.fromTo(
        processRail,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "#process",
            start: "top 65%",
            end: "bottom 75%",
            scrub: 0.3,
          },
        }
      );
    }

    if (stageElements.length > 0) {
      stageElements.forEach((stage, idx) => {
        const node = stage.querySelector<HTMLElement>("[data-stage-node]");
        const dot = stage.querySelector<HTMLElement>("[data-stage-dot]");
        const title = stage.querySelector<HTMLElement>("[data-stage-title]");
        const summary = stage.querySelector<HTMLElement>("[data-stage-summary]");
        const detail = stage.querySelector<HTMLElement>("[data-stage-detail]");

        const isLast = idx === stageElements.length - 1;
        const triggerStart = isLast ? "top 80%" : "top 60%";
        const triggerEnd = isLast ? "bottom 90%" : "bottom 60%";

        const st = ScrollTrigger.create({
          trigger: stage,
          start: triggerStart,
          end: triggerEnd,
          onEnter: () => {
            if (processStatus) processStatus.textContent = stageNames[idx] || "";
            if (node) {
              node.style.borderColor = "var(--border-hairline)";
              node.style.backgroundColor = "var(--bg-surface)";
            }
            if (dot) {
              dot.style.backgroundColor = "var(--accent-signal)";
              dot.style.transform = "scale(1.0)";
            }
            if (title) title.style.color = "var(--text-primary)";
            if (summary) summary.style.color = "var(--text-primary)";
            if (detail) detail.style.color = "var(--text-secondary)";
          },
          onEnterBack: () => {
            if (processStatus) processStatus.textContent = stageNames[idx] || "";
            if (node) {
              node.style.borderColor = "var(--border-hairline)";
              node.style.backgroundColor = "var(--bg-surface)";
            }
            if (dot) {
              dot.style.backgroundColor = "var(--accent-signal)";
              dot.style.transform = "scale(1.0)";
            }
            if (title) title.style.color = "var(--text-primary)";
            if (summary) summary.style.color = "var(--text-primary)";
            if (detail) detail.style.color = "var(--text-secondary)";
          },
          onLeave: () => {
            if (node) node.style.borderColor = "var(--border-hairline)";
            if (dot) {
              dot.style.backgroundColor = "var(--text-secondary)";
              dot.style.transform = "scale(1.0)";
            }
            if (title) title.style.color = "var(--text-secondary)";
          },
          onLeaveBack: () => {
            if (node) {
              node.style.borderColor = "var(--border-hairline)";
              node.style.backgroundColor = "var(--bg-canvas)";
            }
            if (dot) {
              dot.style.backgroundColor = "var(--text-tertiary)";
              dot.style.transform = "scale(1.0)";
            }
            if (title) title.style.color = "var(--text-tertiary)";
            if (summary) summary.style.color = "var(--text-tertiary)";
            if (detail) detail.style.color = "var(--text-tertiary)";
          },
        });
        activeTriggers.push(st);
      });
    }

    // -------------------------------------------------------------
    // 5. Contact: Direct Action & Quiet Ledger Fade
    // -------------------------------------------------------------
    const contactEmailWrap = document.querySelector<HTMLElement>("[data-contact-email-wrap]");
    if (contactEmailWrap) {
      gsap.fromTo(
        contactEmailWrap,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: contactEmailWrap,
            start: "top 85%",
            once: true,
          },
        }
      );
    }

    // Contact ledger removed — minimal centered layout
  });
}

function applyReducedMotion() {
  activeTriggers.forEach((st) => st.kill && st.kill());
  activeTriggers = [];

  const resetSelectors = [
    ".reveal-line",
    ".reveal-word",
    ".reveal-line-wrap",
    "[data-studio-statement]",
    "[data-contact-statement]",
    "[data-process-statement]",
    "[data-studio-p]",
    "[data-ledger-row]",
    "[data-hero-line='1']",
    "[data-hero-line='2']",
    "[data-hero-line='3']",
    "[data-hero-support]",
    "[data-hero-meta]",
    "[data-contact-email-wrap]",
    "[data-project-media]",
    "[data-project-img]",
    "[data-split-media]",
    "[data-split-text]",
    "[data-split-img]",
    "[data-pair-media]",
    "[data-pair-img]",
    "[data-ledger-media]",
    "[data-ledger-img]",
  ];

  resetSelectors.forEach((sel) => {
    document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
      el.style.transform = "none";
      el.style.opacity = "1";
      el.style.clipPath = "none";
      if (el.classList.contains("reveal-line-wrap")) {
        el.style.overflow = "visible";
      }
    });
  });

  const rail = document.querySelector<HTMLElement>("[data-process-rail]");
  if (rail) {
    rail.style.transform = "scaleY(1)";
  }

  document.querySelectorAll<HTMLElement>(".process-stage").forEach((stage) => {
    const title = stage.querySelector<HTMLElement>("[data-stage-title]");
    const summary = stage.querySelector<HTMLElement>("[data-stage-summary]");
    const detail = stage.querySelector<HTMLElement>("[data-stage-detail]");
    if (title) title.style.color = "var(--text-primary)";
    if (summary) summary.style.color = "var(--text-primary)";
    if (detail) detail.style.color = "var(--text-secondary)";
  });
}

// Auto-run on client DOM lifecycle events
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScrollScenes);
  } else {
    initScrollScenes();
  }
  document.addEventListener("astro:page-load", initScrollScenes);
}
