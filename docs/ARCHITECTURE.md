# Architecture

## Stack
Next.js (App Router) + Supabase (Postgres) + Vercel.

## Build Now vs Later
**Now:** Assessment flow (6 areas × 4 questions), score persistence, Gap Map results with computed flags, demo data visible without login.
**Later:** AI-generated personalized insights, email capture, user accounts, progress tracking.

## Key User Action Flow
1. Visitor lands on homepage → sees demo Gap Map + "Start Your Assessment" CTA
2. Starts assessment → guided through 6 life areas, 4 questions each (sliders)
3. On completion → scores saved to DB → Gap Map renders with gap scores, fight/flight flags (stress ≥ 4), awareness flags (awareness ≤ 2)
4. User sees where they're in survival mode and where awareness is low

## Responsive Nav Shell
Left sidebar on desktop (Home, Assessment, Results). Hamburger menu on mobile. Current section highlighted.

## Layer Plan
1. **Data layer** — Supabase tables, `lib/data/` queries (built first)
2. **App logic** — assessment flow, score computation in `lib/assessment/` (built second)
3. **Smart features** — AI insights in `lib/ai/` (later, optional; core runs without it)

## Why Core Runs Without AI
All scores and flags are computed from user inputs using rule-based thresholds. No AI call is required for the assessment or results to render.

## Repo Structure
```
lib/data/          — all DB reads/writes
lib/assessment/    — scoring + gap computation
lib/ai/            — AI insights (later)
app/               — routes
components/         — UI components
__tests__/          — beside code they test
```

## Module Map

| Module | Responsibility | Data Owned | Build Order |
|--------|---------------|-----------|-------------|
| life-areas | Area config + display | life_areas | 1st |
| assessment | Assessment flow + scoring | assessments, assessment_scores | 2nd |
| gap-map | Results visualization | computed from assessment_scores | 3rd |
| auth | Login + per-user isolation | user_id scoping | 4th (later) |
