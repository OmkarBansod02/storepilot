import { db } from "@/lib/db";
import { events, experiments, sessions } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { diagnoseDashboardMetrics } from "@/features/analytics/lib/diagnose-dashboard-metrics";
import type { SnippetEventType } from "@/features/analytics/schemas/event-input";
import type {
  DashboardMetrics,
  DiagnosisMetricInput,
  ScrollDepthSummary,
  VariantFunnelMetrics,
} from "@/features/analytics/types";
import type { ExperimentArm } from "@/features/experiments/types";

type ScrollDepth = 25 | 50 | 75 | 100;
type FunnelArm = ExperimentArm | "unassigned";

interface ScrollDepthEventRow {
  sessionId: string;
  payload: Record<string, unknown>;
}

interface SessionMetricRow {
  id: string;
  experimentId: string | null;
  experimentArm: ExperimentArm | null;
  experimentVariantId: string | null;
}

interface FunnelAccumulator {
  experimentId: string | null;
  variantId: string | null;
  arm: FunnelArm;
  sessionIds: Set<string>;
  productViewSessions: Set<string>;
  addToCartSessions: Set<string>;
  checkoutStartSessions: Set<string>;
  purchaseSessions: Set<string>;
  productViews: number;
  addToCarts: number;
  checkoutStarts: number;
  purchases: number;
  totalRevenueCents: number;
}

const FUNNEL_EVENT_TYPES: ReadonlySet<SnippetEventType> = new Set([
  "product_view",
  "add_to_cart",
  "checkout_start",
  "purchase",
] satisfies SnippetEventType[]);

function calculateRate(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.min(numerator / denominator, 1);
}

function calculateAverage(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

function readScrollDepth(payload: Record<string, unknown>): ScrollDepth | null {
  const depth = payload.depth;

  if (depth === 25 || depth === 50 || depth === 75 || depth === 100) {
    return depth;
  }

  return null;
}

function calculateScrollDepthSummary(
  totalSessions: number,
  scrollRows: ScrollDepthEventRow[],
): ScrollDepthSummary {
  const deepestDepthBySession = new Map<string, ScrollDepth>();
  let totalScrollEvents = 0;

  for (const row of scrollRows) {
    const depth = readScrollDepth(row.payload);
    if (depth === null) continue;

    totalScrollEvents += 1;

    const currentDepth = deepestDepthBySession.get(row.sessionId) ?? 0;
    if (depth > currentDepth) {
      deepestDepthBySession.set(row.sessionId, depth);
    }
  }

  const deepestDepths = Array.from(deepestDepthBySession.values());
  const totalDepth = deepestDepths.reduce((sum, depth) => sum + depth, 0);

  return {
    totalScrollEvents,
    sessionsWithScrollDepth: deepestDepthBySession.size,
    averageMaxScrollDepth:
      totalSessions === 0 ? 0 : totalDepth / totalSessions,
    highestScrollDepth: Math.max(...deepestDepths, 0),
  };
}

function readPayloadRevenueCents(payload: Record<string, unknown>): number {
  const revenueCents = payload.revenue_cents;
  if (typeof revenueCents === "number" && Number.isFinite(revenueCents)) {
    return Math.max(Math.round(revenueCents), 0);
  }

  const revenue = payload.revenue;
  if (typeof revenue === "number" && Number.isFinite(revenue)) {
    return Math.max(Math.round(revenue * 100), 0);
  }

  return 0;
}

function getSessionGroupKey(row: SessionMetricRow): string {
  const arm = row.experimentArm ?? "unassigned";
  return `${row.experimentId ?? "none"}:${row.experimentVariantId ?? "none"}:${arm}`;
}

function createFunnelAccumulator(row: SessionMetricRow): FunnelAccumulator {
  return {
    experimentId: row.experimentId,
    variantId: row.experimentArm === "variant" ? row.experimentVariantId : null,
    arm: row.experimentArm ?? "unassigned",
    sessionIds: new Set([row.id]),
    productViewSessions: new Set(),
    addToCartSessions: new Set(),
    checkoutStartSessions: new Set(),
    purchaseSessions: new Set(),
    productViews: 0,
    addToCarts: 0,
    checkoutStarts: 0,
    purchases: 0,
    totalRevenueCents: 0,
  };
}

function toVariantFunnelMetrics(
  accumulator: FunnelAccumulator,
): VariantFunnelMetrics {
  const sessionsCount = accumulator.sessionIds.size;

  return {
    experimentId: accumulator.experimentId,
    variantId: accumulator.variantId,
    arm: accumulator.arm,
    sessions: sessionsCount,
    productViews: accumulator.productViews,
    addToCarts: accumulator.addToCarts,
    checkoutStarts: accumulator.checkoutStarts,
    purchases: accumulator.purchases,
    addToCartRate: calculateRate(
      accumulator.addToCartSessions.size,
      sessionsCount,
    ),
    checkoutStartRate: calculateRate(
      accumulator.checkoutStartSessions.size,
      sessionsCount,
    ),
    purchaseConversionRate: calculateRate(
      accumulator.purchaseSessions.size,
      sessionsCount,
    ),
    totalRevenueCents: accumulator.totalRevenueCents,
    averageOrderValueCents: calculateAverage(
      accumulator.totalRevenueCents,
      accumulator.purchases,
    ),
    revenuePerVisitorCents: calculateAverage(
      accumulator.totalRevenueCents,
      sessionsCount,
    ),
  };
}

function sortVariantFunnelMetrics(
  a: VariantFunnelMetrics,
  b: VariantFunnelMetrics,
): number {
  const armOrder: Record<FunnelArm, number> = {
    control: 0,
    variant: 1,
    unassigned: 2,
  };

  return armOrder[a.arm] - armOrder[b.arm];
}

function getSessionSet(
  sessionSetsByType: Map<SnippetEventType, Set<string>>,
  eventType: SnippetEventType,
): Set<string> {
  const existing = sessionSetsByType.get(eventType);
  if (existing) return existing;

  const created = new Set<string>();
  sessionSetsByType.set(eventType, created);
  return created;
}

function countUnion(...sets: Set<string>[]): number {
  const union = new Set<string>();

  for (const set of sets) {
    for (const value of set) {
      union.add(value);
    }
  }

  return union.size;
}

export async function getDashboardMetrics(
  pageId: string,
): Promise<DashboardMetrics> {
  const [sessionRows, eventRows, scrollRows] = await Promise.all([
    db
      .select({
        id: sessions.id,
        experimentId: sessions.experimentId,
        experimentArm: sessions.experimentArm,
        experimentVariantId: experiments.variantId,
      })
      .from(sessions)
      .leftJoin(experiments, eq(sessions.experimentId, experiments.id))
      .where(eq(sessions.pageId, pageId)),
    db
      .select({
        sessionId: events.sessionId,
        eventType: events.eventType,
        payload: events.payload,
        revenueCents: events.revenueCents,
      })
      .from(events)
      .where(eq(events.pageId, pageId)),
    db
      .select({
        sessionId: events.sessionId,
        payload: events.payload,
      })
      .from(events)
      .where(
        and(eq(events.pageId, pageId), eq(events.eventType, "scroll_depth")),
      ),
  ]);

  const totalSessions = sessionRows.length;
  const totalVisitors = totalSessions;
  const countByType = new Map<SnippetEventType, number>();
  const sessionSetsByType = new Map<SnippetEventType, Set<string>>();
  const sessionGroupById = new Map<string, string>();
  const groups = new Map<string, FunnelAccumulator>();

  for (const row of sessionRows) {
    const key = getSessionGroupKey(row);
    sessionGroupById.set(row.id, key);

    const existing = groups.get(key);
    if (existing) {
      existing.sessionIds.add(row.id);
    } else {
      groups.set(key, createFunnelAccumulator(row));
    }
  }

  for (const row of eventRows) {
    countByType.set(row.eventType, (countByType.get(row.eventType) ?? 0) + 1);
    getSessionSet(sessionSetsByType, row.eventType).add(row.sessionId);

    if (!FUNNEL_EVENT_TYPES.has(row.eventType)) {
      continue;
    }

    const groupKey = sessionGroupById.get(row.sessionId);
    if (!groupKey) continue;

    const group = groups.get(groupKey);
    if (!group) continue;

    if (row.eventType === "product_view") {
      group.productViews += 1;
      group.productViewSessions.add(row.sessionId);
    }

    if (row.eventType === "add_to_cart") {
      group.addToCarts += 1;
      group.addToCartSessions.add(row.sessionId);
    }

    if (row.eventType === "checkout_start") {
      group.checkoutStarts += 1;
      group.checkoutStartSessions.add(row.sessionId);
    }

    if (row.eventType === "purchase") {
      group.purchases += 1;
      group.purchaseSessions.add(row.sessionId);
      group.totalRevenueCents +=
        row.revenueCents ?? readPayloadRevenueCents(row.payload);
    }
  }

  const productViews = countByType.get("product_view") ?? 0;
  const addToCarts = countByType.get("add_to_cart") ?? 0;
  const checkoutStarts = countByType.get("checkout_start") ?? 0;
  const purchases = countByType.get("purchase") ?? 0;
  const pageViewEvents = countByType.get("page_view") ?? 0;
  const legacyCtaClicks = countByType.get("cta_click") ?? 0;
  const legacyFormStarts = countByType.get("form_start") ?? 0;
  const legacyFormSubmits = countByType.get("form_submit") ?? 0;

  const addToCartSessions = getSessionSet(sessionSetsByType, "add_to_cart");
  const checkoutStartSessions = getSessionSet(
    sessionSetsByType,
    "checkout_start",
  );
  const purchaseSessions = getSessionSet(sessionSetsByType, "purchase");
  const ctaClickSessions = getSessionSet(sessionSetsByType, "cta_click");
  const formStartSessions = getSessionSet(sessionSetsByType, "form_start");
  const formSubmitSessions = getSessionSet(sessionSetsByType, "form_submit");

  const totalRevenueCents = Array.from(groups.values()).reduce(
    (sum, group) => sum + group.totalRevenueCents,
    0,
  );

  const metrics: DiagnosisMetricInput = {
    totalSessions,
    totalVisitors,
    productViews,
    addToCarts,
    checkoutStarts,
    purchases,
    addToCartRate: calculateRate(addToCartSessions.size, totalSessions),
    checkoutStartRate: calculateRate(checkoutStartSessions.size, totalSessions),
    purchaseConversionRate: calculateRate(purchaseSessions.size, totalSessions),
    totalRevenueCents,
    averageOrderValueCents: calculateAverage(totalRevenueCents, purchases),
    revenuePerVisitorCents: calculateAverage(totalRevenueCents, totalVisitors),
    totalPageViews: pageViewEvents + productViews,
    ctaClicks: legacyCtaClicks + addToCarts,
    formStarts: legacyFormStarts + checkoutStarts,
    formSubmits: legacyFormSubmits + purchases,
    ctaClickThroughRate: calculateRate(
      countUnion(ctaClickSessions, addToCartSessions),
      totalSessions,
    ),
    formStartRate: calculateRate(
      countUnion(formStartSessions, checkoutStartSessions),
      totalSessions,
    ),
    formSubmitRate: calculateRate(
      countUnion(formSubmitSessions, purchaseSessions),
      totalSessions,
    ),
    scrollDepth: calculateScrollDepthSummary(totalSessions, scrollRows),
  };

  return {
    ...metrics,
    perVariantFunnel: Array.from(groups.values())
      .map(toVariantFunnelMetrics)
      .sort(sortVariantFunnelMetrics),
    diagnosis: diagnoseDashboardMetrics(metrics),
  };
}
