"use client";

import { useCallback, useState } from "react";
import { ExperimentStartedCard } from "@/features/experiments/components/experiment-started-card";
import { VariantGenerationCta } from "@/features/variants/components/variant-generation-cta";
import { VariantLoading } from "@/features/variants/components/variant-loading";
import { VariantError } from "@/features/variants/components/variant-error";
import { VariantProposalCard } from "@/features/variants/components/variant-proposal-card";
import type { ApprovalResult } from "@/features/variants/components/variant-proposal-card";
import type { DemoPageBaseline, SerializedVariantProposal } from "@/features/variants/types";

interface VariantSectionProps {
  pageId: string;
  baseline: DemoPageBaseline;
  initialVariant: SerializedVariantProposal | null;
}

type SectionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; variant: SerializedVariantProposal }
  | { status: "experiment_started"; approval: ApprovalResult };

export function VariantSection({
  pageId,
  baseline,
  initialVariant,
}: VariantSectionProps) {
  const [state, setState] = useState<SectionState>(
    initialVariant
      ? { status: "success", variant: initialVariant }
      : { status: "idle" },
  );

  const handleGenerate = useCallback(async () => {
    setState({ status: "loading" });

    try {
      const response = await fetch("/api/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          (body as { error?: string } | null)?.error ??
          "Something went wrong while generating the variant.";
        setState({ status: "error", message });
        return;
      }

      const data = (await response.json()) as SerializedVariantProposal;
      setState({ status: "success", variant: data });
    } catch {
      setState({
        status: "error",
        message: "Network error. Please check your connection and try again.",
      });
    }
  }, [pageId]);

  if (state.status === "idle") {
    return <VariantGenerationCta onGenerate={handleGenerate} isLoading={false} />;
  }

  if (state.status === "loading") {
    return (
      <div className="space-y-4">
        <VariantGenerationCta onGenerate={handleGenerate} isLoading />
        <VariantLoading />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <VariantError
        message={state.message}
        onRetry={handleGenerate}
      />
    );
  }

  if (state.status === "experiment_started") {
    return (
      <ExperimentStartedCard
        variantHeadline={state.approval.variant.headline}
        primaryConversionEvent={state.approval.primaryConversionEvent}
      />
    );
  }

  return (
    <VariantProposalCard
      variant={state.variant}
      baseline={baseline}
      onApproved={(result) =>
        setState({ status: "experiment_started", approval: result })
      }
    />
  );
}
