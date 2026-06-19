import { getRunningExperimentForPage } from "@/features/experiments/server/get-running-experiment";
import type { DemoExperimentRuntime } from "@/features/demo/types";
import { serializeVariantProposal } from "@/features/variants/types";

export async function getDemoExperimentRuntime(
  pageId: string,
): Promise<DemoExperimentRuntime | null> {
  const experiment = await getRunningExperimentForPage(pageId);

  if (!experiment) return null;

  return {
    experimentId: experiment.id,
    variant: serializeVariantProposal(experiment.variant),
  };
}
