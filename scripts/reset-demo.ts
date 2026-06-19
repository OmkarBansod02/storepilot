import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const DEMO_SITE_NAME = "StorePilot Demo";
const DEMO_SITE_URL = "http://localhost:3000/demo";
const DEMO_PAGE_TITLE = "Northstar Pack - Demo Product Page";
const PRIMARY_CONVERSION_EVENT = "form_submit";

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

function printResult(demoPage: DemoPage, counts: ResetCounts): void {
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

      return { demoPage, counts };
    });

    printResult(result.demoPage, result.counts);
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown reset error.";
  console.error(`Demo reset failed: ${message}`);
  process.exitCode = 1;
});
