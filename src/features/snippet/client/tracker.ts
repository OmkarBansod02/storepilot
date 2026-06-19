import type {
  SnippetEventPayloadByType,
  SnippetEventType,
} from "@/features/analytics/schemas/event-input";
import type { ExperimentAssignment } from "@/features/experiments/types";

export interface TrackEventParams<EventType extends SnippetEventType> {
  pageId: string;
  sessionId: string;
  eventType: EventType;
  payload?: SnippetEventPayloadByType[EventType];
  experimentContext?: ExperimentAssignment | null;
}

export async function trackEvent<EventType extends SnippetEventType>({
  pageId,
  sessionId,
  eventType,
  payload,
  experimentContext,
}: TrackEventParams<EventType>): Promise<boolean> {
  try {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageId,
        sessionId,
        eventType,
        payload: payload ?? {},
        experimentId: experimentContext?.experimentId,
        variantArm: experimentContext?.variantArm,
        occurredAt: new Date().toISOString(),
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

interface InitSessionParams {
  pageId: string;
  anonymousId: string;
  experimentContext?: ExperimentAssignment | null;
}

const pendingSessions = new Map<string, Promise<string | null>>();

export async function initSession({
  pageId,
  anonymousId,
  experimentContext,
}: InitSessionParams): Promise<string | null> {
  const experimentKey = experimentContext
    ? `${experimentContext.experimentId}:${experimentContext.variantArm}`
    : "no-experiment";
  const requestKey = `${pageId}:${anonymousId}:${experimentKey}`;
  const pendingSession = pendingSessions.get(requestKey);

  if (pendingSession) {
    return pendingSession;
  }

  const request = createSession({
    pageId,
    anonymousId,
    experimentContext,
  }).finally(() => {
    pendingSessions.delete(requestKey);
  });

  pendingSessions.set(requestKey, request);

  return request;
}

async function createSession({
  pageId,
  anonymousId,
  experimentContext,
}: InitSessionParams): Promise<string | null> {
  try {
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageId,
        anonymousId,
        experimentId: experimentContext?.experimentId,
        variantArm: experimentContext?.variantArm,
        userAgent: navigator.userAgent,
        referrer: document.referrer || undefined,
      }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { sessionId: string };
    return data.sessionId;
  } catch {
    return null;
  }
}
