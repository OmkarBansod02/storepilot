"use client";

import { useCallback } from "react";
import { useTracker } from "@/features/snippet/client/tracker-provider";
import { Button } from "@/components/ui/button";
import { demoContent } from "@/features/demo/lib/demo-content";
import {
  CheckCircle2,
  ShoppingCart,
  CreditCard,
  Package,
} from "lucide-react";

type CheckoutStep = "idle" | "cart" | "checkout" | "complete";

interface DemoCheckoutProps {
  step: CheckoutStep;
  onStepChange: (step: CheckoutStep) => void;
}

export function DemoCheckout({ step, onStepChange }: DemoCheckoutProps) {
  const { track } = useTracker();

  const handleAddToCart = useCallback(() => {
    track("add_to_cart", {
      product_id: demoContent.productId,
      cart_value_cents: demoContent.priceCents,
      currency: demoContent.currency,
    });
    onStepChange("cart");
  }, [track, onStepChange]);

  const handleCheckout = useCallback(() => {
    track("checkout_start", {
      product_id: demoContent.productId,
      cart_value_cents: demoContent.priceCents,
      currency: demoContent.currency,
    });
    onStepChange("checkout");
  }, [track, onStepChange]);

  const handlePurchase = useCallback(() => {
    track("purchase", {
      product_id: demoContent.productId,
      revenue_cents: demoContent.priceCents,
      currency: demoContent.currency,
    });
    onStepChange("complete");
  }, [track, onStepChange]);

  return (
    <section
      id="checkout"
      className="border-t border-[#e8ddd0]/60 bg-[#f5efe8]"
    >
      <div className="mx-auto max-w-lg px-6 py-28 text-center">
        <h2 className="text-[28px] font-bold tracking-tight sm:text-[36px]">
          {demoContent.formHeadline}
        </h2>
        <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
          {demoContent.formDescription}
        </p>

        <div className="mt-10">
          {step === "complete" ? (
            <CompletedState />
          ) : (
            <CheckoutCard
              step={step}
              onAddToCart={handleAddToCart}
              onCheckout={handleCheckout}
              onPurchase={handlePurchase}
            />
          )}
        </div>

        <StepIndicator currentStep={step} />
      </div>
    </section>
  );
}

function CheckoutCard({
  step,
  onAddToCart,
  onCheckout,
  onPurchase,
}: {
  step: Exclude<CheckoutStep, "complete">;
  onAddToCart: () => void;
  onCheckout: () => void;
  onPurchase: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#e8ddd0]/70 bg-white p-6 text-left shadow-card">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-accent/50">
            <Package className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-[14px] font-semibold">
              {demoContent.productName}
            </p>
            <p className="text-[12.5px] text-muted-foreground">Qty: 1</p>
          </div>
        </div>
        <p className="text-[16px] font-bold">{demoContent.price}</p>
      </div>

      <div className="flex items-center justify-between pt-4 text-[13px]">
        <span className="text-muted-foreground">Shipping</span>
        <span className="font-medium text-success">Free</span>
      </div>
      <div className="mt-2 flex items-center justify-between border-b border-border/60 pb-4 text-[14px]">
        <span className="font-semibold">Total</span>
        <span className="font-bold">{demoContent.price}</span>
      </div>

      <div className="mt-5">
        {step === "idle" && (
          <Button
            className="h-12 w-full text-base shadow-primary-glow"
            onClick={onAddToCart}
          >
            <ShoppingCart className="size-4" />
            Add to Cart
          </Button>
        )}
        {step === "cart" && (
          <Button
            className="h-12 w-full text-base shadow-primary-glow"
            onClick={onCheckout}
          >
            <CreditCard className="size-4" />
            Proceed to Checkout
          </Button>
        )}
        {step === "checkout" && (
          <Button
            className="h-12 w-full text-base shadow-primary-glow"
            onClick={onPurchase}
          >
            <CreditCard className="size-4" />
            Complete Purchase — {demoContent.price}
          </Button>
        )}
      </div>
    </div>
  );
}

function CompletedState() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-success/10">
        <CheckCircle2 className="size-7 text-success" />
      </div>
      <p className="text-lg font-bold">Order confirmed!</p>
      <p className="text-[14px] text-muted-foreground">
        Thank you for your purchase. Your wallet will be shipped within 2–3
        business days.
      </p>
    </div>
  );
}

const steps: { key: CheckoutStep; label: string }[] = [
  { key: "cart", label: "Cart" },
  { key: "checkout", label: "Checkout" },
  { key: "complete", label: "Confirmed" },
];

function StepIndicator({ currentStep }: { currentStep: CheckoutStep }) {
  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      {steps.map((s, i) => {
        const isActive = i <= stepIndex;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`flex size-6 items-center justify-center rounded-full text-[11px] font-bold ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-border/60 text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-[12px] font-medium ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-6 ${
                  i < stepIndex ? "bg-primary" : "bg-border/60"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
