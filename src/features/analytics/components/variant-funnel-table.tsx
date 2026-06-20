import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { VariantFunnelMetrics } from "@/features/analytics/types";
import { formatDemoCurrency } from "@/features/demo/lib/demo-product";

function formatPercent(value: number): string {
  const bounded = Math.min(Math.max(value, 0), 1);
  if (bounded === 0) return "0%";
  return `${(bounded * 100).toFixed(1)}%`;
}

function armLabel(arm: VariantFunnelMetrics["arm"]): string {
  if (arm === "control") return "Control";
  if (arm === "variant") return "Variant";
  return "Unassigned";
}

function findBestVariant(
  rows: VariantFunnelMetrics[],
): VariantFunnelMetrics | null {
  const assigned = rows.filter(
    (r) => r.arm !== "unassigned" && r.sessions > 0,
  );
  if (assigned.length === 0) return null;

  return assigned.reduce((best, row) =>
    row.revenuePerVisitorCents > best.revenuePerVisitorCents ? row : best,
  );
}

interface VariantFunnelTableProps {
  perVariantFunnel: VariantFunnelMetrics[];
}

export function VariantFunnelTable({
  perVariantFunnel,
}: VariantFunnelTableProps) {
  const rows = perVariantFunnel.filter((r) => r.sessions > 0);
  if (rows.length === 0) return null;

  const best = findBestVariant(rows);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variant Comparison</CardTitle>
        <CardDescription>
          Per-variant storefront funnel performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pr-4">Variant</th>
                <th className="pb-3 pr-4 text-right">Sessions</th>
                <th className="pb-3 pr-4 text-right">Add-to-Cart</th>
                <th className="pb-3 pr-4 text-right">Checkout</th>
                <th className="pb-3 pr-4 text-right">Purchase</th>
                <th className="pb-3 pr-4 text-right">Revenue</th>
                <th className="pb-3 text-right">Rev / Visitor</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => {
                const isBest = best === row;
                return (
                  <tr
                    key={`${row.experimentId}-${row.arm}`}
                    className={cn(isBest && "bg-accent/20")}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{armLabel(row.arm)}</span>
                        {isBest && (
                          <Badge variant="success" className="text-[10px]">
                            Best
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      {row.sessions.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      {formatPercent(row.addToCartRate)}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      {formatPercent(row.checkoutStartRate)}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      {formatPercent(row.purchaseConversionRate)}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      {formatDemoCurrency(row.totalRevenueCents)}
                    </td>
                    <td
                      className={cn(
                        "py-3 text-right tabular-nums",
                        isBest && "font-semibold text-success",
                      )}
                    >
                      {formatDemoCurrency(row.revenuePerVisitorCents)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
