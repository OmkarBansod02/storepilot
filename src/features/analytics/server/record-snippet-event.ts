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
      experimentVariantId: experiments.variantId,
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
      ? ({
          experimentId: session.experimentId,
          variantArm: session.experimentArm,
          ...(session.experimentArm === "variant" && session.experimentVariantId
            ? { variant_id: session.experimentVariantId }
            : {}),
        } satisfies JsonObject)
      : input.experimentId && input.variantArm
        ? ({
            experimentId: input.experimentId,
            variantArm: input.variantArm,
            ...(input.variantArm === "variant" && input.variantId
              ? { variant_id: input.variantId }
              : {}),
          } satisfies JsonObject)
        : {};
  const occurredAt = input.occurredAt ? new Date(input.occurredAt) : new Date();
  const revenueCents = readRevenueCents(input);
  const cartValueCents = readCartValueCents(input);
  const variantId =
    session.experimentArm === "variant"
      ? session.experimentVariantId
      : session.experimentArm === "control"
        ? null
        : readPayloadVariantId(input) ?? input.variantId ?? null;

  const [inserted] = await db
    .insert(events)
    .values({
      sessionId: input.sessionId,
      pageId: input.pageId,
      eventType: input.eventType,
      productId: readProductId(input),
      variantId,
      revenueCents,
      cartValueCents,
      currency: readCurrency(input),
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

function readProductId(input: RecordEventInput): string | null {
  switch (input.eventType) {
    case "product_view":
    case "add_to_cart":
    case "checkout_start":
    case "purchase":
      return input.payload.product_id ?? null;
    default:
      return null;
  }
}

function readPayloadVariantId(input: RecordEventInput): string | null {
  switch (input.eventType) {
    case "product_view":
    case "add_to_cart":
    case "checkout_start":
    case "purchase":
      return input.payload.variant_id ?? null;
    default:
      return null;
  }
}

function readCartValueCents(input: RecordEventInput): number | null {
  switch (input.eventType) {
    case "add_to_cart":
    case "checkout_start":
      return input.payload.cart_value_cents ?? null;
    default:
      return null;
  }
}

function readRevenueCents(input: RecordEventInput): number | null {
  if (input.eventType !== "purchase") return null;

  if (input.payload.revenue_cents !== undefined) {
    return input.payload.revenue_cents;
  }

  if (input.payload.revenue !== undefined) {
    return Math.round(input.payload.revenue * 100);
  }

  return null;
}

function readCurrency(input: RecordEventInput): string | null {
  switch (input.eventType) {
    case "add_to_cart":
    case "checkout_start":
    case "purchase":
      return input.payload.currency;
    default:
      return null;
  }
}
