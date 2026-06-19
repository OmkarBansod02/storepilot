import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardMetrics } from "@/features/analytics/types";

interface FunnelStep {
  label: string;
  count: number;
  sessionRate: number;
}

function buildFunnelSteps(metrics: DashboardMetrics): FunnelStep[] {
  return [
    {
      label: "Page Views",
      count: metrics.totalPageViews,
      sessionRate: 1,
    },
    {
      label: "CTA Clicks",
      count: metrics.ctaClicks,
      sessionRate: metrics.ctaClickThroughRate,
    },
    {
      label: "Form Starts",
      count: metrics.formStarts,
      sessionRate: metrics.formStartRate,
    },
    {
      label: "Form Submits",
      count: metrics.formSubmits,
      sessionRate: metrics.formSubmitRate,
    },
  ];
}

function formatPercent(value: number): string {
  const boundedValue = Math.min(Math.max(value, 0), 1);
  if (boundedValue === 0) return "0%";
  return `${(boundedValue * 100).toFixed(1)}%`;
}

interface ConversionFunnelProps {
  metrics: DashboardMetrics;
}

export function ConversionFunnel({ metrics }: ConversionFunnelProps) {
  const steps = buildFunnelSteps(metrics);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>
          Raw event totals with unique-session conversion rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step) => {
            const width = Math.max(step.sessionRate * 100, 2);

            return (
              <div key={step.label}>
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="font-semibold text-foreground">{step.label}</span>
                  <span className="text-[12px] text-muted-foreground tabular-nums">
                    {step.count.toLocaleString()} events · {formatPercent(step.sessionRate)}
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted/80">
                  <div
                    className="h-2.5 rounded-full bg-primary/85 transition-all"
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
