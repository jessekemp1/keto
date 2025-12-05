#!/bin/bash

# Keto Tracker - Setup Verification Script
# Checks that all prerequisites are met before starting the app

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔍 Checking Keto Tracker setup..."
echo ""

# Check 1: Node.js and npm
echo "1️⃣  Checking Node.js and npm..."
if ! command -v node &> /dev/null; then
    echo "   ❌ Node.js not found"
    echo "   💡 Install nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    exit 1
fi

# Load nvm if available
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh" 2>/dev/null || true
elif [ -s "$NVM_DIR/nvm.sh" ]; then
    source "$NVM_DIR/nvm.sh" 2>/dev/null || true
fi

# Use .nvmrc if available
if [ -f ".nvmrc" ] && command -v nvm &> /dev/null; then
    nvm use 2>/dev/null || true
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "   ✅ Node.js $NODE_VERSION"
echo "   ✅ npm $NPM_VERSION"
echo ""

# Check 2: Required files
echo "2️⃣  Checking required files..."
REQUIRED_FILES=("package.json" "App.js" ".nvmrc")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "   ❌ Missing: $file"
        exit 1
    fi
done
echo "   ✅ All required files present"
echo ""

# Check 3: Dependencies installed
echo "3️⃣  Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   ⚠️  node_modules not found"
    echo "   💡 Running: npm install"
    npm install
else
    echo "   ✅ node_modules directory exists"
fi
echo ""

# Check 4: Critical dependencies
echo "4️⃣  Verifying critical dependencies..."
CRITICAL_DEPS=(
    "react-native-gesture-handler"
    "@react-navigation/stack"
    "@react-navigation/native"
    "expo"
    "react-native"
)

MISSING_DEPS=()
for dep in "${CRITICAL_DEPS[@]}"; do
    if ! npm list "$dep" &>/dev/null; then
        MISSING_DEPS+=("$dep")
    fi
done

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    echo "   ⚠️  Missing dependencies: ${MISSING_DEPS[*]}"
    echo "   💡 Running: npm install"
    npm install
else
    echo "   ✅ All critical dependencies installed"
fi
echo ""

# Check 5: App.js has gesture-handler import
echo "5️⃣  Checking App.js configuration..."
if ! grep -q "react-native-gesture-handler" App.js 2>/dev/null; then
    echo "   ⚠️  Missing react-native-gesture-handler import in App.js"
    echo "   💡 This should be the first import in App.js"
else
    echo "   ✅ react-native-gesture-handler import found"
fi
echo ""

# Check 6: Port availability (optional)
echo "6️⃣  Checking port availability..."
if lsof -ti:8081 &>/dev/null; then
    echo "   ⚠️  Port 8081 (Metro bundler) is in use"
    echo "   💡 Another Expo instance may be running"
else
    echo "   ✅ Port 8081 available"
fi

if lsof -ti:19006 &>/dev/null; then
    echo "   ⚠️  Port 19006 (Web dev server) is in use"
    echo "   💡 Another web instance may be running"
else
    echo "   ✅ Port 19006 available"
fi
echo ""

echo "✅ Setup check complete!"
echo ""
echo "🚀 Ready to start. Use:"
echo "   ./start.sh              # Start Expo (choose platform)"
echo "   ./start.sh start -- --web   # Start web version"
echo ""

