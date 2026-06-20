import { z } from "zod";

export const variantTargetAreaSchema = z.enum([
  "hero_positioning",
  "add_to_cart_cta",
  "checkout_reassurance",
  "shipping_returns_trust",
  "offer_banner",
]);

export const variantGenerationSourceSchema = z.enum([
  "ai",
  "deterministic_fallback",
]);

export const variantSourceDiagnosisSchema = z
  .object({
    primaryBottleneck: z.enum([
      "insufficient_data",
      "low_cta_engagement",
      "weak_above_the_fold_interest",
      "form_friction",
      "good_interest_weak_conversion",
      "healthy_funnel",
    ]),
    title: z.string().trim().min(1).max(180),
    recommendedExperimentTitle: z.string().trim().min(1).max(180),
  })
  .strict();

export const variantProposalSchema = z
  .object({
    headline: z.string().trim().min(1).max(160),
    subheadline: z.string().trim().min(1).max(320),
    primaryCtaLabel: z.string().trim().min(1).max(80),
    trustProofRow: z.array(z.string().trim().min(1).max(120)).min(1).max(4),
    rationale: z.string().trim().min(1).max(1200),
    targetArea: variantTargetAreaSchema,
    expectedImpact: z.string().trim().min(1).max(300),
    sourceDiagnosis: variantSourceDiagnosisSchema,
    source: variantGenerationSourceSchema,
  })
  .strict();

export const variantStoredContentSchema = variantProposalSchema.omit({
  rationale: true,
});

export const createVariantInputSchema = z.object({
  pageId: z.string().uuid(),
}).strict();

export const getLatestPendingVariantInputSchema = z.object({
  pageId: z.string().uuid(),
}).strict();

export type VariantTargetArea = z.infer<typeof variantTargetAreaSchema>;
export type VariantGenerationSource = z.infer<
  typeof variantGenerationSourceSchema
>;
export type VariantSourceDiagnosis = z.infer<
  typeof variantSourceDiagnosisSchema
>;
export type VariantProposalInput = z.infer<typeof variantProposalSchema>;
export type VariantStoredContentInput = z.infer<
  typeof variantStoredContentSchema
>;
export type CreateVariantInput = z.infer<typeof createVariantInputSchema>;
export type GetLatestPendingVariantInput = z.infer<
  typeof getLatestPendingVariantInputSchema
>;
