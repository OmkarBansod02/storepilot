import { db } from "@/lib/db";
import { sites, pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getDefaultDemoPageBaseline } from "@/features/demo/lib/default-demo-page-baseline";

const DEMO_SITE_NAME = "StorePilot Demo";
const DEMO_SITE_URL = "http://localhost:3000/demo";
const DEMO_PAGE_TITLE = "Northstar Pack - Demo Product Page";

export async function ensureDemoPage(): Promise<{ pageId: string; siteId: string }> {
  const baselineContent = getDefaultDemoPageBaseline();
  const existingSite = await db
    .select({ id: sites.id })
    .from(sites)
    .where(eq(sites.name, DEMO_SITE_NAME))
    .limit(1);

  let siteId: string;

  if (existingSite.length > 0) {
    siteId = existingSite[0].id;
  } else {
    const [inserted] = await db
      .insert(sites)
      .values({ name: DEMO_SITE_NAME, url: DEMO_SITE_URL })
      .returning({ id: sites.id });
    siteId = inserted.id;
  }

  const existingPage = await db
    .select({ id: pages.id, baselineContent: pages.baselineContent })
    .from(pages)
    .where(eq(pages.siteId, siteId))
    .limit(1);

  if (existingPage.length > 0) {
    if (!existingPage[0].baselineContent) {
      await db
        .update(pages)
        .set({ baselineContent, updatedAt: new Date() })
        .where(eq(pages.id, existingPage[0].id));
    }

    return { pageId: existingPage[0].id, siteId };
  }

  const [page] = await db
    .insert(pages)
    .values({
      siteId,
      url: DEMO_SITE_URL,
      title: DEMO_PAGE_TITLE,
      primaryConversionEvent: "form_submit",
      baselineContent,
    })
    .returning({ id: pages.id });

  return { pageId: page.id, siteId };
}
