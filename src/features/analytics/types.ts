export type DiagnosisStatus = "not_enough_data" | "ready";

export type PrimaryBottleneck =
  | "insufficient_data"
  | "low_cta_engagement"
  | "weak_above_the_fold_interest"
  | "form_friction"
  | "good_interest_weak_conversion"
  | "healthy_funnel";

export type DiagnosisConfidence = "low" | "medium" | "high";

export interface ScrollDepthSummary {
  totalScrollEvents: number;
  sessionsWithScrollDepth: number;
  averageMaxScrollDepth: number;
  highestScrollDepth: number;
}

export interface DiagnosisSignal {
  label: string;
  value: string;
  description: string;
}

export interface RecommendedExperiment {
  title: string;
  description: string;
  targetArea: string;
  expectedImpact: string;
}

export interface DashboardDiagnosis {
  status: DiagnosisStatus;
  primaryBottleneck: PrimaryBottleneck;
  title: string;
  summary: string;
  confidence: DiagnosisConfidence;
  supportingSignals: DiagnosisSignal[];
  recommendedExperiment: RecommendedExperiment;
  createdAt: string;
}

export interface DiagnosisMetricInput {
  totalSessions: number;
  totalPageViews: number;
  ctaClicks: number;
  formStarts: number;
  formSubmits: number;
  ctaClickThroughRate: number;
  formStartRate: number;
  formSubmitRate: number;
  scrollDepth: ScrollDepthSummary;
}

export interface DashboardMetrics {
  totalSessions: number;
  totalPageViews: number;
  ctaClicks: number;
  formStarts: number;
  formSubmits: number;
  ctaClickThroughRate: number;
  formStartRate: number;
  formSubmitRate: number;
  scrollDepth: ScrollDepthSummary;
  diagnosis: DashboardDiagnosis;
}
