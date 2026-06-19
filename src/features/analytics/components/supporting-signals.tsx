import { Card } from "@/components/ui/card";
import type { DiagnosisSignal } from "@/features/analytics/types";

interface SupportingSignalsProps {
  signals: DiagnosisSignal[];
}

export function SupportingSignals({ signals }: SupportingSignalsProps) {
  if (signals.length === 0) return null;

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Supporting signals
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {signals.map((signal) => (
          <Card key={signal.label} className="gap-2 px-4 py-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {signal.label}
            </p>
            <p className="text-xl font-bold tabular-nums leading-none tracking-tight">
              {signal.value}
            </p>
            <p className="text-[11.5px] leading-5 text-muted-foreground">
              {signal.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
