# Architecture

## Stack
Next.js 14 (App Router) · Supabase (Postgres) · Vercel deploy.

## Build Sequence
**Now:** DB schema + data-access layer → audit wizard (6 areas × 4 readings, persisted) → Gap Map computation + results view → email capture.
**Next:** AI narrative summary in the chapter's voice → polish all UI states → deploy.
**Later:** Lock it down — auth, owner-scoped RLS, rate limiting, lead routing to Phoenix Realm / Theta Collective.

## Key User Action Flow
1. Visitor lands on home page → taps "Start the Audit"
2. Wizard presents one area at a time (career → health → relationships → finances → growth → purpose) — four slider inputs per area, auto-saves each response to DB
3. After sixth area, server computes the Gap Map (rank by gap, flag stress ≥ 7 and awareness ≤ 4)
4. Results page renders the Gap Map: ranked bars, fight/flight zones, low-awareness zones, total gap — in the chapter's language
5. Email capture card: "Leave your email to keep your Gap Map" → saves email to audit record → confirmation

## Nav Shell
Single guided flow (landing → wizard → results → email). No sidebar — this is a linear wizard, not a multi-section app.

## Layer Plan
1. **Data layer** (`lib/data/`): all DB reads/writes — audits, area_responses, gap_maps. Nothing inline in UI.
2. **App logic** (`lib/scoring/`): gap calculator, flag logic, ranking — pure functions, server-runnable.
3. **Smart features** (`lib/ai/`, later): AI narrative summary of the Gap Map in the chapter's voice.

## Why the Core Runs Without AI
Gap Map ranking and flags are pure arithmetic (gap = want − now; stress_flag = stress ≥ 7; awareness_flag = awareness ≤ 4; sort by gap descending). The AI layer (narrative summary) is additive — the Gap Map renders fully without it.

## Repo Structure
```
src/
  app/
    page.tsx                  # landing + start
    audit/
      [area]/page.tsx         # per-area wizard step
    results/
      page.tsx                 # Gap Map + email capture
  components/
    audit/                     # slider inputs, area card, progress
    results/                   # gap bar, flag badge, ranked list
    ui/                        # shared primitives
  lib/
    data/                      # audits.ts, area-responses.ts, gap-maps.ts
    scoring/                   # gap-calculator.ts
    ai/                        # summary.ts (later)
  tests/                       # beside the code they test
```

## Module Map
| Module | Responsibility | Data it owns | Build order |
|---|---|---|---|
| **audit-engine** | Wizard flow, 6 areas × 4 readings, persistence | audits, area_responses | 1st |
| **gap-map** | Compute ranking + flags from responses | gap_maps | 2nd |
| **results-view** | Render Gap Map visually + email capture | reads gap_maps, writes email on audits | 2nd |
| **ai-summary** (later) | Narrative summary in chapter's voice | ai_summary field on gap_maps | 3rd |