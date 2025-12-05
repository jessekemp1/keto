# Keto Tracker - Product Documentation

---

## What Is This?

A mobile app for tracking your progress through Dr. Boz's 12-phase ketogenic diet continuum. Log daily glucose and ketone measurements, automatically calculate your Dr. Boz Ratio, and see your progress through each phase.

---

## Why Use This?

- **Automatic Calculations**: No manual math - enter values, get ratio instantly
- **Phase Tracking**: See where you are, what's next, requirements for each phase
- **Visual Progress**: 7-day charts and color-coded feedback
- **Complete Privacy**: All data stays on your device
- **Simple Daily Use**: Quick logging interface

---

## Quick Start

### 1. Installation

```bash
cd keto-tracker
npm install
npx expo start
```

### 2. Deploy to Device

**Option A: Expo Go (Fastest)**
1. Install Expo Go from Google Play Store
2. Scan QR code from terminal
3. App loads instantly

**Option B: Direct Install**
```bash
npx expo run:android
```

### 3. First Use

1. Open app
2. Go to "Log" tab
3. Enter glucose and ketones
4. See Dr. Boz Ratio calculated automatically
5. Save metrics

---

## Core Features

### 1. Daily Metric Logging

**What It Does**: Log glucose, ketones, optional weight, energy, and clarity levels.

**How to Use**:
- Open "Log" tab
- Enter glucose (mmol/L)
- Enter ketones (mmol/L)
- Ratio calculates automatically
- Optional: Add weight, energy (1-10), clarity (1-10)
- Save metrics

**Dr. Boz Ratio**:
- **< 40**: Excellent (deep ketosis) - Green
- **40-80**: Good (therapeutic range) - Yellow
- **> 80**: Needs improvement - Red

### 2. Phase Progression

**What It Does**: Automatically tracks progress through 12 phases.

**Phases**:
- Phase 1-4: 7 days each (Foundation phases)
- Phase 5-8: 14 days each (Fasting phases)
- Phase 9-12: Advanced fasting phases

**How to Use**:
- View current phase on Home screen
- See progress bar (e.g., "Day 3 of 7")
- Check "Phase Info" for requirements
- Automatic advancement based on duration

### 3. Analytics & Progress

**What It Does**: Shows 7-day chart of Dr. Boz Ratio with statistics.

**How to Use**:
- Open "Analytics" tab
- See 7-day trend chart
- View statistics: average, best, latest ratios
- Track improvement over time

### 4. Phase Information

**What It Does**: Detailed view of all 12 phases with requirements and educational content.

**How to Use**:
- Open "Phase Info" tab
- See current phase highlighted
- Review requirements for each phase
- Read educational content
- Check Dr. Boz Ratio guide

---

## Daily Workflow

### Morning Routine

1. Measure fasting glucose and ketones
2. Open app → "Log" tab
3. Enter values
4. See ratio calculated automatically
5. Save metrics

### Throughout Day

- Check "Home" tab for current status
- See today's ratio with color-coded feedback
- Review phase progress

### Weekly Review

- Check "Analytics" tab for 7-day trends
- Review statistics
- See improvement over time

---

## Troubleshooting

### App won't connect to device
```bash
adb kill-server
adb start-server
adb devices
```

### Expo Go not loading
- Check phone and computer on same WiFi
- Try direct install: `npx expo run:android`

### Data not saving
- Check device storage permissions
- Restart app
- Verify AsyncStorage is working

---

## FAQ

**Q: Do I need internet?**  
A: No, app works completely offline. All data stored locally.

**Q: Can I export my data?**  
A: Currently data stays on device. Export feature planned for future.

**Q: What if I miss a day?**  
A: No problem. Log when you can. App tracks what you enter.

**Q: How do phases advance?**  
A: Automatically based on duration. Phase 1-4: 7 days, Phase 5-8: 14 days.

**Q: Can I reset my progress?**  
A: Clear app data in device settings to reset. Future versions will have reset option.

---

## Best Practices

1. **Log Consistently**: Daily logging gives best insights
2. **Use Same Time**: Log at same time each day (morning fasting)
3. **Review Trends**: Check analytics weekly to see progress
4. **Follow Phase Requirements**: Check phase info for guidance

---

**Ready to track your keto journey?** Start with `npx expo start` and begin logging daily metrics.

