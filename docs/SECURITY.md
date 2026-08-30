# Security

## Secret Handling
- Supabase service key and any AI API keys live in Vercel environment variables — never in code, never in chat, never exposed to the client.
- Client-side code uses the Supabase anon key only (read/write within RLS policies).

## Permission Model
- **v1 (demo-first):** RLS enabled but permissive — all tables readable and writable without login. The app works for anonymous visitors.
- **Lock-down sprint:** Replace permissive policies with `auth.uid() = user_id` owner-scoped policies. A visitor can only read/write her own audit, responses, and gap map. Email field readable only by the owner.
- No admin role in v1. Later: a service role for lead review, behind auth.

## Approved-Tools Rule
- No raw `run_any` / `send_any` capabilities. Every agent action (later) calls a named, narrowly-scoped server function with explicit inputs and structured error output.
- Tools return `{ success: boolean, retryable: boolean, reason: string }` — never throw silently.

## Audit Principle
- Every meaningful action (later: lead scored, email drafted, email sent) is written to `audit_logs` with actor, action, target, outcome, risk level, timestamp.
- Email addresses are PII — never logged in plain text in application logs; stored only in the `audits.email` column.

## Rate Limiting (lock-down sprint)
- Audit creation: max 5 per IP per hour (prevents spam signups skewing completion metrics).
- Email capture: 1 per audit.

## What Could NOT Be Verified in v1
- No penetration test run yet — plan states this plainly.
- PII exposure audit deferred to lock-down sprint.
- Prompt injection resistance: N/A in v1 (no AI), relevant when narrative summary ships.