"use client";

import { useState } from "react";
import { FileText, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BaselineVsVariant } from "@/features/variants/components/baseline-vs-variant";
import type { DemoPageBaseline, SerializedVariantProposal } from "@/features/variants/types";
import { formatVariantTargetArea } from "@/features/variants/lib/format-variant-target-area";

export interface ApprovalResult {
  variant: SerializedVariantProposal;
  experimentId: string;
  primaryConversionEvent: string;
}

interface VariantProposalCardProps {
  variant: SerializedVariantProposal;
  baseline: DemoPageBaseline;
  onApproved: (result: ApprovalResult) => void;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "pending_approval") {
    return (
      <Badge variant="secondary" className="bg-accent text-accent-foreground">
        Pending approval
      </Badge>
    );
  }
  return <Badge variant="outline">{status}</Badge>;
}

export function VariantProposalCard({
  variant,
  baseline,
  onApproved,
}: VariantProposalCardProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function approveVariant() {
    setIsApproving(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: variant.pageId }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setErrorMessage(
          body?.error ?? "Could not approve this variant for testing.",
        );
        return;
      }

      const data = (await response.json()) as {
        experiment: {
          id: string;
          primaryConversionEvent: string;
        };
        variant: SerializedVariantProposal;
      };
      onApproved({
        variant: data.variant,
        experimentId: data.experiment.id,
        primaryConversionEvent: data.experiment.primaryConversionEvent,
      });
    } catch {
      setErrorMessage("Network error while approving the variant.");
    } finally {
      setIsApproving(false);
    }
  }

  const isPending = variant.status === "pending_approval";

  return (
    <div className="space-y-5">
      <Card className="gap-0 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <FileText className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Variant Proposal
              </p>
              <h2 className="mt-1 text-lg font-semibold leading-snug">
                Improved {formatVariantTargetArea(variant.targetArea)}
              </h2>
            </div>
          </div>
          <StatusBadge status={variant.status} />
        </div>

        <div className="mt-5 grid gap-4 rounded-lg border bg-muted/40 p-4 sm:grid-cols-3">
          <MetaCell
            label="Target area"
            value={formatVariantTargetArea(variant.targetArea)}
          />
          <MetaCell label="Expected impact" value={variant.expectedImpact} />
          <MetaCell
            label="Source"
            value={variant.source === "ai" ? "AI-generated" : "Deterministic fallback"}
          />
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Rationale
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {variant.rationale}
          </p>
        </div>
      </Card>

      <BaselineVsVariant baseline={baseline} variant={variant} />

      <Card className="flex-row items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-sm text-foreground">
            {isPending
              ? "Ready to test?"
              : "This variant is approved and now has a running A/B test."}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isPending
              ? "Approve the proposal to launch a 50/50 A/B test against your baseline."
              : "Open the experiment to monitor live performance."}
          </p>
          {errorMessage && (
            <p className="mt-1 text-xs font-medium text-destructive">
              {errorMessage}
            </p>
          )}
        </div>
        {isPending ? (
          <Button
            size="sm"
            onClick={approveVariant}
            disabled={isApproving}
            className="shrink-0 gap-2"
          >
            <FlaskConical className="size-3.5" />
            {isApproving ? "Approving..." : "Approve for A/B test"}
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <a href="/experiments">View experiment</a>
          </Button>
        )}
      </Card>
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
