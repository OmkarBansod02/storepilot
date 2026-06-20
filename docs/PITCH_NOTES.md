# Pitch Notes

Talking points for a short founder-facing walkthrough of StorePilot. The goal
is to communicate, in under five minutes, what was built, why it was built
this way, and what the simplifications and next steps are.

This is a focused exploration of ecommerce product-page optimization, not a launched
product. Frame it as evidence of product and engineering judgment.

---

## One-line description

> StorePilot is the smallest believable version of an autonomous ecommerce
> optimization loop: observe, diagnose, generate, approve, test, deploy.

---

## Why this exists

- Product pages are a high-leverage surface for ecommerce teams, and most
  teams iterate on them too slowly.
- Existing experimentation tools either require a real growth team to drive
  them, or they hand the keys to an AI without enough guardrails.
- The interesting question is not "can AI rewrite a hero section" — it's
  "what does a small, trustworthy loop around that decision look like?"
- StorePilot is a working answer at MVP scale. One page, one funnel, one
  experiment, human approval, deterministic truth.

---

## What it does, in six beats

1. **Observe a demo product page.** An in-app tracker records product views,
   add-to-cart actions, checkout starts, purchases, revenue, and scroll depth
   into Postgres.
2. **Diagnose.** A small deterministic rule set turns aggregated metrics
   into one primary bottleneck with supporting signals and a confidence
   level.
3. **Generate.** A variant proposal is drafted from the diagnosis and the
   current baseline (AI when configured, deterministic fallback otherwise)
   and validated through a strict zod schema.
4. **Approve.** A human approves the variant. No experiment runs without
   approval.
5. **Test.** One running A/B experiment per page. Visitors are bucketed by
   hashing `experimentId + anonymousId`. Conversions are attributed by arm.
6. **Deploy.** Results are recomputed deterministically. A conclusive
   winner writes the variant content into the page baseline; the
   experiment is completed.

---

## The product principle that holds it together

> AI drafts wording. Deterministic code owns truth.

- Truth: validation, ingestion, aggregation, assignment, attribution,
  results, deploy.
- Wording: variant copy, rationale, framing.

Every AI output is parsed through zod before it is persisted. The full loop
works with no AI key — the deterministic fallback generator produces a
validated proposal mapped from the diagnosed bottleneck. AI is a quality
multiplier, not a load-bearing dependency.

---

## What is interesting about the engineering

- **Feature-first layout.** Each feature (`analytics`, `snippet`, `variants`,
  `experiments`, `demo`) owns its `components/`, `server/`,
  `schemas/`, and `lib/`. Route handlers stay thin.
- **Strict zod boundaries.** Request bodies, query params, AI outputs, and
  the deploy-time baseline rewrite are all parsed at the edge.
- **Single source of truth in Postgres.** Small Drizzle schema, JSONB only
  where structured payloads earn their keep.
- **Deterministic experiment runtime.** Hash-based bucketing, cookie
  pinning, server-side validation that the experiment is still running
  before persisting arm context, conversion rows written only when an
  event matches the experiment's primary conversion event.
- **Transactional deploy.** Result calculation, baseline rewrite, variant
  status update, and experiment completion happen inside a single DB
  transaction with conflict checks at the status update.
- **Honest fallbacks.** No silent AI failures: if the model is missing or
  the response is invalid, the fallback path runs and is reported back.

---

## What is intentionally simplified

Be upfront about scope. The shortcuts are deliberate and documented.

- One site, one page, one primary conversion event, one active experiment,
  one pending variant proposal.
- No authentication, organizations, or roles.
- Promotion uses deterministic Bayesian probability with minimum traffic and
  purchase floors. Raw conversion rates and lift remain supporting metrics.
- The "snippet" is an in-app React provider on the demo page, not a
  third-party `<script>` tag.
- Variant scope is hero copy, primary CTA label, and a small trust-proof
  row. No DOM rewriting or visual editor.
- Anonymous IDs live in browser local storage; there is no identity graph.

---

## What would come next

Roughly ordered by value.

1. **Real statistical rigor.** Confidence intervals, minimum sample size
   guards, and a clearer "not enough data" state.
2. **External snippet SDK.** A small standalone `<script>` so the loop
   works on any site without integrating React.
3. **Multi-tenant + auth.** Sites, pages, members, API keys, billing.
4. **Richer variants.** Iterative generation, side-by-side preview,
   edit-before-approve, structured rollback history.
5. **Deeper diagnosis.** Session-level paths, segment slicing, and
   AI-assisted hypotheses grounded in real cohorts.
6. **CMS integrations.** Push approved baselines back into the host CMS.
7. **Observability.** Structured logs, error tracking, and product
   analytics on StorePilot itself.

---

## Quick-fire Q&A

**Is this production-ready?**
No. It is an MVP-scale exploration. The loop is end-to-end, but several
pieces (statistics, auth, scale, external snippet) are intentionally out of
scope.

**Is this trying to be a full ecommerce platform?**
No. It is a small, human-approved loop around product-page optimization,
built to demonstrate product and engineering judgment without replacing the
storefront, CMS, analytics stack, or checkout.

**Why Bayesian probability?**
It gives the demo a stable, explainable decision rule without pretending raw
lift is enough. Promotion still waits for minimum traffic, minimum purchases,
and a 95% probability that one arm is best.

**Why is AI optional?**
Because product truth shouldn't depend on a third-party model being
available, performant, or correctly formatted. AI is a quality multiplier
on variant copy and rationale, not a load-bearing dependency.

**Why is the snippet not a third-party `<script>`?**
Scope. The demo page is bundled in the same Next.js app, so a React
provider is the cleanest way to wire it without inventing a second build
pipeline. Externalizing the snippet is on the next-steps list.

**Why one experiment at a time?**
The MVP is about showing the loop cleanly, not about being a generalized
experimentation framework. Multiple concurrent experiments add traffic
splitting and analysis complexity that would obscure the core story.

**What would you build next if you had a week?**
Real statistics with sample size guards, an external snippet SDK, and richer
variant editing. In that order.

---

## Suggested live walk

1. Open the repo and skim `README.md` — 30 seconds.
2. Open `/demo`, click through a session, point at the live event stream
   (or just refresh `/dashboard`).
3. Show the diagnosis card and explain the rule that produced it.
4. Generate a variant, point out the zod-validated proposal and the
   deterministic fallback note in the source.
5. Approve, then show `/experiments` with arm assignments updating.
6. Force a few conversions across arms, deploy the winner, refresh `/demo`
   to show the new baseline.
7. Close on the principle: AI drafts wording, deterministic code owns
   truth.
