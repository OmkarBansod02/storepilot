import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function DashboardEmpty() {
  return (
    <Card className="items-center gap-0 border-border/60 bg-gradient-to-b from-accent/30 to-card px-8 py-16 text-center shadow-elevated">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Activity className="size-7" />
      </div>
      <h3 className="mt-6 text-lg font-bold tracking-tight">Waiting for traffic</h3>
      <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
        StorePilot will start surfacing diagnosis, recommendations, and a
        proposed variant as soon as your demo store records its first
        sessions.
      </p>
      <div className="mt-7 space-y-2 text-[13px] text-muted-foreground">
        <p className="flex items-center justify-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">1</span>
          Open the demo store and interact with the product
        </p>
        <p className="flex items-center justify-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">2</span>
          Browse the product page and add an item to cart
        </p>
        <p className="flex items-center justify-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">3</span>
          Return here — the dashboard updates automatically
        </p>
      </div>
      <Button className="mt-8" asChild>
        <Link href="/demo">
          Open demo store
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </Card>
  );
}
