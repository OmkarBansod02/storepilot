import type { SerializedVariantProposal } from "@/features/variants/types";

export interface DemoPageBaseline {
  brand: string;
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  trustProofRow: string[];
  formHeadline: string;
  formDescription: string;
}

export interface DemoExperimentRuntime {
  experimentId: string;
  variant: SerializedVariantProposal;
}
