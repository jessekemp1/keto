# Quick Start - Get Running in 5 Minutes

## Option 1: Fastest (Using Expo Go App)

**Time: 2 minutes**

1. **On your computer:**
   ```bash
   cd /home/claude/keto-tracker
   ./setup.sh
   npm start
   ```

2. **On your Pixel 8:**
   - Install "Expo Go" from Google Play Store
   - Open Expo Go app
   - Scan the QR code shown in terminal
   - App launches instantly!

**Pros:** Instant testing, no build process
**Cons:** Can't create standalone APK

---

## Option 2: Direct Install (Development Build)

**Time: 5 minutes**

1. **Enable USB Debugging on Pixel 8:**
   - Settings → About phone → Tap "Build number" 7 times
   - Settings → System → Developer options → Enable "USB debugging"

2. **Connect & Deploy:**
   ```bash
   cd /home/claude/keto-tracker
   ./setup.sh
   
   # Verify device connected
   adb devices
   
   # Build and install
   npm start
   # Press 'a' when prompted
   ```

**Pros:** Real app experience, faster than Expo Go
**Cons:** Takes 3-5 minutes first build

---

## Option 3: Production APK (Standalone)

**Time: 10-15 minutes (first time)**

```bash
cd /home/claude/keto-tracker
npm install -g eas-cli

# Create account (if needed)
eas login

# Build APK
eas build --platform android --profile preview

# After build completes, download and install
adb install path/to/app.apk
```

**Pros:** True standalone app, can share APK
**Cons:** Requires Expo account, longer build time

---

## Recommended Path

1. **Start with Option 1** (Expo Go) - Test immediately
2. **Move to Option 2** if you want faster performance
3. **Use Option 3** when ready for production

## Common Issues

### "adb: command not found"
```bash
# Mac
brew install android-platform-tools

# Linux
sudo apt-get install android-tools-adb
```

### Device not showing in adb devices
- Disconnect and reconnect USB
- Accept USB debugging prompt on phone
- Try different USB cable

### Metro bundler won't start
```bash
npx expo start -c
```

## What to Test First

1. ✅ Open app → See Phase 1 card on Home screen
2. ✅ Tap "Log Metrics" → Enter glucose (85) and ketones (1.0)
3. ✅ See Dr. Boz Ratio calculate to 85
4. ✅ Save → Return to Home → See today's ratio
5. ✅ Navigate to "Analytics" → (Will show data after 2-3 days)
6. ✅ Navigate to "Current Phase" → See all 12 phases

## Next Steps After Testing

- Log metrics daily for 3-5 days to see chart populate
- Watch phase auto-advance after duration completes
- Test with different glucose/ketone values
- Verify data persists after closing app

## Support

If setup fails, check:
1. Node.js version: `node --version` (needs v18+)
2. Dependencies installed: `npm ls` (should show no errors)
3. Metro bundler output for specific error messages
