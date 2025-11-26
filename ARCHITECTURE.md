# Architecture & Data Flow

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      User's Pixel 8                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              React Native App (Expo)                     ││
│  │                                                           ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ││
│  │  │     Home     │  │     Log      │  │  Analytics   │  ││
│  │  │    Screen    │  │   Metrics    │  │    Screen    │  ││
│  │  │              │  │    Screen    │  │              │  ││
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  ││
│  │         │                  │                  │          ││
│  │         └──────────────────┼──────────────────┘          ││
│  │                            │                             ││
│  │                    ┌───────▼────────┐                    ││
│  │                    │  Storage Utils │                    ││
│  │                    │  (storage.js)  │                    ││
│  │                    └───────┬────────┘                    ││
│  │                            │                             ││
│  │                    ┌───────▼────────┐                    ││
│  │                    │  AsyncStorage  │                    ││
│  │                    │ (Local SQLite) │                    ││
│  │                    └────────────────┘                    ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Navigation Structure

```
App.js (Root)
│
├── Bottom Tab Navigator
    │
    ├── Home Tab → HomeScreen.js
    │   └── Shows: Current phase, today's ratio, quick actions
    │
    ├── Log Tab → LogMetricsScreen.js
    │   └── Shows: Input form for glucose/ketones, calculates ratio
    │
    ├── Analytics Tab → AnalyticsScreen.js
    │   └── Shows: 7-day chart, statistics, recent entries
    │
    └── Phase Tab → PhaseInfoScreen.js
        └── Shows: Current phase details, all 12 phases, education
```

## Data Flow

### 1. Logging New Metrics

```
User enters glucose (85) and ketones (1.0)
        │
        ▼
LogMetricsScreen calculates ratio (85/1.0 = 85)
        │
        ▼
User clicks "Save"
        │
        ▼
LogMetricsScreen.handleSave()
        │
        ▼
storage.saveDailyMetric({
    date: "2025-11-25",
    glucose: 85,
    ketones: 1.0,
    drBozRatio: 85,
    weight: null,
    energy: null,
    clarity: null
})
        │
        ▼
AsyncStorage.setItem("daily_metrics", JSON.stringify([...]))
        │
        ▼
Navigation to HomeScreen
        │
        ▼
HomeScreen loads today's metric
        │
        ▼
Display ratio: 85 (yellow, "Fair")
```

### 2. Phase Advancement

```
User opens app
        │
        ▼
HomeScreen.loadData()
        │
        ▼
getUserProfile() → Current: Phase 1, Started: "2025-11-18"
        │
        ▼
checkPhaseAdvancement()
        │
        ├─→ Days in phase: 7 (started Nov 18, now Nov 25)
        │   Phase 1 duration: 7 days
        │   7 >= 7 → ADVANCE
        │
        └─→ Update profile:
            - currentPhase: 2
            - phaseStartDate: "2025-11-25"
        │
        ▼
saveUserProfile()
        │
        ▼
Display Phase 2 on HomeScreen
```

### 3. Chart Rendering

```
User opens Analytics tab
        │
        ▼
AnalyticsScreen.loadMetrics()
        │
        ▼
getRecentMetrics(7) → Returns last 7 days of data
        │
        ▼
[
    { date: "2025-11-19", glucose: 85, ketones: 1.0, drBozRatio: 85 },
    { date: "2025-11-20", glucose: 80, ketones: 1.5, drBozRatio: 53.3 },
    { date: "2025-11-21", glucose: 75, ketones: 2.0, drBozRatio: 37.5 },
    ...
]
        │
        ▼
Transform to chart format:
    labels: ["11/19", "11/20", "11/21", ...]
    data: [85, 53.3, 37.5, ...]
        │
        ▼
LineChart component renders with data
        │
        ▼
Calculate statistics:
    - Latest: 37.5
    - Average: 58.6
    - Best: 37.5
    - Highest: 85
```

## Storage Schema

### AsyncStorage Keys

**1. user_profile**
```json
{
  "startDate": "2025-11-18",
  "currentPhase": 1,
  "phaseStartDate": "2025-11-18",
  "targetDrBozRatio": 80
}
```

**2. daily_metrics** (Array)
```json
[
  {
    "date": "2025-11-25",
    "glucose": 85,
    "ketones": 1.0,
    "drBozRatio": 85,
    "weight": 180,
    "energy": 8,
    "clarity": 9
  },
  {
    "date": "2025-11-24",
    "glucose": 80,
    "ketones": 1.5,
    "drBozRatio": 53.3,
    "weight": null,
    "energy": null,
    "clarity": null
  }
]
```

## Component Lifecycle

### HomeScreen Example

```
1. Component mounts
   └─→ useFocusEffect hook triggers

2. loadData() called
   ├─→ getUserProfile()
   │   └─→ Read from AsyncStorage
   │       └─→ Check if phase should advance
   │           └─→ Save if advanced
   │
   └─→ getTodayMetric()
       └─→ Read from AsyncStorage
       └─→ Filter for today's date

3. State updates
   └─→ profile: {...}
   └─→ todayMetric: {...}

4. Render with new data
   ├─→ Phase card (using profile)
   ├─→ Ratio card (using todayMetric)
   └─→ Action buttons

5. User pulls to refresh
   └─→ onRefresh() called
       └─→ loadData() again
       └─→ UI updates
```

## Key Algorithms

### Dr. Boz Ratio Calculation

```javascript
function calculateDrBozRatio(glucose, ketones) {
    if (!glucose || !ketones) return null;
    if (ketones === 0) return 999; // Prevent division by zero
    return Math.round((glucose / ketones) * 10) / 10; // Round to 1 decimal
}

// Examples:
// glucose=85, ketones=1.0 → 85.0
// glucose=80, ketones=1.5 → 53.3
// glucose=75, ketones=2.0 → 37.5
```

### Phase Advancement Logic

```javascript
function checkPhaseAdvancement(profile) {
    const phase = PHASES[profile.currentPhase];
    
    // Phase 12 has no duration (maintenance)
    if (!phase.duration) return profile;
    
    const daysInPhase = differenceInDays(
        new Date(),
        parseISO(profile.phaseStartDate)
    );
    
    // Check if completed duration
    if (daysInPhase >= phase.duration) {
        // Advance to next phase
        return {
            ...profile,
            currentPhase: Math.min(profile.currentPhase + 1, 12),
            phaseStartDate: format(new Date(), 'yyyy-MM-dd')
        };
    }
    
    return profile; // No change
}
```

### Ratio Color Coding

```javascript
function getRatioColor(ratio) {
    if (ratio === null) return '#6b7280'; // Gray
    if (ratio < 40) return '#10b981';      // Green (Excellent)
    if (ratio < 80) return '#f59e0b';      // Yellow (Good)
    return '#ef4444';                       // Red (Needs work)
}
```

## Performance Considerations

### Data Loading
- AsyncStorage reads are async but fast (<10ms)
- Data loads on screen focus, not every render
- Pull-to-refresh manually triggers reload

### State Management
- No Redux/Context needed for MVP
- Local state in each screen
- Shared utilities via storage.js
- Data refetched on screen focus (always fresh)

### Chart Rendering
- react-native-chart-kit is lightweight
- Only renders last 7 days (max ~200 data points)
- SVG-based, good performance on mobile

## Error Handling

```
User Input Validation
├─→ Non-numeric input → Rejected by keyboardType
├─→ Empty required fields → Alert before save
├─→ Negative values → Rejected by validation
└─→ Division by zero → Returns 999 (handled)

Storage Errors
├─→ Read failure → Returns default/empty
├─→ Write failure → Alert user, retry available
└─→ Data corruption → Falls back to defaults

Network Errors
└─→ N/A - No network calls in MVP
```

## Deployment Architecture

```
Development:
    Developer Machine → Metro Bundler → WiFi/USB → Pixel 8 (Expo Go)

Production:
    Developer Machine → EAS Build → APK → Manual Install → Pixel 8
```

## Security & Privacy

- **All data stored locally** (AsyncStorage SQLite)
- **No network calls** (completely offline)
- **No user authentication** (single-user device)
- **No analytics tracking**
- **No crash reporting** (in MVP)

## Future Architecture Considerations

When scaling beyond MVP:

1. **Backend**: Add Firebase/Supabase for cloud sync
2. **State Management**: Add Zustand/Redux for complex state
3. **Authentication**: Add user accounts
4. **Analytics**: Add crash reporting (Sentry)
5. **Notifications**: Add expo-notifications
6. **Testing**: Add Jest + React Native Testing Library
