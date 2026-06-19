import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type {
  DashboardDiagnosis,
  DiagnosisConfidence,
  PrimaryBottleneck,
} from "@/features/analytics/types";

interface BottleneckCardProps {
  diagnosis: DashboardDiagnosis;
}

const confidenceConfig: Record<
  DiagnosisConfidence,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  high: { label: "High confidence", variant: "default" },
  medium: { label: "Medium confidence", variant: "secondary" },
  low: { label: "Low confidence", variant: "outline" },
};

type Severity = "issue" | "healthy" | "neutral";

function getSeverity(bottleneck: PrimaryBottleneck): Severity {
  if (bottleneck === "healthy_funnel") return "healthy";
  if (bottleneck === "insufficient_data") return "neutral";
  return "issue";
}

function SeverityIcon({ severity }: { severity: Severity }) {
  if (severity === "healthy") {
    return <CheckCircle2 className="size-5" />;
  }
  if (severity === "neutral") {
    return <HelpCircle className="size-5" />;
  }
  return <AlertTriangle className="size-5" />;
}

const severityIconStyles: Record<Severity, string> = {
  issue: "bg-warning/15 text-warning",
  healthy: "bg-success/15 text-success",
  neutral: "bg-muted text-muted-foreground",
};

export function BottleneckCard({ diagnosis }: BottleneckCardProps) {
  const conf = confidenceConfig[diagnosis.confidence];
  const severity = getSeverity(diagnosis.primaryBottleneck);

  const borderAccent: Record<Severity, string> = {
    issue: "border-l-warning/50",
    healthy: "border-l-success/50",
    neutral: "border-l-border",
  };

  return (
    <Card className={`gap-0 border-l-[3px] p-7 shadow-elevated ${borderAccent[severity]}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl ${severityIconStyles[severity]}`}
          >
            <SeverityIcon severity={severity} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Likely bottleneck
            </p>
            <h2 className="mt-1.5 text-lg font-bold leading-snug tracking-tight">
              {diagnosis.title}
            </h2>
          </div>
        </div>
        <Badge variant={conf.variant} className="shrink-0">
          {conf.label}
        </Badge>
      </div>
      <p className="mt-5 max-w-3xl text-[14px] leading-relaxed text-muted-foreground">
        {diagnosis.summary}
      </p>
    </Card>
  );
}
