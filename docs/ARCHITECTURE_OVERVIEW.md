# Architecture Overview

A short, founder-friendly view of how StorePilot is put together. For the full
engineering guide, see [`ARCHITECTURE.md`](../ARCHITECTURE.md). For the
database contract, see [`SCHEMA.md`](./SCHEMA.md).

---

## Shape of the system

StorePilot is a single Next.js (App Router) application backed by Postgres.

- The frontend renders the audit, dashboard, experiment, and demo product-page
  surfaces.
- API route handlers are thin: validate input, call a feature server
  function, return a typed result.
- Each feature owns its own slice (`components/`, `server/`, `schemas/`,
  `lib/`, `types.ts`).
- Postgres is the single source of truth. Drizzle owns the schema and
  queries.
- Optional AI calls go through a single OpenAI client wrapper and are
  always validated through zod before they touch product state.

There is no background job system, message bus, repository layer, plugin
architecture, or generic workflow engine. The app is intentionally small
and traceable.

---

## Tech stack

- **Next.js 16** (App Router, React 19, server components by default)
- **TypeScript** strict mode
- **Tailwind CSS v4** and **shadcn/ui** primitives over **Radix UI**
- **Postgres** via **Drizzle ORM**
- **zod** at every request boundary and AI output boundary
- **Playwright** (Chromium) for URL audit capture
- **OpenAI** as an optional variant drafting backend

---

## Folder model

```text
src/
  app/
    (app)/        App shell: /audit, /dashboard, /experiments
    demo/         Instrumented demo product page
    api/          Route handlers (thin)
  components/
    ui/           Shared shadcn-style primitives
    layout/       Shared layout shells
  features/
    audit/        URL audit
    analytics/    Event ingestion, metrics, diagnosis
    snippet/      In-app tracker (client) + session ingestion
    variants/     Variant proposal (AI + fallback)
    experiments/  Assignment, results, deploy
    demo/         Demo page baseline and runtime helpers
  lib/
    db/           Drizzle schema and connection
    ai/           OpenAI client wrapper
    validations/  Shared request validation helpers
```

Rule of thumb:

- If logic affects one feature, it lives inside that feature.
- If it is truly shared infrastructure, it lives in `lib/`.
- `app/` only does composition.

---

## Request lifecycle

A typical write request flows like this:

1. The client calls a route handler in `src/app/api/.../route.ts`.
2. The handler parses the body with `parseJsonBody(request, schema)` from
   `lib/validations/parse-json-body.ts`. Validation failures short-circuit
   with a typed error response.
3. The handler delegates to a feature server function (for example,
   `features/audit/server/create-audit.ts`).
4. The server function does the work — DB queries, Playwright, AI calls —
   and returns a typed result.
5. Domain errors are thrown as typed errors (for example, `AuditError`,
   `ExperimentError`) and the handler converts them to stable error
   responses.

Read requests follow the same shape minus the body parse.

---

## The seven stages

| Stage      | Owner                                  | Mechanism            |
|------------|----------------------------------------|----------------------|
| Audit      | `features/audit/server`                | Playwright + heuristics |
| Observe    | `features/snippet/client` + `features/snippet/server` + `features/analytics/server/record-snippet-event.ts` | React provider + `/api/sessions` + `/api/events` |
| Diagnose   | `features/analytics/lib/diagnose-dashboard-metrics.ts` | Deterministic rules over aggregated metrics |
| Generate   | `features/variants/server/generate-variant-proposal.ts` | AI draft or deterministic fallback, zod-validated |
| Approve    | `features/experiments/server/create-experiment.ts` | Variant transitioned `pending_approval` → `approved`, experiment created |
| Test       | `features/demo/server/get-demo-experiment-runtime.ts` + `features/snippet/client/tracker-provider.tsx` | Hash-based bucket, cookie pinning, conversion attribution |
| Deploy     | `features/experiments/server/deploy-experiment-winner.ts` | Deterministic winner rule, baseline rewrite, status transition |

---

## Deterministic vs AI

Anything that affects truth is deterministic and lives in plain TypeScript:

- URL validation
- Page signal extraction
- Audit heuristics and scoring
- Event ingestion and payload validation
- Metric aggregation
- Diagnosis rules
- Experiment assignment (hash + bucket)
- Conversion attribution
- Result calculation and winner recommendation
- Deploy state transitions

AI is allowed only for tasks where wording or framing is the goal:

- Drafting variant copy (hero, CTA, trust row)
- Generating human-readable rationale

Every AI response is parsed by a strict zod schema before it touches the
database. If no `OPENAI_API_KEY` is configured, a deterministic fallback
generator produces a validated proposal from the diagnosed bottleneck. The
loop works end-to-end with no AI key at all.

---

## Data model at a glance

The schema is small on purpose. See [`SCHEMA.md`](./SCHEMA.md) for the full
contract.

- `sites`, `pages` — the tracked storefront and product page. `pages.baseline_content`
  is the live demo baseline copy.
- `audits` — one URL audit per row with extracted signals, findings, and a
  recommended experiment.
- `sessions` — anonymous visitor sessions, optionally tagged with
  `experiment_id` and `experiment_arm`.
- `events` — validated snippet events with typed payloads (`page_view`,
  `scroll_depth`, `cta_click`, `form_start`, `form_submit`).
- `variants` — one pending variant proposal at a time; structured content +
  rationale + source diagnosis snapshot + `source` (`ai` or
  `deterministic_fallback`).
- `experiments` — one A/B test per page, with status, primary conversion
  event, and lifecycle timestamps.
- `conversions` — attributed conversions per experiment, session, and arm.

JSONB is used for flexible structured payloads (page signals, findings,
event payloads, variant content, baseline content) so the schema does not
need to be re-shaped for every small change.

---

## Server / client boundaries

Server side owns anything that affects product state:

- DB reads and writes
- Playwright and AI calls
- Metric aggregation
- Experiment creation, assignment validation, conversion attribution
- Deploy transitions

Client side owns the parts that need to react in the browser:

- Form interactions and progressive loading states
- Local UI state (e.g. preview interactions)
- The snippet tracker (anonymous ID, session init, event emission)

`features/snippet/client/tracker-provider.tsx` is the only client surface
that talks to the backend on behalf of the demo page. It exposes a `track`
function via React context and is the single place to add a new tracked
event from the UI.

---

## Validation strategy

zod is used in three places:

1. **Request boundaries** (`features/*/schemas/*-input.ts`). Every API
   handler parses its body or query through a feature-owned schema and
   returns a stable 400 on failure.
2. **AI output contracts** (`features/variants/schemas/*`). AI responses
   are parsed into a typed proposal before persistence. Validation
   failures fall back to the deterministic generator.
3. **Internal normalization where it pays off** (for example, the baseline
   content and variant stored content schemas used inside the deploy
   transaction).

The general rule: parse at the edge, trust within.

---

## What is intentionally not abstracted

To keep the codebase honest, the following patterns are deliberately
absent:

- No repository pattern or generic data access layer.
- No service container or dependency injection framework.
- No plugin architecture or workflow engine.
- No generic event bus.
- No generalized experimentation framework (one running experiment, two
  arms, one primary event).
- No background queue (audits and AI calls run inline; this is acceptable
  at MVP scale).
- No multi-tenant primitives — there is no organization, member, or auth
  concept.

These are reasonable next steps in a production version, but adding them
now would make the codebase harder to read, not easier.

---

## Where to start reading

If you want to trace one path through the system end-to-end:

1. `src/app/api/audit/route.ts` →
   `src/features/audit/server/create-audit.ts` →
   `src/features/audit/lib/analyze-page-heuristics.ts`
2. `src/features/snippet/client/tracker-provider.tsx` →
   `src/app/api/events/route.ts` →
   `src/features/analytics/server/record-snippet-event.ts`
3. `src/features/analytics/server/get-dashboard-metrics.ts` →
   `src/features/analytics/lib/diagnose-dashboard-metrics.ts`
4. `src/app/api/variants/route.ts` →
   `src/features/variants/server/generate-variant-proposal.ts`
5. `src/app/api/experiments/route.ts` →
   `src/features/experiments/server/create-experiment.ts`
6. `src/features/demo/server/get-demo-experiment-runtime.ts`
7. `src/app/api/experiments/[experimentId]/deploy/route.ts` →
   `src/features/experiments/server/deploy-experiment-winner.ts`

Those seven files cover every stage of the loop.
