import type {
  DashboardDiagnosis,
  DiagnosisConfidence,
  DiagnosisMetricInput,
  DiagnosisSignal,
  RecommendedExperiment,
} from "@/features/analytics/types";
import { formatDemoCurrency } from "@/features/demo/lib/demo-product";

const MIN_SESSIONS_FOR_DIAGNOSIS = 5;
const MIN_PRODUCT_VIEWS_FOR_DIAGNOSIS = 10;
const LOW_ADD_TO_CART_RATE = 0.08;
const HEALTHY_CHECKOUT_START_RATE = 0.12;
const LOW_PURCHASE_RATE = 0.05;
const WEAK_PURCHASE_RATE = 0.08;
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
      label: "Add-to-cart rate",
      value: formatPercent(metrics.addToCartRate),
      description:
        "Sessions with at least one add-to-cart event divided by total sessions.",
    },
    {
      label: "Purchase conversion",
      value: formatPercent(metrics.purchaseConversionRate),
      description:
        "Sessions with at least one purchase divided by total sessions.",
    },
    {
      label: "Revenue per visitor",
      value: formatDemoCurrency(metrics.revenuePerVisitorCents),
      description: "Total purchase revenue divided by tracked sessions.",
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
    metrics.productViews < MIN_PRODUCT_VIEWS_FOR_DIAGNOSIS
  ) {
    return createDiagnosis({
      metrics,
      createdAt,
      status: "not_enough_data",
      primaryBottleneck: "insufficient_data",
      title: "Not enough behavior data yet",
      summary:
        "StorePilot needs a small storefront baseline before calling a bottleneck. Keep collecting sessions until the dashboard has at least 5 sessions and 10 product views.",
      confidence: "low",
      recommendedExperiment: {
        title: "Collect a clean baseline",
        description:
          "Drive a small amount of traffic through the tracked product page before changing copy, add-to-cart placement, or checkout messaging.",
        targetArea: "Tracking baseline",
        expectedImpact:
          "More reliable diagnosis before choosing the first experiment.",
      },
      extraSignals: [
        {
          label: "Minimum needed",
          value: `${MIN_SESSIONS_FOR_DIAGNOSIS} sessions / ${MIN_PRODUCT_VIEWS_FOR_DIAGNOSIS} product views`,
          description:
            "The deterministic diagnosis stays conservative until this floor is reached.",
        },
      ],
    });
  }

  if (
    metrics.checkoutStartRate >= HEALTHY_CHECKOUT_START_RATE &&
    metrics.purchaseConversionRate < LOW_PURCHASE_RATE
  ) {
    return createDiagnosis({
      metrics,
      createdAt,
      status: "ready",
      primaryBottleneck: "form_friction",
      title: "Checkout friction is likely blocking purchases",
      summary:
        "Shoppers are willing to start checkout, but too few complete the purchase. The issue is probably trust, shipping or return uncertainty, perceived effort, or final-step hesitation.",
      confidence,
      recommendedExperiment: {
        title: "Reduce checkout hesitation",
        description:
          "Test clearer checkout reassurance, return proof, and lower-risk purchase language near the buy action.",
        targetArea: "Checkout path",
        expectedImpact:
          "Improve purchase completion from shoppers who already show intent.",
      },
      extraSignals: [
        {
          label: "Checkout start threshold",
          value: formatPercent(HEALTHY_CHECKOUT_START_RATE),
          description:
            "The page is clearing the minimum intent threshold before the purchase step.",
        },
        {
          label: "Low purchase threshold",
          value: formatPercent(LOW_PURCHASE_RATE),
          description:
            "Purchase conversion below this level suggests downstream friction.",
        },
      ],
    });
  }

  if (
    metrics.scrollDepth.averageMaxScrollDepth < LOW_SCROLL_DEPTH &&
    metrics.addToCartRate < LOW_ADD_TO_CART_RATE
  ) {
    return createDiagnosis({
      metrics,
      createdAt,
      status: "ready",
      primaryBottleneck: "weak_above_the_fold_interest",
      title: "Above-the-fold interest looks weak",
      summary:
        "Shoppers are not scrolling deeply and are not adding the product to cart. The hero section may not be creating enough immediate relevance, confidence, or urgency.",
      confidence,
      recommendedExperiment: {
        title: "Sharpen the product promise",
        description:
          "Test a more specific product promise, clearer outcome, stronger proof, and a more direct add-to-cart button near the top of the page.",
        targetArea: "Hero section",
        expectedImpact:
          "Increase early shopping intent before visitors decide whether to keep reading.",
      },
      extraSignals: [
        {
          label: "Low scroll threshold",
          value: formatDepth(LOW_SCROLL_DEPTH),
          description:
            "Average max scroll depth below this level points to weak early interest.",
        },
        {
          label: "Low add-to-cart threshold",
          value: formatPercent(LOW_ADD_TO_CART_RATE),
          description:
            "Add-to-cart below this level means few shoppers are acting on the product promise.",
        },
      ],
    });
  }

  if (metrics.addToCartRate < LOW_ADD_TO_CART_RATE) {
    return createDiagnosis({
      metrics,
      createdAt,
      status: "ready",
      primaryBottleneck: "low_cta_engagement",
      title: "Add-to-cart engagement is low",
      summary:
        "Shoppers are reaching the page, but the product is not earning enough cart intent. The offer, button copy, price confidence, or add-to-cart visibility may need tightening.",
      confidence,
      recommendedExperiment: {
        title: "Test a clearer add-to-cart path",
        description:
          "Try more outcome-oriented button copy and make the add-to-cart action easier to find in the hero section.",
        targetArea: "Add-to-cart action",
        expectedImpact:
          "Increase the share of sessions that move from product interest to cart intent.",
      },
      extraSignals: [
        {
          label: "Low add-to-cart threshold",
          value: formatPercent(LOW_ADD_TO_CART_RATE),
          description:
            "Add-to-cart below this level is treated as the first ecommerce funnel bottleneck.",
        },
      ],
    });
  }

  if (
    metrics.scrollDepth.averageMaxScrollDepth >= GOOD_SCROLL_DEPTH &&
    metrics.purchaseConversionRate < WEAK_PURCHASE_RATE
  ) {
    return createDiagnosis({
      metrics,
      createdAt,
      status: "ready",
      primaryBottleneck: "good_interest_weak_conversion",
      title: "Interest is present, but purchase conversion is weak",
      summary:
        "Shoppers are engaging with the product page, but that interest is not turning into enough purchases. The next test should connect the product promise more directly to the buy step.",
      confidence,
      recommendedExperiment: {
        title: "Align proof with purchase intent",
        description:
          "Test stronger buyer proof, clearer checkout expectations, and add-to-cart copy that reduces uncertainty before purchase.",
        targetArea: "Mid-page proof and purchase path",
        expectedImpact:
          "Convert engaged shoppers who need more confidence before buying.",
      },
      extraSignals: [
        {
          label: "Good scroll threshold",
          value: formatDepth(GOOD_SCROLL_DEPTH),
          description:
            "Average max scroll depth at or above this level suggests visitors are reading beyond the hero.",
        },
        {
          label: "Weak purchase threshold",
          value: formatPercent(WEAK_PURCHASE_RATE),
          description:
            "Purchase conversion below this level leaves room for a focused conversion test.",
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
      "The tracked ecommerce funnel is clearing the basic engagement thresholds. The next experiment should be a focused lift test rather than a broad repair.",
    confidence,
    recommendedExperiment: {
      title: "Test a sharper value proposition",
      description:
        "Run a focused hero or add-to-cart copy test to look for incremental lift without changing the whole page.",
      targetArea: "Hero and add-to-cart action",
      expectedImpact:
        "Find incremental conversion lift while preserving the current funnel.",
    },
  });
}
