# Data Model

## audits
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | default gen_random_uuid() |
| user_id | uuid, nullable | for owner-scoping at lock-down |
| session_token | text, not null | identifies anonymous visitor session |
| status | audit_status | `in_progress` / `completed` |
| email | text, nullable | captured at end |
| completed_at | timestamptz, nullable | set when Gap Map generated |
| created_at | timestamptz, not null | default now() |

## area_responses
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, nullable | for owner-scoping later |
| audit_id | uuid, FK → audits(id) | on delete cascade |
| area | life_area enum | career, health, relationships, finances, growth, purpose |
| now_score | numeric, 1–10 | where she is now |
| want_score | numeric, 1–10 | where she wants to be |
| stress_level | numeric, 1–10 | how much runs on fight/flight |
| awareness_level | numeric, 1–10 | how aware she is of what she feels |
| gap_score | numeric, generated | want_score − now_score, stored |
| stress_flag | boolean, generated | stress_level ≥ 7 |
| awareness_flag | boolean, generated | awareness_level ≤ 4 |
| created_at | timestamptz, not null | default now() |

Unique constraint: (audit_id, area) — one response per area per audit.

## gap_maps
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, nullable | for owner-scoping later |
| audit_id | uuid, FK → audits(id) | one-to-one |
| ranked_areas | jsonb, not null | ordered array: `[{area, gap, stress_flag, awareness_flag}]` |
| total_gap | numeric, not null | sum of all gap_scores |
| ai_summary | text, nullable | AI-generated narrative (later) |
| ai_summary_source | text, nullable | model/agent that produced it |
| ai_summary_confidence | numeric, nullable | 0–1 |
| ai_summary_review_status | text, default 'unreviewed' | unreviewed / approved / rejected |
| created_at | timestamptz, not null | default now() |

## RLS / Permissions
- All tables: RLS enabled, v1 permissive policies (select + write for all) so the demo works without login.
- Lock-down sprint: replace with `auth.uid() = user_id` owner-scoped policies.