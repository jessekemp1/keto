#!/bin/bash

# Keto Continuum Tracker - Option 2: Direct Install Builder
# This script handles the complete build and deployment process

set -e  # Exit on error

echo "🥑 Keto Continuum Tracker - Direct Install Builder"
echo "===================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC}  $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

# Step 1: Verify prerequisites
echo "Step 1: Verifying prerequisites..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Install from https://nodejs.org/"
    exit 1
fi
print_status "Node.js $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm not found"
    exit 1
fi
print_status "npm $(npm --version)"

# Check for ADB
if ! command -v adb &> /dev/null; then
    print_warning "ADB not found. Install android-platform-tools:"
    echo "  Mac: brew install android-platform-tools"
    echo "  Linux: sudo apt-get install android-tools-adb"
    echo ""
    read -p "Continue without ADB? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    ADB_AVAILABLE=false
else
    print_status "ADB installed"
    ADB_AVAILABLE=true
fi

# Step 2: Check device connection
echo ""
echo "Step 2: Checking device connection..."
echo ""

if [ "$ADB_AVAILABLE" = true ]; then
    DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l)
    
    if [ $DEVICES -eq 0 ]; then
        print_warning "No Android device detected"
        echo ""
        echo "To connect your Pixel 8:"
        echo "1. Enable Developer Options:"
        echo "   Settings → About phone → Tap 'Build number' 7 times"
        echo ""
        echo "2. Enable USB Debugging:"
        echo "   Settings → System → Developer options → USB debugging"
        echo ""
        echo "3. Connect USB cable"
        echo "4. Accept USB debugging prompt on phone"
        echo ""
        read -p "Connect device and press Enter to continue..."
        
        # Check again
        DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l)
        if [ $DEVICES -eq 0 ]; then
            print_error "Still no device detected. Using Expo Go method instead."
            echo ""
            echo "Alternative: Install 'Expo Go' from Play Store and scan QR code"
            DEPLOYMENT_METHOD="expo-go"
        else
            print_status "Device connected!"
            DEPLOYMENT_METHOD="direct"
        fi
    else
        print_status "Device connected!"
        adb devices
        DEPLOYMENT_METHOD="direct"
    fi
else
    print_warning "ADB not available - will use Expo Go method"
    DEPLOYMENT_METHOD="expo-go"
fi

# Step 3: Verify dependencies
echo ""
echo "Step 3: Verifying dependencies..."
echo ""

if [ ! -d "node_modules" ]; then
    print_warning "Dependencies not installed. Running npm install..."
    npm install
    print_status "Dependencies installed"
else
    print_status "Dependencies already installed"
fi

# Step 4: Build configuration check
echo ""
echo "Step 4: Checking build configuration..."
echo ""

if [ -f "app.json" ]; then
    print_status "app.json configuration found"
else
    print_error "app.json not found"
    exit 1
fi

if [ -f "package.json" ]; then
    print_status "package.json found"
else
    print_error "package.json not found"
    exit 1
fi

# Step 5: Pre-flight validation
echo ""
echo "Step 5: Running pre-flight validation..."
echo ""

# Check for common issues
if [ ! -f "App.js" ]; then
    print_error "App.js not found - corrupt project?"
    exit 1
fi
print_status "App.js found"

if [ ! -d "src/screens" ]; then
    print_error "src/screens directory missing"
    exit 1
fi
print_status "Screen components found"

if [ ! -f "src/utils/storage.js" ]; then
    print_error "Storage utility missing"
    exit 1
fi
print_status "Storage utility found"

# Step 6: Start build/deployment
echo ""
echo "Step 6: Starting deployment..."
echo ""

if [ "$DEPLOYMENT_METHOD" = "direct" ]; then
    print_status "Using DIRECT INSTALL method"
    echo ""
    echo "The app will now build and install directly on your Pixel 8"
    echo "This may take 3-5 minutes on first build..."
    echo ""
    echo "You will see a Metro bundler window. Once it says 'Successfully built', "
    echo "the app will automatically install on your device."
    echo ""
    read -p "Press Enter to start build..."
    
    # Option A: Use expo run:android (full native build)
    echo ""
    echo "Starting native Android build..."
    npx expo run:android
    
elif [ "$DEPLOYMENT_METHOD" = "expo-go" ]; then
    print_status "Using EXPO GO method"
    echo ""
    echo "Steps to deploy:"
    echo "1. Install 'Expo Go' from Google Play Store on your Pixel 8"
    echo "2. A QR code will appear below"
    echo "3. Open Expo Go and scan the QR code"
    echo "4. App will load on your device"
    echo ""
    read -p "Press Enter to start Expo dev server..."
    
    # Start Expo dev server
    npx expo start
fi

echo ""
print_status "Deployment process started!"
echo ""
echo "Next steps:"
echo "- The app should now be running on your Pixel 8"
echo "- Test by logging your first metrics (glucose + ketones)"
echo "- Navigate through all 4 tabs to verify functionality"
echo ""
echo "For troubleshooting, see README.md or TESTING.md"
