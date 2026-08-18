# Security

## Secret Handling
- Supabase URL + anon key: `NEXT_PUBLIC_` env vars (safe for client).
- Supabase service role key: server-side only, never in client bundle, never in git.
- No secrets in code, comments, or chat.

## Permission Model
- **v1 (demo-first):** Open RLS on all tables — anyone can read/write. This is intentional for demo without login.
- **Lock-down (later):**
  - `assessments` + `assessment_scores`: owner-scoped (auth.uid() = user_id). Users see only their own data.
  - `life_areas`: public read (shared config), admin-only write.
  - Replace all v1 open policies with owner-scoped policies.

## Approved-Tools Rule
Only named, narrow tools with strict schemas: `generate_area_insight`, `draft_action_plan`. No raw run-any or send-any tools. Each returns structured errors marking retryable vs terminal with a human-readable reason.

## Audit Principle
Every AI-generated output carries source, confidence, and review_status. Low-confidence outputs are queued for review, never shown as fact. Every approval is logged.

## PII
No PII collected in v1 (no names, no emails). Lock-down sprint adds email for accounts — stored in Supabase Auth, not in domain tables.

## What Could Not Be Verified in v1
- Rate-limiting on assessment creation (add in lock-down sprint)
- CSRF protection (Next.js server actions provide baseline; verify before production)
