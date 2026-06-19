import type { CreateVariantInput } from "@/features/variants/schemas/variant-input";
import { generateVariantProposalForPage } from "@/features/variants/server/generate-variant-proposal";

export async function createVariant(input: CreateVariantInput) {
  return generateVariantProposalForPage(input);
}
