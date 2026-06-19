import type {
  DashboardDiagnosis,
  DiagnosisConfidence,
  DiagnosisMetricInput,
  DiagnosisSignal,
  RecommendedExperiment,
} from "@/features/analytics/types";

const MIN_SESSIONS_FOR_DIAGNOSIS = 5;
const MIN_PAGE_VIEWS_FOR_DIAGNOSIS = 10;
const LOW_CTA_CLICK_RATE = 0.08;
const HEALTHY_FORM_START_RATE = 0.12;
const LOW_FORM_SUBMIT_RATE = 0.05;
const WEAK_FORM_SUBMIT_RATE = 0.08;
const LOW_SCROLL_DEPTH = 50;
const GOOD_SCROLL_DEPTH = 50;

function formatPercent(rate: number): string {
  const boundedRate = Math.min(Math.max(rate, 0), 1);
  if (boundedRate === 0) return "0%";
  return `${(boundedRate * 100).toFixed(1)}%`;
}

function formatDepth(depth: number): string {
  if (depth === 0) return "0%";
  return `${Math.round(depth)}%`;
}

function confidenceForSampleSize(totalSessions: number): DiagnosisConfidence {
  if (totalSessions >= 20) return "high";
  if (totalSessions >= 10) return "medium";
  return "low";
}

function buildCoreSignals(metrics: DiagnosisMetricInput): DiagnosisSignal[] {
  return [
    {
      label: "Sessions",
      value: metrics.totalSessions.toLocaleString(),
      description: "Anonymous sessions tracked for this storefront page.",
    },
    {
      label: "CTA click-through",
      value: formatPercent(metrics.ctaClickThroughRate),
      description:
        "Sessions with at least one CTA click divided by total sessions.",
    },
    {
      label: "Form submit rate",
      value: formatPercent(metrics.formSubmitRate),
      description:
        "Sessions with at least one form submit divided by total sessions.",
    },
    {
      label: "Avg. max scroll depth",
      value: formatDepth(metrics.scrollDepth.averageMaxScrollDepth),
      description: "Average of each session's deepest reached scroll milestone.",
    },
  ];
}

function createDiagnosis(params: {
  metrics: DiagnosisMetricInput;
  createdAt: Date;
  status: DashboardDiagnosis["status"];
  primaryBottleneck: DashboardDiagnosis["primaryBottleneck"];
  title: string;
  summary: string;
  confidence: DiagnosisConfidence;
  recommendedExperiment: RecommendedExperiment;
  extraSignals?: DiagnosisSignal[];
}): DashboardDiagnosis {
  return {
    status: params.status,
    primaryBottleneck: params.primaryBottleneck,
    title: params.title,
    summary: params.summary,
    confidence: params.confidence,
    supportingSignals: [
      ...buildCoreSignals(params.metrics),
      ...(params.extraSignals ?? []),
    ],
    recommendedExperiment: params.recommendedExperiment,
    createdAt: params.createdAt.toISOString(),
  };
}

export function diagnoseDashboardMetrics(
  metrics: DiagnosisMetricInput,
  createdAt = new Date(),
): DashboardDiagnosis {
  const confidence = confidenceForSampleSize(metrics.totalSessions);

  if (
    metrics.totalSessions < MIN_SESSIONS_FOR_DIAGNOSIS ||
    metrics.totalPageViews < MIN_PAGE_VIEWS_FOR_DIAGNOSIS
  ) {
    return createDiagnosis({
      metrics,
      createdAt,
      status: "not_enough_data",
      primaryBottleneck: "insufficient_data",
      title: "Not enough behavior data yet",
      summary:
        "StorePilot needs a small baseline before calling a bottleneck. Keep collecting sessions until the dashboard has at least 5 sessions and 10 page views.",
      confidence: "low",
      recommendedExperiment: {
        title: "Collect a clean baseline",
        description:
          "Drive a small amount of traffic through the tracked page before changing copy, CTA placement, or form structure.",
        targetArea: "Tracking baseline",
        expectedImpact:
          "More reliable diagnosis before choosing the first experiment.",
      },
      extraSignals: [
        {
          label: "Minimum needed",
          value: `${MIN_SESSIONS_FOR_DIAGNOSIS} sessions / ${MIN_PAGE_VIEWS_FOR_DIAGNOSIS} page views`,
          description:
            "The deterministic diagnosis stays conservative until this floor is reached.",
        },
      ],
    });
  }

  if (
    metrics.formStartRate >= HEALTHY_FORM_START_RATE &&
    metrics.formSubmitRate < LOW_FORM_SUBMIT_RATE
  ) {
    return createDiagnosis({
      metrics,
      createdAt,
      status: "ready",
      primaryBottleneck: "form_friction",
      title: "Form friction is likely blocking conversion",
      summary:
        "Visitors are willing to start the form, but too few complete it. The issue is probably in form length, perceived effort, unclear fields, or trust near the submit step.",
      confidence,
      recommendedExperiment: {
        title: "Reduce form effort",
        description:
          "Test a shorter form, clearer field labels, and reassurance near the submit button.",
        targetArea: "Offer form",
        expectedImpact:
          "Improve completion from visitors who already show intent.",
      },
      extraSignals: [
        {
          label: "Form start threshold",
          value: formatPercent(HEALTHY_FORM_START_RATE),
          description:
            "The page is clearing the minimum intent threshold before the form.",
        },
        {
          label: "Low submit threshold",
          value: formatPercent(LOW_FORM_SUBMIT_RATE),
          description:
            "Submit rate below this level suggests downstream friction.",
        },
      ],
    });
  }

  if (
    metrics.scrollDepth.averageMaxScrollDepth < LOW_SCROLL_DEPTH &&
    metrics.ctaClickThroughRate < LOW_CTA_CLICK_RATE
  ) {
    return createDiagnosis({
      metrics,
      createdAt,
      status: "ready",
      primaryBottleneck: "weak_above_the_fold_interest",
      title: "Above-the-fold interest looks weak",
      summary:
        "Visitors are not scrolling deeply and are not clicking the primary CTA. The hero section may not be creating enough immediate relevance or urgency.",
      confidence,
      recommendedExperiment: {
        title: "Sharpen the hero promise",
        description:
          "Test a more specific headline, clearer outcome, stronger proof, and a more direct primary CTA near the top of the page.",
        targetArea: "Hero section",
        expectedImpact:
          "Increase early engagement before visitors decide whether to keep reading.",
      },
      extraSignals: [
        {
          label: "Low scroll threshold",
          value: formatDepth(LOW_SCROLL_DEPTH),
          description:
            "Average max scroll depth below this level points to weak early interest.",
        },
        {
          label: "Low CTA threshold",
          value: formatPercent(LOW_CTA_CLICK_RATE),
          description:
            "CTA click-through below this level means few visitors are acting on the page promise.",
        },
      ],
    });
  }

  if (metrics.ctaClickThroughRate < LOW_CTA_CLICK_RATE) {
    return createDiagnosis({
      metrics,
      createdAt,
      status: "ready",
      primaryBottleneck: "low_cta_engagement",
      title: "CTA engagement is low",
      summary:
        "Visitors are reaching the page, but the primary call to action is not earning enough clicks. The offer, button copy, or CTA visibility may need tightening.",
      confidence,
      recommendedExperiment: {
        title: "Test a clearer primary CTA",
        description:
          "Try more outcome-oriented button copy and make the primary CTA easier to find in the hero section.",
        targetArea: "Primary CTA",
        expectedImpact:
          "Increase the share of sessions that move from attention to action.",
      },
      extraSignals: [
        {
          label: "Low CTA threshold",
          value: formatPercent(LOW_CTA_CLICK_RATE),
          description:
            "CTA click-through below this level is treated as the first funnel bottleneck.",
        },
      ],
    });
  }

  if (
    metrics.scrollDepth.averageMaxScrollDepth >= GOOD_SCROLL_DEPTH &&
    metrics.formSubmitRate < WEAK_FORM_SUBMIT_RATE
  ) {
    return createDiagnosis({
      metrics,
      createdAt,
      status: "ready",
      primaryBottleneck: "good_interest_weak_conversion",
      title: "Interest is present, but conversion is weak",
      summary:
        "Visitors are engaging with the page, but that interest is not turning into enough completed forms. The next test should connect the page promise more directly to the conversion step.",
      confidence,
      recommendedExperiment: {
        title: "Align proof and CTA with the conversion step",
        description:
          "Test stronger proof, clearer next-step expectations, and CTA copy that reduces uncertainty before the form.",
        targetArea: "Mid-page proof and CTA path",
        expectedImpact:
          "Convert engaged readers who need more confidence before submitting.",
      },
      extraSignals: [
        {
          label: "Good scroll threshold",
          value: formatDepth(GOOD_SCROLL_DEPTH),
          description:
            "Average max scroll depth at or above this level suggests visitors are reading beyond the hero.",
        },
        {
          label: "Weak conversion threshold",
          value: formatPercent(WEAK_FORM_SUBMIT_RATE),
          description:
            "Submit rate below this level leaves room for a focused conversion test.",
        },
      ],
    });
  }

  return createDiagnosis({
    metrics,
    createdAt,
    status: "ready",
    primaryBottleneck: "healthy_funnel",
    title: "No obvious bottleneck detected",
    summary:
      "The tracked funnel is clearing the basic engagement thresholds. The next experiment should be a focused lift test rather than a broad repair.",
    confidence,
    recommendedExperiment: {
      title: "Test a sharper value proposition",
      description:
        "Run a focused hero or CTA copy test to look for incremental lift without changing the whole page.",
      targetArea: "Hero and primary CTA",
      expectedImpact:
        "Find incremental conversion lift while preserving the current funnel.",
    },
  });
}
