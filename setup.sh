#!/bin/bash

echo "🥑 Keto Continuum Tracker - Setup Script"
echo "=========================================="
echo ""

# Check Node.js
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"

# Check for Pixel 8 connection
if command -v adb &> /dev/null; then
    echo "✅ ADB installed"
    
    DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l)
    if [ $DEVICES -gt 0 ]; then
        echo "✅ Android device connected"
    else
        echo "⚠️  No Android device detected. Connect your Pixel 8 via USB."
    fi
else
    echo "⚠️  ADB not found. Install android-platform-tools for direct deployment."
fi

echo ""
echo "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Connect your Pixel 8 via USB"
    echo "2. Enable USB debugging on device"
    echo "3. Run: npm start"
    echo "4. Press 'a' to deploy to Android device"
    echo ""
    echo "Or install Expo Go from Play Store and scan QR code"
else
    echo ""
    echo "❌ Installation failed. Check errors above."
    exit 1
fi
