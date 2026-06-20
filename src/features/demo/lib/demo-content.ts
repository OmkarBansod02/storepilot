import {
  DEMO_CURRENCY,
  DEMO_PRODUCT_ID,
  DEMO_PRODUCT_NAME,
  DEMO_PRODUCT_PRICE_MINOR,
  formatDemoCurrency,
} from "@/features/demo/lib/demo-product";

export const demoContent = {
  productName: DEMO_PRODUCT_NAME,
  brand: "Atelier Craft",
  tagline: "Small-batch leather goods since 2019",
  headline: "Premium Full-Grain\nLeather Wallet",
  subheadline:
    "Hand-cut and saddle-stitched from vegetable-tanned full-grain leather. Ages beautifully — no two wallets patina the same way.",
  ctaLabel: "Add to Cart",
  secondaryCta: "View Details",
  price: formatDemoCurrency(DEMO_PRODUCT_PRICE_MINOR),
  priceCents: DEMO_PRODUCT_PRICE_MINOR,
  currency: DEMO_CURRENCY,
  productId: DEMO_PRODUCT_ID,
  rating: 4.8,
  reviewCount: 200,
  features: [
    {
      title: "Full-grain leather",
      description:
        "Vegetable-tanned cowhide sourced from heritage tanneries. Develops a rich patina unique to you.",
    },
    {
      title: "Small-batch atelier",
      description:
        "Hand-cut, saddle-stitched, and edge-burnished by artisans. Batches of 50 — never mass-produced.",
    },
    {
      title: "Slim & functional",
      description:
        "6 card slots, 2 note compartments, and a coin pocket — all in a profile thin enough for any front pocket.",
    },
  ],
  socialProof: {
    metric: "4.8/5",
    metricLabel: "average rating from 200+ verified buyers",
    quotes: [
      {
        text: "The leather quality is incredible. Three months in and it's developing a gorgeous patina.",
        author: "Rohan K.",
        role: "Verified buyer",
      },
      {
        text: "Finally a wallet that's slim enough for my front pocket but holds everything I need. Beautifully made.",
        author: "Priya M.",
        role: "Verified buyer",
      },
    ],
  },
  formHeadline: "Complete your order",
  formDescription:
    "Free shipping on all orders above ₹2,000. 30-day hassle-free returns. Secure checkout.",
  trustBadges: [
    "Free shipping above ₹2,000",
    "30-day returns",
    "Secure checkout",
  ],
} as const;
