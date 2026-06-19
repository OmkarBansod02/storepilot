import { and, eq } from "drizzle-orm";
import type { SnippetEventType } from "@/features/analytics/schemas/event-input";
import type { RecordEventInput } from "@/features/analytics/schemas/event-input";
import { db } from "@/lib/db";
import {
  conversions,
  events,
  experiments,
  sessions,
  type JsonObject,
} from "@/lib/db/schema";

export type RecordSnippetEventResult =
  | {
      accepted: true;
      eventId: string;
      eventType: SnippetEventType;
    }
  | {
      accepted: false;
      reason: "session_not_found";
    };

export async function recordSnippetEvent(
  input: RecordEventInput,
): Promise<RecordSnippetEventResult> {
  const [session] = await db
    .select({
      id: sessions.id,
      experimentId: sessions.experimentId,
      experimentArm: sessions.experimentArm,
      experimentStatus: experiments.status,
      primaryConversionEvent: experiments.primaryConversionEvent,
    })
    .from(sessions)
    .leftJoin(experiments, eq(sessions.experimentId, experiments.id))
    .where(
      and(eq(sessions.id, input.sessionId), eq(sessions.pageId, input.pageId)),
    )
    .limit(1);

  if (!session) {
    return { accepted: false, reason: "session_not_found" };
  }

  await db
    .update(sessions)
    .set({ lastSeenAt: new Date() })
    .where(eq(sessions.id, session.id));

  const eventContext =
    session.experimentId && session.experimentArm
      ? {
          experimentId: session.experimentId,
          variantArm: session.experimentArm,
        }
      : input.experimentId && input.variantArm
        ? {
            experimentId: input.experimentId,
            variantArm: input.variantArm,
          }
        : {};
  const occurredAt = input.occurredAt ? new Date(input.occurredAt) : new Date();

  const [inserted] = await db
    .insert(events)
    .values({
      sessionId: input.sessionId,
      pageId: input.pageId,
      eventType: input.eventType,
      payload: { ...input.payload, ...eventContext } satisfies JsonObject,
      occurredAt,
    })
    .returning({ id: events.id });

  if (
    session.experimentId &&
    session.experimentArm &&
    session.experimentStatus === "running" &&
    input.eventType === session.primaryConversionEvent
  ) {
    await db.insert(conversions).values({
      experimentId: session.experimentId,
      sessionId: session.id,
      pageId: input.pageId,
      arm: session.experimentArm,
      eventName: input.eventType,
      occurredAt,
    });
  }

  return {
    accepted: true,
    eventId: inserted.id,
    eventType: input.eventType,
  };
}
