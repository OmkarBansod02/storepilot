import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const auditStatusEnum = pgEnum("audit_status", [
  "queued",
  "processing",
  "completed",
  "failed",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "page_view",
  "scroll_depth",
  "cta_click",
  "form_start",
  "form_submit",
  "product_view",
  "add_to_cart",
  "checkout_start",
  "purchase",
]);

export const variantStatusEnum = pgEnum("variant_status", [
  "draft",
  "pending_approval",
  "approved",
  "rejected",
  "deployed",
]);

export const experimentStatusEnum = pgEnum("experiment_status", [
  "draft",
  "running",
  "paused",
  "completed",
]);

export const experimentArmEnum = pgEnum("experiment_arm", [
  "control",
  "variant",
]);

export type JsonObject = Record<string, unknown>;

export interface AuditFinding {
  severity: "high" | "medium" | "low";
  category: string;
  description: string;
}

export interface VariantContent {
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  trustProofRow: string[];
  targetArea:
    | "hero_positioning"
    | "add_to_cart_cta"
    | "checkout_reassurance"
    | "shipping_returns_trust"
    | "offer_banner";
  expectedImpact: string;
  sourceDiagnosis: {
    primaryBottleneck:
      | "insufficient_data"
      | "low_cta_engagement"
      | "weak_above_the_fold_interest"
      | "form_friction"
      | "good_interest_weak_conversion"
      | "healthy_funnel";
    title: string;
    recommendedExperimentTitle: string;
  };
  source: "ai" | "deterministic_fallback";
}

export interface PageBaselineContent {
  brand: string;
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  trustProofRow: string[];
  formHeadline: string;
  formDescription: string;
}

const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sites = pgTable("sites", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  ...timestamps(),
});

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    title: text("title"),
    primaryConversionEvent: text("primary_conversion_event")
      .default("purchase")
      .notNull(),
    baselineContent: jsonb("baseline_content").$type<PageBaselineContent | null>(),
    ...timestamps(),
  },
  (table) => [index("pages_site_id_idx").on(table.siteId)],
);

export const audits = pgTable(
  "audits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    status: auditStatusEnum("status").default("queued").notNull(),
    screenshotUrl: text("screenshot_url"),
    extractedSignals: jsonb("extracted_signals")
      .$type<JsonObject>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    findings: jsonb("findings")
      .$type<AuditFinding[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    recommendedExperiment: text("recommended_experiment"),
    ...timestamps(),
  },
  (table) => [index("audits_page_id_idx").on(table.pageId)],
);

export const variants = pgTable(
  "variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    auditId: uuid("audit_id").references(() => audits.id, {
      onDelete: "set null",
    }),
    status: variantStatusEnum("status").default("pending_approval").notNull(),
    content: jsonb("content").$type<VariantContent>().notNull(),
    rationale: text("rationale").notNull(),
    ...timestamps(),
  },
  (table) => [
    index("variants_page_id_idx").on(table.pageId),
    index("variants_audit_id_idx").on(table.auditId),
  ],
);

export const experiments = pgTable(
  "experiments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "restrict" }),
    status: experimentStatusEnum("status").default("draft").notNull(),
    primaryConversionEvent: text("primary_conversion_event")
      .default("purchase")
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("experiments_page_id_idx").on(table.pageId),
    index("experiments_variant_id_idx").on(table.variantId),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    anonymousId: text("anonymous_id").notNull(),
    experimentId: uuid("experiment_id").references(() => experiments.id, {
      onDelete: "set null",
    }),
    experimentArm: experimentArmEnum("experiment_arm"),
    userAgent: text("user_agent"),
    referrer: text("referrer"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("sessions_page_id_idx").on(table.pageId),
    index("sessions_anonymous_id_idx").on(table.anonymousId),
  ],
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    eventType: eventTypeEnum("event_type").notNull(),
    productId: text("product_id"),
    variantId: uuid("variant_id").references(() => variants.id, {
      onDelete: "set null",
    }),
    revenueCents: integer("revenue_cents"),
    cartValueCents: integer("cart_value_cents"),
    currency: text("currency"),
    payload: jsonb("payload")
      .$type<JsonObject>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("events_session_id_idx").on(table.sessionId),
    index("events_page_id_idx").on(table.pageId),
    index("events_event_type_idx").on(table.eventType),
    index("events_product_id_idx").on(table.productId),
    index("events_variant_id_idx").on(table.variantId),
  ],
);

export const conversions = pgTable(
  "conversions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    experimentId: uuid("experiment_id")
      .notNull()
      .references(() => experiments.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    arm: experimentArmEnum("arm").notNull(),
    eventName: text("event_name").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("conversions_experiment_id_idx").on(table.experimentId),
    index("conversions_session_id_idx").on(table.sessionId),
    index("conversions_page_id_idx").on(table.pageId),
  ],
);

export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type Audit = typeof audits.$inferSelect;
export type NewAudit = typeof audits.$inferInsert;
export type Variant = typeof variants.$inferSelect;
export type NewVariant = typeof variants.$inferInsert;
export type Experiment = typeof experiments.$inferSelect;
export type NewExperiment = typeof experiments.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Conversion = typeof conversions.$inferSelect;
export type NewConversion = typeof conversions.$inferInsert;
