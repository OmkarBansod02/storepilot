import type { ExperimentArm } from "@/features/experiments/types";
import {
  calculateBayesianWinner,
  type BayesianWinnerResult,
} from "@/features/experiments/lib/calculate-bayesian-winner";

export type ExperimentWinnerRecommendation =
  | ExperimentArm
  | "inconclusive";

export interface ExperimentArmTotals {
  sessions: number;
  conversions: number;
}

export interface ExperimentArmResult extends ExperimentArmTotals {
  conversionRate: number;
}

export interface ExperimentLift {
  absoluteDifference: number;
  relativeLiftPercent: number | null;
}

export interface ExperimentResults extends BayesianWinnerResult {
  arms: Record<ExperimentArm, ExperimentArmResult>;
  lift: ExperimentLift;
  recommendedWinner: ExperimentWinnerRecommendation;
}

export function emptyExperimentArmTotals(): Record<
  ExperimentArm,
  ExperimentArmTotals
> {
  return {
    control: { sessions: 0, conversions: 0 },
    variant: { sessions: 0, conversions: 0 },
  };
}

function calculateRate(conversions: number, sessions: number): number {
  if (sessions === 0) return 0;
  return Math.min(conversions / sessions, 1);
}

function recommendWinner(
  control: ExperimentArmResult,
  variant: ExperimentArmResult,
): ExperimentWinnerRecommendation {
  if (control.sessions === 0 || variant.sessions === 0) return "inconclusive";
  if (control.conversionRate === variant.conversionRate) return "inconclusive";

  return variant.conversionRate > control.conversionRate
    ? "variant"
    : "control";
}

export function calculateExperimentResults(
  totals: Record<ExperimentArm, ExperimentArmTotals>,
): ExperimentResults {
  const arms: Record<ExperimentArm, ExperimentArmResult> = {
    control: {
      ...totals.control,
      conversionRate: calculateRate(
        totals.control.conversions,
        totals.control.sessions,
      ),
    },
    variant: {
      ...totals.variant,
      conversionRate: calculateRate(
        totals.variant.conversions,
        totals.variant.sessions,
      ),
    },
  };

  const absoluteDifference =
    arms.variant.conversionRate - arms.control.conversionRate;

  return {
    ...calculateBayesianWinner(totals),
    arms,
    lift: {
      absoluteDifference,
      relativeLiftPercent:
        arms.control.conversionRate === 0
          ? null
          : (absoluteDifference / arms.control.conversionRate) * 100,
    },
    recommendedWinner: recommendWinner(arms.control, arms.variant),
  };
}
