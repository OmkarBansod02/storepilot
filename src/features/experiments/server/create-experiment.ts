import { ExperimentError } from "@/features/experiments/lib/experiment-errors";
import type { CreateExperimentInput } from "@/features/experiments/schemas/experiment-input";
import { mapVariantRow } from "@/features/variants/lib/map-variant-row";
import type { VariantProposal } from "@/features/variants/types";
import { db } from "@/lib/db";
import { experiments, pages, variants } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";

export interface CreateExperimentResult {
  experiment: {
    id: string;
    pageId: string;
    variantId: string;
    status: "running";
    primaryConversionEvent: string;
    startedAt: Date | null;
    createdAt: Date;
  };
  variant: VariantProposal;
}

export async function createExperiment(
  input: CreateExperimentInput,
): Promise<CreateExperimentResult> {
  const now = new Date();

  return db.transaction(async (tx) => {
    const [page] = await tx
      .select({
        id: pages.id,
        primaryConversionEvent: pages.primaryConversionEvent,
      })
      .from(pages)
      .where(eq(pages.id, input.pageId))
      .limit(1);

    if (!page) {
      throw new ExperimentError(
        "page_not_found",
        "Cannot create an experiment for an unknown page.",
        404,
      );
    }

    const [runningExperiment] = await tx
      .select({ id: experiments.id })
      .from(experiments)
      .where(
        and(eq(experiments.pageId, input.pageId), eq(experiments.status, "running")),
      )
      .limit(1);

    if (runningExperiment) {
      throw new ExperimentError(
        "experiment_already_running",
        "A running experiment already exists for this page.",
        409,
      );
    }

    const [pendingVariant] = await tx
      .select()
      .from(variants)
      .where(
        and(
          eq(variants.pageId, input.pageId),
          eq(variants.status, "pending_approval"),
        ),
      )
      .orderBy(desc(variants.createdAt))
      .limit(1);

    if (!pendingVariant) {
      throw new ExperimentError(
        "pending_variant_not_found",
        "No pending variant is available for approval.",
        404,
      );
    }

    const [approvedVariant] = await tx
      .update(variants)
      .set({ status: "approved", updatedAt: now })
      .where(
        and(
          eq(variants.id, pendingVariant.id),
          eq(variants.status, "pending_approval"),
        ),
      )
      .returning();

    if (!approvedVariant) {
      throw new ExperimentError(
        "pending_variant_not_found",
        "The pending variant was already approved or changed.",
        409,
      );
    }

    const [experiment] = await tx
      .insert(experiments)
      .values({
        pageId: page.id,
        variantId: approvedVariant.id,
        status: "running",
        primaryConversionEvent: page.primaryConversionEvent,
        startedAt: now,
      })
      .returning();

    return {
      experiment: {
        id: experiment.id,
        pageId: experiment.pageId,
        variantId: experiment.variantId,
        status: "running",
        primaryConversionEvent: experiment.primaryConversionEvent,
        startedAt: experiment.startedAt,
        createdAt: experiment.createdAt,
      },
      variant: mapVariantRow(approvedVariant),
    };
  });
}
