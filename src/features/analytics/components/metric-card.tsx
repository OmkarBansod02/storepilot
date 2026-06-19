import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  emphasis?: "default" | "primary";
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  emphasis = "default",
}: MetricCardProps) {
  const isPrimary = emphasis === "primary";

  return (
    <Card
      className={cn(
        "gap-3 px-5 py-5",
        isPrimary && "border-primary/15 bg-accent/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-lg",
            isPrimary
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className={cn(
        "text-[28px] font-bold leading-none tabular-nums tracking-tight",
        isPrimary && "text-primary",
      )}>
        {value}
      </p>
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        {description}
      </p>
    </Card>
  );
}
