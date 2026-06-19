import { ExternalLink, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AuditResult } from "../types";

interface AuditSummaryCardProps {
  result: AuditResult;
}

type ScoreTone = "success" | "primary" | "warning" | "destructive";

function scoreTone(score: number): ScoreTone {
  if (score >= 80) return "success";
  if (score >= 60) return "primary";
  if (score >= 40) return "warning";
  return "destructive";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Moderate";
  if (score >= 40) return "Needs work";
  return "Critical";
}

const ringColorClass: Record<ScoreTone, string> = {
  success: "text-success",
  primary: "text-primary",
  warning: "text-warning",
  destructive: "text-destructive",
};

const badgeColorClass: Record<ScoreTone, string> = {
  success: "bg-success/10 text-success border-success/20",
  primary: "bg-primary/10 text-primary border-primary/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
};

export function AuditSummaryCard({ result }: AuditSummaryCardProps) {
  const tone = scoreTone(result.overallScore);
  const label = scoreLabel(result.overallScore);
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (result.overallScore / 100) * circumference;

  return (
    <Card className="h-full shadow-elevated">
      <CardContent className="flex h-full flex-col gap-6">
        <div className="flex items-center gap-5">
          <div className="relative flex size-[96px] shrink-0 items-center justify-center">
            <svg className="size-[96px] -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                strokeWidth="5"
                className="stroke-border/60"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={cn(
                  "transition-all duration-700",
                  ringColorClass[tone],
                )}
                style={{ stroke: "currentColor" }}
              />
            </svg>
            <span className="absolute font-heading text-[24px] font-bold tracking-tight tabular-nums">
              {result.overallScore}
            </span>
          </div>
          <div className="space-y-2">
            <Badge
              variant="secondary"
              className={cn(
                "h-6 rounded-full border px-2.5 text-[11px] font-medium",
                badgeColorClass[tone],
              )}
            >
              {label}
            </Badge>
            <p className="text-[14px] font-semibold text-foreground">
              Conversion score
            </p>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Heuristic + AI-weighted snapshot of conversion readiness.
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-border/70 bg-surface-muted p-4">
          <div className="flex items-start gap-2.5">
            <Globe className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 space-y-0.5">
              <p className="truncate text-[14px] font-medium leading-tight">
                {result.pageMetadata.title}
              </p>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="truncate">{result.url}</span>
                <ExternalLink className="size-3 shrink-0" />
              </a>
            </div>
          </div>
          {result.pageMetadata.description && (
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {result.pageMetadata.description}
            </p>
          )}
        </div>

        <p className="text-[14px] leading-relaxed text-foreground/85">
          {result.summary}
        </p>
      </CardContent>
    </Card>
  );
}
