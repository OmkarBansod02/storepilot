import {
  calculateExperimentResults,
  emptyExperimentArmTotals,
  type ExperimentResults,
} from "@/features/experiments/lib/calculate-experiment-results";
import type { ExperimentStatus } from "@/features/experiments/types";
import { mapVariantRow } from "@/features/variants/lib/map-variant-row";
import type { VariantStatus } from "@/features/variants/types";
import type { VariantTargetArea } from "@/features/variants/schemas/variant-input";
import { db } from "@/lib/db";
import { conversions, experiments, sessions, variants } from "@/lib/db/schema";
import { and, countDistinct, desc, eq } from "drizzle-orm";

export interface ExperimentResultSummary extends ExperimentResults {
  id: string;
  pageId: string;
  variantId: string;
  status: ExperimentStatus;
  primaryConversionEvent: string;
  variantHeadline: string;
  variantCtaLabel: string;
  variantTargetArea: VariantTargetArea;
  variantStatus: VariantStatus;
  startedAt: Date | null;
  completedAt: Date | null;
}

async function getExperimentResultTotals(
  experimentId: string,
  primaryConversionEvent: string,
) {
  const totals = emptyExperimentArmTotals();

  const [sessionRows, conversionRows] = await Promise.all([
    db
      .select({
        arm: sessions.experimentArm,
        total: countDistinct(sessions.id),
      })
      .from(sessions)
      .where(eq(sessions.experimentId, experimentId))
      .groupBy(sessions.experimentArm),
    db
      .select({
        arm: conversions.arm,
        total: countDistinct(conversions.sessionId),
      })
      .from(conversions)
      .where(
        and(
          eq(conversions.experimentId, experimentId),
          eq(conversions.eventName, primaryConversionEvent),
        ),
      )
      .groupBy(conversions.arm),
  ]);

  for (const row of sessionRows) {
    if (row.arm === "control" || row.arm === "variant") {
      totals[row.arm].sessions = row.total;
    }
  }

  for (const row of conversionRows) {
    totals[row.arm].conversions = row.total;
  }

  return totals;
}

export async function getExperimentResults(
  experimentId: string,
): Promise<ExperimentResultSummary | null> {
  const [row] = await db
    .select({
      experiment: experiments,
      variant: variants,
    })
    .from(experiments)
    .innerJoin(variants, eq(experiments.variantId, variants.id))
    .where(eq(experiments.id, experimentId))
    .limit(1);

  if (!row) return null;

  const variant = mapVariantRow(row.variant);
  const totals = await getExperimentResultTotals(
    row.experiment.id,
    row.experiment.primaryConversionEvent,
  );
  const results = calculateExperimentResults(totals);

  return {
    id: row.experiment.id,
    pageId: row.experiment.pageId,
    variantId: row.experiment.variantId,
    status: row.experiment.status,
    primaryConversionEvent: row.experiment.primaryConversionEvent,
    variantHeadline: variant.headline,
    variantCtaLabel: variant.primaryCtaLabel,
    variantTargetArea: variant.targetArea,
    variantStatus: variant.status,
    startedAt: row.experiment.startedAt,
    completedAt: row.experiment.completedAt,
    ...results,
  };
}

export async function getRunningExperimentResultsForPage(
  pageId: string,
): Promise<ExperimentResultSummary | null> {
  const [row] = await db
    .select({
      id: experiments.id,
    })
    .from(experiments)
    .where(and(eq(experiments.pageId, pageId), eq(experiments.status, "running")))
    .orderBy(desc(experiments.startedAt), desc(experiments.createdAt))
    .limit(1);

  if (!row) return null;

  return getExperimentResults(row.id);
}

export async function getLatestExperimentForPage(
  pageId: string,
): Promise<ExperimentResultSummary | null> {
  const running = await getRunningExperimentResultsForPage(pageId);
  if (running) return running;

  const [completedRow] = await db
    .select({ id: experiments.id })
    .from(experiments)
    .where(
      and(
        eq(experiments.pageId, pageId),
        eq(experiments.status, "completed"),
      ),
    )
    .orderBy(desc(experiments.completedAt), desc(experiments.createdAt))
    .limit(1);

  if (!completedRow) return null;

  return getExperimentResults(completedRow.id);
}
