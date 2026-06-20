import { db } from "@/lib/db";
import { experiments, sessions } from "@/lib/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
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
  // Experiment context is part of session identity; historical assignments
  // are never rewritten when the same anonymous visitor enters a new context.
  const assignmentCondition = assignment
    ? and(
        eq(sessions.experimentId, assignment.experimentId),
        eq(sessions.experimentArm, assignment.variantArm),
      )
    : and(isNull(sessions.experimentId), isNull(sessions.experimentArm));
  const existing = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(
      and(
        eq(sessions.pageId, input.pageId),
        eq(sessions.anonymousId, input.anonymousId),
        assignmentCondition,
      ),
    )
    .orderBy(desc(sessions.lastSeenAt))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(sessions)
      .set({
        lastSeenAt: new Date(),
        userAgent: input.userAgent ?? null,
      })
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
