export const demoContent = {
  brand: "Acme Launch",
  tagline: "Ship faster. Convert better.",
  headline: "The launch platform that\ngrows with your product",
  subheadline:
    "Acme Launch helps early-stage teams ship landing pages, collect real user signal, and iterate toward higher conversion — without a full growth team.",
  ctaLabel: "Start free trial",
  secondaryCta: "See how it works",
  features: [
    {
      title: "Launch in minutes",
      description:
        "Go from idea to live page with pre-built templates and smart defaults. No designer required.",
    },
    {
      title: "Real-time analytics",
      description:
        "See who's visiting, where they drop off, and which copy resonates — all in one clean dashboard.",
    },
    {
      title: "Built-in A/B testing",
      description:
        "Test headlines, CTAs, and layouts with one click. No third-party tools or complex setup.",
    },
  ],
  socialProof: {
    metric: "2,400+",
    metricLabel: "teams launched",
    quotes: [
      {
        text: "We doubled our signup rate in two weeks.",
        author: "Sarah K.",
        role: "Head of Growth, Relay",
      },
      {
        text: "Finally, a tool that doesn't require a full-time analyst.",
        author: "Marcus T.",
        role: "Founder, Onward",
      },
    ],
  },
  formHeadline: "Get early access",
  formDescription:
    "Join the waitlist and be the first to try the next version of Acme Launch.",
} as const;
