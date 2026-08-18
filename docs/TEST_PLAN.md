# Test Plan

## v1 Success Scenario (manual)
1. Open app URL in incognito browser → homepage loads, demo Gap Map visible with 6 areas
2. Click "Start Your Assessment" → assessment begins at Career & Business
3. Set all 4 sliders for first area → "Next" button enables
4. Click through all 6 areas, setting 4 sliders each → final area shows "View My Gap Map"
5. Gap Map page loads → shows 6 area cards with gap scores, fight/flight badges, awareness badges
6. Verify: area with stress ≥ 4 shows fight/flight badge; area with awareness ≤ 2 shows low-awareness badge
7. Verify: areas sorted by priority (high first), then by gap_score descending
8. Click "Start New Assessment" → new assessment begins fresh
9. Verify in Supabase dashboard: new assessment row + 6 assessment_scores rows persisted

## Empty State
- Navigate to results page with no completed assessment → "You haven't taken an assessment yet" message + "Start Your Assessment" CTA

## Error State
- Simulate DB write failure (disconnect network before completing) → form retains slider values, error message shown, retry button appears
- Click retry → submission succeeds when network restored

## Loading State
- Gap Map page: skeleton cards appear while data loads

## Validation
- Attempt to submit area without all 4 sliders set → "Next" disabled, cannot proceed
- Score values constrained by slider min/max (1–10 for current/desired, 1–5 for stress/awareness)
- Server-side check constraints reject out-of-range values

## Responsive
- View on mobile (375px) → sidebar collapses to hamburger, assessment sliders usable, Gap Map cards stack vertically
