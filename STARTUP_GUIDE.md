# Keto Tracker - Startup Guide

**Quick Reference**: How to start the app reliably every time.

## 🚀 Quick Start

```bash
# Option 1: Use the start script (RECOMMENDED)
./start.sh

# Option 2: For web specifically
./start.sh start -- --web
```

## 📋 Prerequisites Check

Before starting, run the setup check:

```bash
./check-setup.sh
```

This verifies:
- ✅ Node.js and npm are installed
- ✅ Correct Node.js version (from `.nvmrc`)
- ✅ All dependencies are installed
- ✅ Critical packages are present
- ✅ App.js is configured correctly
- ✅ Ports are available

## 🔧 Common Startup Issues & Fixes

### Issue 1: "npm: command not found"

**Cause**: nvm not loaded in current shell

**Fix**:
```bash
# Load nvm manually
source ~/.nvm/nvm.sh

# Or use the start script (handles this automatically)
./start.sh
```

### Issue 2: "Module not found" errors

**Cause**: Dependencies not installed or outdated

**Fix**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Or use the start script (auto-installs if missing)
./start.sh
```

### Issue 3: "Port already in use"

**Cause**: Another Expo instance running

**Fix**:
```bash
# Kill existing processes
pkill -f "expo start" || true
pkill -f "node.*expo" || true

# Or find and kill specific ports
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
lsof -ti:19006 | xargs kill -9 2>/dev/null || true

# Then start again
./start.sh
```

### Issue 4: "Unable to resolve module" errors

**Cause**: Missing dependencies or cache issues

**Fix**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npx expo start -c  # Clear Expo cache
```

### Issue 5: App crashes on startup

**Cause**: Missing `react-native-gesture-handler` import

**Fix**: Ensure `App.js` has this as the **first import**:
```javascript
import 'react-native-gesture-handler';
```

The start script verifies this automatically.

## 🌐 Web Development

When starting for web:

```bash
./start.sh start -- --web
```

**Important URLs**:
- **Metro Bundler**: http://localhost:8081 (API endpoint, not the app)
- **Web App**: http://localhost:19006 (actual web interface)

The web app runs on port **19006**, not 8081!

## 📱 Mobile Development

For Android/iOS:

```bash
./start.sh
# Then press 'a' for Android or 'i' for iOS
```

## 🔍 Verification Steps

After starting, verify:

1. **Metro bundler is running**: Should see "Metro waiting on..."
2. **No red errors**: Check terminal output
3. **Web accessible**: Navigate to http://localhost:19006 (for web)
4. **App loads**: Should see the Keto Tracker interface

## 🛠️ Troubleshooting Checklist

If the app won't start:

- [ ] Run `./check-setup.sh` to verify setup
- [ ] Check Node.js version matches `.nvmrc` (v22.18.0)
- [ ] Verify all dependencies installed: `npm list --depth=0`
- [ ] Clear cache: `npx expo start -c`
- [ ] Kill existing processes on ports 8081/19006
- [ ] Check `App.js` has gesture-handler import at top
- [ ] Verify `package.json` has all required dependencies

## 📦 Required Dependencies

Critical dependencies (auto-checked by start script):

- `react-native-gesture-handler` (must be imported first in App.js)
- `@react-navigation/stack` (for top navigation)
- `@react-navigation/native` (navigation core)
- `expo` (framework)
- `react-native` (core)

## 🎯 Best Practices

1. **Always use `./start.sh`** instead of `npm start` directly
   - Handles nvm loading automatically
   - Checks dependencies before starting
   - Provides helpful error messages

2. **Run `./check-setup.sh`** if you encounter issues
   - Identifies missing dependencies
   - Verifies configuration
   - Suggests fixes

3. **For web development**: Always use `./start.sh start -- --web`
   - Ensures webpack dev server starts correctly
   - Opens on correct port (19006)

4. **Clear cache** if you see strange errors:
   ```bash
   npx expo start -c
   ```

## 🚨 Emergency Reset

If nothing works, do a complete reset:

```bash
# Stop all processes
pkill -f expo || true
pkill -f node || true

# Clean everything
rm -rf node_modules package-lock.json
rm -rf .expo

# Reinstall
npm install

# Start fresh
./start.sh
```

## 📞 Getting Help

If issues persist:

1. Check terminal output for specific error messages
2. Run `./check-setup.sh` and review output
3. Verify Node.js version: `node --version` (should be v22.18.0)
4. Check Expo version: `npx expo --version`
5. Review browser console (for web): Open DevTools (F12)

---

**Remember**: The start script (`./start.sh`) handles most issues automatically. Use it instead of running `npm start` directly!

