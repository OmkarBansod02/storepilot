import type {
  AuditCategory,
  AuditFinding,
  AuditIssue,
  FindingSeverity,
  PageSignals,
  RecommendedExperiment,
} from "@/features/audit/schemas/audit-result";

interface HeuristicIssueInput {
  id: string;
  title: string;
  severity: FindingSeverity;
  category: AuditCategory;
  description: string;
  conversionImpact: string;
}

export interface HeuristicAnalysis {
  summary: string;
  findings: AuditFinding[];
  issues: AuditIssue[];
  overallScore: number;
  recommendedExperiment: RecommendedExperiment;
}

const weakCtaLabels = new Set([
  "learn more",
  "submit",
  "click here",
  "read more",
  "more",
  "continue",
]);

const genericHeadlineWords = [
  "welcome",
  "solutions",
  "platform",
  "experience",
  "transform",
  "unlock",
  "future",
  "innovation",
  "simple",
  "better",
];

export function analyzePageHeuristics(signals: PageSignals): HeuristicAnalysis {
  const issues = detectHeuristicIssues(signals);
  const findings = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    severity: issue.severity,
    category: issue.category,
    description: issue.description,
  }));
  const overallScore = calculateScore(issues);

  return {
    summary: buildSummary(signals, issues, overallScore),
    findings,
    issues,
    overallScore,
    recommendedExperiment: buildRecommendedExperiment(signals, issues),
  };
}

function detectHeuristicIssues(signals: PageSignals): AuditIssue[] {
  const issues: HeuristicIssueInput[] = [];

  const headline = signals.mainHeading?.trim() ?? "";

  if (!headline) {
    issues.push({
      id: "headline-missing",
      title: "No clear primary headline detected",
      severity: "high",
      category: "headline",
      description:
        "The rendered page did not expose a visible H1. Visitors may not get a clear first answer to what the page offers.",
      conversionImpact:
        "A missing or hidden headline weakens first-impression clarity, especially for cold traffic deciding whether to keep reading.",
    });
  } else if (isWeakHeadline(headline)) {
    issues.push({
      id: "headline-weak",
      title: "Headline may be too generic",
      severity: "high",
      category: "headline",
      description: `The primary headline "${headline}" appears short, broad, or light on concrete customer value.`,
      conversionImpact:
        "Generic headlines force visitors to infer the benefit. That extra work often increases bounce before the CTA is considered.",
    });
  }

  if (signals.ctaLabels.length === 0) {
    issues.push({
      id: "cta-missing",
      title: "No strong CTA detected",
      severity: "high",
      category: "cta",
      description:
        "The page did not expose a visible action label that looks like a primary conversion CTA.",
      conversionImpact:
        "When the next step is unclear, motivated visitors can still stall because the page does not make the intended action obvious.",
    });
  } else if (hasWeakPrimaryCta(signals.ctaLabels)) {
    issues.push({
      id: "cta-weak",
      title: "Primary CTA language looks weak",
      severity: "medium",
      category: "cta",
      description: `Detected CTA labels include "${signals.ctaLabels.slice(0, 3).join('", "')}", which may not communicate a specific outcome.`,
      conversionImpact:
        "Low-specificity CTA copy tends to attract weaker intent and gives visitors less confidence about what will happen next.",
    });
  }

  if (signals.trustSignals.length === 0) {
    issues.push({
      id: "trust-missing",
      title: "No visible trust signals detected",
      severity: "medium",
      category: "trust",
      description:
        "The page text did not show obvious proof such as reviews, customer counts, security cues, case studies, or guarantees.",
      conversionImpact:
        "Trust cues reduce perceived risk near the decision point. Without them, visitors have fewer reasons to believe the promise.",
    });
  }

  if (signals.navLinkCount > 7 || signals.ctaLabels.length > 5) {
    issues.push({
      id: "competing-actions",
      title: "Too many competing actions",
      severity: "medium",
      category: "layout",
      description: `The page exposes ${signals.navLinkCount} navigation links and ${signals.ctaLabels.length} CTA-like labels.`,
      conversionImpact:
        "Extra choices split attention. Focused landing pages usually make one next action more visually and verbally dominant.",
    });
  }

  const aboveFoldActionCount =
    signals.aboveTheFold.linkCount + signals.aboveTheFold.buttonCount;

  if (signals.aboveTheFold.textLength > 1_800 || aboveFoldActionCount > 14) {
    issues.push({
      id: "above-fold-clutter",
      title: "Possible clutter above the fold",
      severity: "medium",
      category: "layout",
      description: `The first viewport contains roughly ${signals.aboveTheFold.textLength} text characters and ${aboveFoldActionCount} action/link elements.`,
      conversionImpact:
        "Dense first screens make the value proposition harder to scan and can bury the action path beneath too many competing elements.",
    });
  }

  if (signals.aboveTheFold.formFieldCount >= 4 || signals.formFieldCount >= 6) {
    issues.push({
      id: "early-form-friction",
      title: "Form may ask for too much too early",
      severity: signals.aboveTheFold.formFieldCount >= 4 ? "high" : "medium",
      category: "form",
      description: `The page includes ${signals.formFieldCount} visible form fields, with ${signals.aboveTheFold.formFieldCount} in the first viewport.`,
      conversionImpact:
        "Long forms create commitment before trust is established. Reducing early fields can increase starts and completions.",
    });
  }

  return issues;
}

function isWeakHeadline(headline: string): boolean {
  const normalized = headline.toLowerCase();
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  const hasSpecificNumber = /\d/.test(normalized);
  const hasCustomerLanguage = /\b(for|teams|founders|marketers|developers|customers|users)\b/.test(
    normalized,
  );
  const hasGenericWord = genericHeadlineWords.some((word) =>
    normalized.includes(word),
  );

  return (
    wordCount < 4 ||
    (hasGenericWord && !hasSpecificNumber && !hasCustomerLanguage)
  );
}

function hasWeakPrimaryCta(labels: string[]): boolean {
  const firstLabel = labels[0]?.trim().toLowerCase();

  if (!firstLabel) {
    return true;
  }

  return weakCtaLabels.has(firstLabel);
}

function calculateScore(issues: AuditIssue[]): number {
  const penalty = issues.reduce((total, issue) => {
    if (issue.severity === "high") {
      return total + 18;
    }

    if (issue.severity === "medium") {
      return total + 11;
    }

    return total + 6;
  }, 0);

  return Math.max(20, Math.min(95, 100 - penalty));
}

function buildSummary(
  signals: PageSignals,
  issues: AuditIssue[],
  overallScore: number,
): string {
  if (issues.length === 0) {
    return `This page shows a focused conversion structure with a ${overallScore}/100 deterministic score. The rendered page has a visible headline, CTA path, and at least one trust cue. The next best step is an incremental experiment around sharper proof or CTA framing.`;
  }

  const highCount = issues.filter((issue) => issue.severity === "high").length;
  const topIssue = issues[0];
  const ctaText =
    signals.ctaLabels.length > 0
      ? `Detected CTA labels include ${signals.ctaLabels.slice(0, 3).join(", ")}.`
      : "No strong CTA label was detected.";

  return `This page scores ${overallScore}/100 from deterministic conversion heuristics. ${highCount} high-priority issue${highCount === 1 ? "" : "s"} stood out, led by ${topIssue.title.toLowerCase()}. ${ctaText} The highest-leverage improvement is to clarify the first screen and make one conversion action more obvious.`;
}

function buildRecommendedExperiment(
  signals: PageSignals,
  issues: AuditIssue[],
): RecommendedExperiment {
  const topIssue = issues[0];

  if (!topIssue) {
    return {
      title: "Test a proof-led hero refinement",
      hypothesis:
        "Adding more specific proof near the primary CTA will increase confidence without changing the page structure.",
      expectedImpact: "+5-10% CTA engagement",
      changes: [
        "Add a quantified trust cue near the hero CTA",
        "Make the CTA label describe the visitor outcome",
        "Keep the existing page structure unchanged for a clean test",
      ],
      rationale:
        "The deterministic audit did not find major conversion blockers, so the safest experiment is a focused copy/proof improvement rather than a broad redesign.",
    };
  }

  if (topIssue.category === "headline") {
    return {
      title: "Test a specific value-led hero",
      hypothesis:
        "Replacing the generic first headline with a specific customer outcome will help visitors understand the page faster and continue toward the CTA.",
      expectedImpact: "+10-20% CTA engagement",
      changes: [
        "Rewrite the H1 around the specific customer outcome",
        "Add one short supporting line that explains who the page is for",
        "Place the primary CTA immediately after the value proposition",
      ],
      rationale:
        "The headline is the first conversion filter. If it does not quickly explain value, later sections have less chance to recover the visitor.",
    };
  }

  if (topIssue.category === "cta") {
    return {
      title: "Test a clearer primary CTA path",
      hypothesis:
        "Making one action visually and verbally dominant will reduce hesitation and increase click-through from the first screen.",
      expectedImpact: "+10-18% CTA clicks",
      changes: [
        "Use one primary CTA label that describes the next step",
        "Repeat that CTA near the hero and after the main proof section",
        "De-emphasize secondary links that compete with conversion",
      ],
      rationale:
        "CTA clarity matters most after intent is created. The page should make the next step obvious before visitors start scanning alternatives.",
    };
  }

  if (topIssue.category === "trust") {
    return {
      title: "Test trust proof near the conversion point",
      hypothesis:
        "Moving proof closer to the headline and CTA will reduce perceived risk and increase willingness to act.",
      expectedImpact: "+8-15% CTA engagement",
      changes: [
        "Add one quantified trust cue beside the primary CTA",
        "Place a short testimonial or customer count in the hero",
        "Keep the CTA and layout otherwise stable",
      ],
      rationale:
        "Trust signals work best when they appear near the moment of decision, not only after a visitor has already scrolled.",
    };
  }

  if (topIssue.category === "form") {
    return {
      title: "Test a lower-friction form entry",
      hypothesis:
        "Reducing early form fields will increase form starts and completions by asking for commitment later.",
      expectedImpact: "+10-25% form completion",
      changes: [
        "Limit the first form step to the minimum required fields",
        "Move optional questions after initial submission or to a second step",
        "Add a short privacy or no-spam reassurance near the form",
      ],
      rationale:
        "Long forms increase perceived effort before the page has earned enough trust. Reducing the first ask makes the conversion path feel easier.",
    };
  }

  return {
    title: "Test a more focused first screen",
    hypothesis:
      "Reducing competing navigation and above-fold clutter will help more visitors notice and act on the primary CTA.",
    expectedImpact: "+8-15% CTA engagement",
    changes: [
      `Reduce visible navigation from ${signals.navLinkCount} links toward the most important paths`,
      "Make one primary CTA visually dominant",
      "Move secondary information below the first screen",
    ],
    rationale:
      "The current first screen appears to split attention across too many elements. A more focused layout should improve scanning and action clarity.",
  };
}
