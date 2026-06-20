
# StorePilot — Product Requirements Document

## Summary

StorePilot is an ecommerce optimization MVP for self-improving storefront pages.

It helps a founder or product/growth engineer:
- explore an instrumented demo storefront
- use lightweight funnel tracking
- collect a few key behavior events
- identify likely friction
- generate one improved variant
- approve it
- run one A/B test
- and deploy the winner

It is a narrow, believable product wedge designed to demonstrate the core product loop:
**observe → diagnose → generate → approve → test → ship**

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

The MVP has three main surfaces:
1. Demo Store
2. Dashboard
3. Experiment Lab

---

## Snippet-powered Optimizer

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
This demonstrates the complete behavior-to-winner optimization loop.

---

## Core product loop

The MVP should demonstrate this loop clearly:

### 1. Observe
Collect behavioral data from real interactions.

### 2. Diagnose
Turn behavioral data into a likely bottleneck.

### 3. Generate
Propose one improved page variant.

### 4. Approve
Require a human to approve the change before experiment launch.

### 5. Test
Split traffic between baseline and variant.

### 6. Ship
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

### Snippet tracking
- session initialization
- product view tracking
- scroll milestone tracking
- add-to-cart tracking
- checkout-start tracking
- purchase and revenue tracking

### Diagnosis
- simple metric aggregation
- likely friction summary
- one recommended experiment

### Variant generation
- generate one improved ecommerce product-page variant
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

1. Open the demo product page
2. Record real events
3. Show the likely bottleneck
4. Generate one better variant
5. Approve the experiment
6. Run a basic A/B test
7. Show Bayesian winner confidence
8. Deploy the winner

A strong result is a product that:
- feels coherent
- looks polished
- behaves predictably
- is easy to explain
- signals strong engineering judgment

---

## User stories

### Story 1 — Behavior-backed diagnosis
As a growth/product engineer,
I want to collect a few key interaction signals from a page,
so I can understand where shoppers leave the funnel.

### Story 2 — Guided improvement
As a user,
I want the system to propose one clear experiment,
so I do not have to manually coordinate design, copy, and engineering work.

### Story 3 — Human-in-the-loop launch
As a user,
I want to approve the variant before it goes live,
so I stay in control of what gets tested.

### Story 4 — Simple winner deployment
As a user,
I want to promote the winning version,
so the product loop feels complete.

---

## Functional requirements

## 1. Snippet tracking
The system must:
- initialize anonymous session identity
- capture key events
- send events to the backend
- store events reliably

## 2. Dashboard
The system must display:
- total sessions
- add-to-cart rate
- checkout-start rate
- purchase conversion rate
- revenue per visitor
- scroll depth summary
- top diagnosis
- recommended experiment

## 3. Variant generation
The system must:
- represent the baseline page in structured form
- generate one improved variant
- validate the generated output
- preview it clearly
- allow approval before launch

## 4. Experiment runtime
The system must:
- assign users to control or variant
- record conversions by arm
- show a simple comparison
- allow only one active experiment for the MVP

## 5. Deployment
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

### Snippet events
- product view
- scroll milestone
- add to cart
- checkout start
- purchase

### Experiment data
- experiment status
- variant arm
- primary conversion event
- simple lift comparison

---

## AI usage policy

AI is allowed for:
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
- a clear instrumented demo storefront
- real data collection
- clear diagnosis
- one generated improvement
- approval workflow
- a believable experiment result
- a winner deployment action

---

## What to skip if time gets tight

If time is limited, keep:
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
