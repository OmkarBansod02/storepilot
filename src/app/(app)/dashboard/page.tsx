export const dynamic = "force-dynamic";

import {
  Activity,
  Eye,
  MousePointerClick,
  FormInput,
  Send,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionLabel } from "@/components/layout/section-label";
import { MetricCard } from "@/features/analytics/components/metric-card";
import { ConversionFunnel } from "@/features/analytics/components/conversion-funnel";
import { DashboardEmpty } from "@/features/analytics/components/dashboard-empty";
import { DiagnosisSection } from "@/features/analytics/components/diagnosis-section";
import { getDashboardMetrics } from "@/features/analytics/server/get-dashboard-metrics";
import { ensureDemoPage } from "@/features/demo/server/ensure-demo-page";
import { getDemoPageBaseline } from "@/features/demo/server/get-demo-page-baseline";
import { RunningExperimentCard } from "@/features/experiments/components/running-experiment-card";
import { getRunningExperimentSummary } from "@/features/experiments/server/get-running-experiment-summary";
import { VariantSection } from "@/features/variants/components/variant-section";
import { getLatestPendingVariant } from "@/features/variants/server/get-latest-pending-variant";
import { serializeVariantProposal } from "@/features/variants/types";

function formatPercent(value: number): string {
  const boundedValue = Math.min(Math.max(value, 0), 1);
  if (boundedValue === 0) return "0%";
  return `${(boundedValue * 100).toFixed(1)}%`;
}

function formatDepth(value: number): string {
  if (value === 0) return "0%";
  return `${Math.round(value)}%`;
}


interface SecondaryStatCardProps {
  title: string;
  value: string;
  description: string;
}

function SecondaryStatCard({ title, value, description }: SecondaryStatCardProps) {
  return (
    <Card className="gap-2.5 px-5 py-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <p className="text-[26px] font-bold tabular-nums leading-none tracking-tight">{value}</p>
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        {description}
      </p>
    </Card>
  );
}

export default async function DashboardPage() {
  const { pageId } = await ensureDemoPage();
  const [metrics, runningExperiment, baseline] = await Promise.all([
    getDashboardMetrics(pageId),
    getRunningExperimentSummary(pageId),
    getDemoPageBaseline(pageId),
  ]);
  const existingVariant = runningExperiment
    ? null
    : await getLatestPendingVariant({ pageId });

  const hasData = metrics.totalSessions > 0;
  const diagnosisReady = metrics.diagnosis.status === "ready";
  const serializedVariant = existingVariant
    ? serializeVariantProposal(existingVariant)
    : null;

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Monitor visitor behavior, diagnose friction, and ship the next experiment."
      />

      {!hasData ? (
        <div className="mt-8">
          <DashboardEmpty />
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          <section className="space-y-3">
            <SectionLabel>Performance</SectionLabel>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard
                title="Sessions"
                value={metrics.totalSessions.toLocaleString()}
                description="Total tracked sessions"
                icon={Activity}
              />
              <MetricCard
                title="Page Views"
                value={metrics.totalPageViews.toLocaleString()}
                description="Total page view events"
                icon={Eye}
              />
              <MetricCard
                title="CTA Clicks"
                value={metrics.ctaClicks.toLocaleString()}
                description={`${formatPercent(metrics.ctaClickThroughRate)} of sessions clicked`}
                icon={MousePointerClick}
              />
              <MetricCard
                title="Form Starts"
                value={metrics.formStarts.toLocaleString()}
                description={`${formatPercent(metrics.formStartRate)} of sessions started`}
                icon={FormInput}
              />
              <MetricCard
                title="Form Submits"
                value={metrics.formSubmits.toLocaleString()}
                description={`${formatPercent(metrics.formSubmitRate)} of sessions submitted`}
                icon={Send}
              />
            </div>
          </section>

          <DiagnosisSection diagnosis={metrics.diagnosis} />

          {(runningExperiment ||
            (diagnosisReady && !runningExperiment)) && (
            <section className="space-y-3">
              <SectionLabel>
                {runningExperiment ? "Live experiment" : "Next experiment"}
              </SectionLabel>
              {runningExperiment ? (
                <RunningExperimentCard experiment={runningExperiment} />
              ) : (
                <VariantSection
                  pageId={pageId}
                  baseline={baseline}
                  initialVariant={serializedVariant}
                />
              )}
            </section>
          )}

          <section className="space-y-3">
            <SectionLabel>Funnel breakdown</SectionLabel>
            <div className="grid gap-4 lg:grid-cols-2">
              <ConversionFunnel metrics={metrics} />
              <div className="grid gap-3">
                <SecondaryStatCard
                  title="CTA Click-Through"
                  value={formatPercent(metrics.ctaClickThroughRate)}
                  description="Sessions with a CTA click / total sessions"
                />
                <SecondaryStatCard
                  title="Average Max Scroll"
                  value={formatDepth(metrics.scrollDepth.averageMaxScrollDepth)}
                  description="Deepest scroll milestone averaged across sessions"
                />
                <SecondaryStatCard
                  title="Form Submit Rate"
                  value={formatPercent(metrics.formSubmitRate)}
                  description="Sessions with a form submit / total sessions"
                />
              </div>
            </div>
          </section>
        </div>
      )}
    </PageContainer>
  );
}
