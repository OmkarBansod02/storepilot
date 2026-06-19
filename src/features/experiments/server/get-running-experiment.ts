import { mapVariantRow } from "@/features/variants/lib/map-variant-row";
import type { VariantProposal } from "@/features/variants/types";
import { db } from "@/lib/db";
import { experiments, variants } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";

export interface RunningExperiment {
  id: string;
  pageId: string;
  variantId: string;
  status: "running";
  primaryConversionEvent: string;
  startedAt: Date | null;
  createdAt: Date;
  variant: VariantProposal;
}

export async function getRunningExperimentForPage(
  pageId: string,
): Promise<RunningExperiment | null> {
  const rows = await db
    .select({
      experiment: experiments,
      variant: variants,
    })
    .from(experiments)
    .innerJoin(variants, eq(experiments.variantId, variants.id))
    .where(and(eq(experiments.pageId, pageId), eq(experiments.status, "running")))
    .orderBy(desc(experiments.startedAt), desc(experiments.createdAt))
    .limit(1);

  const row = rows[0];

  if (!row) return null;

  return {
    id: row.experiment.id,
    pageId: row.experiment.pageId,
    variantId: row.experiment.variantId,
    status: "running",
    primaryConversionEvent: row.experiment.primaryConversionEvent,
    startedAt: row.experiment.startedAt,
    createdAt: row.experiment.createdAt,
    variant: mapVariantRow(row.variant),
  };
}
