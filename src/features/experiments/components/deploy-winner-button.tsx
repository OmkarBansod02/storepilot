"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ExperimentRecommendedAction } from "@/features/experiments/lib/calculate-bayesian-winner";
import type { ExperimentArm } from "@/features/experiments/types";

interface DeployWinnerButtonProps {
  experimentId: string;
  winner: ExperimentArm;
  recommendedAction: ExperimentRecommendedAction;
}

function getDeployLabel(
  winner: ExperimentArm,
  recommendedAction: ExperimentRecommendedAction,
): string {
  if (recommendedAction === "needs_more_data") return "Needs more data";
  if (recommendedAction === "keep_running") return "Keep running";
  return winner === "variant" ? "Promote variant" : "Retain control";
}

export function DeployWinnerButton({
  experimentId,
  winner,
  recommendedAction,
}: DeployWinnerButtonProps) {
  const router = useRouter();
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canDeploy = recommendedAction === "promote_winner";

  async function handleDeploy() {
    if (!canDeploy || isDeploying) return;

    setError(null);
    setIsDeploying(true);

    try {
      const response = await fetch(`/api/experiments/${experimentId}/deploy`, {
        method: "POST",
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(body?.error ?? "Winner deployment failed.");
        return;
      }

      router.refresh();
    } finally {
      setIsDeploying(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-1.5 sm:items-end">
      <Button
        type="button"
        size="sm"
        className={
          canDeploy
            ? "gap-2 bg-success text-success-foreground shadow-sm hover:bg-success/90"
            : "gap-2"
        }
        disabled={!canDeploy || isDeploying}
        onClick={handleDeploy}
      >
        {isDeploying && <Loader2 className="size-3.5 animate-spin" />}
        {isDeploying
          ? "Deploying…"
          : getDeployLabel(winner, recommendedAction)}
        {canDeploy && !isDeploying && <ArrowRight className="size-3.5" />}
      </Button>
      {error && (
        <p className="max-w-xs text-xs text-destructive sm:text-right">
          {error}
        </p>
      )}
    </div>
  );
}
