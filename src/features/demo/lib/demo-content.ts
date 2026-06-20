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
  tagline: "Handcrafted leather goods",
  headline: "Premium Full-Grain\nLeather Wallet",
  subheadline:
    "Handmade in small batches from ethically sourced full-grain leather. Designed to age beautifully and last a lifetime.",
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
        "Premium cowhide that develops a rich patina over time, getting more beautiful with every use.",
    },
    {
      title: "Handmade craftsmanship",
      description:
        "Each wallet is hand-cut, hand-stitched, and inspected by artisans in small batches of 50.",
    },
    {
      title: "Slim & functional",
      description:
        "6 card slots, 2 note compartments, and a coin pocket — all in a slim profile that fits any pocket.",
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
        text: "Finally a wallet that's slim enough for my front pocket but holds everything I need.",
        author: "Priya M.",
        role: "Verified buyer",
      },
    ],
  },
  formHeadline: "Complete your order",
  formDescription:
    "Free shipping on orders above ₹2,000. 30-day hassle-free returns.",
  trustBadges: [
    "Free shipping above ₹2,000",
    "30-day returns",
    "Secure checkout",
  ],
} as const;
