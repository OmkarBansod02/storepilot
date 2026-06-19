import type { CreateAuditInput } from "@/features/audit/schemas/audit-input";
import {
  auditResultSchema,
  type AuditResult,
} from "@/features/audit/schemas/audit-result";
import { analyzePageHeuristics } from "@/features/audit/lib/analyze-page-heuristics";

import { capturePageForAudit } from "./capture-page";

export async function createAudit(input: CreateAuditInput): Promise<AuditResult> {
  const capturedPage = await capturePageForAudit(input.url);
  const analysis = analyzePageHeuristics(capturedPage.signals);

  const result = auditResultSchema.parse({
    id: crypto.randomUUID(),
    url: capturedPage.finalUrl,
    screenshotUrl: capturedPage.screenshotUrl,
    pageMetadata: {
      title:
        capturedPage.signals.pageTitle ||
        capturedPage.signals.mainHeading ||
        capturedPage.finalUrl,
      description: capturedPage.signals.metaDescription,
      ogImage: capturedPage.signals.ogImage,
    },
    pageSignals: capturedPage.signals,
    overallScore: analysis.overallScore,
    summary: analysis.summary,
    findings: analysis.findings,
    issues: analysis.issues,
    recommendedExperiment: analysis.recommendedExperiment,
    createdAt: new Date().toISOString(),
  });

  return result;
}
