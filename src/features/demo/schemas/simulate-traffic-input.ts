import { z } from "zod";

export const simulateTrafficInputSchema = z
  .object({
    visitors: z.number().int().min(1).max(5_000).default(1_000),
  })
  .strict();

export type SimulateTrafficInput = z.infer<
  typeof simulateTrafficInputSchema
>;
