import { db } from "@/lib/db";
import { sessions, events } from "@/lib/db/schema";
import { and, eq, count, countDistinct } from "drizzle-orm";
import { diagnoseDashboardMetrics } from "@/features/analytics/lib/diagnose-dashboard-metrics";
import type {
  DashboardMetrics,
  DiagnosisMetricInput,
  ScrollDepthSummary,
} from "@/features/analytics/types";

type ScrollDepth = 25 | 50 | 75 | 100;

interface ScrollDepthEventRow {
  sessionId: string;
  payload: Record<string, unknown>;
}

function calculateRate(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.min(numerator / denominator, 1);
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

export async function getDashboardMetrics(
  pageId: string,
): Promise<DashboardMetrics> {
  const [sessionCounts, eventCounts, uniqueSessionCounts, scrollRows] =
    await Promise.all([
      db
        .select({ total: count() })
        .from(sessions)
        .where(eq(sessions.pageId, pageId)),
      db
        .select({
          eventType: events.eventType,
          total: count(),
        })
        .from(events)
        .where(eq(events.pageId, pageId))
        .groupBy(events.eventType),
      db
        .select({
          eventType: events.eventType,
          total: countDistinct(events.sessionId),
        })
        .from(events)
        .where(eq(events.pageId, pageId))
        .groupBy(events.eventType),
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

  const totalSessions = sessionCounts[0]?.total ?? 0;

  const countByType = new Map(
    eventCounts.map((row) => [row.eventType, row.total]),
  );
  const uniqueSessionsByType = new Map(
    uniqueSessionCounts.map((row) => [row.eventType, row.total]),
  );

  const totalPageViews = countByType.get("page_view") ?? 0;
  const ctaClicks = countByType.get("cta_click") ?? 0;
  const formStarts = countByType.get("form_start") ?? 0;
  const formSubmits = countByType.get("form_submit") ?? 0;
  const sessionsWithCtaClick = uniqueSessionsByType.get("cta_click") ?? 0;
  const sessionsWithFormStart = uniqueSessionsByType.get("form_start") ?? 0;
  const sessionsWithFormSubmit = uniqueSessionsByType.get("form_submit") ?? 0;

  const metrics: DiagnosisMetricInput = {
    totalSessions,
    totalPageViews,
    ctaClicks,
    formStarts,
    formSubmits,
    ctaClickThroughRate: calculateRate(sessionsWithCtaClick, totalSessions),
    formStartRate: calculateRate(sessionsWithFormStart, totalSessions),
    formSubmitRate: calculateRate(sessionsWithFormSubmit, totalSessions),
    scrollDepth: calculateScrollDepthSummary(totalSessions, scrollRows),
  };

  return {
    ...metrics,
    diagnosis: diagnoseDashboardMetrics(metrics),
  };
}
