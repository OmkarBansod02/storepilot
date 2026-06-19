import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardMetrics } from "@/features/analytics/types";

interface FunnelStep {
  label: string;
  count: number;
  sessionRate: number;
}

function buildFunnelSteps(metrics: DashboardMetrics): FunnelStep[] {
  return [
    {
      label: "Product Views",
      count: metrics.productViews,
      sessionRate: metrics.totalSessions > 0
        ? Math.min(metrics.productViews / metrics.totalSessions, 1)
        : 0,
    },
    {
      label: "Add to Cart",
      count: metrics.addToCarts,
      sessionRate: metrics.addToCartRate,
    },
    {
      label: "Checkout Started",
      count: metrics.checkoutStarts,
      sessionRate: metrics.checkoutStartRate,
    },
    {
      label: "Purchased",
      count: metrics.purchases,
      sessionRate: metrics.purchaseConversionRate,
    },
  ];
}

function formatPercent(value: number): string {
  const boundedValue = Math.min(Math.max(value, 0), 1);
  if (boundedValue === 0) return "0%";
  return `${(boundedValue * 100).toFixed(1)}%`;
}

function stepToStepRate(from: FunnelStep, to: FunnelStep): string {
  if (from.count === 0) return "—";
  return formatPercent(to.count / from.count);
}

interface ConversionFunnelProps {
  metrics: DashboardMetrics;
}

export function ConversionFunnel({ metrics }: ConversionFunnelProps) {
  const steps = buildFunnelSteps(metrics);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storefront Funnel</CardTitle>
        <CardDescription>
          Ecommerce funnel with session-based conversion rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const width = Math.max(step.sessionRate * 100, 2);
            const prevStep = index > 0 ? steps[index - 1] : null;
            const dropoffRate = prevStep ? stepToStepRate(prevStep, step) : null;

            return (
              <div key={step.label}>
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {step.label}
                    </span>
                    {dropoffRate !== null && (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <ArrowRight className="size-3" />
                        {dropoffRate} from prev
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] tabular-nums text-muted-foreground">
                    {step.count.toLocaleString()} · {formatPercent(step.sessionRate)} of sessions
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted/80">
                  <div
                    className={cn(
                      "h-2.5 rounded-full transition-all",
                      index === 0 && "bg-primary/85",
                      index === 1 && "bg-primary/70",
                      index === 2 && "bg-primary/55",
                      index === 3 && "bg-primary",
                    )}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
