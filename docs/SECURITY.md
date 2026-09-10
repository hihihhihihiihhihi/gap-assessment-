# Security

## Secret Handling
- Supabase service key and anon key stored in Vercel environment variables only — never in code, never in client-visible strings.
- Client uses anon key with RLS policies. Server actions use service key server-side only.
- No third-party API keys in v1 (no AI calls, no email service yet).

## Permission Model
- **v1 (demo-first):** All tables have permissive RLS — anonymous visitors can create assessments, area_responses, gap_maps, and leads. This is intentional: the audit must work without a login wall.
- **Lock-down sprint (later):** Replace permissive policies with owner-scoped policies (`auth.uid() = user_id`). Assessments and children scoped to the creating user. Leads table gets stricter write-only-then-read-by-owner policy.
- Email field in leads is PII — even in v1, never expose leads table contents to the client. Only insert, never select from the browser.

## Approved-Tools Rule
- v1: no external tool calls. Server actions write directly to Supabase via `lib/data/` layer.
- Later: any external integration (email, CRM) uses named, least-privilege tools only. No raw `run_any` / `send_any`. Each tool has a narrow parameter schema and returns structured errors (retryable vs terminal).

## Audit Principle
- v1: no audit log table yet — the assessments and leads tables themselves are the record.
- Later: every meaningful action (email sent, lead routed, data exported) writes to audit_logs with actor, action, target, risk level, and timestamp.

## What Could NOT Be Verified in v1
- Rate-limiting on assessment creation (add in lock-down sprint).
- Email validation beyond format check (no verification email sent in v1).
- PII encryption at rest beyond Supabase defaults.