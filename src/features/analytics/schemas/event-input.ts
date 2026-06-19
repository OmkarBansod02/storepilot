import { z } from "zod";

export const snippetEventTypeSchema = z.enum([
  "page_view",
  "scroll_depth",
  "cta_click",
  "form_start",
  "form_submit",
]);

const trackingTextSchema = z.string().trim().min(1).max(128);
const pageTextSchema = z.string().trim().min(1).max(512);

const baseEventInputSchema = z.object({
  pageId: z.string().uuid(),
  sessionId: z.string().uuid(),
  experimentId: z.string().uuid().optional(),
  variantArm: z.enum(["control", "variant"]).optional(),
  occurredAt: z.string().datetime().optional(),
});

function validateExperimentContext(
  input: { experimentId?: string; variantArm?: "control" | "variant" },
  ctx: z.RefinementCtx,
): void {
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
}

export const pageViewPayloadSchema = z
  .object({
    path: pageTextSchema.optional(),
    title: pageTextSchema.optional(),
  })
  .strict();

export const scrollDepthPayloadSchema = z
  .object({
    depth: z.union([
      z.literal(25),
      z.literal(50),
      z.literal(75),
      z.literal(100),
    ]),
  })
  .strict();

export const ctaClickPayloadSchema = z
  .object({
    label: trackingTextSchema.optional(),
    location: trackingTextSchema.optional(),
  })
  .strict();

export const formStartPayloadSchema = z
  .object({
    formId: trackingTextSchema.optional(),
    field: trackingTextSchema.optional(),
  })
  .strict();

export const formSubmitPayloadSchema = z
  .object({
    formId: trackingTextSchema.optional(),
  })
  .strict();

export const recordEventInputSchema = z
  .discriminatedUnion("eventType", [
    baseEventInputSchema
      .extend({
        eventType: z.literal("page_view"),
        payload: pageViewPayloadSchema.default({}),
      })
      .strict(),
    baseEventInputSchema
      .extend({
        eventType: z.literal("scroll_depth"),
        payload: scrollDepthPayloadSchema,
      })
      .strict(),
    baseEventInputSchema
      .extend({
        eventType: z.literal("cta_click"),
        payload: ctaClickPayloadSchema.default({}),
      })
      .strict(),
    baseEventInputSchema
      .extend({
        eventType: z.literal("form_start"),
        payload: formStartPayloadSchema.default({}),
      })
      .strict(),
    baseEventInputSchema
      .extend({
        eventType: z.literal("form_submit"),
        payload: formSubmitPayloadSchema.default({}),
      })
      .strict(),
  ])
  .superRefine(validateExperimentContext);

export type SnippetEventType = z.infer<typeof snippetEventTypeSchema>;
export type RecordEventInput = z.infer<typeof recordEventInputSchema>;
export type SnippetEventPayloadByType = {
  [EventType in SnippetEventType]: Extract<
    RecordEventInput,
    { eventType: EventType }
  >["payload"];
};
