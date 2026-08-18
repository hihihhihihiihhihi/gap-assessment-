# Data Model

## life_areas
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (PK) | default gen_random_uuid() |
| user_id | uuid | nullable, for future ownership |
| name | text | not null |
| description | text | |
| sort_order | int | default 0 |
| created_at | timestamptz | default now() |

**Relationships:** 1-to-many with assessment_scores.
**RLS:** v1 open read/write. Lock-down: public read, admin write.

## assessments
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (PK) | |
| user_id | uuid | nullable |
| status | text | in_progress \| completed |
| started_at | timestamptz | |
| completed_at | timestamptz | |
| created_at | timestamptz | default now() |

**Relationships:** 1-to-many with assessment_scores.
**RLS:** v1 open. Lock-down: owner only (auth.uid() = user_id).

## assessment_scores
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (PK) | |
| assessment_id | uuid (FK → assessments) | on delete cascade |
| life_area_id | uuid (FK → life_areas) | |
| user_id | uuid | nullable |
| current_score | int | 1–10, check constraint |
| desired_score | int | 1–10, check constraint |
| stress_level | int | 1–5, check constraint |
| awareness_level | int | 1–5, check constraint |
| ai_summary | text | nullable — AI-generated insight |
| ai_source | text | nullable — model/label |
| ai_confidence | numeric | nullable — 0.0–1.0 |
| ai_review_status | text | default 'unreviewed' |
| created_at | timestamptz | default now() |

**Unique:** (assessment_id, life_area_id) — one score row per area per assessment.
**Relationships:** belongs-to assessment, belongs-to life_area.
**RLS:** v1 open. Lock-down: owner only.
**Computed in app (not stored):** gap_score = desired − current; fight_flight = stress ≥ 4; low_awareness = awareness ≤ 2; priority = high if fight_flight AND low_awareness, medium if either, low otherwise.
