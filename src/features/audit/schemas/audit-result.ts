import { z } from "zod";

export const auditCategorySchema = z.enum([
  "headline",
  "cta",
  "trust",
  "layout",
  "form",
  "copy",
  "performance",
]);

export const findingSeveritySchema = z.enum(["high", "medium", "low"]);

export const pageMetadataSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
  ogImage: z.string().nullable(),
});

export const aboveTheFoldSignalsSchema = z.object({
  textLength: z.number().int().nonnegative(),
  linkCount: z.number().int().nonnegative(),
  buttonCount: z.number().int().nonnegative(),
  formFieldCount: z.number().int().nonnegative(),
});

export const pageSignalsSchema = z.object({
  finalUrl: z.string().url(),
  pageTitle: z.string(),
  metaDescription: z.string().nullable(),
  ogImage: z.string().nullable(),
  mainHeading: z.string().nullable(),
  subheadings: z.array(z.string()),
  ctaLabels: z.array(z.string()),
  hasForm: z.boolean(),
  formFieldCount: z.number().int().nonnegative(),
  navLinkCount: z.number().int().nonnegative(),
  trustSignals: z.array(z.string()),
  sectionSignals: z.array(z.string()),
  aboveTheFold: aboveTheFoldSignalsSchema,
});

export const auditFindingSchema = z.object({
  id: z.string(),
  title: z.string(),
  severity: findingSeveritySchema,
  category: auditCategorySchema,
  description: z.string(),
});

export const auditIssueSchema = auditFindingSchema.extend({
  conversionImpact: z.string(),
});

export const recommendedExperimentSchema = z.object({
  title: z.string(),
  hypothesis: z.string(),
  expectedImpact: z.string(),
  changes: z.array(z.string()).min(1),
  rationale: z.string(),
});

export const auditResultSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  screenshotUrl: z.string().nullable(),
  pageMetadata: pageMetadataSchema,
  pageSignals: pageSignalsSchema,
  overallScore: z.number().int().min(0).max(100),
  summary: z.string(),
  findings: z.array(auditFindingSchema),
  issues: z.array(auditIssueSchema),
  recommendedExperiment: recommendedExperimentSchema,
  createdAt: z.string(),
});

export const auditAiSummarySchema = z.object({
  summary: z.string(),
  keyFindings: z.array(auditFindingSchema),
  prioritizedIssues: z.array(auditIssueSchema),
  recommendedExperiment: recommendedExperimentSchema,
  rationale: z.string(),
});

export type PageMetadata = z.infer<typeof pageMetadataSchema>;
export type PageSignals = z.infer<typeof pageSignalsSchema>;
export type AuditCategory = z.infer<typeof auditCategorySchema>;
export type FindingSeverity = z.infer<typeof findingSeveritySchema>;
export type AuditFinding = z.infer<typeof auditFindingSchema>;
export type AuditIssue = z.infer<typeof auditIssueSchema>;
export type RecommendedExperiment = z.infer<typeof recommendedExperimentSchema>;
export type AuditResult = z.infer<typeof auditResultSchema>;
export type AuditAiSummary = z.infer<typeof auditAiSummarySchema>;
