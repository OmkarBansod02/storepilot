import { ArrowRight, FlaskConical } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ensureDemoPage } from "@/features/demo/server/ensure-demo-page";
import { RunningExperimentCard } from "@/features/experiments/components/running-experiment-card";
import { getLatestPageExperiment } from "@/features/experiments/server/get-running-experiment-summary";

export const dynamic = "force-dynamic";

const FLOW_STEPS = [
  "System diagnoses a friction point",
  "One improved variant is generated",
  "You review and approve the change",
  "Traffic is split 50/50 between control and variant",
  "Results are compared and the winner can be deployed",
] as const;

export default async function ExperimentsPage() {
  const { pageId } = await ensureDemoPage();
  const experiment = await getLatestPageExperiment(pageId);
  const isRunning = experiment?.status === "running";

  return (
    <PageContainer>
      <PageHeader
        title="Experiments"
        description="Review, approve, and track A/B tests on your product page."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {experiment ? (
          <RunningExperimentCard
            experiment={experiment}
            showDeployAction={isRunning}
          />
        ) : (
          <EmptyExperimentState />
        )}

        <Card className="self-start">
          <CardHeader>
            <CardTitle className="text-[15px] font-bold tracking-tight">How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 text-[13.5px] text-muted-foreground">
              {FLOW_STEPS.map((step, index) => (
                <li key={index} className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

function EmptyExperimentState() {
  return (
    <Card className="lg:col-span-2 border-border/60 bg-gradient-to-b from-accent/20 to-card shadow-elevated">
      <CardContent className="py-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <FlaskConical className="size-7 text-primary" />
          </div>
          <h3 className="mt-6 text-lg font-bold tracking-tight">
            No experiment yet
          </h3>
          <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
            Experiments appear here once a variant is approved from the
            dashboard. The system will split traffic, track conversions, and
            recommend a winner.
          </p>
          <Button variant="outline" className="mt-7" asChild>
            <Link href="/dashboard">
              Go to dashboard
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
