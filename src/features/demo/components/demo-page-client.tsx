"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  DemoExperimentRuntime,
  DemoPageBaseline,
} from "@/features/demo/types";
import { assignExperimentArm } from "@/features/experiments/lib/assign-experiment-arm";
import type {
  ExperimentArm,
  ExperimentAssignment,
} from "@/features/experiments/types";
import {
  getOrCreateAnonymousId,
  replaceAnonymousId,
} from "@/features/snippet/client/anonymous-id";
import { TrackerProvider } from "@/features/snippet/client/tracker-provider";
import { useTracker } from "@/features/snippet/client/tracker-provider";
import { useScrollDepth } from "@/features/snippet/client/use-scroll-depth";
import { demoContent } from "@/features/demo/lib/demo-content";
import { DevArmBadge } from "./dev-arm-badge";
import { DemoFeatures } from "./demo-features";
import { DemoHero, type DemoHeroContent } from "./demo-hero";
import { DemoCheckout } from "./demo-checkout";
import { DemoSocialProof } from "./demo-social-proof";

type CheckoutStep = "idle" | "cart" | "checkout" | "complete";

function getAssignmentCookieName(experimentId: string): string {
  return `storepilot_exp_${experimentId}`;
}

function readAssignmentCookie(experimentId: string): ExperimentAssignment | null {
  const cookieName = `${getAssignmentCookieName(experimentId)}=`;
  const rawCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(cookieName));
  const rawArm = rawCookie?.slice(cookieName.length);

  if (rawArm !== "control" && rawArm !== "variant") return null;

  return { experimentId, variantArm: rawArm };
}

function writeAssignmentCookie(assignment: ExperimentAssignment): void {
  const maxAge = 60 * 60 * 24 * 30;
  document.cookie = `${getAssignmentCookieName(assignment.experimentId)}=${assignment.variantArm}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

function getForcedAssignment(
  experimentRuntime: DemoExperimentRuntime | null,
  forcedArm: ExperimentArm | null,
): ExperimentAssignment | null {
  if (!experimentRuntime || !forcedArm) return null;

  return {
    experimentId: experimentRuntime.experimentId,
    variantArm: forcedArm,
  };
}

function resolveAssignment(
  experimentRuntime: DemoExperimentRuntime,
  anonymousIdOverride?: string,
): ExperimentAssignment {
  if (!anonymousIdOverride) {
    const cookieAssignment = readAssignmentCookie(experimentRuntime.experimentId);
    if (cookieAssignment) return cookieAssignment;
  }

  const anonymousId = anonymousIdOverride ?? getOrCreateAnonymousId();
  const assignment = {
    experimentId: experimentRuntime.experimentId,
    variantArm: assignExperimentArm({
      experimentId: experimentRuntime.experimentId,
      anonymousId,
    }),
  };

  writeAssignmentCookie(assignment);

  return assignment;
}

function buildHeroContent(
  baseline: DemoPageBaseline,
  experimentRuntime: DemoExperimentRuntime | null,
  assignment: ExperimentAssignment | null,
): DemoHeroContent {
  if (!experimentRuntime || assignment?.variantArm !== "variant") {
    return {
      brand: baseline.brand,
      headline: baseline.headline,
      subheadline: baseline.subheadline,
      primaryCtaLabel: baseline.primaryCtaLabel,
      secondaryCtaLabel: baseline.secondaryCtaLabel,
      trustProofRow: baseline.trustProofRow,
    };
  }

  return {
    brand: baseline.brand,
    headline: experimentRuntime.variant.headline,
    subheadline: experimentRuntime.variant.subheadline,
    primaryCtaLabel: experimentRuntime.variant.primaryCtaLabel,
    secondaryCtaLabel: baseline.secondaryCtaLabel,
    trustProofRow: experimentRuntime.variant.trustProofRow,
  };
}

function useProductView() {
  const { track, ready } = useTracker();
  const fired = useRef(false);

  useEffect(() => {
    if (!ready || fired.current) return;
    fired.current = true;
    track("product_view", { product_id: demoContent.productId });
  }, [ready, track]);
}

function TrackedContent({
  heroContent,
}: {
  heroContent: DemoHeroContent;
}) {
  useProductView();
  useScrollDepth();

  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("idle");

  const handleAddToCart = useCallback(() => {
    setCheckoutStep((prev) => (prev === "idle" ? "cart" : prev));
  }, []);

  return (
    <>
      <DemoHero content={heroContent} onAddToCart={handleAddToCart} />
      <DemoFeatures />
      <DemoSocialProof />
      <DemoCheckout step={checkoutStep} onStepChange={setCheckoutStep} />
    </>
  );
}

interface DemoPageClientProps {
  pageId: string;
  baseline: DemoPageBaseline;
  experimentRuntime: DemoExperimentRuntime | null;
  forcedArm: ExperimentArm | null;
  freshSession: boolean;
}

export function DemoPageClient({
  pageId,
  baseline,
  experimentRuntime,
  forcedArm,
  freshSession,
}: DemoPageClientProps) {
  const forcedAssignment = getForcedAssignment(experimentRuntime, forcedArm);
  const [freshAnonymousId, setFreshAnonymousId] = useState<string | null>(null);
  const [resolvedAssignment, setResolvedAssignment] =
    useState<ExperimentAssignment | null>(null);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setResolvedAssignment(null);
      setFreshAnonymousId(freshSession ? replaceAnonymousId() : null);
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [freshSession]);

  useEffect(() => {
    if (!experimentRuntime || forcedAssignment) return;
    if (freshSession && !freshAnonymousId) return;

    const timerId = window.setTimeout(() => {
      setResolvedAssignment(
        resolveAssignment(experimentRuntime, freshAnonymousId ?? undefined),
      );
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [experimentRuntime, forcedAssignment, freshAnonymousId, freshSession]);

  const assignment =
    forcedAssignment ??
    (resolvedAssignment?.experimentId === experimentRuntime?.experimentId
      ? resolvedAssignment
      : null);

  const heroContent = useMemo(
    () => buildHeroContent(baseline, experimentRuntime, assignment),
    [assignment, baseline, experimentRuntime],
  );

  const experimentContext = experimentRuntime ? assignment : null;
  const isForcedAssignment = Boolean(
    experimentRuntime &&
      forcedArm &&
      assignment?.experimentId === experimentRuntime.experimentId &&
      assignment.variantArm === forcedArm,
  );

  if (experimentRuntime && !assignment) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center text-sm text-muted-foreground">
        Preparing experiment...
      </div>
    );
  }

  const trackingAnonymousId = freshSession ? freshAnonymousId : null;

  if (freshSession && !trackingAnonymousId) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center text-sm text-muted-foreground">
        Preparing test session...
      </div>
    );
  }

  return (
    <TrackerProvider
      key={trackingAnonymousId ?? "stored-anonymous-id"}
      pageId={pageId}
      experimentContext={experimentContext}
      anonymousId={trackingAnonymousId ?? undefined}
    >
      <TrackedContent heroContent={heroContent} />
      {experimentRuntime && assignment && (
        <DevArmBadge arm={assignment.variantArm} forced={isForcedAssignment} />
      )}
    </TrackerProvider>
  );
}
