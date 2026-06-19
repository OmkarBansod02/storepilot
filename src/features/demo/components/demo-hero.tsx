"use client";

import { useTracker } from "@/features/snippet/client/tracker-provider";
import { Button } from "@/components/ui/button";
import { demoContent } from "@/features/demo/lib/demo-content";
import { ShoppingCart, Star, Shield, Truck, RotateCcw } from "lucide-react";

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
  onAddToCart: () => void;
}

const trustIcons: Record<string, typeof Shield> = {
  shipping: Truck,
  returns: RotateCcw,
  checkout: Shield,
};

function getTrustIcon(label: string) {
  if (label.toLowerCase().includes("shipping")) return trustIcons.shipping;
  if (label.toLowerCase().includes("return")) return trustIcons.returns;
  return trustIcons.checkout;
}

export function DemoHero({ content, onAddToCart }: DemoHeroProps) {
  const { track } = useTracker();

  function handleAddToCart() {
    track("add_to_cart", {
      product_id: demoContent.productId,
      cart_value_cents: demoContent.priceCents,
      currency: demoContent.currency,
    });
    onAddToCart();
    const el = document.getElementById("checkout");
    el?.scrollIntoView({ behavior: "smooth" });
  }

  function handleViewDetails() {
    track("cta_click", { label: content.secondaryCtaLabel, location: "hero" });
    const el = document.getElementById("features");
    el?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="relative mx-auto max-w-5xl px-6 pb-20 pt-20 sm:pb-28 sm:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(60%_50%_at_50%_0%,var(--accent)_0%,transparent_70%)] opacity-70"
      />

      <div className="grid items-center gap-12 sm:grid-cols-2 sm:gap-16">
        {/* Product image placeholder */}
        <div className="mx-auto w-full max-w-md sm:mx-0">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-accent/60 via-card to-accent/30 shadow-card">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10">
                <ShoppingCart className="size-10 text-primary/60" />
              </div>
              <span className="text-[13px] font-medium text-muted-foreground">
                Product image
              </span>
            </div>
            <div className="absolute top-4 left-4 rounded-lg bg-primary px-3 py-1 text-[12px] font-bold text-primary-foreground shadow-primary-glow">
              Bestseller
            </div>
          </div>
        </div>

        {/* Product details */}
        <div className="text-center sm:text-left">
          <p className="text-[11px] font-bold tracking-[0.2em] text-primary uppercase">
            {content.brand}
          </p>
          <h1 className="mt-4 text-[36px] font-extrabold leading-[1.1] tracking-tight whitespace-pre-line text-balance sm:text-[44px]">
            {content.headline}
          </h1>

          <div className="mt-4 flex items-center justify-center gap-2 sm:justify-start">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${
                    i < Math.floor(demoContent.rating)
                      ? "fill-primary text-primary"
                      : "fill-border text-border"
                  }`}
                />
              ))}
            </div>
            <span className="text-[13px] font-medium text-muted-foreground">
              {demoContent.rating}/5 ({demoContent.reviewCount}+ reviews)
            </span>
          </div>

          <p className="mt-4 text-[32px] font-extrabold tracking-tight text-foreground">
            {demoContent.price}
          </p>

          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            {content.subheadline}
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 sm:justify-start">
            <Button
              size="lg"
              className="h-12 px-7 text-base shadow-primary-glow"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="size-4" />
              {content.primaryCtaLabel}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 text-base"
              onClick={handleViewDetails}
            >
              {content.secondaryCtaLabel}
            </Button>
          </div>

          {content.trustProofRow.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
              {content.trustProofRow.map((proof) => {
                const Icon = getTrustIcon(proof);
                return (
                  <span
                    key={proof}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground"
                  >
                    <Icon className="size-3.5 text-success" />
                    {proof}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
