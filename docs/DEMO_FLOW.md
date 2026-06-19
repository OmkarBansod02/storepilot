# Demo Flow

A step-by-step walkthrough of the full StorePilot loop on a local machine. The
goal is for someone unfamiliar with the project to start from a clean state
and exercise every stage — audit, observe, diagnose, generate, approve, test,
deploy — in roughly five to ten minutes.

This document assumes you have already followed the **Running locally**
section of [`README.md`](../README.md) (env vars set, migrations applied,
dev server running).

---

## 0. Reset to a clean state

```bash
npm run db:reset-demo
```

This restores the demo `sites` and `pages` rows, resets
`pages.baseline_content` to the bundled default, and clears prior
conversions, events, sessions, experiments, and variants for the demo page.
It refuses to run when `NODE_ENV=production`.

You should now have:

- one demo site + page
- the default baseline copy on `/demo`
- no sessions, events, variants, experiments, or conversions

---

## 1. Audit a URL

1. Open `http://localhost:3000/audit`.
2. Paste any public URL (a product page works best).
3. Submit.

What happens behind the scenes:

- The URL is validated by zod (`features/audit/schemas/audit-input.ts`).
- `POST /api/audit` calls `createAudit` in
  `features/audit/server/create-audit.ts`.
- `capturePageForAudit` launches Playwright (Chromium), navigates to the
  page, captures a screenshot, and extracts structured signals (title,
  headings, CTA labels, form presence, trust hints, etc.).
- `analyzePageHeuristics` runs deterministic rules over those signals to
  produce findings, an overall score, an issue list, and one recommended
  experiment.
- The full audit is validated against `auditResultSchema` and returned to
  the UI.

What you should see:

- A screenshot of the captured page.
- A short page summary and key signals.
- A prioritized list of findings with severity.
- One recommended experiment and rationale.

> Note: audits are computed inline against the request, so first-run cold
> starts can take a few seconds while Chromium boots.

---

## 2. Generate traffic on the demo page

The audit surface is the cold-start hook. The richer loop runs against the
bundled instrumented product page at `/demo`.

1. Open `http://localhost:3000/demo` in a regular browser window.
2. Scroll to the bottom of the page.
3. Click the primary CTA in the hero.
4. Click the primary CTA button in the header.
5. Fill in the offer form (any values) and submit.
6. Open `http://localhost:3000/demo` in an incognito window and repeat. In
   development you can also reuse the same window and append
   `?freshSession=1` to force a new anonymous ID.
7. Repeat a few more times. Aim for at least ten sessions, with at least
   five completing the form and a few that bounce earlier.

What happens behind the scenes:

- `TrackerProvider` in `features/snippet/client/tracker-provider.tsx`
  initializes a session on mount.
- An anonymous ID is read from (or written to) local storage.
- `POST /api/sessions` upserts a session row in Postgres tied to the demo
  page.
- Page views, scroll depth milestones (`25 / 50 / 75 / 100`), CTA clicks,
  form starts, and form submits are sent to `POST /api/events`, validated
  by zod, and stored in `events` with a typed payload.

---

## 3. Inspect aggregated metrics + diagnosis

1. Open `http://localhost:3000/dashboard`.

What you should see:

- Total sessions and total page views.
- Unique-session CTA click-through rate, form start rate, and form submit
  rate.
- A scroll depth summary (average max depth, highest depth reached,
  sessions with any scroll event).
- A diagnosis card with one **primary bottleneck**, supporting signals, a
  confidence level, and a recommended experiment.

Everything on this page is computed deterministically from the persisted
sessions and events:

- Aggregation lives in
  `features/analytics/server/get-dashboard-metrics.ts`.
- The diagnosis rule set lives in
  `features/analytics/lib/diagnose-dashboard-metrics.ts`. Examples:
  - Fewer than 5 sessions or fewer than 10 page views → `not_enough_data`.
  - Healthy form starts but weak submits → `form_friction`.
  - Low scroll depth + low CTA click-through → `weak_above_the_fold_interest`.
  - Low CTA click-through alone → `low_cta_engagement`.
  - Good scroll depth but weak submits → `good_interest_weak_conversion`.
  - Otherwise → `healthy_funnel`.

If the dashboard says `not_enough_data`, drive more sessions through
`/demo` and refresh.

---

## 4. Generate and approve a variant

1. Still on `/dashboard`, click **Generate variant** (or equivalent CTA in
   the variant proposal section).
2. Review the proposed variant: new headline, subheadline, primary CTA
   label, trust-proof row, target area, and expected impact.
3. Approve it.

What happens behind the scenes:

- `POST /api/variants` calls
  `features/variants/server/generate-variant-proposal.ts`.
- The server reads the current diagnosis. If diagnosis is not ready,
  generation is rejected.
- If `OPENAI_API_KEY` is set, `generate-variant-with-ai.ts` drafts the
  variant; otherwise a deterministic fallback maps the diagnosed
  bottleneck to a structured proposal.
- Either way, the output is validated through the variant proposal zod
  schema before persistence.
- The variant is saved with `status = 'pending_approval'` and
  `source = 'ai' | 'deterministic_fallback'`.
- Approving the variant transitions it to `approved` and triggers
  experiment creation (next step).

---

## 5. Run an A/B test

Approving the variant creates one running experiment.

1. Open `http://localhost:3000/experiments`.

What you should see:

- A summary of the running experiment (page, primary conversion event,
  start time).
- Live arm assignments and conversion counts as new sessions arrive.

What happens behind the scenes:

- `POST /api/experiments` calls
  `features/experiments/server/create-experiment.ts`.
- The server finds the latest `pending_approval` variant, rejects the
  request if another experiment is already running on the page, marks the
  variant `approved`, creates one `running` experiment, and stamps
  `started_at`.
- On `/demo`, runtime assignment lives in
  `features/demo/server/get-demo-experiment-runtime.ts` and the client
  tracker. Buckets are computed by hashing `experimentId + anonymousId`
  into 0–99; below 50 renders `control`, 50 and above renders `variant`.
- The assignment is also written to a short browser cookie so a returning
  visitor stays in the same arm.
- New sessions store their `experiment_id` and `experiment_arm` server-side
  (only if the experiment exists, belongs to the same page, and is
  `running`).
- When a tracked event matches the experiment's primary conversion event,
  a row is inserted into `conversions` with the experiment ID, session ID,
  page ID, arm, and event name.

### Driving differentiated traffic

To produce a meaningful comparison, run more sessions through `/demo`. In
development you can use:

- `?arm=control` — force the control arm for the current page load.
- `?arm=variant` — force the variant arm for the current page load.
- `?freshSession=1` — clear the stored anonymous ID before assigning,
  giving you a brand-new session.

A `DevArmBadge` (visible only in development) shows which arm is currently
rendering.

Aim for roughly equal sessions per arm and at least a handful of
conversions on each side. The deterministic winner rule needs both arms to
have sessions and unequal rates to recommend a winner.

---

## 6. Deploy the winner

1. On `/experiments`, review the computed results: assigned sessions per
   arm, converted sessions per arm, conversion rate per arm, absolute lift,
   and relative lift percentage.
2. Read the recommended winner.
3. If the result is conclusive, click **Deploy winner**.

What happens behind the scenes:

- `POST /api/experiments/[experimentId]/deploy` calls
  `features/experiments/server/deploy-experiment-winner.ts` inside a
  database transaction.
- The server reloads the experiment, the linked variant, and the page.
- Sessions are counted distinctly by arm; conversions are counted
  distinctly by arm, filtered to the experiment's primary conversion event.
- `calculateExperimentResults` derives per-arm conversion rates, absolute
  lift, relative lift, and a recommended winner:
  - either arm with `0` sessions → `inconclusive`
  - equal rates → `inconclusive`
  - higher variant rate → `variant`
  - higher control rate → `control`
- `inconclusive` results are rejected at the API boundary (HTTP 409).
- A `control` winner completes the experiment with no baseline change.
- A `variant` winner writes the variant's headline, subheadline, primary
  CTA label, and trust-proof row into `pages.baseline_content`, marks the
  variant `deployed`, and completes the experiment.

After deploy, refresh `/demo`. The page now renders the new baseline copy
even without an active experiment.

---

## 7. Resetting between runs

To run the full demo again from scratch:

```bash
npm run db:reset-demo
```

The script preserves the demo `sites` and `pages` rows (and their IDs) so
existing browser anonymous IDs continue to behave sensibly, but clears every
session, event, variant, experiment, and conversion linked to the demo page
and restores the default baseline content.

---

## Troubleshooting

- **Audit hangs or fails on first run.** Make sure `npx playwright install
  chromium` has run. The audit route uses the Node.js runtime
  (`export const runtime = "nodejs"`).
- **Dashboard shows `not_enough_data`.** Drive at least 5 sessions and 10
  page views through `/demo`.
- **Variant generation is rejected.** The server requires a `ready`
  diagnosis. If you see "not enough data", generate more traffic first.
- **"An experiment is already running."** Deploy the current winner or wait
  for it to complete. The MVP allows only one running experiment per page.
- **Deploy is rejected as inconclusive.** Both arms need sessions and
  unequal conversion rates. Force more traffic into each arm using
  `?arm=...&freshSession=1` and submit the form on the variant arm.
