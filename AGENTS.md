
---

# `AGENTS.md`

```md
# AGENTS.md

# StorePilot — Agent Working Rules

## Purpose

This file defines how coding agents should behave while working on this repository.

All agents must follow:
- `PRD.md`
- `ARCHITECTURE.md`
- this file

If there is a conflict:
1. `PRD.md` decides **what** we are building
2. `ARCHITECTURE.md` decides **how** the codebase is organized
3. `AGENTS.md` decides **how agents should work**

---

## Project mission

StorePilot is an ecommerce optimization MVP for self-improving storefront pages.

The MVP supports:
- instrumented demo storefront
- lightweight event tracking
- diagnosis of likely friction
- one generated variant
- human approval
- one A/B test
- winner deployment

This is a **narrow, high-signal MVP**.

Do not turn this into:
- a generic analytics platform
- a generalized experimentation framework
- a large no-code editor
- an AI-everywhere product

---

## Non-negotiable product constraints

Agents must respect these constraints at all times:

- one product page
- one primary conversion event
- one active experiment at a time
- deterministic product logic by default
- AI only where it clearly adds value
- human approval before experiment launch
- simple, believable product loop
- speed and clarity over completeness

---

## High-level engineering expectations

All code should be:
- clean
- lightweight
- easy to scan
- easy to continue
- strongly typed
- minimally abstracted
- organized by feature

The repo should signal:
- strong software engineering judgment
- product-minded execution
- clean full-stack thinking
- ability to ship without chaos

---

## Agent behavior rules

### 1. Do not redesign the product
Agents should implement within the product scope already defined.

Do not:
- invent new product surfaces
- add adjacent features not in scope
- expand the MVP without strong justification
- introduce speculative enterprise features

### 2. Do not redesign the architecture casually
Agents must follow the existing architecture unless explicitly asked to change it.

Before changing structure, ask:
- is this truly necessary?
- does this reduce clarity?
- is this solving a real current problem?

### 3. Keep diffs narrow
Change only what is needed for the requested task.

Do not:
- rewrite unrelated files
- reformat the whole repo
- rename major structures without need
- move files around for taste alone

### 4. Prefer additive, reviewable steps
Implement changes in small logical steps.

When possible:
- propose a file plan first
- then implement
- then summarize what changed

### 5. Preserve repo readability
A human reviewer should be able to understand the codebase quickly.

That means:
- small files
- explicit names
- predictable locations
- limited indirection

---

## Code quality rules

### TypeScript
- use strict typing
- no `any`
- no unsafe hidden casts unless unavoidable and justified
- prefer explicit types at boundaries

### Validation
- validate all request boundaries
- validate AI outputs
- validate important internal normalization points when useful
- use zod consistently

### Functions
- keep functions focused
- prefer single-purpose functions
- avoid deeply nested control flow
- extract helpers only when they improve readability

### Components
- keep components small
- do not mix heavy business logic into presentational UI
- keep mock data and typed placeholders separate from component markup

### Comments
- use comments sparingly
- comment reasoning, not obvious code
- do not add noisy comments everywhere

### Imports
- keep imports clean
- remove dead imports
- avoid tangled dependency chains

---

## Folder discipline

Agents must respect the folder model in `ARCHITECTURE.md`.

### `src/app`
Only route-level composition and page wiring.

### `src/components/ui`
Only truly shared UI primitives.

### `src/components/layout`
Only shared layout structure.

### `src/features/*`
Own feature-specific UI, schemas, server logic, and helpers.

### `src/lib/*`
Only generic infrastructure and shared helpers.

### `src/server/*`
Only cross-feature server concerns.

Do not place code in random folders just because it works.

---

## Deterministic vs AI rules

### Deterministic logic must remain deterministic
Do not replace deterministic logic with AI.

These must remain deterministic:
- input validation
- event tracking
- session handling
- assignment logic
- conversion attribution
- metric calculation
- deployment state transitions

### AI should be used only for
- summarization
- prioritization
- recommendation drafting
- variant generation
- rationale generation

### AI output rule
All AI outputs must:
- use structured prompts
- return structured JSON when appropriate
- be validated before use
- never directly control critical product state without validation

---

## What agents must avoid

Do not add:
- generic repository pattern
- dependency injection framework
- generic service registry
- generic plugin system
- complex workflow engine
- event bus abstraction
- advanced state machine unless clearly needed
- huge utility modules
- unnecessary design patterns for “future flexibility”

Do not create:
- giant components
- giant server files
- giant action files
- giant helpers
- giant hooks files

Do not introduce:
- clever abstractions that reduce readability
- vague names
- speculative code for future features
- deep nesting of folders without reason

---

## Naming rules

Prefer names that explain behavior directly.

Good examples:
- `getDashboardMetrics`
- `calculateExperimentResults`
- `recordSnippetEvent`
- `calculateScrollDepthSummary`
- `generateVariantProposal`
- `assignExperimentArm`

Avoid vague names like:
- `process`
- `handleData`
- `manager`
- `service`
- `helper`
- `common`
unless the name is qualified and precise

---

## File size guidance

As a general rule:
- keep most files small
- split files when responsibilities start to mix
- avoid files becoming dumping grounds

Soft guidance:
- UI components should stay compact
- route handlers should stay very small
- schemas should remain focused
- feature server files should represent one clear flow

Do not split files so aggressively that tracing logic becomes annoying.

---

## Prompt-response working style for agents

When assigned a new feature or change, agents should usually:

1. Restate the task briefly
2. Propose the file plan
3. Mention any tradeoffs
4. Implement in a clean, minimal way
5. Summarize what changed

If the requested change touches architecture, schema, or shared contracts:
- explain the impact clearly before making the change

---

## When to ask for confirmation

Agents should ask before:
- changing the folder structure substantially
- changing schema in a way that impacts many features
- introducing new dependencies
- replacing an existing pattern with a new architectural pattern
- deleting or rewriting large existing parts

Agents should not ask for confirmation on:
- obvious local implementation details
- straightforward bug fixes
- small feature-contained refactors
- minor UI improvements within scope

---

## Cursor-specific guidance

Cursor should be used mainly for:
- page structure
- UI implementation
- layout polish
- component organization
- Tailwind/shadcn refinement
- frontend cleanup

Cursor should avoid making major backend architecture decisions unless explicitly asked.

When working in UI:
- keep components readable
- avoid giant page files
- use feature-local components
- separate placeholder/mock data from render logic
- preserve strong visual hierarchy

---

## Backend-heavy agent guidance

Backend-focused agents should be used mainly for:
- schema
- validation
- route handlers
- server orchestration
- event ingestion
- analytics logic
- experiment logic
- AI output contracts
- cleanup refactors
- tests for deterministic logic

Backend-focused agents should avoid overengineering.

Prefer:
- direct and clear server functions
- explicit DB interactions
- typed contracts
- feature-local orchestration

---

## Testing priorities

Agents should prioritize tests for:
- URL validation
- event payload validation
- experiment assignment
- metric aggregation
- heuristic detection
- AI output validation fallback behavior

Do not spend large effort on snapshot-heavy or trivial tests unless useful.

---

## Documentation rules

When making meaningful architecture or domain changes, agents should update the relevant docs:
- `README.md`
- `PRD.md` if scope changes
- `ARCHITECTURE.md` if structure changes
- `docs/SCHEMA.md` if schema becomes more detailed
- `docs/DECISIONS.md` if a notable decision is made

Do not let code and docs drift apart.

---

## Demo-first mindset

This project is being built to:
- showcase engineering quality
- demonstrate product understanding
- create a strong founder signal
- help win a job or contract conversation quickly

So every implementation decision should ask:
- does this make the demo stronger?
- does this make the repo cleaner?
- does this show good product and engineering judgment?
- does this avoid overbuilding?

---

## Final rule

Agents should optimize for:
- clean code
- clean structure
- believable product behavior
- strong traceability
- small, sharp diffs
- founder-impressive execution

Not for:
- maximum abstraction
- maximum flexibility
- maximum complexity
- showing off unnecessary patterns
