# Data Model

## assessments
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | default gen_random_uuid() |
| user_id | uuid | nullable — owner-scoping later |
| status | text | 'in_progress' / 'completed' / 'abandoned' |
| started_at | timestamptz | default now() |
| completed_at | timestamptz | nullable |
| created_at | timestamptz | default now() |

**RLS:** v1 permissive (anon read/write). Later: owner-scoped to user_id.

## area_responses
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| assessment_id | uuid | FK → assessments.id |
| area | text | 'career' / 'health' / 'relationships' / 'finances' / 'growth' / 'purpose' |
| current_score | int | 1–10 — where she is now |
| desired_score | int | 1–10 — where she wants to be |
| stress_level | int | 1–10 — how much runs on stress |
| awareness_level | int | 1–10 — how aware she is of feelings there |
| created_at | timestamptz | default now() |

**Computed (not stored, derived in gap-map):** gap_size = desired − current; stress_flag = stress ≥ 7; awareness_flag = awareness ≤ 3.

**Constraint:** unique(assessment_id, area) — one response per area per assessment.

**RLS:** v1 permissive. Later: owner-scoped via assessment_id → user_id.

## gap_maps
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| assessment_id | uuid | FK → assessments.id, unique |
| ranked_areas | jsonb | array of {area, gap_size, priority, stress_flag, awareness_flag} sorted desc by priority |
| overall_gap | numeric | average gap across areas |
| created_at | timestamptz | default now() |

**RLS:** v1 permissive. Later: owner-scoped.

## leads
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| assessment_id | uuid | FK → assessments.id |
| email | text | validated, unique per assessment |
| created_at | timestamptz | default now() |

**RLS:** v1 permissive. Later: owner-scoped + email PII protection.

## Relationships
```
assessments 1—6 area_responses
assessments 1—1 gap_maps
assessments 1—1 leads
```

## AI Fields (later — narrative module)
| Field | Type | Notes |
|-------|------|-------|
| narrative_text | text | nullable |
| narrative_source | text | 'ai-narrative-v1' |
| narrative_confidence | numeric | nullable |
| narrative_review_status | text | default 'unreviewed' |