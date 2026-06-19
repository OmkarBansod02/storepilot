import {
  ArrowRight,
  BarChart3,
  Camera,
  FlaskConical,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Camera,
    title: "Page screenshot & structure",
    description: "We render your page and extract real headings, CTAs, and trust signals.",
  },
  {
    icon: BarChart3,
    title: "Prioritized conversion issues",
    description: "Heuristic checks flag likely friction, ranked by probable impact.",
  },
  {
    icon: FlaskConical,
    title: "One recommended experiment",
    description: "A single, focused experiment with a hypothesis and rationale.",
  },
  {
    icon: ArrowRight,
    title: "Clear next step",
    description: "Send the experiment forward, or connect the snippet to validate.",
  },
] as const;

export function AuditEmpty() {
  return (
    <Card className="border-border/60 shadow-elevated">
      <CardContent className="py-12">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10">
              <Search className="size-6 text-primary" />
            </div>
            <h3 className="mt-5 text-lg font-bold tracking-tight">
              Paste a URL to get started
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              Enter any public landing page URL and get a structured conversion
              audit in seconds.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="flex items-start gap-3 rounded-xl border border-border/70 bg-surface-muted/60 p-4"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-card">
                  <b.icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold leading-snug">
                    {b.title}
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
