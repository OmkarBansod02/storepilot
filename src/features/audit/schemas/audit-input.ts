import { z } from "zod";

const publicPageUrlSchema = z
  .string()
  .trim()
  .url()
  .transform((value, context) => {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      context.addIssue({
        code: "custom",
        message: "URL must use http or https.",
      });
      return z.NEVER;
    }

    if (url.username || url.password) {
      context.addIssue({
        code: "custom",
        message: "URL must not include credentials.",
      });
      return z.NEVER;
    }

    url.hash = "";

    return url.toString();
  });

export const createAuditInputSchema = z.object({
  url: publicPageUrlSchema,
});

export type CreateAuditInput = z.infer<typeof createAuditInputSchema>;
