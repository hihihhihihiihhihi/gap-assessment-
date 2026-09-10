# Architecture

## Stack
Next.js 15 (App Router) + Supabase (Postgres) + Vercel.

## Build Now vs Later
**Now:** audit flow, Gap Map computation, email capture, seed demo data, anonymous access.
**Later:** accounts, return portal, AI narrative summaries, analytics dashboard, Phoenix Realm / Theta Collective lead routing.

## Key User Flow (one action)
1. Visitor lands on `/` — sees intro copy + "Begin" button.
2. Steps through six area screens (4 sliders each) — progress bar persists to DB on each step.
3. Completes final area → `/gap-map` renders computed result: ranked areas, flagged zones, chapter-language labels.
4. Sees email capture prompt: "Leave your email to keep your Gap Map."
5. Submits email → `/saved` confirms, stores lead.

## Responsive Nav
Single-flow tool — no sidebar. Linear step progression with a top progress bar. Mobile-first; each area screen is one viewport with four sliders and a Next button.

## Layer Plan
1. **Data** — Postgres tables for assessments, area_responses, gap_maps, leads. All reads/writes through `lib/data/`.
2. **App Logic** — Gap Map computation (rule-based scoring) in `lib/gap-map/`. Server actions for persisting responses.
3. **Smart Features** — (later) AI narrative generation using stored Gap Map context.

## Why Core Runs Without AI
The Gap Map is pure arithmetic: gap = desired − current; stress flag = stress ≥ 7; awareness flag = awareness ≤ 3; priority = gap × (1 + stress/10) × (1 + (5 − awareness)/10). No model call needed. AI narrative is a later enhancement.

## Repo Structure
```
app/
  page.tsx                  # intro / begin
  audit/[area]/page.tsx     # one area per step
  gap-map/page.tsx          # result display
  saved/page.tsx            # email confirmation
components/
  AreaSlider.tsx
  GapMapChart.tsx
  ZoneFlag.tsx
  EmailCapture.tsx
lib/
  data/                     # all DB access
    assessments.ts
    area_responses.ts
    gap_maps.ts
    leads.ts
  gap-map/                  # scoring + ranking logic
    compute.ts
  ai/                       # (later) narrative generation
    narrative.ts
  types/                    # shared types
__tests__/
  gap-map/compute.test.ts
```

## Module Map

| Module | Responsibility | Data owned | Build order |
|--------|---------------|------------|-------------|
| **audit** | Collect 24 readings across 6 areas, persist per step | assessments, area_responses | 1st |
| **gap-map** | Compute, rank, flag zones from readings | gap_maps | 2nd |
| **lead-capture** | Capture email after Gap Map, persist lead | leads | 3rd |
| **narrative** (later) | Generate personalised Gap Map summary text | — | later |
| **auth** (later) | Accounts, return portal, owner-scoped data | — | later |