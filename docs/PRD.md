# Gap Assessment — PRD

## Problem
High-performing women (35–65) look successful from the outside but can't see the distance between the life they live and the life they want — or recognise how much runs on fight-or-flight without knowing. The Gap Audit makes that distance visible in three minutes.

## Target User
Female professionals and entrepreneurs, 35–65, who look successful and are quietly running out of themselves. She read the chapter or heard the talk, recognised herself, and wants to know how wide her gap is before talking to anyone.

## Core Objects
- **Audit** — one visitor session; tracks status (in_progress / completed), captures email at the end.
- **Area Response** — for each of six life areas (career, health, relationships, finances, growth, purpose): four readings: `now` (1–10), `want` (1–10), `stress` (1–10, fight/flight), `awareness` (1–10). Derived: `gap_score` (want − now), `stress_flag` (stress ≥ 7), `awareness_flag` (awareness ≤ 4).
- **Gap Map** — computed from all six area responses: areas ranked by gap size, fight/flight and low-awareness zones flagged. Stored as ranked JSON + total gap.

## MVP (v1) — Checklist
- [x] Landing page that introduces the audit and starts the flow
- [x] Guided wizard: six areas, four readings each, persisted to DB as she goes
- [x] Gap Map computed and rendered immediately after completion (ranked areas, stress/awareness flags, visual bars)
- [x] Email capture at the end of the Gap Map — email saves to the audit record
- [x] Named zones use the chapter's language: the current, fight/flight, the gap
- [x] Works end-to-end with no login; seed demo data so results pages render for anonymous visitors

## Non-Goals (v1)
- Accounts / login / user dashboards
- Saving or revisiting past audits by the visitor
- Courses, content, or community features
- Payment or subscription
- AI-generated narrative (later phase)

## Success Criteria
A first-time anonymous visitor lands, completes all six areas (completion — not drop-off), sees her ranked Gap Map with fight/flight and low-awareness zones flagged in the chapter's language, and leaves a real email address to keep it. The number to watch is completion-versus-drop-off, not signups.