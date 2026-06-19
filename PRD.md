
# StorePilot — Product Requirements Document

## Summary

StorePilot is an ecommerce optimization MVP for self-improving storefront pages.

It helps a founder or product/growth engineer:
- paste a URL and get a fast conversion audit
- install a lightweight snippet
- collect a few key behavior events
- identify likely friction
- generate one improved variant
- approve it
- run one A/B test
- and deploy the winner

It is a narrow, believable product wedge designed to demonstrate the core product loop:
**audit → observe → diagnose → generate → approve → test → ship**

---

## Product goal

Build a founder-demo-ready product that clearly shows how software can improve itself through a measurable feedback loop.

The MVP should:
- feel useful quickly
- be easy to understand in a short demo
- use AI only where it adds value
- showcase strong software engineering judgment
- stay narrow enough to finish fast

---

## Why this project exists

The purpose of this project is to build the smallest believable version of an autonomous ecommerce optimization workflow.

It should show:
- product understanding
- end-to-end engineering skill
- clean architecture
- smart use of AI
- clear thinking about automation vs deterministic logic

This project is intentionally optimized for:
- founder relevance
- first-mover advantage
- clean execution
- strong hiring/contract signal

---

## Product vision

StorePilot should feel like a focused AI-native growth tool for ecommerce teams.

It should not feel like:
- a giant analytics platform
- a generic AI wrapper
- a no-code website builder
- a bloated experimentation suite

The vision is:
A system that helps a storefront page move toward a better version through a clear, measurable, human-approved loop.

---

## Target user

Primary user:
- founder
- growth/product engineer
- technical marketer

Initial usage assumptions:
- they care about product-page conversion
- they want fast signal
- they do not want to wire many tools together manually
- they value a system that suggests and tests improvements

---

## MVP scope

The MVP supports:
- one product page
- one primary conversion metric
- one active experiment at a time
- one generated variant at a time

The MVP has two main surfaces:
1. URL Audit
2. Snippet-powered Optimizer

---

## Surface A — URL Audit

### User flow
1. user pastes a public website URL
2. system captures a page screenshot
3. system extracts key page structure
4. system identifies likely conversion issues
5. system returns a clean audit with one recommended experiment

### Output should include
- screenshot
- page summary
- key findings
- prioritized issues
- likely conversion risks
- one recommended experiment
- rationale for the recommendation

### Purpose
This is the low-friction entry point and quick demo hook.

---

## Surface B — Snippet-powered Optimizer

### User flow
1. user installs a lightweight snippet
2. page interaction events are collected
3. system identifies likely friction or drop-off
4. system proposes one improved variant
5. user approves the variant
6. system runs a 50/50 A/B test
7. system shows performance
8. user can deploy the winner

### Purpose
This is the deeper proof that the product is not just an audit tool.

---

## Core product loop

The MVP should demonstrate this loop clearly:

### 1. Audit
Analyze the page and identify probable conversion weaknesses.

### 2. Observe
Collect behavioral data from real interactions.

### 3. Diagnose
Turn page signals and behavioral data into a likely bottleneck.

### 4. Generate
Propose one improved page variant.

### 5. Approve
Require a human to approve the change before experiment launch.

### 6. Test
Split traffic between baseline and variant.

### 7. Ship
Show lift and allow the winner to become the new default.

---

## Product principles

### 1. Narrow beats broad
We are building the smallest believable wedge, not a platform.

### 2. Deterministic by default
Critical product logic should be deterministic and testable.

### 3. AI only where it adds clear value
Use AI for interpretation, summarization, and generation.
Do not use AI for core truth or system control.

### 4. Human approval matters
Changes should not go live automatically in this MVP.

### 5. Demo clarity matters
A founder should understand the product in under a few minutes.

### 6. Engineering quality is part of the product
The codebase itself should showcase clean thinking and clean execution.

---

## In scope

### URL Audit
- public URL input
- screenshot capture
- basic page signal extraction
- heuristic issue detection
- structured AI-generated audit
- clean audit result UI

### Snippet tracking
- session initialization
- page view tracking
- scroll milestone tracking
- CTA click tracking
- form start tracking
- form submit tracking

### Diagnosis
- simple metric aggregation
- likely friction summary
- one recommended experiment

### Variant generation
- generate one improved hero/CTA variant
- preview baseline vs variant
- human approval

### Experimentation
- one active experiment
- 50/50 traffic split
- conversion tracking
- simple lift display

### Deployment
- manually promote winner
- mark experiment complete

---

## Out of scope

Do not build these in the MVP:
- multi-page optimization
- arbitrary site-wide DOM rewriting
- WYSIWYG editor
- multivariate testing
- advanced statistics engine
- autonomous deployment without approval
- full session replay
- complex segmentation
- deep integrations with CMS tools
- multi-user collaboration
- billing
- generalized growth platform features

---

## Success criteria

The MVP is successful if it can demonstrate this full story:

1. Paste a URL
2. Get a believable audit
3. Install snippet on a demo product page
4. Record real events
5. Show the likely bottleneck
6. Generate one better variant
7. Approve the experiment
8. Run a basic A/B test
9. Show results
10. Deploy the winner

A strong result is a product that:
- feels coherent
- looks polished
- behaves predictably
- is easy to explain
- signals strong engineering judgment

---

## User stories

### Story 1 — Instant audit
As a founder,
I want to paste a URL and get a useful conversion audit,
so I can quickly understand what may be hurting purchases or lead capture.

### Story 2 — Behavior-backed diagnosis
As a growth/product engineer,
I want to collect a few key interaction signals from a page,
so I can validate whether the audit is supported by real traffic.

### Story 3 — Guided improvement
As a user,
I want the system to propose one clear experiment,
so I do not have to manually coordinate design, copy, and engineering work.

### Story 4 — Human-in-the-loop launch
As a user,
I want to approve the variant before it goes live,
so I stay in control of what gets tested.

### Story 5 — Simple winner deployment
As a user,
I want to promote the winning version,
so the product loop feels complete.

---

## Functional requirements

## 1. URL audit
The system must:
- accept a public URL
- validate it
- render the page
- capture a screenshot
- extract key page signals
- generate a structured audit
- store and display the result

## 2. Snippet tracking
The system must:
- initialize anonymous session identity
- capture key events
- send events to the backend
- store events reliably

## 3. Dashboard
The system must display:
- total sessions
- CTA click-through behavior
- form start rate
- form completion rate
- scroll depth summary
- top diagnosis
- recommended experiment

## 4. Variant generation
The system must:
- represent the baseline page in structured form
- generate one improved variant
- validate the generated output
- preview it clearly
- allow approval before launch

## 5. Experiment runtime
The system must:
- assign users to control or variant
- record conversions by arm
- show a simple comparison
- allow only one active experiment for the MVP

## 6. Deployment
The system must:
- allow manual promotion of the winner
- update the baseline state
- mark the experiment as completed

---

## Non-functional requirements

The product should be:
- lightweight
- easy to run locally
- easy to understand
- cleanly structured
- strongly typed
- fast enough for a demo
- polished enough for founder review

The codebase should:
- avoid unnecessary abstraction
- avoid giant files
- follow feature boundaries
- keep route handlers thin
- validate inputs and AI outputs
- remain easy for another engineer or agent to continue

---

## Data tracked in MVP

### Page signals
- page title
- main heading
- subheading hints
- CTA labels
- nav link count
- trust signal hints
- form presence
- section hints

### Snippet events
- page view
- scroll milestone
- CTA click
- form start
- form submit

### Experiment data
- experiment status
- variant arm
- primary conversion event
- simple lift comparison

---

## AI usage policy

AI is allowed for:
- summarizing audit findings
- prioritizing issues
- writing experiment rationale
- generating structured variant content
- generating human-readable explanations

AI is not allowed to be the source of truth for:
- event correctness
- metric calculations
- traffic assignment
- conversion attribution
- deployment actions

All AI-generated structured outputs must be validated before use.

---

## UX requirements

The UI should feel:
- focused
- trustworthy
- modern
- clear
- calm
- B2B and product-minded

Avoid:
- cluttered dashboards
- overly flashy AI aesthetics
- excessive animation
- too many charts
- dense information walls

Important states to design well:
- loading
- empty
- processing
- success
- error

---

## Demo expectations

The product should support a strong short demo.

A good demo should show:
- fast initial audit value
- real data collection
- clear diagnosis
- one generated improvement
- approval workflow
- a believable experiment result
- a winner deployment action

---

## What to skip if time gets tight

If time is limited, keep:
- URL audit
- event collection basics
- one diagnosis card
- one variant generation flow
- one experiment flow

Reduce or simplify:
- dashboard depth
- chart complexity
- edit controls
- advanced preview capabilities

Do not cut:
- clean structure
- stable types
- validation
- approval step
- end-to-end product loop

---

## Final product standard

StorePilot should feel like:
- a sharp, narrow product
- built by someone who understands both product and engineering
- careful about where AI is useful
- serious enough to impress founders quickly

It should not feel like:
- an unfinished toy
- a generic SaaS starter with AI added on top
- a messy hackathon app
- an overbuilt platform trying to do everything
