import type { ExperimentArm } from "@/features/experiments/types";

interface DevArmBadgeProps {
  arm: ExperimentArm;
  forced?: boolean;
}

export function DevArmBadge({ arm, forced = false }: DevArmBadgeProps) {
  const dotColor =
    arm === "variant" ? "bg-primary" : "bg-muted-foreground";

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border bg-background/95 px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur">
      <span className={`size-2 rounded-full ${dotColor}`} />
      <span className="text-muted-foreground">Arm:</span>
      <span className="font-semibold">
        {arm}
        {forced ? " (forced)" : ""}
      </span>
    </div>
  );
}
