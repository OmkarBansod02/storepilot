import { CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ExperimentStartedCardProps {
  variantHeadline: string;
  primaryConversionEvent: string;
}

export function ExperimentStartedCard({
  variantHeadline,
  primaryConversionEvent,
}: ExperimentStartedCardProps) {
  return (
    <Card className="border-primary/20 shadow-elevated">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle2 className="size-5 text-success" />
            </div>
            <div>
              <CardTitle className="text-[16px] font-bold tracking-tight">Experiment started</CardTitle>
              <CardDescription className="mt-1">
                Your A/B test is now live on the demo page.
              </CardDescription>
            </div>
          </div>
          <Badge variant="warning">Running</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-[14px]">
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground">Variant</span>
            <span className="font-semibold">{variantHeadline}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground">Split</span>
            <span className="font-semibold">50 / 50</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground">Primary metric</span>
            <span className="font-semibold">{primaryConversionEvent}</span>
          </div>
        </div>

        <div className="mt-6">
          <Button asChild variant="outline" className="gap-2">
            <a href="/experiments">
              View experiment details
              <ArrowRight className="size-3.5" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
