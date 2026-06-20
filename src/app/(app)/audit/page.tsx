import { Camera, FlaskConical, Search, ShieldCheck } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { AuditPageClient } from "@/features/audit/components/audit-page-client";

const trustItems = [
  { icon: Camera, label: "Screenshot & structure" },
  { icon: Search, label: "Prioritized issues" },
  { icon: FlaskConical, label: "One recommended experiment" },
  { icon: ShieldCheck, label: "Deterministic + AI" },
] as const;

export default function AuditPage() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[340px] bg-[radial-gradient(65%_55%_at_50%_0%,var(--accent)_0%,transparent_75%)] opacity-80"
      />

      <PageContainer>
        <PageHeader
          title="Storefront Audit"
          description="Paste any public product page. Get a structured ecommerce conversion audit — offer clarity, checkout trust, shipping reassurance, and purchase intent — with one experiment to run next."
        >
          <Badge
            variant="secondary"
            className="h-6 rounded-full border-border/80 bg-card px-2.5 text-[11px] font-medium tracking-wide text-muted-foreground shadow-card uppercase"
          >
            Quick start
          </Badge>
        </PageHeader>

        <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-2.5 text-[13px] text-muted-foreground">
          {trustItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-accent">
                <item.icon className="size-3 text-primary" />
              </span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <AuditPageClient />
        </div>
      </PageContainer>
    </div>
  );
}
