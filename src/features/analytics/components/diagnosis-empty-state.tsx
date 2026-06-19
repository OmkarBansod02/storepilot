import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DashboardDiagnosis } from "@/features/analytics/types";

interface DiagnosisEmptyStateProps {
  diagnosis: DashboardDiagnosis;
}

export function DiagnosisEmptyState({ diagnosis }: DiagnosisEmptyStateProps) {
  return (
    <Card className="items-center gap-0 border-border/60 bg-gradient-to-b from-accent/20 to-card px-8 py-14 text-center shadow-elevated">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <BarChart3 className="size-6" />
      </div>
      <h3 className="mt-6 text-lg font-bold tracking-tight">{diagnosis.title}</h3>
      <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
        {diagnosis.summary}
      </p>
      {diagnosis.supportingSignals.length > 0 && (
        <p className="mt-5 text-[13px] text-muted-foreground">
          {diagnosis.supportingSignals[0].label}:{" "}
          <span className="font-semibold text-foreground">
            {diagnosis.supportingSignals[0].value}
          </span>
        </p>
      )}
    </Card>
  );
}
