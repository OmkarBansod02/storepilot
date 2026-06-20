# StorePilot

StorePilot is an autonomous ecommerce optimization engine. It tracks storefront funnel events, runs product-page variants, measures conversion/revenue, and promotes winning variants.

StorePilot is a Next.js project that walks a single storefront page through one
complete optimization loop:

**observe → diagnose → generate → approve → test → deploy**

It is not a production analytics platform, a generalized experimentation
framework, or a no-code storefront editor. It is the smallest believable
version of that loop, built to demonstrate clean product thinking and clean
full-stack execution.

---

## What StorePilot does

1. **Observe a demo product page.** A bundled demo product page is wired up to
   a lightweight in-app tracker. Product views, add-to-cart actions, checkout
   starts, purchases, revenue, and scroll depth are recorded into Postgres.
2. **Diagnose the funnel.** A small deterministic rule set turns aggregated
   metrics into one primary bottleneck (e.g. weak above-the-fold interest,
   form friction, low CTA engagement) with supporting signals and a confidence
   level.
3. **Generate one variant.** Given the current diagnosis and the persisted
   baseline content, StorePilot drafts one improved product-page proposal. If
   `OPENAI_API_KEY` is configured the draft is AI-generated and validated
   against a strict zod schema; otherwise a deterministic fallback produces a
   validated proposal mapped from the known bottleneck.
4. **Approve and test.** A human approves the variant. Approval creates one
   running A/B experiment. The demo page bucket-assigns visitors by hashing
   `experimentId + anonymousId`; the assignment is also written to a short
   browser cookie. Conversions are attributed by arm.
5. **Deploy the winner.** Results are recomputed deterministically at deploy
   time. If the recommendation is conclusive, the winning variant content is
   written back into the page baseline and the experiment is completed.

Scope is deliberately small: one storefront, one product page, one primary
conversion event, one active experiment, one pending variant proposal.

---

## Why this exists

The goal is to show, end-to-end, what a believable ecommerce optimization loop
looks like when:

- the product surface is narrow,
- AI is used only where it adds real value,
- and deterministic logic owns anything that affects truth (events, metrics,
  assignment, attribution, deploys).

StorePilot is a portfolio-style project, not a product launch. Read it as
evidence of how a small, sharp MVP can be structured around a real product
loop rather than as a finished commercial offering.

---

## Tech stack

- **App:** Next.js 16 (App Router), React 19, TypeScript (strict)
- **Styling:** Tailwind CSS v4, shadcn/ui primitives, Radix UI
- **Database:** Postgres + Drizzle ORM
- **Validation:** zod at every request and AI-output boundary
- **AI (optional):** OpenAI for variant drafting; deterministic fallback when
  no key is configured

---

## Repository layout

```text
src/
  app/                       Next.js App Router routes
    (app)/                   App shell (dashboard, experiments)
    demo/                    The instrumented demo product page
    api/                     Thin route handlers (events, sessions,
                             variants, experiments)
  components/ui/             Shared shadcn-style primitives
  features/
    analytics/               Event ingestion, metrics, diagnosis rules
    snippet/                 In-app tracker (client) + session ingestion
    variants/                Variant proposal generation (AI + fallback)
    experiments/             Assignment, results, deploy
    demo/                    Demo page baseline and runtime helpers
  lib/
    db/                      Drizzle schema and connection
    ai/                      OpenAI client wrapper
    validations/             Shared request validation helpers
drizzle/                     SQL migrations
scripts/reset-demo.ts        Local demo state reset
docs/                        Schema, demo flow, architecture overview, pitch
```

Each feature owns its own `components/`, `server/`, `schemas/`, `lib/`, and
`types.ts`. Route handlers stay thin and delegate to feature server functions.
See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for full guidance and
[`docs/ARCHITECTURE_OVERVIEW.md`](./docs/ARCHITECTURE_OVERVIEW.md) for the
short version.

---

## Deterministic vs AI

A core constraint of this project is keeping AI out of anything that affects
product truth.

| Concern                       | Deterministic | AI        |
|-------------------------------|---------------|-----------|
| Event ingestion / validation  | yes           | no        |
| Metric aggregation            | yes           | no        |
| Diagnosis rules               | yes           | no        |
| Experiment assignment         | yes           | no        |
| Conversion attribution        | yes           | no        |
| Result calculation / winner   | yes           | no        |
| Deploy state transitions      | yes           | no        |
| Variant copy drafting         | optional      | preferred |
| Findings / rationale wording  | optional      | optional  |

Every AI output is parsed through a strict zod schema before it is persisted
or rendered. When no `OPENAI_API_KEY` is set, the deterministic fallback
generator produces a validated proposal mapped from the diagnosed bottleneck.

---

## Database overview

The schema is intentionally small. See [`docs/SCHEMA.md`](./docs/SCHEMA.md)
for the full contract.

- `sites`, `pages` — the tracked storefront and product page; `pages.baseline_content`
  stores the live demo baseline.
- `sessions`, `events` — anonymous sessions and validated snippet events with
  typed payloads.
- `variants` — one pending variant proposal at a time, validated content +
  rationale + source diagnosis snapshot.
- `experiments` — one A/B test per page, with status, primary conversion
  event, and lifecycle timestamps.
- `conversions` — attributed conversions per experiment, session, and arm.

Enums keep event, variant, experiment, and assignment state transitions
explicit.

---

## Running locally

### Prerequisites

- Node.js 20+
- Docker Desktop or Docker Engine for local Postgres
- npm

### 1. Install

```bash
npm install
```

### 2. Start local Postgres

```bash
docker compose up -d
```

This starts a local Postgres 16 database named `storepilot` on
`localhost:5432`.

### 3. Configure environment

Copy `.env.example` to `.env.local` and fill in the values.

```bash
cp .env.example .env.local
```

| Variable         | Required | Notes                                              |
|------------------|----------|----------------------------------------------------|
| `DATABASE_URL`   | yes      | Postgres connection string                         |
| `OPENAI_API_KEY` | no       | If unset, variant generation uses the fallback     |

For local development, `.env.example` points at the Docker database:
`postgresql://storepilot:storepilot@localhost:5432/storepilot`.

### 4. Push the database schema

```bash
npm run db:push
```

### 5. Seed and reset demo state

```bash
npm run db:reset-demo
```

This script preserves or recreates the demo `sites` and `pages` rows, restores
the default baseline content, and clears any prior conversions, events,
sessions, experiments, and variants for the demo page. It refuses to run when
`NODE_ENV=production` or when `DATABASE_URL` points at a non-local host.

### 6. Start the dev server

```bash
npm run dev
```

Then open:

- `http://localhost:3000` — landing
- `http://localhost:3000/demo` — the instrumented demo product page
- `http://localhost:3000/dashboard` — metrics + diagnosis + variant proposal
- `http://localhost:3000/experiments` — running experiment + results + deploy

---

## Testing the demo flow

A scripted walkthrough lives in
[`docs/DEMO_FLOW.md`](./docs/DEMO_FLOW.md). The short version:

1. Run `npm run db:reset-demo` to start from a clean baseline.
2. Visit `/demo` in a few browser sessions (incognito works well) and
   interact: view the product, add it to cart, start checkout, and purchase.
3. Open `/dashboard` to see aggregated metrics and the deterministic
   diagnosis card.
4. From the dashboard, generate a variant proposal and approve it.
5. Visit `/demo` again — you will now be bucketed into `control` or
   `variant`. In development you can force an arm with `?arm=variant` or
   start a fresh anonymous session with `?freshSession=1`.
6. Drive a few more conversions across both arms.
7. Open `/experiments` to see raw lift and Bayesian confidence. Once the 95%
   gate clears, promote the variant or retain control to complete the
   experiment.

---

## What is intentionally simplified

This MVP is sharp on the loop and loose on everything around it.

- One site, one page, one primary conversion event, one active experiment.
- No authentication, organizations, or roles.
- Promotion uses a deterministic Bayesian probability calculation with minimum
  traffic and purchase floors; raw conversion rates and lift remain supporting
  metrics.
- Anonymous IDs live in browser local storage; there is no identity graph.
- Variant scope is hero copy, primary CTA label, and a small trust-proof row.
  No DOM rewriting or visual editor.
- The "snippet" is an in-app React provider on the demo page rather than a
  third-party `<script>` tag.

---

## What would come next in a production version

In order of likely value:

- **Real statistical rigor.** Confidence intervals, minimum sample size
  guards, and a clear "not enough data" state instead of a binary winner
  rule.
- **External snippet.** A small standalone `<script>` SDK so any storefront can
  install StorePilot without integrating React.
- **Multi-tenant + auth.** Sites, pages, members, API keys, billing.
- **Richer variants.** Iterative variant generation, side-by-side preview,
  edit-before-approve, and structured rollback history.
- **Deeper diagnosis.** Session-level paths, segment slicing, and AI-assisted
  hypotheses grounded in real cohorts.
- **CMS integrations.** Push approved baselines into the host CMS instead of
  storing them in `pages.baseline_content`.
- **Observability.** Structured logs, error tracking, and product analytics
  on StorePilot itself.

---

## Project documents

- [`PRD.md`](./PRD.md) — product requirements and scope
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — full engineering guide
- [`AGENTS.md`](./AGENTS.md) — working rules for coding agents
- [`docs/SCHEMA.md`](./docs/SCHEMA.md) — database contract
- [`docs/ARCHITECTURE_OVERVIEW.md`](./docs/ARCHITECTURE_OVERVIEW.md) — short
  architecture summary
- [`docs/DEMO_FLOW.md`](./docs/DEMO_FLOW.md) — step-by-step demo walkthrough
- [`docs/PITCH_NOTES.md`](./docs/PITCH_NOTES.md) — talking points for a short
  founder-facing demo

---

## Status

StorePilot is a focused ecommerce optimization MVP, not a production-ready
product. The loop is end-to-end, the code is meant to be readable, and the
simplifications are intentional and documented.
