import { z } from "zod";

export const createExperimentInputSchema = z.object({
  pageId: z.string().uuid(),
}).strict();

export const experimentIdInputSchema = z.object({
  experimentId: z.string().uuid(),
}).strict();

export type CreateExperimentInput = z.infer<
  typeof createExperimentInputSchema
>;
export type ExperimentIdInput = z.infer<typeof experimentIdInputSchema>;
