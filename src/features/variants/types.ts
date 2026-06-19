import type {
  DashboardDiagnosis,
  DashboardMetrics,
} from "@/features/analytics/types";
import type { DemoPageBaseline } from "@/features/demo/types";
import type {
  VariantGenerationSource,
  VariantSourceDiagnosis,
  VariantTargetArea,
} from "@/features/variants/schemas/variant-input";

export type VariantStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "deployed";

export type { DemoPageBaseline };

export interface VariantProposal {
  id: string;
  pageId: string;
  auditId: string | null;
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  trustProofRow: string[];
  rationale: string;
  targetArea: VariantTargetArea;
  expectedImpact: string;
  sourceDiagnosis: VariantSourceDiagnosis;
  source: VariantGenerationSource;
  status: VariantStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface VariantGenerationContext {
  pageId: string;
  baseline: DemoPageBaseline;
  metrics: DashboardMetrics;
  diagnosis: DashboardDiagnosis;
}

export type SerializedVariantProposal = Omit<
  VariantProposal,
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
};

export function serializeVariantProposal(
  v: VariantProposal,
): SerializedVariantProposal {
  return {
    ...v,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  };
}
