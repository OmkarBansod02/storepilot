import { demoContent } from "@/features/demo/lib/demo-content";
import type { DemoPageBaseline } from "@/features/demo/types";

export function getDefaultDemoPageBaseline(): DemoPageBaseline {
  return {
    brand: demoContent.brand,
    headline: demoContent.headline.replace(/\s+/g, " ").trim(),
    subheadline: demoContent.subheadline,
    primaryCtaLabel: demoContent.ctaLabel,
    secondaryCtaLabel: demoContent.secondaryCta,
    trustProofRow: [
      `${demoContent.socialProof.metric} ${demoContent.socialProof.metricLabel}`,
      demoContent.socialProof.quotes[0].text,
      demoContent.socialProof.quotes[1].text,
    ],
    formHeadline: demoContent.formHeadline,
    formDescription: demoContent.formDescription,
  };
}
