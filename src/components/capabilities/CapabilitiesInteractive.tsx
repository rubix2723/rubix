import { useState, useEffect, useRef } from "react";
import { ShaderLines } from "@/components/ui/shader-lines";
import {
  LayoutFrameIcon,
  ModularGridIcon,
  ZapIcon,
  MotionPathIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface CapabilityItem {
  index: string;
  title: string;
  tagline: string;
  description: string;
  deliverables: string[];
  focusArea: string;
}

export const CAPABILITIES: CapabilityItem[] = [
  {
    index: "01",
    title: "Interface & Product Design",
    tagline: "Architecture & Layout Hierarchy",
    description:
      "Structuring clear digital products from initial concepts through interactive screens. We design information hierarchies, navigation patterns, and user flows that make complex workflows straightforward.",
    deliverables: [
      "Information architecture",
      "Interactive prototypes",
      "High-fidelity interface screens",
      "Responsive layout systems",
    ],
    focusArea: "Product Architecture & Hierarchy",
  },
  {
    index: "02",
    title: "Design Systems",
    tagline: "Tokens & Component Governance",
    description:
      "Establishing cohesive design languages that bridge design files and production code. We define accessible typography, semantic color tokens, and modular components that keep products consistent as they scale.",
    deliverables: [
      "Semantic design tokens",
      "Component specifications",
      "Accessible typography scales",
      "Cross-platform pattern libraries",
    ],
    focusArea: "System Tokens & Modularity",
  },
  {
    index: "03",
    title: "Software Engineering",
    tagline: "Static-First Production Software",
    description:
      "Building fast, accessible, and maintainable web applications using modern web standards. We emphasize static-first architecture, clean semantic HTML, resilient styling, and minimal client-side overhead.",
    deliverables: [
      "Astro & React application architecture",
      "Static-first & server-rendered applications",
      "TypeScript implementation",
      "Core Web Vitals & performance tuning",
    ],
    focusArea: "Production Code Architecture",
  },
  {
    index: "04",
    title: "Interactive Web Experiences",
    tagline: "Tactile Motion & Editorial Pacing",
    description:
      "Crafting tailored web experiences with considered tactile interactions. From custom catalog showcases and booking flows to spatial portfolios, every interaction serves clarity rather than spectacle.",
    deliverables: [
      "Curated commerce & catalog showcases",
      "Tailored inquiry & booking workflows",
      "Spatial & architectural portfolios",
      "Refined micro-interactions",
    ],
    focusArea: "Interaction Choreography",
  },
];

export function CapabilitiesInteractive() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isManualScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const activeCapability = CAPABILITIES[activeIndex];

  // Sync scroll on desktop when the section is scrolled
  useEffect(() => {
    const handleScrollSync = () => {
      // Only coordinate scroll progress on desktop viewports
      if (window.innerWidth < 1024) return;
      if (isManualScrollRef.current) return;
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalDist = el.offsetHeight - viewportHeight;

      if (totalDist <= 0) return;

      const stickyTopOffset = 96; // 6rem / top-24
      const currentScroll = stickyTopOffset - rect.top;

      if (currentScroll <= 0) {
        setActiveIndex(0);
        return;
      }

      // Calculate progress relative to the pinned container [0, 1]
      const progress = Math.max(0, Math.min(1, currentScroll / totalDist));

      // 4 clean quadrants
      const newIndex = Math.min(3, Math.floor(progress * 4));
      setActiveIndex(newIndex);
    };

    window.addEventListener("scroll", handleScrollSync, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScrollSync);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const handleSelectTab = (idx: number) => {
    setActiveIndex(idx);
    if (window.innerWidth >= 1024 && containerRef.current) {
      isManualScrollRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      const el = containerRef.current;
      const rect = el.getBoundingClientRect();
      const scrollTop = window.scrollY || window.pageYOffset;
      const containerAbsoluteTop = rect.top + scrollTop;
      const stickyTopOffset = 96;
      const viewportHeight = window.innerHeight;
      const totalDist = el.offsetHeight - viewportHeight;

      if (totalDist > 0) {
        const targetScroll = containerAbsoluteTop - stickyTopOffset + totalDist * (idx / 4 + 0.1);
        window.scrollTo({ top: targetScroll, behavior: "smooth" });
        scrollTimeoutRef.current = window.setTimeout(() => {
          isManualScrollRef.current = false;
        }, 600);
      }
    }
  };

  // Custom icon renderer
  const renderIcon = (index: number, size = 22, isAnimated = false, className = "") => {
    switch (index) {
      case 0:
        return <LayoutFrameIcon size={size} isAnimated={isAnimated} className={className} />;
      case 1:
        return <ModularGridIcon size={size} isAnimated={isAnimated} className={className} />;
      case 2:
        return <ZapIcon size={size} isAnimated={isAnimated} className={className} />;
      case 3:
        return <MotionPathIcon size={size} isAnimated={isAnimated} className={className} />;
      default:
        return <ZapIcon size={size} isAnimated={isAnimated} className={className} />;
    }
  };

  // Substantive communicative architectural diagrams reflecting genuine capability concepts
  const renderDiagram = (index: number) => {
    switch (index) {
      case 0:
        // Layout & Viewport Hierarchy
        return (
          <div className="w-full h-[250px] border border-[var(--border-hairline)] rounded-md bg-[var(--bg-canvas)]/90 backdrop-blur-sm p-4 flex flex-col justify-between shadow-sm select-none">
            {/* Viewport header bar */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[var(--text-tertiary)]/30" />
                <span className="size-2 rounded-full bg-[var(--text-tertiary)]/30" />
                <span className="size-2 rounded-full bg-[var(--text-tertiary)]/30" />
              </div>
              <div className="px-2.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[10px] font-mono text-[var(--text-tertiary)]">
                rubix.studio/interface
              </div>
              <span className="size-2 rounded-full bg-[var(--accent-signal)]/80" />
            </div>

            {/* Interface wireframe hierarchy */}
            <div className="grid grid-cols-12 gap-3 flex-1 pt-3">
              {/* Left sidebar navigation */}
              <div className="col-span-3 border border-[var(--border-hairline)] rounded p-2 flex flex-col gap-1.5 bg-[var(--bg-surface)]/50">
                <div className="w-full h-1.5 rounded bg-[var(--accent-signal)]/70" />
                <div className="w-3/4 h-1 rounded bg-[var(--text-tertiary)]/25" />
                <div className="w-4/5 h-1 rounded bg-[var(--text-tertiary)]/25" />
                <div className="mt-auto w-full h-1 rounded bg-[var(--text-tertiary)]/15" />
              </div>

              {/* Main content pane */}
              <div className="col-span-9 border border-[var(--border-hairline)] rounded p-2.5 flex flex-col justify-between bg-[var(--bg-surface)]/30">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-1/2 h-2.5 rounded bg-[var(--text-primary)]/80" />
                    <span className="text-[9px] font-mono text-[var(--text-tertiary)]">1280px Grid</span>
                  </div>
                  <div className="w-4/5 h-1.5 rounded bg-[var(--text-tertiary)]/30" />
                  <div className="w-3/5 h-1.5 rounded bg-[var(--text-tertiary)]/20" />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="h-14 border border-[var(--border-hairline)] rounded bg-[var(--bg-canvas)]/60 p-2 flex flex-col justify-end gap-1">
                    <div className="w-3/4 h-1.5 rounded bg-[var(--text-primary)]/50" />
                    <div className="w-1/2 h-1 rounded bg-[var(--text-tertiary)]/30" />
                  </div>
                  <div className="h-14 border border-[var(--accent-signal)]/30 rounded bg-[var(--accent-signal)]/5 p-2 flex flex-col justify-between">
                    <span className="text-[9px] font-mono text-[var(--accent-signal)]">CTA Action</span>
                    <div className="w-full h-4 rounded bg-[var(--accent-signal)] flex items-center justify-center">
                      <span className="text-[8px] font-sans font-medium text-white">Execute →</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 1:
        // Modular Tokens & Component Tree
        return (
          <div className="w-full h-[250px] border border-[var(--border-hairline)] rounded-md bg-[var(--bg-canvas)]/90 backdrop-blur-sm p-4 flex flex-col justify-between shadow-sm font-mono text-[10px] select-none">
            {/* Token System Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
              <span className="text-[var(--text-tertiary)]">TOKEN_GOVERNANCE // v2.4</span>
              <span className="text-[var(--accent-signal)] font-sans text-[11px] font-medium">100% Synced</span>
            </div>

            {/* Color Token Swatches */}
            <div className="grid grid-cols-4 gap-2 py-1">
              <div className="p-2 rounded border border-[var(--border-hairline)] bg-[var(--bg-canvas)] flex flex-col gap-1">
                <span className="text-[8px] text-[var(--text-tertiary)]">--bg-canvas</span>
                <span className="text-[9px] text-[var(--text-primary)] font-semibold">Canvas</span>
              </div>
              <div className="p-2 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] flex flex-col gap-1">
                <span className="text-[8px] text-[var(--text-tertiary)]">--bg-surface</span>
                <span className="text-[9px] text-[var(--text-primary)] font-semibold">Surface</span>
              </div>
              <div className="p-2 rounded border border-[var(--accent-signal)]/40 bg-[var(--accent-signal)]/10 flex flex-col gap-1">
                <span className="text-[8px] text-[var(--accent-signal)]">--signal</span>
                <span className="text-[9px] text-[var(--accent-signal)] font-semibold">Accent</span>
              </div>
              <div className="p-2 rounded border border-[var(--border-hairline)] bg-[var(--text-primary)]/5 flex flex-col gap-1">
                <span className="text-[8px] text-[var(--text-tertiary)]">--border</span>
                <span className="text-[9px] text-[var(--text-primary)] font-semibold">Hairline</span>
              </div>
            </div>

            {/* Typographic Scale Ladder */}
            <div className="border border-[var(--border-hairline)] rounded p-2.5 flex flex-col gap-1.5 bg-[var(--bg-surface)]/50">
              <div className="flex items-center justify-between text-[9px] text-[var(--text-tertiary)] pb-1 border-b border-[var(--border-hairline)]">
                <span>SCALE STEP</span>
                <span>WEIGHT / TRACKING</span>
                <span>COMPUTED</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-sans font-medium text-[var(--text-primary)]">
                <span>Display</span>
                <span className="font-mono text-[9px] text-[var(--text-tertiary)]">500 / -0.04em</span>
                <span className="font-mono text-[9px] text-[var(--accent-signal)]">72px</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-sans font-medium text-[var(--text-secondary)]">
                <span>Heading 1</span>
                <span className="font-mono text-[9px] text-[var(--text-tertiary)]">500 / -0.035em</span>
                <span className="font-mono text-[9px] text-[var(--text-tertiary)]">48px</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-sans text-[var(--text-tertiary)]">
                <span>Body Text</span>
                <span className="font-mono text-[9px] text-[var(--text-tertiary)]">400 / 0.00em</span>
                <span className="font-mono text-[9px] text-[var(--text-tertiary)]">16px</span>
              </div>
            </div>
          </div>
        );
      case 2:
        // Static Architecture & Code Compilation
        return (
          <div className="w-full h-[250px] border border-[var(--border-hairline)] rounded-md bg-[var(--bg-canvas)]/90 backdrop-blur-sm p-4 flex flex-col justify-between shadow-sm font-mono text-[10px] select-none">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
              <span className="text-[var(--text-tertiary)]">STACK_ARCHITECTURE</span>
              <span className="text-[var(--accent-signal)] font-medium">Static First</span>
            </div>

            {/* Pipeline Nodes */}
            <div className="grid grid-cols-3 gap-2 py-1 items-center">
              <div className="border border-[var(--border-hairline)] rounded p-2 text-center bg-[var(--bg-surface)]">
                <span className="text-[8px] text-[var(--text-tertiary)] block">SSG FRAMEWORK</span>
                <span className="text-[10px] font-semibold text-[var(--text-primary)]">Astro v7</span>
              </div>
              <div className="border border-[var(--border-hairline)] rounded p-2 text-center bg-[var(--bg-surface)]">
                <span className="text-[8px] text-[var(--text-tertiary)] block">CLIENT ISLAND</span>
                <span className="text-[10px] font-semibold text-[var(--text-primary)]">React 19</span>
              </div>
              <div className="border border-[var(--accent-signal)]/40 rounded p-2 text-center bg-[var(--accent-signal)]/10">
                <span className="text-[8px] text-[var(--accent-signal)] block">CORE VITALS</span>
                <span className="text-[10px] font-semibold text-[var(--accent-signal)]">100 / 100</span>
              </div>
            </div>

            {/* Telemetry rows */}
            <div className="border border-[var(--border-hairline)] rounded p-2.5 flex flex-col gap-1.5 bg-[var(--bg-surface)]/50">
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-[var(--text-secondary)]">Zero-JS Baseline Content</span>
                <span className="text-[var(--accent-signal)] font-semibold">0.0 KB Script</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-[var(--text-secondary)]">First Contentful Paint (FCP)</span>
                <span className="text-[var(--text-primary)] font-semibold">&lt; 0.6s Global</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-[var(--text-secondary)]">Runtime Safety</span>
                <span className="text-[var(--text-tertiary)]">Strict TypeScript</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[var(--border-hairline)] h-1 rounded-full overflow-hidden">
              <div className="w-full h-full bg-[var(--accent-signal)]" />
            </div>
          </div>
        );
      case 3:
        // Motion Path & Spatial Curve
        return (
          <div className="w-full h-[250px] border border-[var(--border-hairline)] rounded-md bg-[var(--bg-canvas)]/90 backdrop-blur-sm p-4 flex flex-col justify-between shadow-sm relative overflow-hidden font-mono text-[10px] select-none">
            {/* Curve Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
              <span className="text-[var(--text-tertiary)]">TACTILE_CHOREOGRAPHY</span>
              <span className="text-[var(--accent-signal)] font-sans text-[11px] font-medium">Emil Kowalski Curve</span>
            </div>

            {/* Dynamic SVG Easing Graph */}
            <div className="relative w-full h-28 my-auto flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 200 80" fill="none" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="0" y1="20" x2="200" y2="20" stroke="var(--border-hairline)" strokeWidth="0.75" strokeDasharray="3 3" />
                <line x1="0" y1="40" x2="200" y2="40" stroke="var(--border-hairline)" strokeWidth="0.75" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="200" y2="60" stroke="var(--border-hairline)" strokeWidth="0.75" strokeDasharray="3 3" />
                <line x1="50" y1="0" x2="50" y2="80" stroke="var(--border-hairline)" strokeWidth="0.75" strokeDasharray="3 3" />
                <line x1="100" y1="0" x2="100" y2="80" stroke="var(--border-hairline)" strokeWidth="0.75" strokeDasharray="3 3" />
                <line x1="150" y1="0" x2="150" y2="80" stroke="var(--border-hairline)" strokeWidth="0.75" strokeDasharray="3 3" />

                {/* Tangent control line */}
                <line x1="10" y1="70" x2="56" y2="10" stroke="var(--accent-signal)" strokeWidth="0.75" opacity="0.4" />
                
                {/* Primary Cubic-Bezier Easing Curve (0.23, 1, 0.32, 1) */}
                <path
                  d="M 10 70 C 56 10, 74 10, 190 10"
                  stroke="var(--accent-signal)"
                  strokeWidth="2"
                  fill="none"
                />

                {/* Control points */}
                <circle cx="10" cy="70" r="3" fill="var(--text-primary)" />
                <circle cx="56" cy="10" r="2.5" fill="var(--accent-signal)" />
                <circle cx="190" cy="10" r="3.5" fill="var(--accent-signal)" />
              </svg>
              <div className="absolute top-2 right-2 text-[9px] text-[var(--accent-signal)] bg-[var(--accent-signal)]/10 px-2 py-0.5 rounded border border-[var(--accent-signal)]/30">
                cubic-bezier(0.23, 1, 0.32, 1)
              </div>
            </div>

            {/* Timeline ticks */}
            <div className="flex items-center justify-between text-[8px] text-[var(--text-tertiary)] pt-2 border-t border-[var(--border-hairline)]">
              <span>0ms (Trigger)</span>
              <span>150ms (Snap)</span>
              <span>350ms (Settle)</span>
              <span>600ms (Rest)</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Shader configuration parameters modulated per capability
  const getShaderParams = (index: number) => {
    switch (index) {
      case 0:
        return { speed: 0.16, intensity: 0.85, signalMix: 0.1 };
      case 1:
        return { speed: 0.2, intensity: 0.95, signalMix: 0.15 };
      case 2:
        return { speed: 0.25, intensity: 1.05, signalMix: 0.3 };
      case 3:
        return { speed: 0.22, intensity: 1.0, signalMix: 0.2 };
      default:
        return { speed: 0.2, intensity: 0.95, signalMix: 0.15 };
    }
  };

  const currentParams = getShaderParams(activeIndex);

  return (
    <div
      ref={containerRef}
      id="capabilities-scroll-container"
      className="relative w-full lg:min-h-[220vh]"
    >
      {/* Desktop Sticky Stage Viewport */}
      <div className="lg:sticky lg:top-24 w-full">
        {/* Asymmetric Editorial Grid (Left: Selectable rows / Right: Interactive Visual Stage) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column (7 cols): Editorial Capability List */}
          <div
            className="lg:col-span-7 flex flex-col border-t border-[var(--border-hairline)] divide-y divide-[var(--border-hairline)]"
            role="tablist"
            aria-label="Capabilities"
          >
            {CAPABILITIES.map((item, idx) => {
              const isCurrent = activeIndex === idx;
              return (
                <button
                  key={item.index}
                  type="button"
                  role="tab"
                  aria-selected={isCurrent}
                  onClick={() => handleSelectTab(idx)}
                  className={cn(
                    "py-8 md:py-10 text-left transition-all duration-200 outline-none group focus-visible:outline-2 focus-visible:outline-[var(--accent-signal)] rounded-sm cursor-pointer",
                    isCurrent ? "opacity-100" : "opacity-50 hover:opacity-85"
                  )}
                >
                  {/* Title & Index Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <span
                        className={cn(
                          "text-xs font-mono transition-colors duration-150",
                          isCurrent ? "text-[var(--accent-signal)]" : "text-[var(--text-tertiary)]"
                        )}
                      >
                        {item.index}
                      </span>
                      <h3
                        className={cn(
                          "text-lg sm:text-xl md:text-2xl font-medium tracking-tight transition-colors duration-150",
                          isCurrent ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                        )}
                      >
                        {item.title}
                      </h3>
                    </div>

                    {/* Custom Monoline Icon Indicator */}
                    <div
                      className={cn(
                        "shrink-0 transition-colors duration-200",
                        isCurrent ? "text-[var(--accent-signal)]" : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]"
                      )}
                    >
                      {renderIcon(idx, 22, isCurrent)}
                    </div>
                  </div>

                  {/* Narrative & Deliverables */}
                  <div className="mt-4 pl-7 md:pl-8 flex flex-col gap-4">
                    <p className="text-[var(--text-secondary)] text-sm md:text-base leading-[1.65] font-normal max-w-[54ch]">
                      {item.description}
                    </p>

                    <div className="pt-1">
                      <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-sans block mb-2">
                        Deliverables
                      </span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[var(--text-secondary)]">
                        {item.deliverables.map((deliv) => (
                          <li key={deliv} className="flex items-center gap-2">
                            <span
                              className={cn(
                                "size-1 rounded-full shrink-0 transition-colors duration-200",
                                isCurrent ? "bg-[var(--accent-signal)]" : "bg-[var(--text-tertiary)]/60"
                              )}
                              aria-hidden="true"
                            />
                            <span>{deliv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column (5 cols): Desktop Interactive Visual Stage */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="relative w-full h-[480px] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] overflow-hidden flex flex-col justify-between p-7 select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              {/* Controlled Atmospheric Gradient Backing */}
              <div
                className="absolute inset-0 z-0 pointer-events-none opacity-20 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(circle at 65% 35%, rgba(249, 115, 22, 0.1), rgba(var(--bg-surface), 0.5) 45%, var(--bg-canvas) 85%)",
                }}
                aria-hidden="true"
              />

              {/* Background WebGL ShaderLines (Single persistent instance modulating parameters) */}
              <div className="absolute inset-0 z-0">
                <ShaderLines
                  speed={currentParams.speed}
                  intensity={currentParams.intensity}
                  signalMix={currentParams.signalMix}
                  activeState={activeIndex}
                  className="w-full h-full opacity-10"
                />
              </div>

              {/* Subtle Architectural Grid Texture Layer */}
              <div
                className="absolute inset-0 architectural-grid opacity-20 pointer-events-none z-0"
                aria-hidden="true"
              />

              {/* Stage Header: Practice Focus Context & Embedded Custom Motion Icon */}
              <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)] border-b border-[var(--border-hairline)] pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-[var(--accent-signal)] font-semibold">{activeCapability.index} / 04</span>
                  <span className="text-[var(--text-tertiary)]">·</span>
                  <span className="text-[var(--text-primary)] font-sans font-medium text-sm">{activeCapability.tagline}</span>
                </div>
                <div data-stage-icon className="text-[var(--accent-signal)]">
                  {renderIcon(activeIndex, 22, true, "transition-colors duration-200")}
                </div>
              </div>

              {/* Stage Centerpiece: Substantive Architectural Diagram */}
              <div className="relative z-10 w-full flex items-center justify-center my-auto transition-all duration-300">
                {renderDiagram(activeIndex)}
              </div>

              {/* Stage Footer: Editorial Summary */}
              <div className="relative z-10 pt-3.5 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                <span className="text-[var(--text-secondary)] font-sans font-medium">{activeCapability.focusArea}</span>
                <span className="text-[var(--text-tertiary)] font-mono text-[11px]">Design + Engineering</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
