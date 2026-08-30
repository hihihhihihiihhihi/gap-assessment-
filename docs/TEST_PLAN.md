# Test Plan

## v1 Success Scenario (manual)
1. Open the app URL in an incognito window (no login)
2. Verify landing page loads with intro copy and "Start the Audit" button
3. Tap "Start the Audit" — wizard starts on Career
4. Move four sliders (now, want, stress, awareness) to different values
5. Tap Next — verify progress indicator advances, Health appears
6. Repeat for all six areas (career → health → relationships → finances → growth → purpose)
7. After sixth area, verify results page loads with Gap Map:
   - Six areas ranked by gap size (largest first)
   - Areas with stress ≥ 7 show fight/flight badge
   - Areas with awareness ≤ 4 show low-awareness badge
   - Total gap number displayed
   - Copy uses chapter language: the current, fight/flight, the gap
8. Email capture card visible: "Leave your email to keep your Gap Map"
9. Enter a real-format email, submit → confirmation state shows
10. Check Supabase: audits row has status=completed, email set, completed_at set; gap_maps row has ranked_areas JSON

## Empty State
- Navigate directly to /results with no audit in session → redirect to landing page (not a blank screen)
- Open wizard with no in-progress audit → starts fresh audit

## Error State
- Simulate network failure on area save (DevTools offline) → error message with retry button, no silent data loss
- Submit invalid email format → inline validation error, no DB write

## Partial State
- Complete 3 of 6 areas, close browser, reopen within session window → resume at area 4 (responses 1–3 intact)

## Loading State
- Every save step shows a loading indicator on the Next button
- Gap Map compute step shows a brief loading state before results render

## Demo Data
- With seed data present, any page that reads audits/gap_maps renders demo rows without error