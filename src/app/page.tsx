import Link from "next/link";
import {
  ArrowRight,
  FlaskConical,
  Eye,
  Activity,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  SplitSquareHorizontal,
  Rocket,
  RotateCw,
  CircleDot,
  BarChart3,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TopNav } from "@/components/layout/top-nav";

const loopSteps = [
  {
    number: "01",
    label: "Observe",
    description: "Collect real visitor behavior signals.",
    icon: Activity,
  },
  {
    number: "02",
    label: "Diagnose",
    description: "Identify the most likely friction point.",
    icon: Stethoscope,
  },
  {
    number: "03",
    label: "Generate",
    description: "Draft one improved product-page variant.",
    icon: Sparkles,
  },
  {
    number: "04",
    label: "Approve",
    description: "Human review before anything ships.",
    icon: ShieldCheck,
  },
  {
    number: "05",
    label: "Test",
    description: "Run a clean 50/50 split on real traffic.",
    icon: SplitSquareHorizontal,
  },
  {
    number: "06",
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
    eyebrow: "Browse",
    title: "Demo Store",
    description:
      "Tracked product page. Every view, add-to-cart, and purchase feeds into the dashboard.",
    href: "/demo",
    cta: "Open demo store",
    icon: ShoppingBag,
  },
  {
    eyebrow: "Monitor",
    title: "Dashboard",
    description:
      "Funnel conversion, revenue, AOV, revenue per visitor, and traffic simulator in one view.",
    href: "/dashboard",
    cta: "View dashboard",
    icon: BarChart3,
  },
  {
    eyebrow: "Test",
    title: "Experiment Lab",
    description:
      "50/50 split test with Bayesian winner confidence. Promote the best variant when ready.",
    href: "/experiments",
    cta: "Open experiment lab",
    icon: FlaskConical,
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <TopNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_50%_at_50%_0%,var(--accent)_0%,transparent_72%)] opacity-85"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-border to-transparent"
          />

          <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-22 sm:pb-24">
            <div className="mx-auto max-w-[40rem] text-center">
              <Badge
                variant="secondary"
                className="h-7 rounded-full border-border/80 bg-card/90 px-3 text-[12px] font-medium text-muted-foreground shadow-card backdrop-blur"
              >
                <CircleDot className="size-3 text-primary" />
                Ecommerce optimization engine
              </Badge>

              <h1 className="mt-5 font-heading text-[40px] leading-[1.08] font-bold tracking-tight text-foreground sm:text-[56px] sm:leading-[1.05]">
                Product pages that{" "}
                <span className="text-primary">keep getting sharper.</span>
              </h1>

              <p className="mx-auto mt-5 max-w-lg text-[15px] leading-[1.7] text-muted-foreground sm:text-[16px]">
                Track funnel events, test product-page variants, and promote the
                winner when Bayesian confidence is high enough.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-11 px-6 text-[14px] font-semibold shadow-primary-glow"
                  asChild
                >
                  <Link href="/demo">
                    <ShoppingBag className="size-4" />
                    Open Demo Store
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 px-5 text-[14px] font-medium"
                  asChild
                >
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </div>

              <p className="mt-4 text-[12.5px] text-muted-foreground/70">
                No account needed · Simulated traffic in one click
              </p>
            </div>

            {/* Principles strip */}
            <div className="mx-auto mt-12 flex max-w-md items-center justify-center gap-6 rounded-xl border border-border/60 bg-card/80 px-6 py-3.5 shadow-card backdrop-blur sm:max-w-lg sm:gap-8">
              {principles.map((p) => (
                <div
                  key={p.label}
                  className="flex items-center gap-2 text-[12.5px] sm:text-[13px]"
                >
                  <p.icon className="size-3.5 shrink-0 text-primary" />
                  <span className="font-medium text-foreground/80 whitespace-nowrap">
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
                Behavior → hypothesis → test → winner. Each cycle is
                human-approved and measurable.
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
              Three parts. One measurable loop.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              Browse the tracked store, understand the funnel, then test and
              promote a stronger product-page variant.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-3">
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
                Self-improving ecommerce storefront engine.
              </p>
            </div>

            <div>
              <p className="text-[11.5px] font-semibold tracking-wider text-foreground/60 uppercase">
                Product
              </p>
              <ul className="mt-4 space-y-2.5 text-[13.5px]">
                <li>
                  <Link
                    href="/demo"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Demo Store
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
                    href="/experiments"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Experiment Lab
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
