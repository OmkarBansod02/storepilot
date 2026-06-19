"use client";

import { useTracker } from "@/features/snippet/client/tracker-provider";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export interface DemoHeroContent {
  brand: string;
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  trustProofRow: readonly string[];
}

interface DemoHeroProps {
  content: DemoHeroContent;
}

export function DemoHero({ content }: DemoHeroProps) {
  const { track } = useTracker();

  function handleCtaClick() {
    track("cta_click", { label: content.primaryCtaLabel, location: "hero" });
    const el = document.getElementById("signup");
    el?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="relative mx-auto max-w-3xl px-6 pb-28 pt-32 text-center sm:pb-36 sm:pt-44">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(60%_50%_at_50%_0%,var(--accent)_0%,transparent_70%)] opacity-70"
      />
      <p className="text-[11px] font-bold tracking-[0.2em] text-primary uppercase">
        {content.brand}
      </p>
      <h1 className="mt-6 text-[48px] font-extrabold leading-[1.05] tracking-tight whitespace-pre-line text-balance sm:text-[64px]">
        {content.headline}
      </h1>
      <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-[19px]">
        {content.subheadline}
      </p>
      <div className="mt-12 flex items-center justify-center gap-4">
        <Button
          size="lg"
          className="h-12 px-7 text-base shadow-primary-glow"
          onClick={handleCtaClick}
        >
          {content.primaryCtaLabel}
          <ArrowRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-12 px-6 text-base"
          onClick={handleCtaClick}
        >
          {content.secondaryCtaLabel}
        </Button>
      </div>
      {content.trustProofRow.length > 0 && (
        <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-2.5">
          {content.trustProofRow.map((proof) => (
            <span
              key={proof}
              className="rounded-full border border-primary/15 bg-accent/50 px-4 py-1.5 text-[12px] font-medium text-accent-foreground shadow-card"
            >
              {proof}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
