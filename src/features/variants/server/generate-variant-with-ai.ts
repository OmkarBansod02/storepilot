import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAiClient } from "@/lib/ai/openai-client";
import type { VariantGenerationContext } from "@/features/variants/types";
import {
  variantProposalSchema,
  type VariantProposalInput,
} from "@/features/variants/schemas/variant-input";
import { env } from "@/lib/env";

const VARIANT_GENERATION_MODEL = "gpt-4.1-mini";

interface VariantAiPrompt {
  system: string;
  user: string;
}

function buildVariantAiPrompt(context: VariantGenerationContext): VariantAiPrompt {
  return {
    system:
      [
        "Generate exactly one improved landing-page variant proposal.",
        "Return only the structured fields requested by the schema.",
        'Set source to exactly "ai".',
        "Do not include experiment setup, traffic splitting, deployment, or arbitrary page edits.",
        "Keep copy specific, believable, and close to the baseline product.",
      ].join(" "),
    user: JSON.stringify(
      {
        baseline: context.baseline,
        diagnosis: {
          primaryBottleneck: context.diagnosis.primaryBottleneck,
          title: context.diagnosis.title,
          summary: context.diagnosis.summary,
          recommendedExperiment: context.diagnosis.recommendedExperiment,
        },
        metrics: {
          totalSessions: context.metrics.totalSessions,
          ctaClickThroughRate: context.metrics.ctaClickThroughRate,
          formStartRate: context.metrics.formStartRate,
          formSubmitRate: context.metrics.formSubmitRate,
          averageMaxScrollDepth:
            context.metrics.scrollDepth.averageMaxScrollDepth,
        },
        requiredFields: [
          "headline",
          "subheadline",
          "primaryCtaLabel",
          "trustProofRow",
          "rationale",
          "targetArea",
          "expectedImpact",
          "sourceDiagnosis",
          "source",
        ],
      },
      null,
      2,
    ),
  };
}

export async function generateVariantWithAi(
  context: VariantGenerationContext,
): Promise<VariantProposalInput | null> {
  if (!env.OPENAI_API_KEY) {
    console.info(
      `[variants] OPENAI_API_KEY is missing for page ${context.pageId}. Using deterministic fallback variant generation.`,
    );
    return null;
  }

  const client = getOpenAiClient();

  if (!client) {
    console.info(
      `[variants] OpenAI client could not be initialized for page ${context.pageId}. Using deterministic fallback variant generation.`,
    );
    return null;
  }

  const prompt = buildVariantAiPrompt(context);
  console.info(
    `[variants] OPENAI_API_KEY detected for page ${context.pageId}. Requesting AI variant generation with ${VARIANT_GENERATION_MODEL}.`,
  );

  const response = await client.responses.parse({
    model: VARIANT_GENERATION_MODEL,
    instructions: prompt.system,
    input: prompt.user,
    text: {
      format: zodTextFormat(variantProposalSchema, "variant_proposal"),
    },
  });

  if (!response.output_parsed) {
    console.warn(
      `[variants] OpenAI returned no parsed variant proposal for page ${context.pageId}. Using deterministic fallback variant generation.`,
    );
    return null;
  }

  const proposal = variantProposalSchema.parse({
    ...response.output_parsed,
    source: "ai",
  });

  console.info(
    `[variants] OpenAI returned a valid variant proposal for page ${context.pageId}.`,
  );

  return proposal;
}
