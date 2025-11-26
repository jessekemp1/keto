# MVP Testing Checklist

Use this checklist to validate all core functionality works on your Pixel 8.

## Installation Testing

- [ ] Setup script runs without errors: `./setup.sh`
- [ ] All dependencies installed successfully
- [ ] App starts without crashes: `npm start`
- [ ] App deploys to Pixel 8 (via Expo Go or direct install)

## Core Functionality

### Home Screen
- [ ] Phase 1 card displays on first launch
- [ ] Phase name shows: "Foundation Start"
- [ ] Phase description visible
- [ ] Progress bar shows "Day 1 of 7"
- [ ] "No metrics logged today" message appears
- [ ] "Log Now" button navigates to Log screen
- [ ] "Log Metrics" button navigates to Log screen
- [ ] "Phase Details" button navigates to Phase Info screen
- [ ] Pull-to-refresh works

### Log Metrics Screen
- [ ] Can enter glucose value (test: 4.7)
- [ ] Can enter ketone value (test: 1.0)
- [ ] Dr. Boz Ratio calculates automatically (should show 4.7)
- [ ] Ratio card appears with colored border
- [ ] Ratio status shows (e.g., "Excellent" for 4.7)
- [ ] Can enter optional weight
- [ ] Can enter optional energy level (1-10)
- [ ] Can enter optional clarity level (1-10)
- [ ] "Save Metrics" button works
- [ ] Success alert appears after save
- [ ] Returns to Home screen after save

### Home Screen (After Logging)
- [ ] Today's ratio displays (4.7 in test)
- [ ] Ratio is color-coded (green for 4.7)
- [ ] Glucose value shown (4.7 mmol/L)
- [ ] Ketones value shown (1.0 mmol/L)
- [ ] Status text shows (Excellent)

### Analytics Screen (Day 1)
- [ ] "No data yet" message shows (need 2+ days for chart)
- [ ] Pull-to-refresh works

### Phase Info Screen
- [ ] Current phase card shows Phase 1
- [ ] Phase 1 highlighted in blue
- [ ] Progress bar shows day 1 of 7
- [ ] Requirements box displays correctly
- [ ] All 12 phases listed in timeline
- [ ] Phase 1-11 show duration (Phase 12 shows "Maintenance")
- [ ] Educational content displays
- [ ] Dr. Boz Ratio guide visible with color coding
- [ ] Pull-to-refresh works

## Multi-Day Testing

### Day 2
- [ ] Log different metrics (e.g., glucose 80, ketones 1.5)
- [ ] New ratio calculates (should be 53.3)
- [ ] Home screen updates with today's data
- [ ] Phase progress shows "Day 2 of 7"
- [ ] Analytics screen still shows "no data" (need 3+ days for meaningful chart)

### Day 3
- [ ] Log metrics again
- [ ] Analytics screen now shows chart with 3 data points
- [ ] Chart displays correctly with dates
- [ ] Statistics card appears (Latest, 7-Day Avg, Best, Highest)
- [ ] Recent Entries list shows all 3 days
- [ ] All ratios color-coded correctly

### Day 7+
- [ ] After 7 days in Phase 1, auto-advances to Phase 2
- [ ] Phase 2 card shows on Home screen
- [ ] Phase Info shows Phase 2 as current
- [ ] Phase 1 marked as completed (checkmark/green)
- [ ] Progress resets to "Day 1 of 7" for Phase 2

## Data Persistence
- [ ] Close app completely
- [ ] Reopen app
- [ ] All logged metrics still present
- [ ] Current phase preserved
- [ ] Chart data still displays
- [ ] No data loss

## Edge Cases

### Invalid Input
- [ ] Try entering text in glucose field → Rejected
- [ ] Try entering negative numbers → Rejected
- [ ] Try saving without glucose → Error alert
- [ ] Try saving without ketones → Error alert
- [ ] Try entering ketones = 0 → Warning (ratio = 999)

### Extreme Values
- [ ] Enter very low ratio values (glucose 40, ketones 3.0 = 13.3)
  - [ ] Shows green color
  - [ ] Status: "Excellent"
- [ ] Enter very high ratio values (glucose 150, ketones 0.3 = 500)
  - [ ] Shows red color  
  - [ ] Status: "Needs work"

### Chart Testing (After 7+ Days)
- [ ] Chart shows full 7-day range
- [ ] Dates labeled correctly
- [ ] Line connects all points
- [ ] Colors match ratio levels
- [ ] Statistics calculate correctly

## Performance

- [ ] App starts in < 3 seconds
- [ ] No lag when entering metrics
- [ ] Chart renders smoothly
- [ ] Tab navigation is instant
- [ ] Pull-to-refresh is responsive
- [ ] No crashes during 10-minute use session

## UI/UX

- [ ] All text is readable
- [ ] Colors are distinguishable
- [ ] Buttons are easy to tap
- [ ] Cards have clear hierarchy
- [ ] Navigation is intuitive
- [ ] Error messages are clear

## Final Validation

- [ ] App works offline (no internet needed)
- [ ] Data survives phone restart
- [ ] App can be uninstalled and reinstalled
- [ ] New install starts fresh at Phase 1
- [ ] All 4 tabs accessible and functional

## Known Limitations (MVP - Not Bugs)

- No push notifications
- No fasting timer
- No data export
- No cloud backup
- No multi-user support
- No edit history
- Cannot edit past entries (only today)
- Chart limited to 7 days
- Phase advancement is time-based only (not metric-based)

## Bug Tracking Template

If you find a bug, document it like this:

**Bug:** [Brief description]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected:** [What should happen]
**Actual:** [What actually happens]
**Device:** Pixel 8
**Android Version:** [Your version]

## Success Criteria

✅ **MVP is successful if:**
- All Core Functionality tests pass
- App doesn't crash during normal use
- Data persists correctly
- Users can log and track metrics for 7+ days
- Phase advancement works automatically

## Next Steps After Testing

1. Use app daily for 2+ weeks
2. Document any friction points
3. Note which features are most valuable
4. Identify what's missing from daily workflow
5. Prioritize next features to build
