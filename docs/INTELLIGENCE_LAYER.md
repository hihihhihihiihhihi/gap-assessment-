# Intelligence Layer

## Messy Inputs
User ratings are subjective 1–10 / 1–5 scales. No free text in v1 — pure slider inputs. No NLP needed.

## Auto-Structure Schema (per area, computed client + server)
```json
{
  "life_area": "Career & Business",
  "current_score": 4,
  "desired_score": 9,
  "gap_score": 5,
  "stress_level": 5,
  "fight_flight": true,
  "awareness_level": 2,
  "low_awareness": true,
  "priority": "high"
}
```

## Events to Track
assessment_started, area_completed, assessment_completed, gap_map_viewed, new_assessment_started.

## Scoring Rules (rule-based, v1)
- **gap_score** = desired_score − current_score
- **fight_flight** = stress_level ≥ 4
- **low_awareness** = awareness_level ≤ 2
- **priority**: high = fight_flight AND low_awareness; medium = fight_flight OR low_awareness; low = neither
- **overall_gap** = average of all 6 area gap_scores

## What Gets Ranked
Life areas sorted by priority (high → medium → low), then by gap_score descending. Gap Map highlights high-priority areas first.

## v1 vs Later
**v1:** All rule-based, zero AI. Scoring and flags are pure arithmetic.
**Later:** AI-generated personalized insight per area (stored as ai_summary + ai_source + ai_confidence + ai_review_status). Low-confidence (< 0.7) outputs routed to review queue, never shown as fact.
