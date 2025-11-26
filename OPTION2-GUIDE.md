# Option 2: Direct Install - Complete Guide

This is the **recommended production method** for installing the Keto Continuum Tracker directly on your Pixel 8 as a standalone development app.

## What is Option 2?

**Direct Install** means the app builds natively and installs directly on your device, giving you:
- ✅ Faster performance (no Expo Go overhead)
- ✅ Real app experience (appears in app drawer)
- ✅ Offline functionality
- ✅ Native Android integration
- ✅ Can be used without computer after installation

## Prerequisites

### 1. Enable Developer Mode on Pixel 8

**Steps:**
1. Open **Settings** on your Pixel 8
2. Scroll to **About phone**
3. Tap **Build number** 7 times rapidly
4. Enter your PIN/password if prompted
5. You'll see "You are now a developer!"

### 2. Enable USB Debugging

**Steps:**
1. Go back to main **Settings**
2. Scroll to **System** → **Developer options**
3. Toggle **USB debugging** ON
4. Confirm the warning dialog

### 3. Install ADB (Android Debug Bridge)

**On Mac:**
```bash
brew install android-platform-tools
```

**On Linux:**
```bash
sudo apt-get update
sudo apt-get install android-tools-adb
```

**On Windows:**
Download from https://developer.android.com/studio/releases/platform-tools

**Verify installation:**
```bash
adb version
# Should show: Android Debug Bridge version X.X.X
```

## Deployment Process

### Method A: Automated Script (Recommended)

**One command deployment:**
```bash
cd /home/claude/keto-tracker
./build-option2.sh
```

The script will:
1. ✅ Verify all prerequisites
2. ✅ Check device connection
3. ✅ Install dependencies if needed
4. ✅ Validate project structure
5. ✅ Build and deploy to your Pixel 8

**Expected output:**
```
🥑 Keto Continuum Tracker - Direct Install Builder
====================================================

Step 1: Verifying prerequisites...
✅ Node.js v22.21.0
✅ npm 10.9.4
✅ ADB installed

Step 2: Checking device connection...
✅ Device connected!

Step 3: Verifying dependencies...
✅ Dependencies already installed

Step 4: Checking build configuration...
✅ app.json configuration found
✅ package.json found

Step 5: Running pre-flight validation...
✅ App.js found
✅ Screen components found
✅ Storage utility found

Step 6: Starting deployment...
✅ Using DIRECT INSTALL method

Starting native Android build...
[Build process starts...]
```

**First build takes 3-5 minutes. Subsequent builds take ~1 minute.**

### Method B: Manual Step-by-Step

If you prefer manual control:

**1. Connect your Pixel 8:**
```bash
# Connect via USB cable
adb devices

# Expected output:
# List of devices attached
# 1A2B3C4D5E6F    device
```

If you see "unauthorized", check your phone for USB debugging authorization prompt.

**2. Verify project setup:**
```bash
cd /home/claude/keto-tracker
npm install  # If not already done
```

**3. Start native build:**
```bash
npx expo run:android
```

**4. Wait for build:**
- Metro bundler starts
- Gradle build runs (first time: 3-5 min)
- APK compiles
- App installs on device
- App launches automatically

**5. Verify installation:**
- Check app drawer on Pixel 8
- You should see "Keto Continuum Tracker" icon
- App persists after closing
- No computer needed after first install

## Build Process Explained

### What Happens During Build?

```
1. Dependencies Check
   └─→ Verifies node_modules are installed

2. Gradle Sync
   └─→ Downloads Android build tools (first time only)
   └─→ Syncs project with Android SDK

3. Native Compilation
   └─→ Compiles JavaScript to bytecode
   └─→ Builds native Android libraries
   └─→ Packages assets and resources

4. APK Generation
   └─→ Creates debug APK (~20-30 MB)
   └─→ Signs with debug keystore

5. Installation
   └─→ Pushes APK to device via ADB
   └─→ Installs on device
   └─→ Launches app automatically

6. Metro Bundler
   └─→ Continues running for hot reload
   └─→ Can be closed after successful launch
```

## Troubleshooting

### Issue: "No devices detected"

**Solutions:**
1. Check USB cable (try different cable)
2. Verify USB debugging is enabled
3. Accept USB debugging prompt on phone
4. Try different USB port
5. Restart ADB:
   ```bash
   adb kill-server
   adb start-server
   adb devices
   ```

### Issue: "Build failed - Gradle sync error"

**Solutions:**
1. Clear build cache:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx expo run:android
   ```

2. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   npx expo run:android
   ```

### Issue: "App installs but crashes on launch"

**Solutions:**
1. Check Metro bundler is still running
2. Verify all source files are present
3. Check device storage (need ~100MB free)
4. Try uninstall and reinstall:
   ```bash
   adb uninstall com.yourname.ketocontinuum
   npx expo run:android
   ```

### Issue: "Metro bundler port already in use"

**Solutions:**
```bash
# Kill any running metro instances
killall node
# Or specify different port
npx expo start --port 8082
```

### Issue: "Build takes too long (>10 minutes)"

**Possible causes:**
- Slow internet (downloading Gradle dependencies)
- Low disk space
- Antivirus scanning build files

**Solutions:**
1. Check internet connection
2. Free up disk space (need 5GB for build tools)
3. Temporarily disable antivirus
4. Check build output for specific error

## Post-Installation

### Testing the Installation

**1. Verify app is installed:**
```bash
adb shell pm list packages | grep ketocontinuum
# Should show: package:com.yourname.ketocontinuum
```

**2. Launch app manually:**
- Find "Keto Continuum Tracker" in app drawer
- Tap to open
- Should see Phase 1 home screen

**3. Test core functionality:**
- [ ] Navigate all 4 tabs
- [ ] Log metrics (glucose/ketones)
- [ ] See ratio calculate
- [ ] Close and reopen (data persists)

### Development vs Production

This is a **development build** which means:
- ✅ Includes Metro bundler for hot reload
- ✅ Better debugging tools
- ✅ Can update code and rebuild quickly
- ⚠️ Larger APK size (~30MB vs ~15MB production)
- ⚠️ Not optimized for performance

For **production build** (smaller, faster), see:
`README.md` → "Method 3: Production APK"

## Updating the App

After making code changes:

**Quick rebuild:**
```bash
npx expo run:android
```

**Or if Metro is still running:**
1. Press `r` in Metro terminal to reload
2. Press `Shift+r` to reload and clear cache

**Clean rebuild (if issues):**
```bash
rm -rf android/build
rm -rf android/app/build
npx expo run:android
```

## Metro Bundler Commands

While app is running, Metro terminal accepts:

- `r` - Reload app
- `Shift+r` - Reload and clear cache
- `d` - Open developer menu on device
- `i` - Run on iOS (if available)
- `a` - Run on Android (reconnect)
- `w` - Run on web
- `?` - Show all commands

## File Locations on Device

**App data stored at:**
```
/data/data/com.yourname.ketocontinuum/
├── databases/
│   └── RKStorage (AsyncStorage SQLite)
├── files/
└── shared_prefs/
```

**View data (requires root):**
```bash
adb shell run-as com.yourname.ketocontinuum
ls databases/
```

## Sharing Your Build

If you want to share the APK with others:

**1. Find the APK:**
```bash
find android/app/build -name "*.apk"
```

**2. Copy to computer:**
```bash
cp android/app/build/outputs/apk/debug/app-debug.apk ~/keto-tracker.apk
```

**3. Install on other devices:**
```bash
adb install ~/keto-tracker.apk
```

**Note:** Debug APKs are signed with debug key and expire after 365 days.

## Performance Optimization

For faster subsequent builds:

**1. Enable Gradle daemon:**
```bash
echo "org.gradle.daemon=true" >> android/gradle.properties
```

**2. Increase Gradle memory:**
```bash
echo "org.gradle.jvmargs=-Xmx4096m" >> android/gradle.properties
```

**3. Enable parallel builds:**
```bash
echo "org.gradle.parallel=true" >> android/gradle.properties
```

## Comparison: Option 1 vs Option 2

| Feature | Option 1 (Expo Go) | Option 2 (Direct Install) |
|---------|-------------------|---------------------------|
| **Speed to test** | 2 minutes | 5 minutes (first time) |
| **App size** | ~50MB (Expo Go) | ~30MB (dev build) |
| **Performance** | Slower | Faster |
| **Persistence** | Via Expo Go | Standalone app |
| **Offline use** | Requires Expo Go | Full offline |
| **Updates** | Instant | Rebuild required |
| **Distribution** | Cannot share | Can share APK |
| **Best for** | Quick testing | Production use |

## Next Steps

After successful installation:

1. ✅ Complete testing checklist (see TESTING.md)
2. ✅ Use daily for 7+ days to validate
3. ✅ Report any bugs or issues
4. ✅ Consider upgrading to production build (Option 3)

## Support

**Build issues?**
1. Check this guide's Troubleshooting section
2. Review README.md for general setup
3. Check Metro bundler output for specific errors
4. Verify ARCHITECTURE.md for expected behavior

**App issues after install?**
- See TESTING.md for validation checklist
- Check logcat for crash details:
  ```bash
  adb logcat | grep -i "ketocontinuum"
  ```

---

**Success Indicator:**
If you can open the app from your Pixel 8 app drawer, log metrics, and see data persist after closing → **Option 2 deployment is successful! 🎉**
