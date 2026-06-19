# Liftpilot Schema

This schema is intentionally small. It models the MVP loop without turning
Liftpilot into a generic analytics or experimentation platform.

## Core Tables

- `sites`: the tracked website container. Stores a display name, canonical URL,
  and timestamps.
- `pages`: the landing page being optimized. Stores the owning site, page URL,
  optional title, primary conversion event, and the current persisted baseline
  content used by the demo page.
- `audits`: a URL audit run for a page. Stores audit status, screenshot URL,
  extracted page signals, deterministic or AI-assisted findings, and one
  recommended experiment.
- `sessions`: an anonymous visitor session for a page. Stores anonymous ID,
  optional experiment context, user agent, referrer, and first/last seen times.
- `events`: validated snippet events. Stores session, page, event type, a small
  typed payload JSON object, and occurrence time.
- `variants`: one generated variant proposal. Stores page, optional source
  audit, approval status, structured variant content, and rationale. Phase 4
  stores the proposal as one pending approval candidate, not as a generic
  multi-variant framework.
- `experiments`: one A/B test for a page and variant. Stores status, primary
  conversion event, and lifecycle timestamps.
- `conversions`: conversion attribution for an experiment arm. Stores
  experiment, session, page, arm, event name, and occurrence time.

## Enums

- `audit_status`: `queued`, `processing`, `completed`, `failed`
- `event_type`: `page_view`, `scroll_depth`, `cta_click`, `form_start`,
  `form_submit`
- `variant_status`: `draft`, `pending_approval`, `approved`, `rejected`,
  `deployed`
- `experiment_status`: `draft`, `running`, `paused`, `completed`
- `experiment_arm`: `control`, `variant`

## Phase 0 Choices

- Drizzle table definitions live in `src/lib/db/schema.ts` so migrations have
  one obvious source of truth.
- Feature request contracts live in `src/features/*/schemas` and use zod at
  route boundaries.
- JSONB is used for page signals, audit findings, event payloads, and variant
  content until Phase 1 proves which fields need normalization.
- No repository layer, service container, workflow engine, or analytics
  framework exists in Phase 0.

## Phase 2 Tracking Contract

Anonymous sessions are reused by `page_id` and `anonymous_id`. The browser owns
the anonymous ID; the server owns the persisted session row.

Supported event payloads:

- `page_view`: `{ "path"?: string, "title"?: string }`
- `scroll_depth`: `{ "depth": 25 | 50 | 75 | 100 }`
- `cta_click`: `{ "label"?: string, "location"?: string }`
- `form_start`: `{ "formId"?: string, "field"?: string }`
- `form_submit`: `{ "formId"?: string }`

Dashboard metrics are computed directly from `sessions` and `events`:

- total sessions
- total page views
- raw CTA click events and unique-session click-through rate
- raw form start events and unique-session form start rate
- raw form submit events and unique-session form submit rate

Dashboard conversion rates use unique sessions:

- CTA click-through rate: sessions with at least one `cta_click` / total
  sessions
- form start rate: sessions with at least one `form_start` / total sessions
- form submit rate: sessions with at least one `form_submit` / total sessions

## Phase 3 Diagnosis Contract

Diagnosis is computed from dashboard metrics at read time. It is not persisted
in a separate table in Phase 3.

The dashboard metrics response now includes:

- `scrollDepth.totalScrollEvents`
- `scrollDepth.sessionsWithScrollDepth`
- `scrollDepth.averageMaxScrollDepth`
- `scrollDepth.highestScrollDepth`
- `diagnosis.status`: `not_enough_data` or `ready`
- `diagnosis.primaryBottleneck`: `insufficient_data`,
  `low_cta_engagement`, `weak_above_the_fold_interest`, `form_friction`,
  `good_interest_weak_conversion`, or `healthy_funnel`
- `diagnosis.title`
- `diagnosis.summary`
- `diagnosis.confidence`: `low`, `medium`, or `high`
- `diagnosis.supportingSignals`: label, value, and description objects
- `diagnosis.recommendedExperiment`: title, description, target area, and
  expected impact
- `diagnosis.createdAt`

Diagnosis rules are deterministic and intentionally small:

- fewer than 5 sessions or fewer than 10 page views means more data is needed
- healthy form starts with weak submits indicates form friction
- low average scroll depth plus low CTA click-through indicates weak
  above-the-fold interest
- low CTA click-through alone indicates CTA engagement is the bottleneck
- good scroll depth with weak submits indicates interest is present but
  conversion is weak
- otherwise the funnel is treated as healthy enough for an incremental test

## Phase 4 Variant Proposal Contract

Variant generation reads the current dashboard diagnosis at request time and
uses the structured demo page baseline. The backend owns validation,
persistence, and approval status; AI may only draft the proposal content.

`POST /api/variants` accepts:

- `pageId`: UUID for the page to optimize

The backend rejects generation when the diagnosis is not ready. A saved variant
always starts with:

- `status`: `pending_approval`
- `rationale`: the validated proposal rationale
- `content.headline`
- `content.subheadline`
- `content.primaryCtaLabel`
- `content.trustProofRow`: 1 to 4 proof snippets
- `content.targetArea`: `hero`, `primary_cta`, `trust_proof`, or
  `signup_form`
- `content.expectedImpact`
- `content.sourceDiagnosis.primaryBottleneck`
- `content.sourceDiagnosis.title`
- `content.sourceDiagnosis.recommendedExperimentTitle`
- `content.source`: `ai` or `deterministic_fallback`

`GET /api/variants?pageId=...` returns only the latest
`pending_approval` variant for the page. This keeps the UI focused on one
current proposal even if older pending rows exist.

If no AI integration is configured, Phase 4 uses a deterministic fallback
generator mapped from the known diagnosis bottlenecks. Fallback output is still
validated through the same zod proposal schema before persistence.

## Phase 5 Experiment Runtime Contract

Approving a variant creates the first narrow A/B runtime for the demo page.
No database shape changes were needed because Phase 0 already included
experiment context on sessions and a conversion attribution table.

`POST /api/experiments` accepts:

- `pageId`: UUID for the demo page

The backend then:

- finds the latest `pending_approval` variant for that page
- rejects the request if a `running` experiment already exists for the page
- marks the variant as `approved`
- creates one `running` experiment using the page primary conversion event
- sets `started_at`

Runtime assignment is deterministic and intentionally small:

- supported arms are `control` and `variant`
- the browser keeps a stable anonymous ID in local storage
- the demo runtime hashes `experimentId + anonymousId`
- buckets below 50 render `control`; buckets 50 and above render `variant`
- the selected arm is also stored in a short browser cookie for reuse

Session creation now accepts optional experiment context:

- `experimentId`
- `variantArm`: `control` or `variant`

The server only persists that context when the experiment exists, belongs to
the same page, and is currently `running`.

Tracked events may include experiment context in their stored payload. Events
remain linked to sessions, and sessions store the canonical experiment arm.
When a tracked event matches the experiment primary conversion event, the
server inserts a conversion row with:

- `experiment_id`
- `session_id`
- `page_id`
- `arm`
- `event_name`

Phase 5 intentionally did not include winner deployment, advanced statistics,
multi-page experiments, multiple active experiments, or a generalized
experimentation framework.

## Phase 6 Experiment Results And Deployment Contract

Phase 6 adds deterministic result calculation and manual winner deployment.
The database remains intentionally small: `pages.baseline_content` stores the
current demo baseline, and `variant_status` includes `deployed` for the
promoted variant state.

Experiment results are computed from persisted attribution records:

- sessions: distinct `sessions.id` grouped by `experiment_id` and
  `experiment_arm`
- conversions: distinct `conversions.session_id` grouped by `experiment_id`,
  `arm`, and the experiment primary conversion event
- conversion rate: converted sessions / assigned sessions, or `0` when the arm
  has no sessions
- absolute lift: variant conversion rate - control conversion rate
- relative lift percentage: absolute lift / control conversion rate, or `null`
  when the control rate is `0`

Winner recommendation is deterministic:

- if either arm has `0` sessions, the result is `inconclusive`
- if rates are equal, the result is `inconclusive`
- if the variant rate is higher, the recommended winner is `variant`
- if the control rate is higher, the recommended winner is `control`

`POST /api/experiments/[experimentId]/deploy` performs the manual deployment
transition. The backend:

- requires the experiment to be `running`
- recomputes results at deploy time
- rejects deployment when the recommendation is `inconclusive`
- completes the experiment for a control winner without changing baseline
  content
- for a variant winner, writes the variant hero/CTA content into
  `pages.baseline_content`, marks the variant as `deployed`, and completes the
  experiment

Phase 6 intentionally does not include confidence intervals, Bayesian testing,
automatic deployment, rollback history, CMS integrations, multiple active
experiments, or a generalized experimentation framework.

## Local Demo Reset

`npm run db:reset-demo` resets local demo state without dropping tables or
touching migrations. It refuses to run when `NODE_ENV=production`.

The command preserves or recreates the demo `sites` and `pages` rows, restores
the demo page `baseline_content` to the default baseline, and deletes demo page
rows from `conversions`, `events`, `sessions`, `experiments`, and `variants`.
