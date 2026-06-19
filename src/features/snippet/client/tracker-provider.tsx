"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { trackEvent, initSession } from "./tracker";
import type {
  SnippetEventPayloadByType,
  SnippetEventType,
} from "@/features/analytics/schemas/event-input";
import type {
  ExperimentArm,
  ExperimentAssignment,
} from "@/features/experiments/types";
import { getOrCreateAnonymousId } from "@/features/snippet/client/anonymous-id";

type TrackArgs<EventType extends SnippetEventType> =
  Record<string, never> extends SnippetEventPayloadByType[EventType]
    ? [payload?: SnippetEventPayloadByType[EventType]]
    : [payload: SnippetEventPayloadByType[EventType]];

type TrackSnippetEvent = <EventType extends SnippetEventType>(
  eventType: EventType,
  ...args: TrackArgs<EventType>
) => void;

interface TrackerContextValue {
  pageId: string;
  sessionId: string | null;
  ready: boolean;
  experimentId: string | null;
  variantArm: ExperimentArm | null;
  track: TrackSnippetEvent;
}

const TrackerContext = createContext<TrackerContextValue | null>(null);

interface TrackerProviderProps {
  pageId: string;
  experimentContext?: ExperimentAssignment | null;
  anonymousId?: string;
  children: ReactNode;
}

export function TrackerProvider({
  pageId,
  experimentContext,
  anonymousId,
  children,
}: TrackerProviderProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const ready = sessionId !== null;
  const experimentId = experimentContext?.experimentId ?? null;
  const variantArm = experimentContext?.variantArm ?? null;

  useEffect(() => {
    const anonId = anonymousId ?? getOrCreateAnonymousId();
    if (!anonId) return;

    let active = true;

    initSession({
      pageId,
      anonymousId: anonId,
      experimentContext: experimentContext ?? null,
    }).then((id) => {
      if (active && id) setSessionId(id);
    });

    return () => {
      active = false;
    };
  }, [anonymousId, experimentContext, pageId]);

  const track = useCallback<TrackSnippetEvent>(
    (eventType, ...args) => {
      if (!sessionId) return;
      const payload = args[0];
      trackEvent({
        pageId,
        sessionId,
        eventType,
        payload,
        experimentContext: experimentContext ?? null,
      });
    },
    [experimentContext, pageId, sessionId],
  );

  return (
    <TrackerContext.Provider
      value={{
        pageId,
        sessionId,
        ready,
        experimentId,
        variantArm,
        track,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker(): TrackerContextValue {
  const ctx = useContext(TrackerContext);
  if (!ctx) {
    throw new Error("useTracker must be used within a TrackerProvider");
  }
  return ctx;
}
