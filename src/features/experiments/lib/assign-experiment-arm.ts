import type { ExperimentArm } from "@/features/experiments/types";

function hashAssignmentKey(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function assignExperimentArm({
  experimentId,
  anonymousId,
}: {
  experimentId: string;
  anonymousId: string;
}): ExperimentArm {
  const bucket = hashAssignmentKey(`${experimentId}:${anonymousId}`) % 100;

  return bucket < 50 ? "control" : "variant";
}
