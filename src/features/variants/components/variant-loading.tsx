import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VariantLoading() {
  return (
    <Card className="gap-0 p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-5 w-56" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 rounded-lg border bg-muted/40 p-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </Card>
  );
}
