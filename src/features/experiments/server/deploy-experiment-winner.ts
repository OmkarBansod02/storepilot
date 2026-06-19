import {
  calculateExperimentResults,
  emptyExperimentArmTotals,
  type ExperimentResults,
} from "@/features/experiments/lib/calculate-experiment-results";
import { ExperimentError } from "@/features/experiments/lib/experiment-errors";
import type { ExperimentIdInput } from "@/features/experiments/schemas/experiment-input";
import { getDefaultDemoPageBaseline } from "@/features/demo/lib/default-demo-page-baseline";
import { demoPageBaselineSchema } from "@/features/demo/schemas/demo-page-baseline";
import type { DemoPageBaseline } from "@/features/demo/types";
import { variantStoredContentSchema } from "@/features/variants/schemas/variant-input";
import type { VariantStoredContentInput } from "@/features/variants/schemas/variant-input";
import { db } from "@/lib/db";
import {
  conversions,
  experiments,
  pages,
  sessions,
  variants,
} from "@/lib/db/schema";
import { and, countDistinct, eq } from "drizzle-orm";

export interface DeployExperimentWinnerResult {
  experimentId: string;
  pageId: string;
  winner: "control" | "variant";
  deployedVariantId: string | null;
  completedAt: Date;
  results: ExperimentResults;
}

function buildVariantBaselineContent(
  currentBaseline: DemoPageBaseline,
  variantContent: VariantStoredContentInput,
): DemoPageBaseline {
  return {
    ...currentBaseline,
    headline: variantContent.headline,
    subheadline: variantContent.subheadline,
    primaryCtaLabel: variantContent.primaryCtaLabel,
    trustProofRow: variantContent.trustProofRow,
  };
}

export async function deployExperimentWinner(
  input: ExperimentIdInput,
): Promise<DeployExperimentWinnerResult> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .select({
        experiment: experiments,
        variant: variants,
        page: pages,
      })
      .from(experiments)
      .innerJoin(variants, eq(experiments.variantId, variants.id))
      .innerJoin(pages, eq(experiments.pageId, pages.id))
      .where(eq(experiments.id, input.experimentId))
      .limit(1);

    if (!row) {
      throw new ExperimentError(
        "experiment_not_found",
        "Cannot deploy a winner for an unknown experiment.",
        404,
      );
    }

    if (row.experiment.status !== "running") {
      throw new ExperimentError(
        "experiment_not_running",
        "Only running experiments can deploy a winner.",
        409,
      );
    }

    const totals = emptyExperimentArmTotals();
    const sessionRows = await tx
      .select({
        arm: sessions.experimentArm,
        total: countDistinct(sessions.id),
      })
      .from(sessions)
      .where(eq(sessions.experimentId, row.experiment.id))
      .groupBy(sessions.experimentArm);

    const conversionRows = await tx
      .select({
        arm: conversions.arm,
        total: countDistinct(conversions.sessionId),
      })
      .from(conversions)
      .where(
        and(
          eq(conversions.experimentId, row.experiment.id),
          eq(conversions.eventName, row.experiment.primaryConversionEvent),
        ),
      )
      .groupBy(conversions.arm);

    for (const sessionRow of sessionRows) {
      if (sessionRow.arm === "control" || sessionRow.arm === "variant") {
        totals[sessionRow.arm].sessions = sessionRow.total;
      }
    }

    for (const conversionRow of conversionRows) {
      totals[conversionRow.arm].conversions = conversionRow.total;
    }

    const results = calculateExperimentResults(totals);

    if (results.recommendedWinner === "inconclusive") {
      throw new ExperimentError(
        "experiment_winner_inconclusive",
        "Experiment results are inconclusive, so no winner can be deployed.",
        409,
      );
    }

    const completedAt = new Date();
    const deployedVariantId =
      results.recommendedWinner === "variant" ? row.variant.id : null;

    if (results.recommendedWinner === "variant") {
      const currentBaseline = demoPageBaselineSchema.safeParse(
        row.page.baselineContent,
      );
      const baselineContent = buildVariantBaselineContent(
        currentBaseline.success
          ? currentBaseline.data
          : getDefaultDemoPageBaseline(),
        variantStoredContentSchema.parse(row.variant.content),
      );

      await tx
        .update(pages)
        .set({ baselineContent, updatedAt: completedAt })
        .where(eq(pages.id, row.experiment.pageId));

      await tx
        .update(variants)
        .set({ status: "deployed", updatedAt: completedAt })
        .where(eq(variants.id, row.variant.id));
    }

    const [completedExperiment] = await tx
      .update(experiments)
      .set({ status: "completed", completedAt })
      .where(
        and(
          eq(experiments.id, row.experiment.id),
          eq(experiments.status, "running"),
        ),
      )
      .returning({ id: experiments.id });

    if (!completedExperiment) {
      throw new ExperimentError(
        "experiment_not_running",
        "Only running experiments can deploy a winner.",
        409,
      );
    }

    return {
      experimentId: row.experiment.id,
      pageId: row.experiment.pageId,
      winner: results.recommendedWinner,
      deployedVariantId,
      completedAt,
      results,
    };
  });
}
