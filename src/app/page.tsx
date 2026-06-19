import Link from "next/link";
import {
  ArrowRight,
  Search,
  FlaskConical,
  Eye,
  Telescope,
  Activity,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  SplitSquareHorizontal,
  Rocket,
  RotateCw,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const loopSteps = [
  {
    number: "01",
    label: "Audit",
    description: "Analyze the page for likely conversion issues.",
    icon: Telescope,
  },
  {
    number: "02",
    label: "Observe",
    description: "Collect real visitor behavior signals.",
    icon: Activity,
  },
  {
    number: "03",
    label: "Diagnose",
    description: "Identify the most likely friction point.",
    icon: Stethoscope,
  },
  {
    number: "04",
    label: "Generate",
    description: "Draft one improved product-page variant.",
    icon: Sparkles,
  },
  {
    number: "05",
    label: "Approve",
    description: "Human review before anything ships.",
    icon: ShieldCheck,
  },
  {
    number: "06",
    label: "Test",
    description: "Run a clean 50/50 split on real traffic.",
    icon: SplitSquareHorizontal,
  },
  {
    number: "07",
    label: "Ship",
    description: "Promote the winner. Repeat the loop.",
    icon: Rocket,
  },
] as const;

const principles = [
  { label: "Deterministic core", icon: ShieldCheck },
  { label: "AI where it counts", icon: Sparkles },
  { label: "Human-approved", icon: Eye },
] as const;

const entryPoints = [
  {
    eyebrow: "Step 1",
    title: "Run a URL audit",
    description:
      "Paste a public URL. Get a fast conversion audit with prioritized issues and one recommended experiment.",
    href: "/audit",
    cta: "Start an audit",
    icon: Search,
  },
  {
    eyebrow: "See it live",
    title: "Visit the demo page",
    description:
      "A realistic tracked product page. Your interactions are recorded and feed straight into the dashboard.",
    href: "/demo",
    cta: "Open demo page",
    icon: Eye,
  },
  {
    eyebrow: "Step 2",
    title: "Generate & test a variant",
    description:
      "Review behavior, approve a generated variant, run a clean A/B test, and deploy the winner.",
    href: "/experiments",
    cta: "View experiments",
    icon: FlaskConical,
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="size-2.5 rounded-full bg-primary shadow-[0_0_0_4px_var(--accent),0_0_8px_rgba(200,90,40,0.15)]"
          />
          <span className="text-base font-semibold tracking-tight">
            StorePilot
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/audit">Audit</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/experiments">Experiments</Link>
          </Button>
          <Button size="sm" className="ml-2" asChild>
            <Link href="/audit">
              Run audit
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(65%_55%_at_50%_0%,var(--accent)_0%,transparent_75%)] opacity-90"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-border to-transparent"
          />

          <div className="mx-auto max-w-6xl px-6 pt-24 pb-28 sm:pt-32 sm:pb-36">
            <div className="mx-auto max-w-2xl text-center">
              <Badge
                variant="secondary"
                className="h-7 rounded-full border-border/80 bg-card/90 px-3 text-[12px] font-medium text-muted-foreground shadow-card backdrop-blur"
              >
                <CircleDot className="size-3 text-primary" />
                Ecommerce optimization engine
              </Badge>

              <h1 className="mt-6 font-heading text-[44px] leading-[1.05] font-bold tracking-tight text-foreground sm:text-[60px]">
                Product pages that{" "}
                <span className="text-primary">keep getting sharper.</span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-muted-foreground sm:text-[17px]">
                StorePilot tracks storefront behavior, drafts one approved
                product-page experiment, measures conversion, and promotes the
                winner.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 px-6 text-[15px] shadow-primary-glow"
                  asChild
                >
                  <Link href="/audit">
                    <Search className="size-4" />
                    Run an Audit
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-5 text-[15px]"
                  asChild
                >
                  <Link href="/demo">See the live demo</Link>
                </Button>
              </div>

              <p className="mt-5 text-[13px] text-muted-foreground/80">
                No account needed · Free to try · ~30s to your first audit
              </p>
            </div>

            {/* Principles strip */}
            <div className="mx-auto mt-16 flex max-w-3xl flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {principles.map((p) => (
                <div
                  key={p.label}
                  className="flex items-center gap-2.5 text-[13.5px]"
                >
                  <span className="flex size-7 items-center justify-center rounded-full border border-border/80 bg-card text-primary shadow-card">
                    <p.icon className="size-3.5" />
                  </span>
                  <span className="font-medium text-foreground/80">
                    {p.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Loop */}
        <section className="border-t border-border/60 bg-surface-muted">
          <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <Badge
                variant="accent"
                className="rounded-full px-3 text-[11px] tracking-wide uppercase"
              >
                The loop
              </Badge>
              <h2 className="mt-5 font-heading text-[32px] font-bold tracking-tight sm:text-[40px]">
                One feedback loop.
                <span className="text-muted-foreground"> Repeated until the storefront wins.</span>
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                A clear, measurable, human-approved cycle. Behavior becomes a
                hypothesis. A hypothesis becomes a test. A test becomes a
                winner.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {loopSteps.map((step) => (
                <div
                  key={step.number}
                  className="group relative flex flex-col rounded-xl border border-border/70 bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-card-hover"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <step.icon className="size-4" />
                    </span>
                    <span className="font-mono text-[11px] tracking-wider text-muted-foreground/60">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold tracking-tight">
                    {step.label}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}

              {/* Loop closer cell */}
              <div className="relative flex flex-col justify-between rounded-xl border border-dashed border-primary/30 bg-accent/50 p-5">
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <RotateCw className="size-4" />
                  </span>
                  <span className="font-mono text-[11px] tracking-wider text-primary/70">
                    LOOP
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                    Then repeat
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    Each cycle leaves you with a better baseline — and a
                    sharper next experiment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Entry-point cards */}
        <section className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="accent"
              className="rounded-full px-3 text-[11px] tracking-wide uppercase"
            >
              Get started
            </Badge>
            <h2 className="mt-5 font-heading text-[32px] font-bold tracking-tight sm:text-[40px]">
              Three ways to see the loop in motion.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              Start with an audit, watch the demo product page collect real behavior,
              then approve and ship a variant.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {entryPoints.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                className="group relative flex flex-col rounded-2xl border border-border/70 bg-card p-7 shadow-card transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-card-hover"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <entry.icon className="size-5" />
                  </span>
                  <span className="rounded-full border border-border/80 bg-surface-muted px-2.5 py-0.5 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                    {entry.eyebrow}
                  </span>
                </div>
                <h3 className="mt-6 text-[18px] font-semibold tracking-tight">
                  {entry.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                  {entry.description}
                </p>
                <span className="mt-7 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-primary">
                  {entry.cta}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-surface-muted/80">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <Link href="/" className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="size-2.5 rounded-full bg-primary shadow-[0_0_0_4px_var(--accent)]"
                />
                <span className="text-base font-semibold tracking-tight">
                  StorePilot
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-muted-foreground">
                A narrow, founder-ready wedge for autonomous ecommerce
                optimization.
              </p>
            </div>

            <div>
              <p className="text-[11.5px] font-semibold tracking-wider text-foreground/60 uppercase">
                Product
              </p>
              <ul className="mt-4 space-y-2.5 text-[13.5px]">
                <li>
                  <Link
                    href="/audit"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    URL Audit
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/demo"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Demo Page
                  </Link>
                </li>
                <li>
                  <Link
                    href="/experiments"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Experiments
                  </Link>
                </li>
              </ul>
            </div>

            <div className="sm:text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-3 py-1.5 text-[12px] text-muted-foreground shadow-card">
                <span
                  aria-hidden
                  className="size-1.5 rounded-full bg-success"
                />
                Live demo
              </div>
              <p className="mt-4 text-[13px] text-muted-foreground sm:ml-auto">
                Built for founders & growth engineers.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-7 text-[12.5px] text-muted-foreground sm:flex-row">
            <span>&copy; {new Date().getFullYear()} StorePilot</span>
            <span>Autonomous ecommerce optimization.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
