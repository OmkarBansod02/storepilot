import type { ExperimentArm } from "@/features/experiments/types";

export const BAYESIAN_MIN_TOTAL_VISITORS = 100;
export const BAYESIAN_MIN_TOTAL_PURCHASES = 10;
export const BAYESIAN_PROMOTION_THRESHOLD = 0.95;

const MONTE_CARLO_SAMPLES = 25_000;

export type ExperimentRecommendedAction =
  | "keep_running"
  | "promote_winner"
  | "needs_more_data";

export interface BayesianArmTotals {
  sessions: number;
  conversions: number;
}

export interface BayesianWinnerResult {
  probabilityBest: Record<ExperimentArm, number>;
  baselineConversionRate: number;
  variantConversionRate: number;
  relativeLift: number | null;
  absoluteLiftPoints: number;
  bayesianWinner: ExperimentArm;
  recommendedAction: ExperimentRecommendedAction;
}

type RandomSource = () => number;

function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function seedFromTotals(
  totals: Record<ExperimentArm, BayesianArmTotals>,
): number {
  const values = [
    totals.control.sessions,
    totals.control.conversions,
    totals.variant.sessions,
    totals.variant.conversions,
  ];

  return values.reduce((seed, value) => {
    const normalizedValue = Math.max(0, Math.floor(value));
    return Math.imul(seed ^ normalizedValue, 16_777_619) >>> 0;
  }, 2_166_136_261);
}

function sampleStandardNormal(random: RandomSource): number {
  const first = Math.max(random(), Number.EPSILON);
  const second = random();
  return (
    Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second)
  );
}

function sampleGamma(shape: number, random: RandomSource): number {
  const scale = shape - 1 / 3;
  const adjustment = 1 / Math.sqrt(9 * scale);

  while (true) {
    const normal = sampleStandardNormal(random);
    const base = 1 + adjustment * normal;
    if (base <= 0) continue;

    const candidate = base * base * base;
    const uniform = random();

    if (
      uniform < 1 - 0.0331 * normal ** 4 ||
      Math.log(Math.max(uniform, Number.EPSILON)) <
        0.5 * normal ** 2 + scale * (1 - candidate + Math.log(candidate))
    ) {
      return scale * candidate;
    }
  }
}

function sampleBeta(
  alpha: number,
  beta: number,
  random: RandomSource,
): number {
  const alphaSample = sampleGamma(alpha, random);
  const betaSample = sampleGamma(beta, random);
  return alphaSample / (alphaSample + betaSample);
}

function normalizeTotals(totals: BayesianArmTotals): BayesianArmTotals {
  const sessions = Math.max(0, Math.floor(totals.sessions));
  const conversions = Math.min(
    Math.max(0, Math.floor(totals.conversions)),
    sessions,
  );

  return { sessions, conversions };
}

function calculateConversionRate(totals: BayesianArmTotals): number {
  return totals.sessions === 0 ? 0 : totals.conversions / totals.sessions;
}

export function calculateBayesianWinner(
  inputTotals: Record<ExperimentArm, BayesianArmTotals>,
): BayesianWinnerResult {
  const totals: Record<ExperimentArm, BayesianArmTotals> = {
    control: normalizeTotals(inputTotals.control),
    variant: normalizeTotals(inputTotals.variant),
  };
  const random = createSeededRandom(seedFromTotals(totals));
  const bestCounts: Record<ExperimentArm, number> = {
    control: 0,
    variant: 0,
  };

  for (let index = 0; index < MONTE_CARLO_SAMPLES; index += 1) {
    const controlSample = sampleBeta(
      totals.control.conversions + 1,
      totals.control.sessions - totals.control.conversions + 1,
      random,
    );
    const variantSample = sampleBeta(
      totals.variant.conversions + 1,
      totals.variant.sessions - totals.variant.conversions + 1,
      random,
    );

    if (variantSample > controlSample) {
      bestCounts.variant += 1;
    } else {
      bestCounts.control += 1;
    }
  }

  const probabilityBest: Record<ExperimentArm, number> = {
    control: bestCounts.control / MONTE_CARLO_SAMPLES,
    variant: bestCounts.variant / MONTE_CARLO_SAMPLES,
  };
  const bayesianWinner: ExperimentArm =
    probabilityBest.variant > probabilityBest.control ? "variant" : "control";
  const baselineConversionRate = calculateConversionRate(totals.control);
  const variantConversionRate = calculateConversionRate(totals.variant);
  const absoluteLift = variantConversionRate - baselineConversionRate;
  const totalVisitors = totals.control.sessions + totals.variant.sessions;
  const totalPurchases =
    totals.control.conversions + totals.variant.conversions;
  const hasMinimumData =
    totalVisitors >= BAYESIAN_MIN_TOTAL_VISITORS &&
    totalPurchases >= BAYESIAN_MIN_TOTAL_PURCHASES;

  let recommendedAction: ExperimentRecommendedAction = "keep_running";
  if (!hasMinimumData) {
    recommendedAction = "needs_more_data";
  } else if (
    probabilityBest[bayesianWinner] >= BAYESIAN_PROMOTION_THRESHOLD
  ) {
    recommendedAction = "promote_winner";
  }

  return {
    probabilityBest,
    baselineConversionRate,
    variantConversionRate,
    relativeLift:
      baselineConversionRate === 0
        ? null
        : absoluteLift / baselineConversionRate,
    absoluteLiftPoints: absoluteLift * 100,
    bayesianWinner,
    recommendedAction,
  };
}
