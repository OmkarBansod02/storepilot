import { db } from "@/lib/db";
import { experiments, sessions, type NewSession } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { CreateSessionInput } from "@/features/snippet/schemas/session-input";
import type { ExperimentAssignment } from "@/features/experiments/types";

async function getValidExperimentAssignment(
  input: CreateSessionInput,
): Promise<ExperimentAssignment | null> {
  if (!input.experimentId || !input.variantArm) return null;

  const [experiment] = await db
    .select({ id: experiments.id })
    .from(experiments)
    .where(
      and(
        eq(experiments.id, input.experimentId),
        eq(experiments.pageId, input.pageId),
        eq(experiments.status, "running"),
      ),
    )
    .limit(1);

  if (!experiment) return null;

  return {
    experimentId: experiment.id,
    variantArm: input.variantArm,
  };
}

export async function createSession(input: CreateSessionInput) {
  const assignment = await getValidExperimentAssignment(input);
  const existing = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(
      and(
        eq(sessions.pageId, input.pageId),
        eq(sessions.anonymousId, input.anonymousId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    const updateValues: Partial<
      Pick<
        NewSession,
        "lastSeenAt" | "userAgent" | "experimentId" | "experimentArm"
      >
    > = {
      lastSeenAt: new Date(),
      userAgent: input.userAgent ?? null,
    };

    if (assignment) {
      updateValues.experimentId = assignment.experimentId;
      updateValues.experimentArm = assignment.variantArm;
    }

    await db
      .update(sessions)
      .set(updateValues)
      .where(eq(sessions.id, existing[0].id));

    return { sessionId: existing[0].id, created: false };
  }

  const [inserted] = await db
    .insert(sessions)
    .values({
      pageId: input.pageId,
      anonymousId: input.anonymousId,
      experimentId: assignment?.experimentId ?? null,
      experimentArm: assignment?.variantArm ?? null,
      userAgent: input.userAgent ?? null,
      referrer: input.referrer ?? null,
    })
    .returning({ id: sessions.id });

  return { sessionId: inserted.id, created: true };
}
