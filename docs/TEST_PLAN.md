# Test Plan

## v1 Success Scenario (manual)
1. Open `/` in a fresh incognito window — verify intro copy + "Begin" button render
2. Click Begin — verify redirect to `/audit/career` with progress bar showing 1/6
3. Move all four sliders to different values, click Next — verify progress updates to 2/6
4. Repeat for all six areas — verify each step persists (check DB: 6 area_responses rows)
5. After final area (purpose) Next click — verify redirect to `/gap-map`
6. Verify Gap Map shows: six areas ranked by priority, fight/flight zones flagged, low-awareness zones flagged, overall gap number
7. Verify chapter-language labels present ("the gap," "fight/flight," "the current")
8. Enter email in capture field, submit — verify redirect to `/saved`
9. Verify `/saved` shows confirmation message
10. Check DB: leads row exists with correct assessment_id and email

## Empty State Tests
- **No areas completed yet:** Navigate to `/gap-map` without completing audit → redirect to `/` with message "Complete all six areas to see your Gap Map."
- **Partial completion:** Complete only 3 areas, try to access `/gap-map` → redirect to next incomplete area

## Error State Tests
- **Network failure during area submission:** Disconnect network, click Next → show inline error "Couldn't save your response. Check your connection and try again." Retry succeeds.
- **Invalid email:** Enter "notanemail" → inline validation error "Please enter a valid email address." Submit button disabled.
- **Duplicate email submission:** Submit same email twice for same assessment → second attempt shows "You've already saved this Gap Map."

## Loading State Tests
- **Gap Map computation:** After final area, brief loading state with "Drawing your Gap Map…" before render
- **Email submission:** Button shows "Saving…" while request in flight

## Responsive Tests
- Complete full flow on 375px viewport — all sliders, buttons, Gap Map chart readable and usable
- Verify no horizontal scroll on any screen

## Seed Data Tests
- Load `/` — demo assessments exist in DB for development rendering checks
- Verify seed data does not appear in user-facing Gap Map (only current session's assessment)

## Security Spot-Check
- Verify leads table is insert-only from client (no SELECT from browser returns data)
- Verify no secrets visible in page source or network response headers