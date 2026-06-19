import { ArrowUpRight, CheckCircle2, Clock, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeployWinnerButton } from "@/features/experiments/components/deploy-winner-button";
import type { RunningExperimentSummary } from "@/features/experiments/server/get-running-experiment-summary";
import { cn } from "@/lib/utils";

interface RunningExperimentCardProps {
  experiment: RunningExperimentSummary;
  showDeployAction?: boolean;
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

function formatDate(value: Date | null): string {
  if (!value) return "Not started";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function formatTargetArea(area: string): string {
  if (area === "signup_form") return "Offer form";

  return area.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type WinnerCopy = {
  label: string;
  caption: string;
};

function getWinnerCopy(
  winner: RunningExperimentSummary["recommendedWinner"],
  isCompleted: boolean,
): WinnerCopy {
  if (winner === "variant") {
    return {
      label: "Variant wins",
      caption: isCompleted
        ? "Variant was deployed as the new baseline."
        : "The variant is outperforming the baseline so far.",
    };
  }
  if (winner === "control") {
    return {
      label: "Control holds",
      caption: isCompleted
        ? "Baseline was kept. Variant did not outperform."
        : "The baseline is holding up against the variant so far.",
    };
  }
  return {
    label: "Too early to call",
    caption: "Keep the test running to collect more sessions on both arms.",
  };
}

export function RunningExperimentCard({
  experiment,
  showDeployAction = false,
}: RunningExperimentCardProps) {
  const isCompleted = experiment.status === "completed";
  const winner = experiment.recommendedWinner;
  const winnerCopy = getWinnerCopy(winner, isCompleted);
  const controlHighlighted = winner === "control";
  const variantHighlighted = winner === "variant";
  const hasWinner = winner !== "inconclusive";
  const liftPositive =
    experiment.lift.relativeLiftPercent !== null &&
    experiment.lift.relativeLiftPercent > 0;

  return (
    <Card className="lg:col-span-2 shadow-elevated">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-[18px] font-bold tracking-tight">
              {formatTargetArea(experiment.variantTargetArea)} A/B Test
            </CardTitle>
            <p className="text-[13.5px] text-muted-foreground">
              {experiment.variantHeadline}
              <span className="mx-2 text-border">·</span>
              CTA: {experiment.variantCtaLabel}
            </p>
          </div>
          <Badge variant={isCompleted ? "secondary" : "warning"}>
            {isCompleted ? "Completed" : "Running"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* ── Result summary ── */}
        <div
          className={cn(
            "rounded-xl border p-5",
            hasWinner && !isCompleted && "border-success/20 bg-success/5",
            isCompleted && "border-border bg-muted/30",
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {isCompleted ? "Final result" : "Recommended winner"}
              </p>
              <p
                className={cn(
                  "mt-1.5 text-xl font-semibold",
                  hasWinner && !isCompleted && "text-success",
                )}
              >
                {winnerCopy.label}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {winnerCopy.caption}
              </p>
            </div>
            {!isCompleted && hasWinner && (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/10">
                <ArrowUpRight className="size-5 text-success" />
              </div>
            )}
            {!isCompleted && !hasWinner && (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <Clock className="size-5 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Relative lift
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
                Absolute change
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {formatSignedPercentagePoints(
                  experiment.lift.absoluteDifference,
                )}
              </p>
            </div>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/70">
            Simple comparison — not a statistical significance test.
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
            isWinner={controlHighlighted && (isCompleted || hasWinner)}
          />
          <ArmCard
            label="Variant"
            tag="Challenger"
            conversionRate={experiment.arms.variant.conversionRate}
            conversions={experiment.arms.variant.conversions}
            sessions={experiment.arms.variant.sessions}
            highlighted={variantHighlighted}
            isWinner={variantHighlighted && (isCompleted || hasWinner)}
          />
        </div>

        {/* ── Metadata row ── */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">Event:</span>{" "}
            {experiment.primaryConversionEvent}
          </span>
          <span>
            <span className="font-medium text-foreground">Split:</span> 50/50
          </span>
          <span>
            <span className="font-medium text-foreground">
              {isCompleted ? "Completed:" : "Started:"}
            </span>{" "}
            {formatDate(
              isCompleted ? experiment.completedAt : experiment.startedAt,
            )}
          </span>
        </div>

        {/* ── Deploy action ── */}
        {showDeployAction && !isCompleted && (
          <div
            className={cn(
              "rounded-xl border p-4",
              hasWinner
                ? "border-success/20 bg-success/5"
                : "bg-muted/20",
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold">
                  {hasWinner ? "Ready to ship" : "Waiting for a clear winner"}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {hasWinner
                    ? "Deploy the recommended winner to close the loop."
                    : "Collect more traffic before deploying."}
                </p>
              </div>
              <DeployWinnerButton
                experimentId={experiment.id}
                recommendedWinner={experiment.recommendedWinner}
              />
            </div>
          </div>
        )}

        {/* ── Completed banner ── */}
        {isCompleted && (
          <div className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/5 p-4">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
            <div>
              <p className="text-sm font-semibold text-success">
                Experiment complete
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {winner === "variant"
                  ? "The variant is now the baseline for this page."
                  : "The baseline was kept. The variant was not deployed."}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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
}

function ArmCard({
  label,
  tag,
  conversionRate,
  conversions,
  sessions,
  highlighted,
  isWinner,
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
          <Badge variant="success">
            Winner
          </Badge>
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
      <p className="mt-2 text-[12px] text-muted-foreground">
        {conversions} conversion{conversions !== 1 ? "s" : ""}
        <Minus className="mx-1.5 inline size-2.5 text-border" />
        {sessions} session{sessions !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
