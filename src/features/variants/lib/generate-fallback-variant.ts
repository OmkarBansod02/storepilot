import type { DashboardDiagnosis } from "@/features/analytics/types";
import type {
  VariantProposalInput,
  VariantSourceDiagnosis,
} from "@/features/variants/schemas/variant-input";
import type { DemoPageBaseline } from "@/features/variants/types";

function buildSourceDiagnosis(
  diagnosis: DashboardDiagnosis,
): VariantSourceDiagnosis {
  return {
    primaryBottleneck: diagnosis.primaryBottleneck,
    title: diagnosis.title,
    recommendedExperimentTitle: diagnosis.recommendedExperiment.title,
  };
}

export function generateFallbackVariant(params: {
  baseline: DemoPageBaseline;
  diagnosis: DashboardDiagnosis;
}): VariantProposalInput {
  const { baseline, diagnosis } = params;
  const sourceDiagnosis = buildSourceDiagnosis(diagnosis);
  const expectedImpact = diagnosis.recommendedExperiment.expectedImpact;

  switch (diagnosis.primaryBottleneck) {
    case "form_friction":
      return {
        headline: "Launch pages that turn visitor intent into signups",
        subheadline: `${baseline.brand} helps early-stage teams create landing pages, capture real behavior, and remove the friction that stops high-intent visitors from finishing the signup step.`,
        primaryCtaLabel: "Join the early access list",
        trustProofRow: [
          "No credit card required",
          "Setup takes minutes",
          baseline.trustProofRow[0],
        ],
        rationale:
          "The diagnosis shows visitors are starting the form but not completing it. This proposal keeps the page promise focused on conversion and adds reassurance around effort and commitment before the signup step.",
        targetArea: "signup_form",
        expectedImpact,
        sourceDiagnosis,
        source: "deterministic_fallback",
      };

    case "weak_above_the_fold_interest":
      return {
        headline: "Build landing pages that prove what converts",
        subheadline: `${baseline.brand} gives early-stage teams a faster way to launch a page, read visitor behavior, and choose the next improvement with confidence.`,
        primaryCtaLabel: "Improve my landing page",
        trustProofRow: [
          "Behavior insights included",
          "Built for early-stage launches",
          baseline.trustProofRow[0],
        ],
        rationale:
          "The diagnosis points to weak above-the-fold engagement. This proposal makes the hero promise more specific, ties the product to a measurable outcome, and gives the primary CTA a clearer reason to click.",
        targetArea: "hero",
        expectedImpact,
        sourceDiagnosis,
        source: "deterministic_fallback",
      };

    case "low_cta_engagement":
      return {
        headline: "Launch faster with a clearer path to conversion",
        subheadline: `${baseline.brand} helps teams publish landing pages, see where visitors hesitate, and move from guesswork to the next best conversion test.`,
        primaryCtaLabel: "Create my launch page",
        trustProofRow: [
          "Clear next step",
          "No growth team required",
          baseline.trustProofRow[0],
        ],
        rationale:
          "The diagnosis shows low CTA engagement, so the proposal strengthens the action language and makes the next step feel more concrete and outcome-oriented.",
        targetArea: "primary_cta",
        expectedImpact,
        sourceDiagnosis,
        source: "deterministic_fallback",
      };

    case "good_interest_weak_conversion":
      return {
        headline: "Turn landing-page interest into confident signups",
        subheadline: `${baseline.brand} combines fast page creation with behavior signals, so engaged visitors see proof, understand the next step, and feel ready to convert.`,
        primaryCtaLabel: "Start with a proven page",
        trustProofRow: [
          baseline.trustProofRow[0],
          "Real behavior signals",
          "One focused next step",
        ],
        rationale:
          "The diagnosis shows visitors are engaging but not converting enough. This proposal connects proof, behavior insight, and the CTA path more tightly so interested readers have fewer reasons to pause.",
        targetArea: "trust_proof",
        expectedImpact,
        sourceDiagnosis,
        source: "deterministic_fallback",
      };

    case "healthy_funnel":
      return {
        headline: "Launch smarter pages and find your next lift",
        subheadline: `${baseline.brand} helps teams ship polished landing pages, collect conversion signal, and keep improving without adding a full growth stack.`,
        primaryCtaLabel: "Start optimizing today",
        trustProofRow: [
          baseline.trustProofRow[0],
          "Fast page setup",
          "Focused conversion insights",
        ],
        rationale:
          "The diagnosis does not show a major repair need, so this proposal keeps the existing offer intact while sharpening the value proposition and CTA for incremental lift.",
        targetArea: "hero",
        expectedImpact,
        sourceDiagnosis,
        source: "deterministic_fallback",
      };

    case "insufficient_data":
      return {
        headline: baseline.headline,
        subheadline: baseline.subheadline,
        primaryCtaLabel: baseline.primaryCtaLabel,
        trustProofRow: baseline.trustProofRow,
        rationale:
          "The diagnosis does not have enough behavior data for a confident variant. The backend normally blocks generation before this fallback is used.",
        targetArea: "hero",
        expectedImpact,
        sourceDiagnosis,
        source: "deterministic_fallback",
      };
  }
}
