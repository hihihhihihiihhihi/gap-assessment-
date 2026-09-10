# Intelligence Layer

## v1: Rule-Based (No AI)

### Inputs
24 raw readings (6 areas × 4 sliders, each 1–10).

### Auto-Structure Schema
```json
{
  "areas": [
    {
      "area": "career",
      "current_score": 6,
      "desired_score": 9,
      "stress_level": 8,
      "awareness_level": 2,
      "gap_size": 3,
      "priority_score": 5.4,
      "stress_flag": true,
      "awareness_flag": true,
      "zone_label": "fight/flight + low awareness"
    }
  ],
  "overall_gap": 3.2,
  "top_priority": "career",
  "flagged_zones": ["career", "health"]
}
```

### Scoring Rules
- **gap_size** = desired_score − current_score
- **stress_flag** = stress_level ≥ 7 → labelled "fight/flight"
- **awareness_flag** = awareness_level ≤ 3 → labelled "running blind"
- **priority_score** = gap_size × (1 + stress_level / 10) × (1 + (5 − min(awareness_level, 5)) / 10)
  - Rationale: bigger gaps matter more, stress amplifies urgency, low awareness means she's not even seeing it.
- **ranked_areas** = sort all areas by priority_score descending.
- **overall_gap** = mean(gap_size) across six areas.

### Events to Track
- assessment_started
- area_completed (which area, time spent)
- assessment_completed
- gap_map_viewed
- email_submitted
- funnel_drop (abandoned at which step)

### What Gets Ranked
Six life areas, by priority_score. Top 2 flagged as "widest gaps." Any area with stress_flag AND awareness_flag gets a "running on fumes" callout.

## Later: AI Narrative
Generate 2–3 sentence personalised summary per Gap Map using chapter voice ("the current," "the gap," "fight/flight"). Stored with value + source + confidence + review_status. Low-confidence → queued for review, not shown.