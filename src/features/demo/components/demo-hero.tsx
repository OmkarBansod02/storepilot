"use client";

import Image from "next/image";
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
    const el = document.getElementById("features");
    el?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="relative mx-auto max-w-5xl px-6 pb-20 pt-20 sm:pb-28 sm:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(60%_50%_at_50%_0%,var(--accent)_0%,transparent_70%)] opacity-60"
      />

      <div className="grid items-center gap-12 sm:grid-cols-2 sm:gap-16">
        {/* Product image */}
        <div className="mx-auto w-full max-w-md sm:mx-0">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-[#f5efe8] via-[#faf7f2] to-[#ede5da] shadow-elevated">
            <Image
              src="/leather_wallet.png"
              alt="Premium Full-Grain Leather Wallet by Atelier Craft"
              fill
              className="object-contain p-6"
              sizes="(max-width: 640px) 90vw, 400px"
              priority
            />
            <div className="absolute top-4 left-4 rounded-lg bg-[#3d2b1f] px-3 py-1 text-[11px] font-bold tracking-wide text-[#f5efe8] uppercase shadow-md">
              Bestseller
            </div>
            <div className="absolute bottom-4 right-4 rounded-md bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-[#3d2b1f] backdrop-blur-sm">
              Small-batch #47
            </div>
          </div>
        </div>

        {/* Product details */}
        <div className="text-center sm:text-left">
          <p className="text-[11px] font-bold tracking-[0.2em] text-[#6b4c3b] uppercase">
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
                      ? "fill-[#c85a28] text-[#c85a28]"
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
              className="h-12 px-6 text-base border-[#d4c4b0] hover:bg-[#f5efe8]"
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
