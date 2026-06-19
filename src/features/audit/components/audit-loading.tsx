"use client";

import { useEffect, useState } from "react";
import { Check, Globe, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { AUDIT_LOADING_STEPS } from "../lib/mock-audit-data";

interface AuditLoadingProps {
  url?: string;
}

export function AuditLoading({ url }: AuditLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = AUDIT_LOADING_STEPS.length;

  useEffect(() => {
    if (currentStep >= totalSteps - 1) {
      return;
    }

    const step = AUDIT_LOADING_STEPS[currentStep];
    const timeout = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, step.duration);

    return () => clearTimeout(timeout);
  }, [currentStep, totalSteps]);

  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <Card className="shadow-elevated">
      <CardContent className="py-10 sm:py-12">
        <div className="mx-auto max-w-md space-y-7">
          {url && (
            <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-surface-muted px-4 py-2.5 text-[13px] text-muted-foreground">
              <Globe className="size-4 shrink-0" />
              <span className="truncate">{url}</span>
            </div>
          )}

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold tracking-tight">
                Analyzing page…
              </span>
              <span className="font-mono text-[12px] text-muted-foreground">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <ol className="space-y-3">
            {AUDIT_LOADING_STEPS.map((step, index) => {
              const isDone = index < currentStep;
              const isActive = index === currentStep;
              return (
                <li key={step.label} className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center">
                    {isDone ? (
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="size-3.5" />
                      </span>
                    ) : isActive ? (
                      <Loader2 className="size-4.5 animate-spin text-primary" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-muted-foreground/25" />
                    )}
                  </span>
                  <span
                    className={
                      isDone || isActive
                        ? "text-[14px] font-medium text-foreground"
                        : "text-[14px] text-muted-foreground"
                    }
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
