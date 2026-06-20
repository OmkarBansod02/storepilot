export const DEMO_PRODUCT_ID = "premium-leather-wallet";
export const DEMO_PRODUCT_NAME = "Premium leather wallet";
export const DEMO_PRODUCT_PRICE_MINOR = 249_900;
export const DEMO_CURRENCY = "INR";

export function formatDemoCurrency(minorUnits: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: DEMO_CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(minorUnits / 100);
}
