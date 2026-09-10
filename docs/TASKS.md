# Tasks — Sprints

## Sprint 1: Data + Audit Flow
**Goal:** A visitor can start an assessment, complete all six areas, and every reading persists to the database.

- [ ] Create Supabase tables (assessments, area_responses, gap_maps, leads) with RLS + seed data
- [ ] Build `lib/data/` access layer — create assessment, upsert area response, fetch responses
- [ ] Build intro page (`/`) with "Begin your Gap Audit" CTA
- [ ] Build `/audit/[area]` — four sliders (current, desired, stress, awareness) + progress bar + Next/Back
- [ ] Persist each area response on Next; update assessment status
- [ ] Seed 3 demo assessments with full readings for demo rendering

**DoD:** Visitor completes 6 area screens; 6 area_responses rows exist in DB with correct assessment_id; assessment status = 'completed'.

## Sprint 2: Gap Map Computation + Display ★ v1 FUNCTIONAL
**Goal:** Completed assessment produces a ranked, flagged Gap Map — the full funnel works end-to-end.

- [ ] Build `lib/gap-map/compute.ts` — scoring, ranking, flagging logic
- [ ] Compute unit tests (gap_size, stress_flag, awareness_flag, priority_score, ranking)
- [ ] Build `/gap-map` page — render ranked areas with zone flags and chapter-language labels
- [ ] Persist gap_map row on completion
- [ ] Build GapMapChart visual (bar/radar) — loading, empty, error states
- [ ] Wire navigation: final area → compute → display Gap Map

**DoD:** A visitor who completes all six areas sees her Gap Map — areas ranked, fight/flight and low-awareness zones flagged, overall gap shown. This is the v1 functional milestone.

## Sprint 3: Email Capture + Polish
**Goal:** Visitor leaves email after seeing Gap Map; full funnel complete.

- [ ] Build EmailCapture component on `/gap-map` page (post-result prompt)
- [ ] Server action: insert lead row with validated email
- [ ] Build `/saved` confirmation page
- [ ] Handle empty/error states for email submission (invalid email, network error, duplicate)
- [ ] Add analytics events (started, area_completed, completed, gap_map_viewed, email_submitted, drop)
- [ ] Mobile responsive pass — all screens tested at 375px width
- [ ] Copy review — ensure chapter voice ("the current," "the gap," "fight/flight")

**DoD:** A stranger lands on `/`, completes six areas, sees Gap Map, enters email, sees confirmation. Lead row exists in DB. Drop-off events fire correctly.

## Sprint 4: Lock It Down (later)
- [ ] Add Supabase Auth (email/password + magic link)
- [ ] Replace permissive RLS with owner-scoped policies
- [ ] Add rate-limiting on assessment creation
- [ ] Leads table: insert-only from client, read only for authenticated owner
- [ ] PII protection review

## Sprint 5: Narrative + Routing (later)
- [ ] AI narrative generation for Gap Map (value + source + confidence + review_status)
- [ ] Email sending tool (named, approved)
- [ ] CRM routing to Phoenix Realm / Theta Collective
- [ ] Audit log table + logging

## Text Gantt
```
Sprint 1  ████████  Data + Audit Flow
Sprint 2  ████████  Gap Map + Display        ★ v1 functional
Sprint 3  ████████  Email Capture + Polish
Sprint 4  ░░░░░░░░  Lock It Down (later)
Sprint 5  ░░░░░░░░  Narrative + Routing (later)
```