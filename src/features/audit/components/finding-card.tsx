import {
  AlignLeft,
  FileText,
  Gauge,
  LayoutPanelTop,
  MousePointerClick,
  ShieldCheck,
  Type,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AuditFinding } from "../types";

interface FindingCardProps {
  finding: AuditFinding;
}

const severityStyles: Record<AuditFinding["severity"], string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-muted text-muted-foreground border-border",
};

const categoryLabels: Record<AuditFinding["category"], string> = {
  headline: "Headline",
  cta: "CTA",
  trust: "Trust",
  layout: "Layout",
  form: "Form",
  copy: "Copy",
  performance: "Performance",
};

const categoryIcons: Record<AuditFinding["category"], LucideIcon> = {
  headline: Type,
  cta: MousePointerClick,
  trust: ShieldCheck,
  layout: LayoutPanelTop,
  form: FileText,
  copy: AlignLeft,
  performance: Gauge,
};

export function FindingCard({ finding }: FindingCardProps) {
  const Icon = categoryIcons[finding.category];
  return (
    <Card
      size="sm"
      className="transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-card-hover"
    >
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="h-[22px] gap-1.5 rounded-md border-border/80 bg-surface-muted px-2 text-[11px] font-medium text-muted-foreground"
          >
            <Icon className="size-3" />
            {categoryLabels[finding.category]}
          </Badge>
          <Badge
            variant="secondary"
            className={cn(
              "h-[22px] rounded-full border px-2 text-[10px] font-semibold tracking-wide uppercase",
              severityStyles[finding.severity],
            )}
          >
            {finding.severity}
          </Badge>
        </div>
        <h4 className="mt-3.5 text-[14px] font-semibold leading-snug tracking-tight">
          {finding.title}
        </h4>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
          {finding.description}
        </p>
      </CardContent>
    </Card>
  );
}
