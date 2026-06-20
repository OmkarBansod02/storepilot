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
        headline: "Complete your order with confidence",
        subheadline: `${baseline.brand} pairs secure checkout with clear shipping and returns, so buying your leather wallet feels straightforward.`,
        primaryCtaLabel: "Complete secure purchase",
        trustProofRow: [
          "Secure checkout",
          "Easy returns",
          baseline.trustProofRow[0],
        ],
        rationale:
          "The diagnosis shows shoppers are starting checkout but not completing purchase. This proposal keeps the product promise focused on purchase intent and adds reassurance around effort and commitment before the conversion step.",
        targetArea: "checkout_reassurance",
        expectedImpact,
        sourceDiagnosis,
        source: "deterministic_fallback",
      };

    case "weak_above_the_fold_interest":
      return {
        headline: "A full-grain leather wallet built to age beautifully",
        subheadline: `${baseline.brand} handcrafts a slim everyday wallet with durable leather, practical storage, and a lifetime of character.`,
        primaryCtaLabel: "Add to cart",
        trustProofRow: [
          "Fast shipping",
          "Verified buyer proof",
          baseline.trustProofRow[0],
        ],
        rationale:
          "The diagnosis points to weak above-the-fold engagement. This proposal makes the product promise more specific and gives shoppers a clearer reason to add the wallet to cart.",
        targetArea: "hero_positioning",
        expectedImpact,
        sourceDiagnosis,
        source: "deterministic_fallback",
      };

    case "low_cta_engagement":
      return {
        headline: "Carry less. Keep what matters.",
        subheadline: `${baseline.brand} makes a slim full-grain leather wallet with room for daily essentials and no unnecessary bulk.`,
        primaryCtaLabel: "Add to cart",
        trustProofRow: [
          "Clear next step",
          "No-risk returns",
          baseline.trustProofRow[0],
        ],
        rationale:
          "The diagnosis shows low add-to-cart engagement, so the proposal strengthens the button language and makes the next step feel more concrete.",
        targetArea: "add_to_cart_cta",
        expectedImpact,
        sourceDiagnosis,
        source: "deterministic_fallback",
      };

    case "good_interest_weak_conversion":
      return {
        headline: "Crafted for years of use, backed by easy returns",
        subheadline: `${baseline.brand} combines full-grain leather, verified buyer proof, free shipping, and 30-day returns for a lower-risk purchase.`,
        primaryCtaLabel: "Buy with confidence",
        trustProofRow: [
          baseline.trustProofRow[0],
          "30-day hassle-free returns",
          "Secure checkout",
        ],
        rationale:
          "The diagnosis shows shoppers are engaging but not purchasing enough. This proposal connects buyer proof, shipping, returns, and the purchase path so interested shoppers have fewer reasons to pause.",
        targetArea: "shipping_returns_trust",
        expectedImpact,
        sourceDiagnosis,
        source: "deterministic_fallback",
      };

    case "healthy_funnel":
      return {
        headline: "Handcrafted full-grain leather, delivered free",
        subheadline: `${baseline.brand} makes a slim everyday wallet designed to age beautifully, with free shipping on this order.`,
        primaryCtaLabel: "Add to cart",
        trustProofRow: [
          baseline.trustProofRow[0],
          "Free shipping above ₹2,000",
          "30-day hassle-free returns",
        ],
        rationale:
          "The diagnosis does not show a major repair need, so this proposal keeps the existing product intact while testing a clearer shipping offer for incremental lift.",
        targetArea: "offer_banner",
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
        targetArea: "hero_positioning",
        expectedImpact,
        sourceDiagnosis,
        source: "deterministic_fallback",
      };
  }
}
