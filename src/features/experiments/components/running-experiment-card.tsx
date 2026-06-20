import { ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeployWinnerButton } from "@/features/experiments/components/deploy-winner-button";
import {
  BAYESIAN_MIN_TOTAL_PURCHASES,
  BAYESIAN_MIN_TOTAL_VISITORS,
} from "@/features/experiments/lib/calculate-bayesian-winner";
import type { RunningExperimentSummary } from "@/features/experiments/server/get-running-experiment-summary";
import type { VariantFunnelMetrics } from "@/features/analytics/types";
import { cn } from "@/lib/utils";

export type LabStatus = "RUNNING" | "WINNER" | "PROMOTED" | "KILLED";

interface RunningExperimentCardProps {
  experiment: RunningExperimentSummary;
  showDeployAction?: boolean;
  funnelByArm?: {
    control: VariantFunnelMetrics;
    variant: VariantFunnelMetrics;
  } | null;
}

function formatPercent(value: number): string {
  if (value === 0) return "0%";
  return `${(Math.min(value, 1) * 100).toFixed(1)}%`;
}

function formatSignedPercentagePoints(value: number): string {
  if (value === 0) return "0 pts";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(1)} pts`;
}

function formatRelativeLift(value: number | null): string {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatRecommendedAction(
  action: RunningExperimentSummary["recommendedAction"],
): string {
  if (action === "promote_winner") return "Promote winner";
  if (action === "needs_more_data") return "Needs more data";
  return "Keep running";
}

function formatDate(value: Date | null): string {
  if (!value) return "Not started";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function formatCurrency(cents: number): string {
  return `₹${(cents / 100).toFixed(2)}`;
}

function formatExperimentName(targetArea: string): string {
  const names: Record<string, string> = {
    hero: "Premium leather wallet hero test",
    primary_cta: "Add-to-cart CTA test",
    trust_proof: "Trust proof placement test",
    signup_form: "Offer form test",
  };
  return (
    names[targetArea] ??
    `${targetArea.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} test`
  );
}

export function getLabStatus(experiment: RunningExperimentSummary): LabStatus {
  if (experiment.status === "running") return "RUNNING";
  if (experiment.recommendedWinner === "variant") {
    return experiment.variantStatus === "deployed" ? "PROMOTED" : "WINNER";
  }
  return "KILLED";
}

const LAB_STATUS_BADGE: Record<
  LabStatus,
  { label: string; variant: "warning" | "success" | "default" | "destructive" }
> = {
  RUNNING: { label: "Running", variant: "warning" },
  WINNER: { label: "Winner", variant: "success" },
  PROMOTED: { label: "Promoted", variant: "default" },
  KILLED: { label: "Killed", variant: "destructive" },
};

function getWinnerCopy(
  winner: RunningExperimentSummary["recommendedWinner"],
  labStatus: LabStatus,
): { label: string; caption: string } {
  if (labStatus === "PROMOTED") {
    return {
      label: "Variant promoted",
      caption: "Variant was deployed as the new product page baseline.",
    };
  }
  if (labStatus === "KILLED") {
    return {
      label: "Experiment killed",
      caption:
        winner === "control"
          ? "Baseline outperformed the variant. Original page kept."
          : "No clear winner. Original product page kept.",
    };
  }
  if (winner === "variant") {
    return {
      label: "Craftsmanship variant leading",
      caption:
        "The variant is outperforming the baseline on purchase conversion.",
    };
  }
  if (winner === "control") {
    return {
      label: "Control leading",
      caption: "The baseline is holding up against the variant.",
    };
  }
  return {
    label: "Too early to call",
    caption: "Keep the test running to collect more visitor sessions.",
  };
}

function getBayesianCopy(
  experiment: RunningExperimentSummary,
): { label: string; caption: string } {
  const winnerLabel =
    experiment.bayesianWinner === "variant" ? "Variant" : "Control";
  const totalVisitors =
    experiment.arms.control.sessions + experiment.arms.variant.sessions;
  const totalPurchases =
    experiment.arms.control.conversions + experiment.arms.variant.conversions;

  if (experiment.recommendedAction === "needs_more_data") {
    return {
      label: "Needs more data",
      caption: `${totalVisitors}/${BAYESIAN_MIN_TOTAL_VISITORS} visitors and ${totalPurchases}/${BAYESIAN_MIN_TOTAL_PURCHASES} purchases collected.`,
    };
  }

  if (experiment.recommendedAction === "promote_winner") {
    return {
      label: `${winnerLabel} is likely best`,
      caption: "The winner has cleared the 95% Bayesian confidence threshold.",
    };
  }

  return {
    label: `${winnerLabel} is currently leading`,
    caption: "Keep running until one arm reaches 95% probability of being best.",
  };
}

export function RunningExperimentCard({
  experiment,
  showDeployAction = false,
  funnelByArm,
}: RunningExperimentCardProps) {
  const labStatus = getLabStatus(experiment);
  const isTerminal = labStatus !== "RUNNING";
  const winner = experiment.recommendedWinner;
  const winnerCopy = isTerminal
    ? getWinnerCopy(winner, labStatus)
    : getBayesianCopy(experiment);
  const promotionReady = experiment.recommendedAction === "promote_winner";
  const highlightedWinner = isTerminal ? winner : experiment.bayesianWinner;
  const controlHighlighted =
    highlightedWinner === "control" && (isTerminal || promotionReady);
  const variantHighlighted =
    highlightedWinner === "variant" && (isTerminal || promotionReady);
  const bestProbability =
    experiment.probabilityBest[experiment.bayesianWinner];
  const liftPositive =
    experiment.lift.relativeLiftPercent !== null &&
    experiment.lift.relativeLiftPercent > 0;

  const statusConfig = LAB_STATUS_BADGE[labStatus];
  const hasFunnel = funnelByArm != null;

  const totalVisitors = hasFunnel
    ? funnelByArm.control.sessions + funnelByArm.variant.sessions
    : experiment.arms.control.sessions + experiment.arms.variant.sessions;

  const aggregateAddToCartRate = hasFunnel
    ? (funnelByArm.control.addToCarts + funnelByArm.variant.addToCarts) /
      Math.max(totalVisitors, 1)
    : null;
  const aggregatePurchaseConversion = hasFunnel
    ? (funnelByArm.control.purchases + funnelByArm.variant.purchases) /
      Math.max(totalVisitors, 1)
    : null;
  const aggregateRevenuePerVisitor = hasFunnel
    ? (funnelByArm.control.totalRevenueCents +
        funnelByArm.variant.totalRevenueCents) /
      Math.max(totalVisitors, 1)
    : null;

  return (
    <Card className="lg:col-span-2 shadow-elevated">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-[18px] font-bold tracking-tight">
              {formatExperimentName(experiment.variantTargetArea)}
            </CardTitle>
            <p className="text-[13.5px] text-muted-foreground">
              {experiment.variantHeadline}
              <span className="mx-2 text-border">·</span>
              CTA: {experiment.variantCtaLabel}
            </p>
          </div>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* ── Ecommerce metrics summary ── */}
        {hasFunnel && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricPill label="Visitors" value={String(totalVisitors)} />
            <MetricPill
              label="Add-to-cart rate"
              value={formatPercent(aggregateAddToCartRate!)}
            />
            <MetricPill
              label="Purchase conv"
              value={formatPercent(aggregatePurchaseConversion!)}
            />
            <MetricPill
              label="Rev / visitor"
              value={formatCurrency(aggregateRevenuePerVisitor!)}
            />
          </div>
        )}

        {/* ── Result summary ── */}
        <div
          className={cn(
            "rounded-xl border p-5",
            promotionReady && !isTerminal && "border-success/20 bg-success/5",
            isTerminal && "border-border bg-muted/30",
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {isTerminal ? "Final result" : "Bayesian confidence"}
              </p>
              <p
                className={cn(
                  "mt-1.5 text-xl font-semibold",
                  promotionReady && !isTerminal && "text-success",
                )}
              >
                {winnerCopy.label}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {winnerCopy.caption}
              </p>
            </div>
            {!isTerminal && promotionReady && (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/10">
                <ArrowUpRight className="size-5 text-success" />
              </div>
            )}
            {!isTerminal && !promotionReady && (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <Clock className="size-5 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Probability best
              </p>
              <p
                className={cn(
                  "mt-1 text-2xl font-bold tabular-nums",
                  promotionReady && !isTerminal && "text-success",
                )}
              >
                {formatPercent(bestProbability)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Recommended action
              </p>
              <p className="mt-1 text-lg font-bold">
                {formatRecommendedAction(experiment.recommendedAction)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Raw relative lift
              </p>
              <p
                className={cn(
                  "mt-1 text-2xl font-bold tabular-nums",
                  liftPositive && "text-success",
                )}
              >
                {formatRelativeLift(experiment.lift.relativeLiftPercent)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Raw absolute change
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {formatSignedPercentagePoints(
                  experiment.lift.absoluteDifference,
                )}
              </p>
            </div>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/70">
            Probability uses a Beta(1, 1) prior and 25,000 stable Monte Carlo
            samples. Lift remains the observed purchase conversion difference.
          </p>
        </div>

        {/* ── Arm comparison cards ── */}
        <div className="grid gap-3 sm:grid-cols-2">
          <ArmCard
            label="Control"
            tag="Baseline"
            conversionRate={experiment.arms.control.conversionRate}
            conversions={experiment.arms.control.conversions}
            sessions={experiment.arms.control.sessions}
            highlighted={controlHighlighted}
            isWinner={controlHighlighted}
            addToCartRate={funnelByArm?.control.addToCartRate}
            revenuePerVisitorCents={funnelByArm?.control.revenuePerVisitorCents}
            probabilityBest={experiment.probabilityBest.control}
          />
          <ArmCard
            label="Variant"
            tag="Challenger"
            conversionRate={experiment.arms.variant.conversionRate}
            conversions={experiment.arms.variant.conversions}
            sessions={experiment.arms.variant.sessions}
            highlighted={variantHighlighted}
            isWinner={variantHighlighted}
            addToCartRate={funnelByArm?.variant.addToCartRate}
            revenuePerVisitorCents={funnelByArm?.variant.revenuePerVisitorCents}
            probabilityBest={experiment.probabilityBest.variant}
          />
        </div>

        {/* ── Metadata row ── */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">
              Conversion event:
            </span>{" "}
            {experiment.primaryConversionEvent}
          </span>
          <span>
            <span className="font-medium text-foreground">Split:</span> 50/50
          </span>
          <span>
            <span className="font-medium text-foreground">
              {isTerminal ? "Completed:" : "Started:"}
            </span>{" "}
            {formatDate(
              isTerminal ? experiment.completedAt : experiment.startedAt,
            )}
          </span>
        </div>

        {/* ── Deploy action ── */}
        {showDeployAction && !isTerminal && (
          <div
            className={cn(
              "rounded-xl border p-4",
              promotionReady
                ? "border-success/20 bg-success/5"
                : "bg-muted/20",
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold">
                  {promotionReady
                    ? "Ready to promote"
                    : formatRecommendedAction(experiment.recommendedAction)}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {promotionReady
                    ? "Promote the winning arm to close the experiment."
                    : "Collect more traffic before deploying a winner."}
                </p>
              </div>
              <DeployWinnerButton
                experimentId={experiment.id}
                recommendedWinner={
                  promotionReady ? experiment.bayesianWinner : "inconclusive"
                }
              />
            </div>
          </div>
        )}

        {/* ── Terminal banner ── */}
        {isTerminal && (
          <div
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4",
              labStatus === "PROMOTED"
                ? "border-success/20 bg-success/5"
                : "border-destructive/20 bg-destructive/5",
            )}
          >
            <CheckCircle2
              className={cn(
                "mt-0.5 size-4 shrink-0",
                labStatus === "PROMOTED" ? "text-success" : "text-destructive",
              )}
            />
            <div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  labStatus === "PROMOTED"
                    ? "text-success"
                    : "text-destructive",
                )}
              >
                {labStatus === "PROMOTED"
                  ? "Variant promoted"
                  : "Experiment killed"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {labStatus === "PROMOTED"
                  ? "The variant is now the baseline for this product page."
                  : "The baseline was kept. The variant was not deployed."}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Metric pill sub-component ── */

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
      <p className="text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-[17px] font-bold tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}

/* ── Arm comparison sub-component ── */

interface ArmCardProps {
  label: string;
  tag: string;
  conversionRate: number;
  conversions: number;
  sessions: number;
  highlighted: boolean;
  isWinner: boolean;
  addToCartRate?: number;
  revenuePerVisitorCents?: number;
  probabilityBest: number;
}

function ArmCard({
  label,
  tag,
  conversionRate,
  conversions,
  sessions,
  highlighted,
  isWinner,
  addToCartRate,
  revenuePerVisitorCents,
  probabilityBest,
}: ArmCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-all",
        highlighted
          ? "border-success/25 bg-success/5 shadow-[0_0_0_1px_rgba(26,122,78,0.08)]"
          : "border-border/70 bg-muted/20",
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold">{label}</h3>
        {isWinner ? (
          <Badge variant="success">Winner</Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            {tag}
          </Badge>
        )}
      </div>
      <p
        className={cn(
          "mt-4 text-[32px] font-bold tabular-nums tracking-tight",
          highlighted && "text-success",
        )}
      >
        {formatPercent(conversionRate)}
      </p>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Purchase conversion
      </p>

      <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs">
        <span className="text-muted-foreground">Probability best</span>
        <span className="font-semibold tabular-nums">
          {formatPercent(probabilityBest)}
        </span>
      </div>

      {(addToCartRate !== undefined ||
        revenuePerVisitorCents !== undefined) && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3">
          {addToCartRate !== undefined && (
            <div>
              <p className="text-[10.5px] font-medium text-muted-foreground">
                Add-to-cart
              </p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums">
                {formatPercent(addToCartRate)}
              </p>
            </div>
          )}
          {revenuePerVisitorCents !== undefined && (
            <div>
              <p className="text-[10.5px] font-medium text-muted-foreground">
                Rev / visitor
              </p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums">
                {formatCurrency(revenuePerVisitorCents)}
              </p>
            </div>
          )}
        </div>
      )}

      <p className="mt-3 text-[12px] text-muted-foreground">
        {conversions} purchase{conversions !== 1 ? "s" : ""}
        <span className="mx-1.5 text-border">·</span>
        {sessions} visitor{sessions !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
