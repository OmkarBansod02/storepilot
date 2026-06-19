import { z } from "zod";

export const demoPageBaselineSchema = z
  .object({
    brand: z.string().trim().min(1).max(120),
    headline: z.string().trim().min(1).max(160),
    subheadline: z.string().trim().min(1).max(320),
    primaryCtaLabel: z.string().trim().min(1).max(80),
    secondaryCtaLabel: z.string().trim().min(1).max(80),
    trustProofRow: z.array(z.string().trim().min(1).max(120)).max(4),
    formHeadline: z.string().trim().min(1).max(160),
    formDescription: z.string().trim().min(1).max(320),
  })
  .strict();
