import { getDefaultDemoPageBaseline } from "@/features/demo/lib/default-demo-page-baseline";
import { demoPageBaselineSchema } from "@/features/demo/schemas/demo-page-baseline";
import type { DemoPageBaseline } from "@/features/demo/types";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getDemoPageBaseline(
  pageId: string,
): Promise<DemoPageBaseline> {
  const [page] = await db
    .select({ baselineContent: pages.baselineContent })
    .from(pages)
    .where(eq(pages.id, pageId))
    .limit(1);

  const parsed = demoPageBaselineSchema.safeParse(page?.baselineContent);

  return parsed.success ? parsed.data : getDefaultDemoPageBaseline();
}
