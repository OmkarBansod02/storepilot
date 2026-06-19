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
        headline: "A faster path from product interest to checkout",
        subheadline: `${baseline.brand} helps shoppers understand the product, trust the offer, and finish the purchase step without extra hesitation.`,
        primaryCtaLabel: "Claim the offer",
        trustProofRow: [
          "Secure checkout",
          "Easy returns",
          baseline.trustProofRow[0],
        ],
        rationale:
          "The diagnosis shows visitors are starting the form but not completing it. This proposal keeps the product promise focused on purchase intent and adds reassurance around effort and commitment before the conversion step.",
        targetArea: "signup_form",
        expectedImpact,
        sourceDiagnosis,
        source: "deterministic_fallback",
      };

    case "weak_above_the_fold_interest":
      return {
        headline: "Find the pack shoppers choose for every quick escape",
        subheadline: `${baseline.brand} gives shoppers a clearer reason to compare, trust, and buy the product without digging through the page.`,
        primaryCtaLabel: "Shop the pack",
        trustProofRow: [
          "Fast shipping",
          "Verified buyer proof",
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
        headline: "Make the next trip easier to pack for",
        subheadline: `${baseline.brand} gives shoppers a clear product promise, practical proof, and a more direct path from interest to purchase.`,
        primaryCtaLabel: "Add to cart",
        trustProofRow: [
          "Clear next step",
          "No-risk returns",
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
        headline: "Turn product interest into a confident order",
        subheadline: `${baseline.brand} pairs practical product benefits with buyer proof, so engaged shoppers understand the next step and feel ready to convert.`,
        primaryCtaLabel: "Buy with confidence",
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
        headline: "A sharper product page for the next lift",
        subheadline: `${baseline.brand} keeps the core offer intact while making the product promise, proof, and CTA easier for shoppers to act on.`,
        primaryCtaLabel: "Shop now",
        trustProofRow: [
          baseline.trustProofRow[0],
          "Buyer-ready proof",
          "Focused checkout path",
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
