# Tasks

## Sprint 1 — Foundation + Audit Engine
**Goal:** DB schema live, 6-area wizard working end-to-end with persistence.
- [ ] Create migration SQL (audits, area_responses, gap_maps) + seed demo rows
- [ ] Build data-access layer (`lib/data/`): create audit, save area response, fetch audit + responses
- [ ] Build scoring module (`lib/scoring/gap-calculator.ts`): gap_score, flags, ranking
- [ ] Landing page: intro copy + "Start the Audit" button → creates audit, redirects to first area
- [ ] Wizard: one area per step, four sliders (now, want, stress, awareness), auto-save to DB, progress indicator, next/back
- [ ] All six areas accessible; incomplete audit saved as in_progress
- **DoD:** Visitor starts audit, completes all six areas, responses persist in DB. Demo rows render on any read.

## Sprint 2 — Gap Map + Email Capture ← v1 FUNCTIONAL MILESTONE
**Goal:** Full success scenario works end-to-end for anonymous visitor.
- [ ] After sixth area, compute Gap Map server-side (rank by gap, flag stress ≥ 7 and awareness ≤ 4)
- [ ] Insert gap_maps row with ranked_areas JSON + total_gap
- [ ] Results page: ranked area bars (gap width), fight/flight zone badges, low-awareness zone badges, total gap — in the chapter's language (the current, fight/flight, the gap)
- [ ] Email capture card on results page: "Leave your email to keep your Gap Map" → validates + saves to audits.email → confirmation state
- [ ] Mark audit status = completed, set completed_at
- **DoD:** Anonymous visitor completes all six areas, sees her ranked Gap Map with flags, leaves email, email persisted. This is the v1 success scenario.

## Sprint 3 — Polish + Deploy
**Goal:** Production-ready UX, all five states handled, deployed.
- [ ] Loading states on every save and compute step
- [ ] Empty state: if results page loads with no audit (direct visit) — redirect to start
- [ ] Error state: save failure shows retry, not silent loss
- [ ] Partial state: in-progress audit resume (session_token cookie)
- [ ] Mobile-responsive wizard and results
- [ ] Analytics events: audit_started, area_completed, audit_completed, email_captured, drop-off point
- [ ] Deploy to Vercel; verify live URL returns 200 for anonymous visitor
- **DoD:** Deployed app; success scenario passes on live URL; loading/empty/error/partial all handled.

## Sprint 4 — Lock It Down
**Goal:** Owner-scoped security before real traffic.
- [ ] Add Supabase Auth (email/password + magic link)
- [ ] Replace permissive RLS with `auth.uid() = user_id` policies on all tables
- [ ] Set user_id on audit creation from auth context
- [ ] Rate limit: 5 audits per IP per hour
- [ ] Security pass: injection, XSS, PII exposure, rate-limiting — state what was and wasn't verified
- **DoD:** A visitor's audit is only visible to her; anonymous permissive access removed; rate limit active.

## Gantt
```
Sprint 1: [====] Foundation + Audit Engine
Sprint 2:      [====] Gap Map + Email Capture  ← v1 functional
Sprint 3:           [====] Polish + Deploy
Sprint 4:                [====] Lock It Down
```