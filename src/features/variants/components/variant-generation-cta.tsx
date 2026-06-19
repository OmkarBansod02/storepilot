import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface VariantGenerationCtaProps {
  onGenerate: () => void;
  isLoading: boolean;
}

export function VariantGenerationCta({
  onGenerate,
  isLoading,
}: VariantGenerationCtaProps) {
  return (
    <Card className="gap-0 border-primary/20 bg-accent/40 p-7 shadow-elevated">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Next step
            </p>
            <h3 className="mt-1.5 text-[17px] font-bold leading-snug tracking-tight">
              Generate a variant proposal
            </h3>
            <p className="mt-2.5 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
              Based on the diagnosis above, Liftpilot will draft one improved
              version of your landing page. You&apos;ll review the proposed
              changes before anything goes live.
            </p>
          </div>
        </div>
        <Button
          className="shrink-0 shadow-primary-glow"
          onClick={onGenerate}
          disabled={isLoading}
        >
          {isLoading ? "Generating…" : "Generate variant"}
        </Button>
      </div>
    </Card>
  );
}
