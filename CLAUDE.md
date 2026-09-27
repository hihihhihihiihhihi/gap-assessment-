# gap-assessment-

<!-- Managed by Launchpad. Edits here may be overwritten on next sync. -->

## Stack & commands

- Framework: Next.js
- `dev`: `next dev --turbopack`
- `build`: `next build`
- `lint`: `next lint`
- `start`: `next start`

## Decisions

- GapFinder-inspired redesign adopted: results page now includes a radar chart, alignment score, and explicit strengths/gaps sections.
- All database access is now routed through a server-only service-role client (Sprint 4).
- Gap map is gated behind email submission — user must provide email before viewing the gap map.

## Architecture

- Sprint 1 built data layer, scoring engine, responsive shell, and demo Gap Map landing — establishing the core architecture in a single sprint.
- Core architecture (data layer, scoring engine, responsive shell, demo gap map landing) was established in sprint 1.
- Client-side DB access eliminated; the service-role client enforces row-level security from the server.

## Gotchas

- Audit wizard end-to-end flow works correctly even when the service-role key is absent (fallback handling verified).

## Notes

- Sprint 2 delivered the assessment engine and personal Gap Map (v1 functional milestone).
- Project rebuilt to current /docs spec including audit wizard, Gap Map, and email capture components.
- Sprint 3 completed — data layer, scoring engine, and assessment engine are confirmed working against real data
- sprint 3 verified end-to-end against the live database
- Email capture component and v1 MVP checklist are marked complete.
- Gap Map is now automatically emailed to the user when they provide their email address.
- After email is submitted, it receives a next-step action (the emailed gap map itself serves as that next step).
