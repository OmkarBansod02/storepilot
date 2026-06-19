import { z } from "zod";

export const createSessionInputSchema = z
  .object({
    pageId: z.string().uuid(),
    anonymousId: z.string().trim().min(8).max(128),
    experimentId: z.string().uuid().optional(),
    variantArm: z.enum(["control", "variant"]).optional(),
    userAgent: z.string().trim().max(512).optional(),
    referrer: z.string().trim().url().optional(),
  })
  .strict()
  .superRefine((input, ctx) => {
    if (input.experimentId && !input.variantArm) {
      ctx.addIssue({
        code: "custom",
        path: ["variantArm"],
        message: "variantArm is required when experimentId is provided.",
      });
    }

    if (input.variantArm && !input.experimentId) {
      ctx.addIssue({
        code: "custom",
        path: ["experimentId"],
        message: "experimentId is required when variantArm is provided.",
      });
    }
  });

export type CreateSessionInput = z.infer<typeof createSessionInputSchema>;
