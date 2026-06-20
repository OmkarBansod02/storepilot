import { db } from "@/lib/db";
import {
  conversions,
  events,
  sessions,
  type JsonObject,
  type NewConversion,
  type NewEvent,
  type NewSession,
} from "@/lib/db/schema";
import type { SimulateTrafficInput } from "@/features/demo/schemas/simulate-traffic-input";
import { ensureDemoPage } from "@/features/demo/server/ensure-demo-page";
import { getRunningExperimentForPage } from "@/features/experiments/server/get-running-experiment";
import type { ExperimentArm } from "@/features/experiments/types";
import {
  DEMO_CURRENCY,
  DEMO_PRODUCT_ID,
  DEMO_PRODUCT_PRICE_MINOR,
} from "@/features/demo/lib/demo-product";

const MAX_VISITORS = 5_000;
const INSERT_BATCH_SIZE = 500;
const TRAFFIC_WINDOW_MS = 14 * 24 * 60 * 60 * 1_000;
const SIMULATION_SEED = 0x5354_4f52;

type FunnelEventType =
  | "product_view"
  | "add_to_cart"
  | "checkout_start"
  | "purchase";

interface FunnelRates {
  addToCart: number;
  checkoutStart: number;
  purchase: number;
}

type RandomSource = () => number;

interface ArmSummary {
  visitors: number;
  addToCarts: number;
  checkoutStarts: number;
  purchases: number;
}

export interface SimulateDemoTrafficResult {
  visitors: number;
  events: number;
  purchases: number;
  experimentId: string | null;
  arms: {
    control: ArmSummary;
    variant: ArmSummary;
  };
}

function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function randomRate(
  min: number,
  max: number,
  random: RandomSource,
): number {
  return min + random() * (max - min);
}

function createFunnelRates(
  random: RandomSource,
): Record<ExperimentArm, FunnelRates> {
  return {
    control: {
      addToCart: randomRate(0.13, 0.17, random),
      checkoutStart: randomRate(0.065, 0.09, random),
      purchase: randomRate(0.02, 0.026, random),
    },
    variant: {
      addToCart: randomRate(0.18, 0.23, random),
      checkoutStart: randomRate(0.11, 0.15, random),
      purchase: randomRate(0.065, 0.075, random),
    },
  };
}

function emptyArmSummary(): ArmSummary {
  return {
    visitors: 0,
    addToCarts: 0,
    checkoutStarts: 0,
    purchases: 0,
  };
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1_000);
}

async function insertInBatches<T>(
  rows: T[],
  insert: (batch: T[]) => Promise<unknown>,
): Promise<void> {
  for (let index = 0; index < rows.length; index += INSERT_BATCH_SIZE) {
    await insert(rows.slice(index, index + INSERT_BATCH_SIZE));
  }
}

function createEvent(
  eventType: FunnelEventType,
  sessionId: string,
  pageId: string,
  variantId: string | null,
  occurredAt: Date,
  experimentId: string | null,
  arm: ExperimentArm | null,
): NewEvent {
  const hasCartValue =
    eventType === "add_to_cart" || eventType === "checkout_start";
  const isPurchase = eventType === "purchase";
  const payload = {
    product_id: DEMO_PRODUCT_ID,
    ...(hasCartValue ? { cart_value_cents: DEMO_PRODUCT_PRICE_MINOR } : {}),
    ...(isPurchase ? { revenue_cents: DEMO_PRODUCT_PRICE_MINOR } : {}),
    ...(eventType !== "product_view" ? { currency: DEMO_CURRENCY } : {}),
    ...(experimentId && arm ? { experimentId, variantArm: arm } : {}),
    ...(variantId ? { variant_id: variantId } : {}),
  } satisfies JsonObject;

  return {
    id: crypto.randomUUID(),
    sessionId,
    pageId,
    eventType,
    productId: DEMO_PRODUCT_ID,
    variantId,
    revenueCents: isPurchase ? DEMO_PRODUCT_PRICE_MINOR : null,
    cartValueCents: hasCartValue ? DEMO_PRODUCT_PRICE_MINOR : null,
    currency: eventType === "product_view" ? null : DEMO_CURRENCY,
    payload,
    occurredAt,
  };
}

/** Demo-only synthetic traffic generator; real traffic must use event ingestion. */
export async function simulateDemoTraffic(
  input: SimulateTrafficInput,
): Promise<SimulateDemoTrafficResult> {
  const { pageId } = await ensureDemoPage();
  const experiment = await getRunningExperimentForPage(pageId);
  const visitorCount = Math.min(input.visitors, MAX_VISITORS);
  const random = createSeededRandom(
    SIMULATION_SEED ^ visitorCount ^ (experiment ? 1 : 0),
  );
  const rates = createFunnelRates(random);
  const firstArm: ExperimentArm = random() < 0.5 ? "control" : "variant";
  const sessionRows: NewSession[] = [];
  const eventRows: NewEvent[] = [];
  const conversionRows: NewConversion[] = [];
  const arms = {
    control: emptyArmSummary(),
    variant: emptyArmSummary(),
  };
  const now = Date.now();
  const experimentStart = experiment?.startedAt?.getTime();
  const trafficStartedAt = Math.min(
    Math.max(
      experimentStart ?? now - TRAFFIC_WINDOW_MS,
      now - TRAFFIC_WINDOW_MS,
    ),
    now,
  );

  for (let index = 0; index < visitorCount; index += 1) {
    const assignedArm: ExperimentArm =
      index % 2 === 0
        ? firstArm
        : firstArm === "control"
          ? "variant"
          : "control";
    const arm = experiment ? assignedArm : "control";
    const experimentId = experiment?.id ?? null;
    const variantId =
      experiment && arm === "variant" ? experiment.variantId : null;
    const sessionId = crypto.randomUUID();
    const firstSeenAt = new Date(
      trafficStartedAt + random() * (now - trafficStartedAt),
    );
    const funnelPosition = random();
    const armRates = rates[arm];
    const addToCart = funnelPosition < armRates.addToCart;
    const checkoutStart = funnelPosition < armRates.checkoutStart;
    const purchase = funnelPosition < armRates.purchase;
    const finalEventOffset = purchase
      ? 12
      : checkoutStart
        ? 7
        : addToCart
          ? 3
          : 0;

    arms[arm].visitors += 1;
    if (addToCart) arms[arm].addToCarts += 1;
    if (checkoutStart) arms[arm].checkoutStarts += 1;
    if (purchase) arms[arm].purchases += 1;

    sessionRows.push({
      id: sessionId,
      pageId,
      anonymousId: `demo-sim-${crypto.randomUUID()}`,
      experimentId,
      experimentArm: experiment ? arm : null,
      userAgent: "StorePilot Demo Traffic Simulator",
      referrer: "https://demo.storepilot.local/simulated-traffic",
      firstSeenAt,
      lastSeenAt: addMinutes(firstSeenAt, finalEventOffset),
    });

    eventRows.push(
      createEvent(
        "product_view",
        sessionId,
        pageId,
        variantId,
        firstSeenAt,
        experimentId,
        experiment ? arm : null,
      ),
    );

    if (addToCart) {
      eventRows.push(
        createEvent(
          "add_to_cart",
          sessionId,
          pageId,
          variantId,
          addMinutes(firstSeenAt, 3),
          experimentId,
          experiment ? arm : null,
        ),
      );
    }

    if (checkoutStart) {
      eventRows.push(
        createEvent(
          "checkout_start",
          sessionId,
          pageId,
          variantId,
          addMinutes(firstSeenAt, 7),
          experimentId,
          experiment ? arm : null,
        ),
      );
    }

    if (purchase) {
      const occurredAt = addMinutes(firstSeenAt, 12);
      eventRows.push(
        createEvent(
          "purchase",
          sessionId,
          pageId,
          variantId,
          occurredAt,
          experimentId,
          experiment ? arm : null,
        ),
      );

      if (experiment) {
        conversionRows.push({
          id: crypto.randomUUID(),
          experimentId: experiment.id,
          sessionId,
          pageId,
          arm,
          eventName: "purchase",
          occurredAt,
        });
      }
    }
  }

  await db.transaction(async (tx) => {
    await insertInBatches(sessionRows, (batch) =>
      tx.insert(sessions).values(batch),
    );
    await insertInBatches(eventRows, (batch) =>
      tx.insert(events).values(batch),
    );
    await insertInBatches(conversionRows, (batch) =>
      tx.insert(conversions).values(batch),
    );
  });

  return {
    visitors: visitorCount,
    events: eventRows.length,
    purchases: arms.control.purchases + arms.variant.purchases,
    experimentId: experiment?.id ?? null,
    arms,
  };
}
