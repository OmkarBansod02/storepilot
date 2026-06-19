import Link from "next/link";
import { ArrowRight, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function NextStepsPanel() {
  return (
    <Card className="border-primary/20 bg-accent/30">
      <CardContent className="py-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Plug className="size-5" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-[14px] font-semibold tracking-tight">
              Validate with real traffic
            </h3>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Connect the StorePilot snippet to your page to collect visitor
              behavior and confirm these findings with real signals.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              Get started
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
