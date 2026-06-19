import { ArrowRight, FlaskConical } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionLabel } from "@/components/layout/section-label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardMetrics } from "@/features/analytics/server/get-dashboard-metrics";
import type { VariantFunnelMetrics } from "@/features/analytics/types";
import { ensureDemoPage } from "@/features/demo/server/ensure-demo-page";
import { RunningExperimentCard } from "@/features/experiments/components/running-experiment-card";
import { getLatestPageExperiment } from "@/features/experiments/server/get-running-experiment-summary";

export const dynamic = "force-dynamic";

const FLOW_STEPS = [
  "System diagnoses a conversion bottleneck on the product page",
  "One improved variant is generated (hero, CTA, offer, trust proof)",
  "You review and approve the change",
  "Traffic is split 50/50 — funnel metrics tracked per variant",
  "Winner is promoted or the experiment is killed",
] as const;

interface LabExperiment {
  title: string;
  targetArea: string;
  description: string;
}

const LAB_EXPERIMENTS: LabExperiment[] = [
  {
    title: "Free shipping offer test",
    targetArea: "Offer banner",
    description:
      "Test whether a free-shipping threshold increases AOV and purchase rate.",
  },
  {
    title: "Add-to-cart CTA test",
    targetArea: "Primary CTA",
    description:
      "Test CTA copy and color variants to improve add-to-cart rate.",
  },
  {
    title: "Trust proof placement test",
    targetArea: "Trust signals",
    description:
      "Move trust badges above the fold to reduce purchase hesitation.",
  },
];

function extractExperimentFunnel(
  perVariantFunnel: VariantFunnelMetrics[],
  experimentId: string,
): { control: VariantFunnelMetrics; variant: VariantFunnelMetrics } | null {
  const control = perVariantFunnel.find(
    (f) => f.experimentId === experimentId && f.arm === "control",
  );
  const variant = perVariantFunnel.find(
    (f) => f.experimentId === experimentId && f.arm === "variant",
  );
  if (!control || !variant) return null;
  return { control, variant };
}

export default async function ExperimentsPage() {
  const { pageId } = await ensureDemoPage();
  const [experiment, dashboardMetrics] = await Promise.all([
    getLatestPageExperiment(pageId),
    getDashboardMetrics(pageId),
  ]);

  const isRunning = experiment?.status === "running";
  const funnelByArm = experiment
    ? extractExperimentFunnel(dashboardMetrics.perVariantFunnel, experiment.id)
    : null;

  return (
    <PageContainer>
      <PageHeader
        title="Experiment Lab"
        description="Test product page variants, track ecommerce conversion, and deploy winners."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {experiment ? (
          <RunningExperimentCard
            experiment={experiment}
            showDeployAction={isRunning}
            funnelByArm={funnelByArm}
          />
        ) : (
          <EmptyExperimentState />
        )}

        <Card className="self-start">
          <CardHeader>
            <CardTitle className="text-[15px] font-bold tracking-tight">
              How it works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 text-[13.5px] text-muted-foreground">
              {FLOW_STEPS.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 leading-relaxed"
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* ── Lab test ideas ── */}
      <div className="mt-10">
        <SectionLabel>Test ideas</SectionLabel>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LAB_EXPERIMENTS.map((lab) => (
            <LabExperimentCard key={lab.title} experiment={lab} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

function EmptyExperimentState() {
  return (
    <Card className="lg:col-span-2 border-border/60 bg-gradient-to-b from-accent/20 to-card shadow-elevated">
      <CardContent className="py-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <FlaskConical className="size-7 text-primary" />
          </div>
          <h3 className="mt-6 text-lg font-bold tracking-tight">
            No active experiment
          </h3>
          <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
            Experiments start here once a variant is approved from the
            dashboard. The system splits traffic, tracks the ecommerce funnel,
            and recommends a winner.
          </p>
          <Button variant="outline" className="mt-7" asChild>
            <Link href="/dashboard">
              Go to dashboard
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LabExperimentCard({ experiment }: { experiment: LabExperiment }) {
  return (
    <Card className="border-border/50">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[14px] font-semibold tracking-tight">
            {experiment.title}
          </h3>
          <Badge variant="secondary" className="shrink-0">
            Upcoming
          </Badge>
        </div>
        <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
          {experiment.targetArea}
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          {experiment.description}
        </p>
      </CardContent>
    </Card>
  );
}
