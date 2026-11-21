# WILDPATCH Technical Product Requirements

## 1. Product goal

WILDPATCH is a daily ecological-restoration challenge. Players investigate a changing landscape, diagnose its stressors, propose a sequenced restoration plan, and learn from a server-scored outcome. The product should combine credible environmental reasoning with a persistent, community-shaped world.

## 2. Current implementation baseline

The current application is a Next.js App Router prototype. It includes a five-stage wetland challenge, a browser UI for investigation and restoration planning, a deterministic scoring engine, a server-side `/api/verify` endpoint, and mock map, profile, reserve, and leaderboard data. The current live challenge is one Willow Fen wetland scenario. The answer key is consumed by server verification code and must remain server-only.

## 3. MVP outcomes

1. Deliver at least 12 authored, quality-reviewed challenge scenarios across wetland, forest, and grassland biomes.
2. Allow the server to choose and freeze one challenge per day, with one best valid result per player per challenge.
3. Support durable player progress, restoration attempts, parcel conditions, leaderboards, and community milestones.
4. Ensure every score and reward is computed by trusted server code; never accept a client-provided score, answer key, or authoritative resource balance.
5. Provide an AI-assisted disturbance authoring agent whose output is validated against ecological and gameplay constraints before publication.
6. Ship a Reddit/Devvit Web experience with an Interactive Post entry point, comment/flair integration where supported, and platform analytics.

## 4. Functional requirements

### 4.1 Challenge content and engine

- A scenario has a stable ID, biome, difficulty, format, initial conditions, observable evidence, available tools/actions, costs, constraints, expected diagnosis, and expected recovery outcomes.
- Content supports single and compound stressors, emergency and audit formats, and multiple severity tiers.
- Scenario validation checks biome/tool/action compatibility, evidence sufficiency, feasible solution plans, budget bounds, score bounds, and that at least one viable plan exists.
- The verifier is a pure deterministic function of a validated scenario and a normalized submission. Its rules and tests are independent of UI components.
- Scenario selection is weighted but reproducible for a challenge date. Once selected, the published challenge is immutable for that date.

### 4.2 AI disturbance authoring agent

- The generator runs server-side and emits a typed candidate scenario, never directly publishing it.
- Inputs include approved biome, stressor, evidence, intervention, difficulty, and format catalogs.
- A deterministic validator rejects invalid or infeasible output; retries are bounded. Rejected output is not shown to players.
- Human review and versioned publication are required before a candidate can enter the daily pool.
- The model must not determine scores or adjudicate player plans at runtime.

### 4.3 Player progress and persistence

- Use authenticated player IDs and durable database records for profiles, challenge attempts, best scores, inventory/resources, achievements, and journal history.
- All reads and writes involving player-owned records are scoped to the authenticated user. Public leaderboard and reserve queries expose only intended public fields.
- A unique `(challenge_id, player_id)` best-result rule prevents duplicate daily rewards. Submission processing is idempotent.
- Server-owned transactions update a report, rewards, player progression, and community aggregates atomically.

### 4.4 Persistent world and community

- Parcels retain condition, active restoration, protection lock, recovery stage, and dated history.
- Scheduled degradation and recovery events are server-owned, auditable, and reversible by operators.
- Community reserve contributions, weekly goals, milestones, and competition boards derive from persisted verified results.
- Research projects, contracts, materials, seed stock, labor, and equipment are modeled as explicit resources with server-side validation.

### 4.5 Reddit / Devvit delivery

- Implement the player-facing surface as Devvit Web / Interactive Post, preserving the existing Next.js prototype as a development adapter only where useful.
- Keep the verifier, answer key, challenge selection, and authoritative persistence on trusted server endpoints.
- Use the supported Devvit storage/API capabilities for state and platform identity; map Reddit identity to internal player records without trusting client-supplied identity.
- Add Devvit Journeys events for the agreed funnel and gameplay outcomes. Avoid sending unnecessary personal data.

## 5. Non-functional requirements

- Validate every request on the server, cap payload size and collection lengths, enforce budgets and action compatibility, and rate-limit write/generation endpoints.
- Use parameterized database access and authenticated per-user scoping. Keep service credentials and answer keys out of client bundles.
- Provide automated unit tests for verifier rules, scenario validation, API input validation, idempotency, and progression calculations.
- Use deterministic seeds for reproducible scenario selection and scoring.
- Maintain accessible keyboard interactions, labels, focus behavior, contrast, reduced-motion support, and responsive layouts.
- Add security headers in the deployed adapter and verify CSP origins against actual integration calls before enforcing CSP.

## 6. Proposed data model

- `scenarios`: published immutable scenario metadata and public content version.
- `scenario_truth`: private expected causes, components, severity, and scoring constraints; server-only access.
- `daily_challenges`: date, scenario version, publication status, and freeze timestamp.
- `players`: platform identity mapping and public profile fields.
- `attempts`: normalized submission, verified report, idempotency key, timestamps, and best-result marker.
- `parcels`: biome, conditions, status, recovery locks, and version.
- `parcel_events`: restoration, degradation, protection, and recovery history.
- `community_contributions`: verified points and aggregate milestone progress.
- `research_projects` and `player_resources`: user-owned resource balances and unlock progress.

Schema changes must be applied through the connected database integration and reflected in typed application schemas before application queries are added.

## 7. Delivery sequence and acceptance criteria

### Phase A — Verifier and content foundations
- Generalized scenario contracts and private answer-key boundary.
- Automated tests for all scoring cases and invalid submissions.
- Scenario validator rejects infeasible or incompatible candidates.
- Acceptance: all verifier and API validation tests pass; a client bundle audit finds no answer-key import.

### Phase B — Content MVP
- Twelve reviewed scenarios across three playable biomes, with multiple difficulty levels and at least two challenge formats.
- Scenario catalog, daily deterministic selection, and challenge freeze.
- Acceptance: every published scenario has at least one verified viable solution and a tested budget.

### Phase C — Accounts and persistence
- Platform-compatible authentication, database schema, attempt history, best-result rule, and idempotent rewards.
- Real profiles, leaderboards, reserve contributions, and parcel history replace mocks.
- Acceptance: integration tests prove user isolation and duplicate submissions do not double-award.

### Phase D — Agent and content operations
- AI candidate generation, deterministic feasibility checks, review/publish workflow, and audit trail.
- Acceptance: invalid generations never publish; generated output passes the same scenario test suite as authored content.

### Phase E — Devvit and community release
- Interactive Post, comment/flair and analytics integration, production monitoring, and moderation/abuse controls.
- Acceptance: end-to-end test on Devvit validates identity, submission, scoring, and durable progression.

## 8. Current implementation status and known blockers

- Implemented today: the Next.js prototype, one wetland challenge, deterministic scoring, server-side answer-key use, map/reserve/profile mock screens, and initial server validation tests.
- Still outstanding: multi-biome scenario catalog and engine generalization, authenticated accounts, durable persistence, real leaderboard/reserve/world systems, AI authoring workflow, research/resources, and Devvit migration/integration.
- The Neon integration is connected, but this workspace currently exposes no runtime `DATABASE_URL`; its schema inspection returned an error on the initial integration check. Runtime database work must wait until the integration provides its app connection variables and the live schema can be verified.
- The existing project is a Next.js prototype, not a Devvit project. Devvit implementation needs the target app/platform setup and must be validated against Devvit's supported APIs rather than approximated with Next.js routes.
