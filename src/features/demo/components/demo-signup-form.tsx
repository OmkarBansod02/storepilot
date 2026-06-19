"use client";

import { useState, useCallback } from "react";
import { useTracker } from "@/features/snippet/client/tracker-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoContent } from "@/features/demo/lib/demo-content";
import { CheckCircle2 } from "lucide-react";

interface DemoSignupFormProps {
  ctaLabel: string;
}

export function DemoSignupForm({ ctaLabel }: DemoSignupFormProps) {
  const { track } = useTracker();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formStarted, setFormStarted] = useState(false);

  const handleFocus = useCallback(() => {
    if (formStarted) return;
    setFormStarted(true);
    track("form_start", { formId: "demo-signup", field: "email" });
  }, [formStarted, track]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;
      track("form_submit", { formId: "demo-signup" });
      setSubmitted(true);
    },
    [email, track],
  );

  return (
    <section id="signup" className="border-t border-border/60 bg-surface-muted">
      <div className="mx-auto max-w-lg px-6 py-28 text-center">
        <h2 className="text-[28px] font-bold tracking-tight sm:text-[36px]">
          {demoContent.formHeadline}
        </h2>
        <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
          {demoContent.formDescription}
        </p>

        {submitted ? (
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-success/10">
              <CheckCircle2 className="size-7 text-success" />
            </div>
            <p className="text-lg font-bold">You&apos;re on the list!</p>
            <p className="text-[14px] text-muted-foreground">
              We&apos;ll be in touch soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-12 flex gap-3">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={handleFocus}
              required
              className="h-12 flex-1 rounded-xl border-border/80 px-4 text-base shadow-card"
            />
            <Button type="submit" className="h-12 px-6 text-base shadow-primary-glow">
              {ctaLabel}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
