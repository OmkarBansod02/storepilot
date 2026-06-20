export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ensureDemoPage } from "@/features/demo/server/ensure-demo-page";
import { getDemoPageBaseline } from "@/features/demo/server/get-demo-page-baseline";
import { getDemoExperimentRuntime } from "@/features/demo/server/get-demo-experiment-runtime";
import { DemoPageClient } from "@/features/demo/components/demo-page-client";
import type { ExperimentArm } from "@/features/experiments/types";
import { ShoppingBag } from "lucide-react";

interface DemoPageProps {
  searchParams?: Promise<{
    arm?: string | string[] | undefined;
    freshSession?: string | string[] | undefined;
  }>;
}

function parseForcedArm(
  value: string | string[] | undefined,
): ExperimentArm | null {
  const rawArm = Array.isArray(value) ? value[0] : value;

  if (rawArm !== "control" && rawArm !== "variant") return null;

  return rawArm;
}

function parseFreshSession(value: string | string[] | undefined): boolean {
  const rawValue = Array.isArray(value) ? value[0] : value;

  return rawValue === "1";
}

export default async function DemoPage({ searchParams }: DemoPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const forcedArm =
    process.env.NODE_ENV === "development"
      ? parseForcedArm(params?.arm)
      : null;
  const freshSession =
    process.env.NODE_ENV === "development"
      ? parseFreshSession(params?.freshSession)
      : false;
  const { pageId } = await ensureDemoPage();
  const [baseline, experimentRuntime] = await Promise.all([
    getDemoPageBaseline(pageId),
    getDemoExperimentRuntime(pageId),
  ]);

  return (
    <div className="flex min-h-full flex-col bg-[#faf7f2]">
      <header className="sticky top-0 z-50 border-b border-[#e8ddd0]/80 bg-[#faf7f2]/92 shadow-[0_1px_3px_rgba(61,43,31,0.04)] backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-[#3d2b1f]">
              <span className="text-[11px] font-bold text-[#f5efe8]">AC</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-[#3d2b1f]">
              {baseline.brand}
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm" className="border-[#d4c4b0] hover:bg-[#f5efe8]">
              <a href="#checkout">
                <ShoppingBag className="size-4" />
                Cart
              </a>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <DemoPageClient
          pageId={pageId}
          baseline={baseline}
          experimentRuntime={experimentRuntime}
          forcedArm={forcedArm}
          freshSession={freshSession}
        />
      </main>

      <footer className="border-t border-[#e8ddd0]/80 bg-[#f5efe8]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6 text-[13px] text-[#7d6b5d]">
          <span>&copy; {baseline.brand} &middot; Small-batch leather goods</span>
          <Link
            href="/dashboard"
            className="font-medium text-[#c85a28] hover:underline underline-offset-2 transition-colors"
          >
            View StorePilot Dashboard &rarr;
          </Link>
        </div>
      </footer>
    </div>
  );
}
