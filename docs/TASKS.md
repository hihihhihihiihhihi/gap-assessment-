# Tasks & Sprints

## Sprint 1 — Foundation & Data
**Goal:** Database + app shell + demo landing page (no login).
- [ ] Create Supabase tables, seed life areas + 3 demo assessments with scores
- [ ] Set up Next.js app with Supabase client
- [ ] Build responsive sidebar shell (desktop) / hamburger (mobile)
- [ ] Landing page showing demo Gap Map from seeded data
- [ ] Data-access layer in `lib/data/`

**Definition of Done:** Homepage loads at the live URL showing a demo Gap Map with 6 life areas and computed flags — no login required.

## Sprint 2 — Assessment Engine + Gap Map ← v1 FUNCTIONAL MILESTONE
**Goal:** The core workflow works end-to-end.
- [ ] Assessment flow: 6 areas × 4 rating sliders (current, desired, stress, awareness)
- [ ] Progress indicator through areas; "Next" validates all 4 sliders set
- [ ] On completion: create assessment row + 6 assessment_scores rows
- [ ] Compute gap_score, fight_flight, low_awareness, priority per area
- [ ] Gap Map results page: per-area cards with gap score, fight/flight badge, awareness badge
- [ ] Areas ranked by priority then gap_score descending
- [ ] "Start New Assessment" button

**Definition of Done:** A visitor completes a full assessment and sees their personal Gap Map with correct computed flags — data persisted to DB.

## Sprint 3 — Polish & Resilience
**Goal:** All UI states handled; responsive; clear copy.
- [ ] Empty state: no results → "You haven't taken an assessment yet" + CTA
- [ ] Error state: DB write fails → retain form values, show message, retry button
- [ ] Loading skeletons for Gap Map cards
- [ ] Responsive layout validated on mobile viewport
- [ ] Clear UI copy: question text, button labels, result descriptions
- [ ] Validate score ranges server-side (1–10 / 1–5 constraints)

**Definition of Done:** Every screen handles loading, empty, and error states gracefully; app works on mobile and desktop.

## Sprint 4 — Lock It Down
**Goal:** Auth + per-user data isolation.
- [ ] Add Supabase Auth (email signup/login)
- [ ] Replace open RLS policies with owner-scoped (auth.uid() = user_id) on assessments + assessment_scores
- [ ] life_areas: public read, admin write only
- [ ] Logged-out users see landing + demo data; starting assessment redirects to login
- [ ] Security pass: no secrets in client bundle, npm audit, validate input ranges

**Definition of Done:** A new user signs up, takes an assessment, and sees only their own results. Demo data visible to logged-out visitors.

## Gantt
```
Sprint 1: Foundation  ████████░░░░░░░░░░░░
Sprint 2: Engine    ░░░░░░░░████████████░░  ← v1 functional
Sprint 3: Polish    ░░░░░░░░░░░░░░░░██████
Sprint 4: Lockdown ░░░░░░░░░░░░░░░░░░░░██
```
