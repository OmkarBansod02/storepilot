export type {
  AuditCategory,
  AuditFinding,
  AuditIssue,
  AuditResult,
  FindingSeverity,
  PageMetadata,
  PageSignals,
  RecommendedExperiment,
} from "./schemas/audit-result";

export type AuditStatus = "idle" | "loading" | "success" | "error";
