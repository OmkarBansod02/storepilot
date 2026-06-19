import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AuditIssue } from "../types";

interface IssueListProps {
  issues: AuditIssue[];
}

const severityStyles: Record<AuditIssue["severity"], string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-muted text-muted-foreground border-border",
};

export function IssueList({ issues }: IssueListProps) {
  if (issues.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Prioritized issues
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Ordered by likely impact on conversion.
          </p>
        </div>
        <Badge
          variant="secondary"
          className="h-6 rounded-full border-border bg-card px-2.5 text-[11px] font-medium text-muted-foreground"
        >
          {issues.length} {issues.length === 1 ? "issue" : "issues"}
        </Badge>
      </div>
      <div className="space-y-3">
        {issues.map((issue, index) => (
          <Card key={issue.id} size="sm">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent font-mono text-[12px] font-semibold text-accent-foreground tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <CardTitle className="flex-1 text-[14.5px] font-semibold tracking-tight">
                  {issue.title}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className={cn(
                    "h-5 rounded-full border px-2 text-[10px] font-medium tracking-wide uppercase",
                    severityStyles[issue.severity],
                  )}
                >
                  {issue.severity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                {issue.description}
              </p>
              <div className="flex items-start gap-2.5 rounded-lg border border-warning/20 bg-warning/5 p-3">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />
                <div className="min-w-0">
                  <p className="text-[11.5px] font-semibold tracking-wide text-warning uppercase">
                    Why this likely hurts conversion
                  </p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-foreground/85">
                    {issue.conversionImpact}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
