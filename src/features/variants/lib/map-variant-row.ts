import { variantStoredContentSchema } from "@/features/variants/schemas/variant-input";
import type { VariantProposal } from "@/features/variants/types";
import type { Variant } from "@/lib/db/schema";

export function mapVariantRow(row: Variant): VariantProposal {
  const content = variantStoredContentSchema.parse(row.content);

  return {
    id: row.id,
    pageId: row.pageId,
    auditId: row.auditId,
    status: row.status,
    headline: content.headline,
    subheadline: content.subheadline,
    primaryCtaLabel: content.primaryCtaLabel,
    trustProofRow: content.trustProofRow,
    rationale: row.rationale,
    targetArea: content.targetArea,
    expectedImpact: content.expectedImpact,
    sourceDiagnosis: content.sourceDiagnosis,
    source: content.source,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
