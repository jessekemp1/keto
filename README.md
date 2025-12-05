# Keto Continuum Tracker MVP

Minimal viable product for tracking ketogenic diet progress through Dr. Boz's 12-phase continuum.

## Features (MVP)

- **Metric Logging**: Daily glucose and ketone tracking with auto-calculated Dr. Boz Ratio
- **Phase Progression**: Automatic advancement through 12 phases based on time
- **Analytics**: 7-day chart of Dr. Boz Ratio with statistics
- **Phase Information**: Detailed view of all 12 phases with requirements
- **Local Storage**: All data persists on device using AsyncStorage

## Quick Start - Deploy to Pixel 8

### Prerequisites

1. **Install Node.js** (v18 or higher)
   ```bash
   # Check if installed
   node --version
   npm --version
   ```

2. **Enable Developer Mode on Pixel 8**
   - Settings → About phone → Tap "Build number" 7 times
   - Settings → System → Developer options → Enable "USB debugging"

3. **Install Android Platform Tools**
   ```bash
   # On Mac with Homebrew
   brew install android-platform-tools
   
   # On Linux
   sudo apt-get install android-tools-adb
   
   # Verify
   adb version
   ```

### Installation & Build

1. **Navigate to project directory**
   ```bash
   cd /home/claude/keto-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify setup** (recommended first time)
   ```bash
   ./check-setup.sh
   ```

4. **Start Expo development server**
   ```bash
   # Option 1: Use the start script (RECOMMENDED - handles everything)
   ./start.sh
   
   # Option 2: For web specifically
   ./start.sh start -- --web
   
   # Option 3: Manual start (only if nvm is already loaded)
   npm start
   ```
   
   **Important**: Web app runs on **http://localhost:19006** (not 8081)

4. **Connect your Pixel 8**
   - Connect via USB cable
   - Authorize USB debugging on phone when prompted
   - Verify connection:
     ```bash
     adb devices
     # Should show your device
     ```

5. **Deploy to device**
   - In the Expo terminal, press `a` to open on Android device
   - OR scan QR code with Expo Go app (simpler for testing)

### Method 1: Using Expo Go (Fastest for Testing)

1. Install **Expo Go** from Google Play Store on Pixel 8
2. Run `npx expo start` on your computer
3. Scan QR code with Expo Go app
4. App loads and runs instantly

**Limitations**: Cannot create standalone APK

### Method 2: Development Build (Full Features)

1. Build development client:
   ```bash
   npx expo run:android
   ```

2. This installs a development version directly on your Pixel 8

### Method 3: Production APK (Standalone App)

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Configure build:
   ```bash
   eas build:configure
   ```

3. Build APK:
   ```bash
   eas build -p android --profile preview
   ```

4. Download APK and install on Pixel 8:
   ```bash
   adb install path/to/downloaded.apk
   ```

## Project Structure

```
keto-tracker/
├── App.js                          # Main app with navigation
├── package.json                    # Dependencies
├── app.json                        # Expo configuration
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js          # Dashboard with current status
│   │   ├── LogMetricsScreen.js    # Input glucose/ketones
│   │   ├── AnalyticsScreen.js     # 7-day chart & stats
│   │   └── PhaseInfoScreen.js     # Phase details & timeline
│   └── utils/
│       └── storage.js             # Data persistence & logic
└── README.md
```

## Usage

### Daily Workflow

1. **Morning**: 
   - Measure fasting glucose and ketones
   - Open app → "Log" tab
   - Enter values → automatic Dr. Boz Ratio calculation
   - Save metrics

2. **Throughout Day**:
   - "Home" tab shows current phase and today's ratio
   - Color-coded feedback (green/yellow/red)

3. **Review Progress**:
   - "Analytics" tab shows 7-day trend
   - Statistics: average, best, latest ratios

4. **Phase Advancement**:
   - Automatic based on duration
   - Phase 1-4: 7 days each
   - Phase 5-8: 14 days each
   - Phase 9-12: Advanced fasting phases

### Key Metrics

**Dr. Boz Ratio** = Glucose (mmol/L) ÷ Ketones (mmol/L)

- **< 40**: Excellent (deep ketosis)
- **40-80**: Good (therapeutic range)
- **> 80**: Needs improvement

## Troubleshooting

### App won't connect to device

```bash
# Restart ADB server
adb kill-server
adb start-server

# Check device connection
adb devices
```

### Can't install on Pixel 8

```bash
# Enable unknown sources
adb shell settings put global install_non_market_apps 1

# Or manually: Settings → Security → Install unknown apps
```

### Metro bundler issues

```bash
# Clear cache
npx expo start -c
```

### Build errors

```bash
# Clean install
rm -rf node_modules
rm package-lock.json
npm install
```

## Data Storage

- All data stored locally with AsyncStorage
- No backend required
- Data persists between app restarts
- No internet connection needed after installation

## Future Enhancements (Not in MVP)

- Push notifications for logging reminders
- Fasting timer for 36/72hr fasts
- Data export to CSV
- Cloud backup
- Weight tracking graph
- Medication/supplement tracking

## Testing Checklist

- [ ] Install app on Pixel 8
- [ ] Log first metrics (glucose/ketones)
- [ ] Verify Dr. Boz Ratio calculation
- [ ] Check ratio color coding
- [ ] Navigate all 4 tabs
- [ ] Log metrics for 3+ days
- [ ] Verify 7-day chart appears
- [ ] Check phase info displays correctly
- [ ] Close and reopen app (data persists)
- [ ] Verify phase auto-advancement after duration

## Technical Notes

**Why Expo?**
- Fastest development cycle
- Hot reload during development
- Easy deployment to physical device
- Cross-platform (iOS/Android from single codebase)

**Dependencies:**
- React Native 0.73
- React Navigation 6.x (tab navigation)
- AsyncStorage (local persistence)
- react-native-chart-kit (charting)
- date-fns (date manipulation)

**Performance:**
- Minimal bundle size (~15MB APK)
- No heavy dependencies
- All calculations client-side
- Fast startup time

## License

MIT License - Free to use and modify

## Support

For issues during setup:
1. Check Metro bundler output for errors
2. Verify all dependencies installed: `npm ls`
3. Ensure USB debugging enabled on Pixel 8
4. Try clearing cache: `npx expo start -c`
