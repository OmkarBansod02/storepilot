export const dynamic = "force-dynamic";

import {
  Activity,
  DollarSign,
  Eye,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionLabel } from "@/components/layout/section-label";
import { MetricCard } from "@/features/analytics/components/metric-card";
import { ConversionFunnel } from "@/features/analytics/components/conversion-funnel";
import { VariantFunnelTable } from "@/features/analytics/components/variant-funnel-table";
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

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
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

  const hasVariantFunnel = metrics.perVariantFunnel.some(
    (v) => v.arm !== "unassigned" && v.sessions > 0,
  );

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Monitor storefront performance, diagnose friction, and optimize for revenue."
      />

      {!hasData ? (
        <div className="mt-8">
          <DashboardEmpty />
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {/* ── Storefront performance ── */}
          <section className="space-y-3">
            <SectionLabel>Storefront performance</SectionLabel>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Sessions"
                value={metrics.totalSessions.toLocaleString()}
                description="Unique visitor sessions tracked"
                icon={Activity}
              />
              <MetricCard
                title="Product Views"
                value={metrics.productViews.toLocaleString()}
                description="Product detail page views"
                icon={Eye}
              />
              <MetricCard
                title="Add-to-Cart Rate"
                value={formatPercent(metrics.addToCartRate)}
                description={`${metrics.addToCarts.toLocaleString()} add-to-cart events`}
                icon={ShoppingCart}
              />
              <MetricCard
                title="Purchase Conversion"
                value={formatPercent(metrics.purchaseConversionRate)}
                description={`${metrics.purchases.toLocaleString()} purchases from ${metrics.totalSessions.toLocaleString()} sessions`}
                icon={Package}
                emphasis="primary"
              />
            </div>
          </section>

          {/* ── Revenue metrics ── */}
          <section className="space-y-3">
            <SectionLabel>Revenue</SectionLabel>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(metrics.totalRevenueCents)}
                description="Sum of all tracked purchase revenue"
                icon={DollarSign}
                emphasis="primary"
              />
              <MetricCard
                title="Average Order Value"
                value={formatCurrency(metrics.averageOrderValueCents)}
                description="Revenue per purchase"
                icon={DollarSign}
              />
              <MetricCard
                title="Revenue per Visitor"
                value={formatCurrency(metrics.revenuePerVisitorCents)}
                description="Total revenue divided by sessions"
                icon={TrendingUp}
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

          {/* ── Storefront funnel ── */}
          <section className="space-y-3">
            <SectionLabel>Storefront funnel</SectionLabel>
            <div className="grid gap-4 lg:grid-cols-2">
              <ConversionFunnel metrics={metrics} />
              <div className="grid gap-3">
                <SecondaryStatCard
                  title="Checkout-Start Rate"
                  value={formatPercent(metrics.checkoutStartRate)}
                  description="Sessions that started checkout / total sessions"
                />
                <SecondaryStatCard
                  title="Cart-to-Purchase Rate"
                  value={
                    metrics.addToCarts > 0
                      ? formatPercent(metrics.purchases / metrics.addToCarts)
                      : "0%"
                  }
                  description="Purchases / add-to-cart events"
                />
                <SecondaryStatCard
                  title="Average Max Scroll"
                  value={
                    metrics.scrollDepth.averageMaxScrollDepth === 0
                      ? "0%"
                      : `${Math.round(metrics.scrollDepth.averageMaxScrollDepth)}%`
                  }
                  description="Deepest scroll milestone averaged across sessions"
                />
              </div>
            </div>
          </section>

          {/* ── Variant comparison ── */}
          {hasVariantFunnel && (
            <section className="space-y-3">
              <SectionLabel>Variant comparison</SectionLabel>
              <VariantFunnelTable
                perVariantFunnel={metrics.perVariantFunnel}
              />
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}
