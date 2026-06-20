import type { VariantTargetArea } from "@/features/variants/schemas/variant-input";

const TARGET_AREA_LABELS: Record<VariantTargetArea, string> = {
  hero_positioning: "Hero positioning",
  add_to_cart_cta: "Add-to-cart button",
  checkout_reassurance: "Checkout reassurance",
  shipping_returns_trust: "Shipping and returns trust",
  offer_banner: "Offer banner",
};

export function formatVariantTargetArea(area: VariantTargetArea): string {
  return TARGET_AREA_LABELS[area];
}
