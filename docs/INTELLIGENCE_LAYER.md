# Intelligence Layer

## Messy Inputs
Four self-rated readings per area (now, want, stress, awareness) on 1–10 sliders. No free text in v1 — structured input only.

## Auto-Structure (Rule-Based, v1)
```json
{
  "ranked_areas": [
    {"area": "health", "gap": 5, "stress_flag": true, "awareness_flag": true, "now": 3, "want": 8, "stress": 9, "awareness": 2},
    {"area": "career", "gap": 4, "stress_flag": false, "awareness_flag": false, "now": 5, "want": 9, "stress": 5, "awareness": 7},
    {"area": "relationships", "gap": 3, "stress_flag": true, "awareness_flag": false, "now": 5, "want": 8, "stress": 8, "awareness": 6},
    {"area": "finances", "gap": 2, "stress_flag": false, "awareness_flag": false, "now": 6, "want": 8, "stress": 4, "awareness": 7},
    {"area": "growth", "gap": 2, "stress_flag": false, "awareness_flag": true, "now": 6, "want": 8, "stress": 3, "awareness": 3},
    {"area": "purpose", "gap": 1, "stress_flag": false, "awareness_flag": false, "now": 7, "want": 8, "stress": 4, "awareness": 8}
  ],
  "total_gap": 17,
  "zones": {
    "fight_or_flight": ["health", "relationships"],
    "low_awareness": ["health", "growth"],
    "widest_gap": "health"
  }
}
```

## Scoring Rules (v1, all arithmetic)
- `gap_score` = want − now (per area)
- `total_gap` = sum of all gap_scores
- `stress_flag` = stress ≥ 7 (fight/flight zone)
- `awareness_flag` = awareness ≤ 4 (low-awareness zone)
- Ranking: areas sorted by gap_score descending

## What Gets Ranked
All six life areas, by gap size. Flags overlay the ranking: an area can be both a wide gap and fight/flight, or a wide gap with low awareness — those are the priority zones.

## Events to Track
- audit_started, area_completed (which area), audit_completed, email_captured, results_viewed
- Drop-off point (which area step was last completed before exit)

## v1 vs Later
- **v1:** Rule-based scoring + ranking. No AI.
- **Later:** AI narrative summary of the Gap Map in the chapter's voice — names the current, fight/flight, the gap. Stored in `gap_maps.ai_summary` with source + confidence + review_status. Low-confidence output queued for review, never shown as fact.