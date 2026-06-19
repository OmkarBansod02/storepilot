import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { RecommendedExperiment } from "@/features/analytics/types";

interface RecommendedExperimentCardProps {
  experiment: RecommendedExperiment;
}

function formatTargetArea(area: string): string {
  if (area === "signup_form") return "Offer form";

  return area.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function RecommendedExperimentCard({
  experiment,
}: RecommendedExperimentCardProps) {
  return (
    <Card className="gap-0 border-primary/20 bg-accent/40 p-7 shadow-elevated">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Lightbulb className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Recommended Experiment
              </p>
              <Badge
                variant="accent"
              >
                Next step
              </Badge>
            </div>
            <h3 className="mt-1.5 text-[17px] font-bold leading-snug tracking-tight">
              {experiment.title}
            </h3>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0">
          {formatTargetArea(experiment.targetArea)}
        </Badge>
      </div>

      <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
        {experiment.description}
      </p>

      <div className="mt-6 border-t border-primary/10 pt-4">
        <p className="text-[13px] text-muted-foreground">
          <span className="font-semibold text-foreground">Expected impact:</span>{" "}
          {experiment.expectedImpact}
        </p>
      </div>
    </Card>
  );
}
