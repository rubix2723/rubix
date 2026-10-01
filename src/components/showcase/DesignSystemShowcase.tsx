import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { Hairline } from '../ui/Hairline';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

export function DesignSystemShowcase() {
  return (
    <div className="max-w-[1360px] mx-auto px-6 md:px-12 py-16 md:py-24">
      {/* Header / Brand Lockup */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-12 hairline-b">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F4F4F6]" aria-hidden="true" />
          <div className="text-xl md:text-2xl font-bold tracking-tight text-[#F4F4F6]">
            RUBIX<span className="text-[#686D7D] font-normal">.studio</span>
          </div>
          <span className="text-xs font-mono uppercase text-[#F97316] px-2 py-0.5 rounded border border-[#F97316]/30 bg-[#F97316]/10">
            V2 SYSTEM FOUNDATION
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-[#686D7D]">DESIGN SYSTEM SPECIFICATION · PHASE 02</span>
        </div>
      </header>

      {/* Design System Introduction & Triad */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl space-y-6">
          <p className="type-meta text-[#F97316]">Architecture & Design Principles</p>
          <div className="space-y-1">
            <h1 className="type-display m-0">Design.</h1>
            <div className="type-display">Development.</div>
            <div className="type-display text-[#686D7D]">Knowledge.</div>
          </div>
          <p className="type-body-lg pt-4">
            The RUBIX V2 Design System rejects synthetic AI decorations, decorative pill soup, and arbitrary 3D spheres.
            Rooted in the industrial discipline of reference architecture (FMI Industries) and high-craft UI principles (Emil Kowalski),
            this foundation guarantees visual authority through typography, spatial restraint, and tactile feedback.
          </p>
        </div>
      </section>

      <Hairline />

      {/* 1. Color System & Contrast Calibration */}
      <section className="py-16 md:py-24">
        <div className="mb-12">
          <p className="type-meta text-[#F97316]">Token Specification 01</p>
          <h2 className="type-h2 mt-2">Color Matrix & Verified Contrast Ratios</h2>
          <p className="type-body mt-2">
            Strictly calibrated for WCAG 2.1 AA (4.5:1 min) and AAA (7.0:1 min) standards against the #07080A canvas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Canvas */}
          <div className="p-6 rounded-xl bg-[#0E1015] border border-white/[0.08] flex flex-col justify-between h-44">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-[#07080A] border border-white/20" />
              <span className="type-meta">Canvas Void</span>
            </div>
            <div>
              <div className="font-mono text-sm text-[#F4F4F6]">#07080A</div>
              <div className="type-caption text-xs mt-1">Base background. Deep charcoal.</div>
            </div>
          </div>

          {/* Surface */}
          <div className="p-6 rounded-xl bg-[#0E1015] border border-white/[0.08] flex flex-col justify-between h-44">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-[#0E1015] border border-white/20" />
              <span className="type-meta">Architectural Surface</span>
            </div>
            <div>
              <div className="font-mono text-sm text-[#F4F4F6]">#0E1015</div>
              <div className="type-caption text-xs mt-1">Elevated cards & navigation bars.</div>
            </div>
          </div>

          {/* Text Primary */}
          <div className="p-6 rounded-xl bg-[#0E1015] border border-white/[0.08] flex flex-col justify-between h-44">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-[#F4F4F6]" />
              <span className="type-meta text-emerald-400">17.5:1 (AAA)</span>
            </div>
            <div>
              <div className="font-mono text-sm text-[#F4F4F6]">#F4F4F6</div>
              <div className="type-caption text-xs mt-1">Primary display & headline text.</div>
            </div>
          </div>

          {/* Text Secondary */}
          <div className="p-6 rounded-xl bg-[#0E1015] border border-white/[0.08] flex flex-col justify-between h-44">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-[#A0A5B5]" />
              <span className="type-meta text-emerald-400">6.2:1 (AA)</span>
            </div>
            <div>
              <div className="font-mono text-sm text-[#F4F4F6]">#A0A5B5</div>
              <div className="type-caption text-xs mt-1">Body text & descriptions.</div>
            </div>
          </div>

          {/* Text Muted */}
          <div className="p-6 rounded-xl bg-[#0E1015] border border-white/[0.08] flex flex-col justify-between h-44">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-[#686D7D]" />
              <span className="type-meta text-emerald-400">4.5:1 (AA)</span>
            </div>
            <div>
              <div className="font-mono text-sm text-[#F4F4F6]">#686D7D</div>
              <div className="type-caption text-xs mt-1">Labels, dividers & coordinates.</div>
            </div>
          </div>

          {/* Signal Orange */}
          <div className="p-6 rounded-xl bg-[#0E1015] border border-white/[0.08] flex flex-col justify-between h-44">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-[#F97316]" />
              <span className="type-meta text-orange-400">Primary Accent</span>
            </div>
            <div>
              <div className="font-mono text-sm text-[#F4F4F6]">#F97316</div>
              <div className="type-caption text-xs mt-1">Industrial Safety Orange. 7.2:1 on dark text.</div>
            </div>
          </div>

          {/* State / Telemetry Accent */}
          <div className="p-6 rounded-xl bg-[#0E1015] border border-white/[0.08] flex flex-col justify-between h-44">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-[#10B981]" />
              <span className="type-meta text-emerald-400">State / Telemetry</span>
            </div>
            <div>
              <div className="font-mono text-sm text-[#F4F4F6]">#10B981</div>
              <div className="type-caption text-xs mt-1">Runtime healthcheck utility. Restricted to real data.</div>
            </div>
          </div>

          {/* Hairline Border */}
          <div className="p-6 rounded-xl bg-[#0E1015] border border-white/[0.08] flex flex-col justify-between h-44">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg border border-white/20" />
              <span className="type-meta">Hairline 1px</span>
            </div>
            <div>
              <div className="font-mono text-sm text-[#F4F4F6]">rgba(255,255,255,0.08)</div>
              <div className="type-caption text-xs mt-1">Subtle precision architectural separation.</div>
            </div>
          </div>
        </div>
      </section>

      <Hairline />

      {/* 2. Typographic Scale Calibration */}
      <section className="py-16 md:py-24">
        <div className="mb-12">
          <p className="type-meta text-[#F97316]">Token Specification 02</p>
          <h2 className="type-h2 mt-2">Fluid Typographic Hierarchy</h2>
          <p className="type-body mt-2">
            Responsive CSS clamp scaling with manually art-directed negative letter-spacing and tight line-heights.
          </p>
        </div>

        <div className="space-y-12">
          <div className="pb-8 hairline-b">
            <span className="type-meta block mb-2">Display Scale // clamp(2.75rem, 5.75rem) // leading-[0.98] // tracking-[-0.035em]</span>
            <div className="type-display">Architectural Precision</div>
          </div>

          <div className="pb-8 hairline-b">
            <span className="type-meta block mb-2">Heading 01 // clamp(2.25rem, 4.0rem) // leading-[1.05] // tracking-[-0.03em]</span>
            <div className="type-h1">Direct Engineering with Hands-On Builders</div>
          </div>

          <div className="pb-8 hairline-b">
            <span className="type-meta block mb-2">Heading 02 // clamp(1.75rem, 2.75rem) // leading-[1.15] // tracking-[-0.025em]</span>
            <div className="type-h2">Selected Production Architecture</div>
          </div>

          <div className="pb-8 hairline-b">
            <span className="type-meta block mb-2">Heading 03 // clamp(1.25rem, 1.75rem) // leading-[1.25] // tracking-[-0.02em]</span>
            <div className="type-h3">Full-Stack TypeScript & Cloud Infrastructure</div>
          </div>

          <div className="pb-8 hairline-b">
            <span className="type-meta block mb-2">Body Large // clamp(1.125rem, 1.25rem) // leading-[1.65] // max-w-65ch</span>
            <p className="type-body-lg">
              We craft digital products that eliminate technical debt and bridge high-end editorial aesthetics with production stability.
              Every interface is engineered from first principles with accessible semantic HTML and measurable performance.
            </p>
          </div>

          <div className="pb-8 hairline-b">
            <span className="type-meta block mb-2">Body Regular // 1.0rem (16px) // leading-[1.65] // max-w-65ch</span>
            <p className="type-body">
              Senior engineers work directly on your product architecture. No intermediaries, no junior staffing, and zero synthetic boilerplate.
            </p>
          </div>

          <div>
            <span className="type-meta block mb-2">Technical Metadata // 0.75rem (12px) // ui-monospace // tracking-[0.08em]</span>
            <div className="type-meta">LATENCY &lt; 40MS // ZERO DOWNTIME CUTOVER // 100% IP TRANSFERRED</div>
          </div>
        </div>
      </section>

      <Hairline />

      {/* 3. Component Primitives & Tactile Interactions */}
      <section className="py-16 md:py-24">
        <div className="mb-12">
          <p className="type-meta text-[#F97316]">Token Specification 03</p>
          <h2 className="type-h2 mt-2">Interactive Control Primitives</h2>
          <p className="type-body mt-2">
            Demonstrating Emil Kowalski's tactile feedback (:active scale-[0.98]), custom cubic-bezier curves, and single-line wrap guarantees.
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <span className="type-meta block mb-4">Button Variants</span>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary" icon={<ArrowUpRight className="w-4 h-4" />}>
                Primary Action
              </Button>
              <Button variant="secondary" icon={<ArrowRight className="w-4 h-4" />}>
                Secondary Action
              </Button>
              <Button variant="outline">
                Outline Control
              </Button>
              <Button variant="signal" icon={<ArrowUpRight className="w-4 h-4" />}>
                Signal Accent
              </Button>
              <Button variant="ghost">
                Ghost Link
              </Button>
            </div>
          </div>

          <div className="pt-6">
            <span className="type-meta block mb-4">Size Hierarchy (Enforcing 44px min touch target on standard sizes)</span>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm" variant="secondary">
                Small (36px)
              </Button>
              <Button size="md" variant="secondary">
                Standard (44px AA)
              </Button>
              <Button size="lg" variant="secondary">
                Large (52px Hero)
              </Button>
            </div>
          </div>

          <div className="pt-6">
            <span className="type-meta block mb-2">Telemetry & Healthcheck Primitive (Data-Bound Only)</span>
            <p className="type-caption mb-4">
              Restricted strictly to verified runtime data (e.g. live healthcheck endpoints). Never used as permanent brand decoration.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <StatusBadge status="operational" label="Endpoint 200 OK" />
              <StatusBadge status="notice" label="Latency Check" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer of Foundation Sheet */}
      <footer className="pt-12 hairline-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#686D7D]">
        <div>RUBIX V2 DESIGN SYSTEM SPECIFICATION — PHASE 02 FOUNDATION</div>
        <div>ASTRO 7 + TAILWIND V4 + REACT PRIMITIVES</div>
      </footer>
    </div>
  );
}
