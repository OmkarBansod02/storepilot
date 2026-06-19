import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const DEMO_SITE_NAME = "StorePilot Demo";
const DEMO_SITE_URL = "http://localhost:3000/demo";
const DEMO_PAGE_TITLE = "Northstar Pack - Demo Product Page";
const PRIMARY_CONVERSION_EVENT = "purchase";
const DEMO_PRODUCT_ID = "northstar-pack";
const DEMO_CURRENCY = "USD";

interface DemoContent {
  brand: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  secondaryCta: string;
  socialProof: {
    metric: string;
    metricLabel: string;
    quotes: [
      { text: string },
      { text: string },
      ...Array<{ text: string }>,
    ];
  };
  formHeadline: string;
  formDescription: string;
}

interface DemoContentModule {
  demoContent: DemoContent;
}

interface DemoPageBaseline {
  brand: string;
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  trustProofRow: string[];
  formHeadline: string;
  formDescription: string;
}

type DemoPageBaselineJson = Record<string, postgres.JSONValue>;

interface DemoPage {
  pageId: string;
  siteId: string;
}

interface ResetCounts {
  conversions: number;
  events: number;
  sessions: number;
  experiments: number;
  variants: number;
}

interface SeedCounts {
  conversions: number;
  events: number;
  sessions: number;
  experiments: number;
  variants: number;
  revenueCents: number;
}

interface SeedSessionPlan {
  arm: "control" | "variant";
  anonymousId: string;
  addToCart: boolean;
  checkoutStart: boolean;
  purchaseRevenueCents: number | null;
  scrollDepth: 25 | 50 | 75 | 100;
}

type TransactionSql = postgres.TransactionSql;

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) {
    return;
  }

  const envFile = readFileSync(filePath, "utf8");

  for (const rawLine of envFile.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;

    if (process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = rawValue.trim().replace(/^(['"])(.*)\1$/, "$2");
  }
}

function loadLocalEnv(): void {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const projectRoot = join(scriptDir, "..");

  loadEnvFile(join(projectRoot, ".env.local"));
  loadEnvFile(join(projectRoot, ".env"));
}

function assertSafeEnvironment(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to reset demo data when NODE_ENV=production.");
  }
}

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to reset demo data.");
  }

  return databaseUrl;
}

async function getDefaultDemoPageBaseline(): Promise<DemoPageBaseline> {
  const modulePath = "../src/features/demo/lib/demo-content.ts";
  const { demoContent } = (await import(modulePath)) as DemoContentModule;

  return {
    brand: demoContent.brand,
    headline: demoContent.headline.replace(/\s+/g, " ").trim(),
    subheadline: demoContent.subheadline,
    primaryCtaLabel: demoContent.ctaLabel,
    secondaryCtaLabel: demoContent.secondaryCta,
    trustProofRow: [
      `${demoContent.socialProof.metric} ${demoContent.socialProof.metricLabel}`,
      demoContent.socialProof.quotes[0].text,
      demoContent.socialProof.quotes[1].text,
    ],
    formHeadline: demoContent.formHeadline,
    formDescription: demoContent.formDescription,
  };
}

function toBaselineJson(baselineContent: DemoPageBaseline): DemoPageBaselineJson {
  return {
    brand: baselineContent.brand,
    headline: baselineContent.headline,
    subheadline: baselineContent.subheadline,
    primaryCtaLabel: baselineContent.primaryCtaLabel,
    secondaryCtaLabel: baselineContent.secondaryCtaLabel,
    trustProofRow: baselineContent.trustProofRow,
    formHeadline: baselineContent.formHeadline,
    formDescription: baselineContent.formDescription,
  };
}

async function ensureDemoPage(
  tx: TransactionSql,
  baselineContent: DemoPageBaseline,
): Promise<DemoPage> {
  const baselineJson = toBaselineJson(baselineContent);

  const existingSites = await tx<{ id: string }[]>`
    select id
    from sites
    where name = ${DEMO_SITE_NAME}
    limit 1
  `;

  let siteId = existingSites[0]?.id;

  if (siteId) {
    await tx`
      update sites
      set url = ${DEMO_SITE_URL}, updated_at = now()
      where id = ${siteId}
    `;
  } else {
    const insertedSites = await tx<{ id: string }[]>`
      insert into sites (name, url)
      values (${DEMO_SITE_NAME}, ${DEMO_SITE_URL})
      returning id
    `;

    siteId = insertedSites[0].id;
  }

  const existingPages = await tx<{ id: string }[]>`
    select id
    from pages
    where site_id = ${siteId}
    limit 1
  `;

  let pageId = existingPages[0]?.id;

  if (pageId) {
    await tx`
      update pages
      set
        url = ${DEMO_SITE_URL},
        title = ${DEMO_PAGE_TITLE},
        primary_conversion_event = ${PRIMARY_CONVERSION_EVENT},
        baseline_content = ${tx.json(baselineJson)},
        updated_at = now()
      where id = ${pageId}
    `;
  } else {
    const insertedPages = await tx<{ id: string }[]>`
      insert into pages (
        site_id,
        url,
        title,
        primary_conversion_event,
        baseline_content
      )
      values (
        ${siteId},
        ${DEMO_SITE_URL},
        ${DEMO_PAGE_TITLE},
        ${PRIMARY_CONVERSION_EVENT},
        ${tx.json(baselineJson)}
      )
      returning id
    `;

    pageId = insertedPages[0].id;
  }

  return { pageId, siteId };
}

async function resetDemoState(
  tx: TransactionSql,
  pageId: string,
): Promise<ResetCounts> {
  const deletedConversions = await tx<{ id: string }[]>`
    delete from conversions
    where page_id = ${pageId}
    returning id
  `;

  const deletedEvents = await tx<{ id: string }[]>`
    delete from events
    where page_id = ${pageId}
    returning id
  `;

  const deletedSessions = await tx<{ id: string }[]>`
    delete from sessions
    where page_id = ${pageId}
    returning id
  `;

  const deletedExperiments = await tx<{ id: string }[]>`
    delete from experiments
    where page_id = ${pageId}
    returning id
  `;

  const deletedVariants = await tx<{ id: string }[]>`
    delete from variants
    where page_id = ${pageId}
    returning id
  `;

  return {
    conversions: deletedConversions.length,
    events: deletedEvents.length,
    sessions: deletedSessions.length,
    experiments: deletedExperiments.length,
    variants: deletedVariants.length,
  };
}

function buildSeededVariantContent(): Record<string, postgres.JSONValue> {
  return {
    headline: "Pack faster for every quick escape",
    subheadline:
      "Northstar Pack keeps daily carry, weekend gear, and travel essentials organized without overpacking.",
    primaryCtaLabel: "Add Northstar Pack",
    trustProofRow: [
      "Free 2-day shipping",
      "30-day easy returns",
      "4.8/5 from verified buyers",
    ],
    targetArea: "hero",
    expectedImpact:
      "Increase add-to-cart intent and purchase confidence on the product page.",
    sourceDiagnosis: {
      primaryBottleneck: "healthy_funnel",
      title: "Seeded ecommerce demo baseline",
      recommendedExperimentTitle: "Test a sharper product promise",
    },
    source: "deterministic_fallback",
  };
}

function buildSeedSessionPlans(): SeedSessionPlan[] {
  const controlRevenue = [8900, null, null, null, null, null, null, null, null, null, null, null];
  const variantRevenue = [8900, 10900, 12900, 8900, null, null, null, null, null, null, null, null];

  return [
    ...controlRevenue.map((revenue, index): SeedSessionPlan => ({
      arm: "control",
      anonymousId: `demo-control-${String(index + 1).padStart(2, "0")}`,
      addToCart: index < 4,
      checkoutStart: index < 2,
      purchaseRevenueCents: revenue,
      scrollDepth: index < 5 ? 75 : 50,
    })),
    ...variantRevenue.map((revenue, index): SeedSessionPlan => ({
      arm: "variant",
      anonymousId: `demo-variant-${String(index + 1).padStart(2, "0")}`,
      addToCart: index < 7,
      checkoutStart: index < 5,
      purchaseRevenueCents: revenue,
      scrollDepth: index < 8 ? 100 : 75,
    })),
  ];
}

async function insertSeedEvent(
  tx: TransactionSql,
  params: {
    sessionId: string;
    pageId: string;
    eventType:
      | "product_view"
      | "add_to_cart"
      | "checkout_start"
      | "purchase"
      | "scroll_depth";
    payload: Record<string, postgres.JSONValue>;
    variantId: string | null;
    revenueCents?: number;
    cartValueCents?: number;
    occurredAt: Date;
  },
): Promise<void> {
  await tx`
    insert into events (
      session_id,
      page_id,
      event_type,
      product_id,
      variant_id,
      revenue_cents,
      cart_value_cents,
      currency,
      payload,
      occurred_at
    )
    values (
      ${params.sessionId},
      ${params.pageId},
      ${params.eventType},
      ${params.eventType === "scroll_depth" ? null : DEMO_PRODUCT_ID},
      ${params.variantId},
      ${params.revenueCents ?? null},
      ${params.cartValueCents ?? null},
      ${params.eventType === "scroll_depth" ? null : DEMO_CURRENCY},
      ${tx.json(params.payload)},
      ${params.occurredAt}
    )
  `;
}

function buildEventPayload(params: {
  experimentId: string;
  arm: "control" | "variant";
  variantId: string | null;
  extra?: Record<string, postgres.JSONValue>;
}): Record<string, postgres.JSONValue> {
  return {
    product_id: DEMO_PRODUCT_ID,
    currency: DEMO_CURRENCY,
    experimentId: params.experimentId,
    variantArm: params.arm,
    ...(params.variantId ? { variant_id: params.variantId } : {}),
    ...(params.extra ?? {}),
  };
}

async function seedDemoEcommerceEvents(
  tx: TransactionSql,
  pageId: string,
): Promise<SeedCounts> {
  const variantContent = buildSeededVariantContent();
  const insertedVariants = await tx<{ id: string }[]>`
    insert into variants (page_id, status, content, rationale)
    values (
      ${pageId},
      'approved',
      ${tx.json(variantContent)},
      ${"Seeded demo variant for ecommerce funnel analytics."}
    )
    returning id
  `;
  const variantId = insertedVariants[0].id;

  const insertedExperiments = await tx<{ id: string }[]>`
    insert into experiments (
      page_id,
      variant_id,
      status,
      primary_conversion_event,
      started_at
    )
    values (
      ${pageId},
      ${variantId},
      'running',
      ${PRIMARY_CONVERSION_EVENT},
      now()
    )
    returning id
  `;
  const experimentId = insertedExperiments[0].id;
  const plans = buildSeedSessionPlans();

  let events = 0;
  let conversions = 0;
  let revenueCents = 0;

  for (const [index, plan] of plans.entries()) {
    const insertedSessions = await tx<{ id: string }[]>`
      insert into sessions (
        page_id,
        anonymous_id,
        experiment_id,
        experiment_arm,
        user_agent,
        referrer,
        first_seen_at,
        last_seen_at
      )
      values (
        ${pageId},
        ${plan.anonymousId},
        ${experimentId},
        ${plan.arm},
        ${"StorePilot demo seeder"},
        ${DEMO_SITE_URL},
        now() - (${plans.length - index} || ' minutes')::interval,
        now() - (${plans.length - index - 1} || ' minutes')::interval
      )
      returning id
    `;
    const sessionId = insertedSessions[0].id;
    const eventVariantId = plan.arm === "variant" ? variantId : null;
    const occurredAt = new Date(Date.now() - (plans.length - index) * 60_000);

    await insertSeedEvent(tx, {
      sessionId,
      pageId,
      eventType: "product_view",
      payload: buildEventPayload({
        experimentId,
        arm: plan.arm,
        variantId: eventVariantId,
      }),
      variantId: eventVariantId,
      occurredAt,
    });
    events += 1;

    await insertSeedEvent(tx, {
      sessionId,
      pageId,
      eventType: "scroll_depth",
      payload: { depth: plan.scrollDepth },
      variantId: null,
      occurredAt,
    });
    events += 1;

    if (plan.addToCart) {
      await insertSeedEvent(tx, {
        sessionId,
        pageId,
        eventType: "add_to_cart",
        payload: buildEventPayload({
          experimentId,
          arm: plan.arm,
          variantId: eventVariantId,
          extra: { cart_value_cents: 8900 },
        }),
        variantId: eventVariantId,
        cartValueCents: 8900,
        occurredAt,
      });
      events += 1;
    }

    if (plan.checkoutStart) {
      await insertSeedEvent(tx, {
        sessionId,
        pageId,
        eventType: "checkout_start",
        payload: buildEventPayload({
          experimentId,
          arm: plan.arm,
          variantId: eventVariantId,
          extra: { cart_value_cents: plan.purchaseRevenueCents ?? 8900 },
        }),
        variantId: eventVariantId,
        cartValueCents: plan.purchaseRevenueCents ?? 8900,
        occurredAt,
      });
      events += 1;
    }

    if (plan.purchaseRevenueCents !== null) {
      await insertSeedEvent(tx, {
        sessionId,
        pageId,
        eventType: "purchase",
        payload: buildEventPayload({
          experimentId,
          arm: plan.arm,
          variantId: eventVariantId,
          extra: { revenue_cents: plan.purchaseRevenueCents },
        }),
        variantId: eventVariantId,
        revenueCents: plan.purchaseRevenueCents,
        occurredAt,
      });
      events += 1;
      revenueCents += plan.purchaseRevenueCents;

      await tx`
        insert into conversions (
          experiment_id,
          session_id,
          page_id,
          arm,
          event_name,
          occurred_at
        )
        values (
          ${experimentId},
          ${sessionId},
          ${pageId},
          ${plan.arm},
          ${PRIMARY_CONVERSION_EVENT},
          ${occurredAt}
        )
      `;
      conversions += 1;
    }
  }

  return {
    conversions,
    events,
    sessions: plans.length,
    experiments: 1,
    variants: 1,
    revenueCents,
  };
}

function printResult(
  demoPage: DemoPage,
  counts: ResetCounts,
  seedCounts: SeedCounts,
): void {
  console.log("Demo reset complete.");
  console.log(`Site: ${demoPage.siteId}`);
  console.log(`Page: ${demoPage.pageId}`);
  console.log("Deleted rows:");
  console.log(`- conversions: ${counts.conversions}`);
  console.log(`- events: ${counts.events}`);
  console.log(`- sessions: ${counts.sessions}`);
  console.log(`- experiments: ${counts.experiments}`);
  console.log(`- variants: ${counts.variants}`);
  console.log("Demo baseline_content restored to the default baseline.");
  console.log("Seeded ecommerce demo rows:");
  console.log(`- sessions: ${seedCounts.sessions}`);
  console.log(`- events: ${seedCounts.events}`);
  console.log(`- conversions: ${seedCounts.conversions}`);
  console.log(`- experiments: ${seedCounts.experiments}`);
  console.log(`- variants: ${seedCounts.variants}`);
  console.log(`- revenue_cents: ${seedCounts.revenueCents}`);
}

async function main(): Promise<void> {
  loadLocalEnv();
  assertSafeEnvironment();

  const sql = postgres(getDatabaseUrl(), {
    max: 1,
    prepare: false,
  });

  try {
    const baselineContent = await getDefaultDemoPageBaseline();
    const result = await sql.begin(async (tx) => {
      const demoPage = await ensureDemoPage(tx, baselineContent);
      const counts = await resetDemoState(tx, demoPage.pageId);
      const seedCounts = await seedDemoEcommerceEvents(tx, demoPage.pageId);

      return { demoPage, counts, seedCounts };
    });

    printResult(result.demoPage, result.counts, result.seedCounts);
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown reset error.";
  console.error(`Demo reset failed: ${message}`);
  process.exitCode = 1;
});
