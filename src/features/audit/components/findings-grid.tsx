import { Badge } from "@/components/ui/badge";
import type { AuditFinding } from "../types";
import { FindingCard } from "./finding-card";

interface FindingsGridProps {
  findings: AuditFinding[];
}

export function FindingsGrid({ findings }: FindingsGridProps) {
  if (findings.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Key findings
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Top conversion signals identified on this page.
          </p>
        </div>
        <Badge
          variant="secondary"
          className="h-6 rounded-full border-border bg-card px-2.5 text-[11px] font-medium text-muted-foreground"
        >
          {findings.length} {findings.length === 1 ? "finding" : "findings"}
        </Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {findings.map((finding) => (
          <FindingCard key={finding.id} finding={finding} />
        ))}
      </div>
    </section>
  );
}
