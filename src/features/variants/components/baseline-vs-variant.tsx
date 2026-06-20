import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DemoPageBaseline, SerializedVariantProposal } from "@/features/variants/types";

interface BaselineVsVariantProps {
  baseline: DemoPageBaseline;
  variant: SerializedVariantProposal;
}

interface ComparisonRowProps {
  label: string;
  baselineValue: string;
  variantValue: string;
}

function ComparisonRow({ label, baselineValue, variantValue }: ComparisonRowProps) {
  const changed = baselineValue !== variantValue;

  return (
    <div
      className={cn(
        "grid grid-cols-[140px_1fr_1fr] items-start gap-3 px-5 py-4 text-sm",
        changed && "bg-accent/20",
      )}
    >
      <span className="pt-px text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="leading-relaxed text-muted-foreground">
        {baselineValue}
      </span>
      <span
        className={cn(
          "leading-relaxed",
          changed ? "font-medium text-foreground" : "text-muted-foreground",
        )}
      >
        {variantValue}
      </span>
    </div>
  );
}

export function BaselineVsVariant({ baseline, variant }: BaselineVsVariantProps) {
  return (
    <Card className="gap-0 p-0">
      <div className="grid grid-cols-[140px_1fr_1fr] gap-3 border-b px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span>Element</span>
        <span>Baseline</span>
        <span className="text-accent-foreground">Proposed Variant</span>
      </div>

      <div className="divide-y">
        <ComparisonRow
          label="Headline"
          baselineValue={baseline.headline}
          variantValue={variant.headline}
        />
        <ComparisonRow
          label="Subheadline"
          baselineValue={baseline.subheadline}
          variantValue={variant.subheadline}
        />
        <ComparisonRow
          label="Add-to-cart label"
          baselineValue={baseline.primaryCtaLabel}
          variantValue={variant.primaryCtaLabel}
        />
        <ComparisonRow
          label="Trust / Proof"
          baselineValue={baseline.trustProofRow.join(" · ")}
          variantValue={variant.trustProofRow.join(" · ")}
        />
      </div>
    </Card>
  );
}
