# ARCHITECTURE.md

# StorePilot — Architecture Guide

## Purpose

This document defines the engineering architecture for StorePilot.

It is the technical source of truth for:
- folder structure
- data flow
- boundaries between frontend/backend/features
- deterministic logic vs AI logic
- coding patterns
- what we are intentionally not abstracting yet

This project is an **ecommerce optimization MVP**, not a generalized experimentation platform.

The architecture should optimize for:
- speed of development
- code clarity
- easy onboarding
- clean file structure
- small, understandable modules
- strong software engineering signal

---

## Core product shape

StorePilot has three main surfaces:

1. **Demo Store** — instrumented ecommerce product page
2. **Dashboard** — funnel metrics, diagnosis, and traffic simulation
3. **Experiment Lab** — A/B results, Bayesian confidence, and winner promotion

This MVP supports:
- one product page
- one primary conversion metric
- one active experiment at a time

---

## Engineering principles

### 1. Narrow architecture over generic architecture
Do not design for every future use case.

Build for the current MVP:
- one page
- one funnel
- one experiment
- one variant at a time

### 2. Deterministic by default
All core system behavior should be deterministic unless AI clearly adds value.

Use deterministic logic for:
- event ingestion
- session tracking
- metric aggregation
- experiment assignment
- conversion attribution
- deploy logic

Use AI for:
- generating experiment hypotheses
- generating variant copy/spec
- producing human-readable rationale

### 3. Thin boundaries
Route handlers, server actions, and request entry points should stay thin.

They should:
- validate input
- call a feature-level server function
- return a typed result

They should not:
- contain long business logic
- query the database in multiple scattered places
- mix orchestration and rendering concerns

### 4. Feature-first organization
Each major product area should own its logic.

Feature code should live close together:
- UI
- schemas
- server logic
- helpers specific to that feature

### 5. Keep files small
Prefer:
- small focused files
- explicit names
- local helpers near the feature

Avoid:
- giant utility files
- giant service classes
- deep inheritance
- framework-like abstractions

### 6. Easy-to-trace logic
A future reviewer should be able to answer:
- where does this request enter?
- which feature owns the logic?
- where is validation?
- where is DB write/read?
- where is the AI call?
- where is the output schema?

without jumping across too many files.

---

## Chosen stack

### Application
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

### Database
- Postgres
- Drizzle ORM

### Validation
- zod

### Optional background jobs
- Inngest or Trigger.dev if needed later

---

## Folder structure

```text
src/
  app/
    (marketing)/
      page.tsx
    dashboard/
      page.tsx
    experiments/
      page.tsx
    api/
      events/
      experiments/
      variants/

  components/
    ui/
    layout/

  features/
    analytics/
      components/
      server/
      schemas/
      lib/
      types.ts

    experiments/
      components/
      server/
      schemas/
      lib/
      types.ts

    variants/
      components/
      server/
      schemas/
      lib/
      types.ts

    snippet/
      client/
      server/
      schemas/
      lib/
      types.ts

  lib/
    db/
    env/
    ai/
    browser/
    utils/
    validations/

  server/
    jobs/
    actions/

drizzle/
public/
scripts/
docs/ 
Folder responsibilities
src/app

Owns route-level composition only.

Responsibilities:

page composition
route layout
calling feature-facing server entry points
wiring server/client UI together

Should not own:

business logic
database logic
feature rules
analysis logic
src/components/ui

Owns truly shared design-system style UI primitives.

Examples:

button wrappers
cards
badges
section shells
empty states
skeletons

Do not place feature-specific logic here.

src/components/layout

Owns shared app shell and layout components.

Examples:

top nav
sidebar
page containers
app header
section header
src/features/*

Owns feature logic.

Each feature should contain:

components/ for feature-specific UI
server/ for business logic and orchestration
schemas/ for zod contracts and validation
lib/ for feature-specific helpers
types.ts for feature-level shared types

This is the main organizational pattern of the project.

src/lib/db

Owns:

database connection
schema exports
small database helpers if necessary

Should not become a full repository pattern layer.

src/lib/env

Owns environment validation and access.

Responsibilities:

parse environment variables once
export a typed env object
fail fast when env is invalid
src/lib/ai

Owns:

model client configuration
structured output helper wrappers
AI-specific utilities

This folder should stay thin and generic.

Feature prompts should live close to the feature when they are feature-specific.

src/server

Owns cross-feature server concerns only.

Examples:

background jobs
server actions that orchestrate multiple features
truly shared backend orchestration

Do not move normal feature logic here if it belongs inside a feature.

Main system flows
1. Snippet event ingestion flow
High-level flow
snippet initializes session ID
page events are captured on the client
events are sent to ingestion endpoint
backend validates event payload
session and event records are stored
analytics logic aggregates page metrics
Ownership
client snippet code: features/snippet/client/*
server ingestion: features/snippet/server/*
schemas: features/snippet/schemas/*
aggregation logic: features/analytics/server/*
2. Diagnosis flow
High-level flow
analytics reads collected events
deterministic aggregation computes key metrics
system identifies likely friction points
AI may summarize the findings in human-readable language
diagnosis is stored and rendered
Ownership
aggregation: features/analytics/server/*
diagnosis logic: features/analytics/server/*
optional AI summary: feature-owned helper in analytics
4. Variant generation flow
High-level flow
baseline page content is represented in structured JSON
diagnosis + baseline content are passed into AI
AI returns strict variant JSON
output is validated
variant is stored
preview UI renders the variant
user approves or rejects it
Ownership
variant generation: features/variants/server/*
validation: features/variants/schemas/*
preview rendering: features/variants/components/*
5. Experiment flow
High-level flow
user approves a variant
experiment is created
page traffic is assigned to control or variant via cookie
conversion events are recorded with variant arm
analytics compares performance
user deploys the winner
Ownership
experiment creation: features/experiments/server/*
assignment logic: features/experiments/server/*
result aggregation: features/experiments/server/*
Deterministic vs AI responsibility split
Deterministic logic

These must stay deterministic and testable:

event payload validation
session identification
metric aggregation
bucketing / assignment
conversion attribution
deploy state transitions
AI logic

These may use AI:

drafting experiment recommendation
generating variant headline/subheadline/CTA/trust row
converting signals into concise founder-friendly output
Rule

AI should operate on structured inputs and return structured outputs.

Never let AI directly decide:

database writes without validation
experiment assignment
conversion result truth
deployment state changes
Schema philosophy

Schemas should stay:

small
explicit
feature-local where possible
validated at boundaries

Use zod for:

request payloads
AI output contracts
internal normalized structures if helpful

Prefer:

parse / safeParse at boundaries
stable typed contracts between feature modules
Database philosophy

We are not building a generalized data platform.

The database should model the MVP clearly and simply.

Core tables:

sites
pages
sessions
events
variants
experiments
conversions

Guidelines:

keep columns explicit
use JSON columns where flexible structured payloads help
do not over-normalize too early
add only fields the MVP actually uses
Error handling

Use explicit error handling at boundaries.

Prefer:

typed domain errors where useful
stable frontend-safe error messages
logging only where it adds debugging value

Avoid:

silent failures
swallowed errors
deeply nested try/catch blocks everywhere

Rule:

validate early
fail clearly
return predictable shapes
Testing strategy

We do not need a huge test suite for MVP.

Test the most important deterministic logic:

URL validation
event payload validation
experiment assignment
metric aggregation
heuristic issue detection
AI output validation fallback behavior

Prioritize tests around logic that:

impacts correctness
is easy to unit test
would be embarrassing to get wrong in a demo
What we are intentionally NOT abstracting yet

Do not build these unless the MVP clearly requires them:

repository pattern
service container / dependency injection
generic plugin architecture
generic workflow engine
generic rule engine
full multi-tenant app architecture
generalized event bus
advanced queue system
reusable analytics framework
complex design token system
generalized CMS adapters

The code should look deliberate, not overengineered.

UI architecture philosophy

The UI should communicate:

trust
clarity
focus
momentum

Use:

simple cards
strong section hierarchy
consistent spacing
readable typography
polished empty/loading/error states

Avoid:

flashy AI visuals
too many charts
overly dense dashboards
excessive animation
visual clutter
Server/client boundaries
Server side

Should own:

DB access
AI calls
metric aggregation
experiment creation
deployment actions
Client side

Should own:

form interactions
progressive loading states
local UI state
preview interactions
snippet event tracking

Rule:
If it changes product state or needs trust, it should likely be server-side.

Naming conventions

Prefer:

explicit names
behavior-based function names
singular responsibility per file

Examples:

assignExperimentArm
recordSnippetEvent
calculateExperimentLift

Avoid:

vague names like processData
giant helpers.ts
giant utils.ts
generic names like manager, handler, service unless necessary
Code review standard for this project

Every change should try to preserve:

readability
traceability
stable contracts
limited surface area
minimal abstraction

Before merging a change, ask:

Is this easy to understand?
Is the logic in the right feature?
Is this abstraction truly needed?
Would a founder skimming the repo think this feels clean?
Can another agent continue from this without confusion?
Final architecture rule

This project should feel like:

a sharp product-minded MVP
built by someone with strong engineering judgment
who understands what to automate and what to keep deterministic

It should not feel like:

a bloated framework
a rushed hack
a toy AI wrapper
a generic SaaS starter with random AI features attached
