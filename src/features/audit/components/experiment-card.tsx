import { FlaskConical, Lightbulb, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RecommendedExperiment } from "../types";

interface ExperimentCardProps {
  experiment: RecommendedExperiment;
}

export function ExperimentCard({ experiment }: ExperimentCardProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Recommended experiment
          </h2>
          <p className="text-[13px] text-muted-foreground">
            The highest-leverage test based on this audit.
          </p>
        </div>
        <Badge
          variant="secondary"
          className="h-6 rounded-full border-border bg-card px-2.5 text-[11px] font-medium text-muted-foreground"
        >
          1 of 1
        </Badge>
      </div>

      <Card className="border-primary/25 shadow-[0_2px_4px_rgba(200,90,40,0.06),0_16px_40px_-20px_rgba(200,90,40,0.18)]">
        <CardHeader className="border-b border-border/60">
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(200,90,40,0.3)]">
              <FlaskConical className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-[16px] font-bold tracking-tight">
                {experiment.title}
              </CardTitle>
            </div>
            <Badge
              variant="secondary"
              className="h-6 gap-1 rounded-full border border-success/20 bg-success/10 px-2.5 text-[11px] font-semibold text-success"
            >
              <TrendingUp className="size-3" />
              {experiment.expectedImpact}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Hypothesis
            </p>
            <p className="text-[14px] leading-relaxed text-foreground/90">
              {experiment.hypothesis}
            </p>
          </div>

          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Proposed changes
            </p>
            <ul className="space-y-2">
              {experiment.changes.map((change) => (
                <li
                  key={change}
                  className="flex items-start gap-2.5 rounded-lg border border-border/70 bg-surface-muted/60 px-3.5 py-2.5"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                  />
                  <span className="text-[13.5px] leading-relaxed text-foreground/90">
                    {change}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex items-start gap-2.5">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Rationale
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                {experiment.rationale}
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </section>
  );
}
