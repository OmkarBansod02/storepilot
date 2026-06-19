import { CheckCircle2, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { AuditResult } from "../types";
import { AuditScreenshot } from "./audit-screenshot";
import { AuditSummaryCard } from "./audit-summary-card";
import { ExperimentCard } from "./experiment-card";
import { FindingsGrid } from "./findings-grid";
import { IssueList } from "./issue-list";
import { NextStepsPanel } from "./next-steps-panel";

interface AuditResultsProps {
  result: AuditResult;
  onAuditAnother?: () => void;
}

export function AuditResults({ result, onAuditAnother }: AuditResultsProps) {
  return (
    <div className="space-y-12">
      {/* Verdict — top hero row */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1.5">
            <Badge
              variant="success"
              className="h-6 gap-1.5 rounded-full px-2.5 text-[11px] font-semibold"
            >
              <CheckCircle2 className="size-3" />
              Audit complete
            </Badge>
            <h2 className="font-heading text-[22px] font-bold tracking-tight">
              Verdict
            </h2>
            <p className="text-[13.5px] text-muted-foreground">
              {result.findings.length}{" "}
              {result.findings.length === 1 ? "finding" : "findings"} ·{" "}
              {result.issues.length}{" "}
              {result.issues.length === 1 ? "prioritized issue" : "prioritized issues"}{" "}
              · 1 recommended experiment
            </p>
          </div>
          {onAuditAnother && (
            <Button variant="outline" size="sm" onClick={onAuditAnother}>
              <RotateCcw className="size-3.5" />
              Audit another URL
            </Button>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <AuditScreenshot
              screenshotUrl={result.screenshotUrl}
              url={result.url}
            />
          </div>
          <div className="lg:col-span-2">
            <AuditSummaryCard result={result} />
          </div>
        </div>
      </section>

      {/* Evidence */}
      <FindingsGrid findings={result.findings} />
      <IssueList issues={result.issues} />

      {/* Plan */}
      <ExperimentCard experiment={result.recommendedExperiment} />
      <NextStepsPanel />
    </div>
  );
}
