#!/bin/bash

# Keto Tracker - Start Script with NVM Support
# This script ensures nvm is loaded and dependencies are ready before starting
# Usage: ./start.sh [npm-command] [args...]
# Examples:
#   ./start.sh              # Runs: npm start
#   ./start.sh start -- --web   # Runs: npm start -- --web
#   ./start.sh install      # Runs: npm install

set -e

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load nvm if it exists
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh" 2>/dev/null || true
elif [ -s "$NVM_DIR/nvm.sh" ]; then
    source "$NVM_DIR/nvm.sh" 2>/dev/null || true
fi

# Use .nvmrc if it exists and nvm is available
if [ -f ".nvmrc" ] && command -v nvm &> /dev/null; then
    nvm use 2>/dev/null || true
fi

# Check if node/npm are available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js not found. Please install Node.js or set up nvm."
    echo "   Install nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"
echo ""

# Quick dependency check (only if starting the app)
if [ $# -eq 0 ] || [ "$1" = "start" ]; then
    if [ ! -d "node_modules" ]; then
        echo "⚠️  node_modules not found. Installing dependencies..."
        npm install
        echo ""
    fi
    
    # Verify critical dependencies
    if ! npm list react-native-gesture-handler @react-navigation/stack &>/dev/null; then
        echo "⚠️  Missing critical dependencies. Installing..."
        npm install react-native-gesture-handler @react-navigation/stack
        echo ""
    fi
fi

# Run the command passed as arguments, or default to "npm start"
if [ $# -eq 0 ]; then
    echo "🚀 Starting Expo development server..."
    echo "   📱 Press 'a' for Android, 'i' for iOS, 'w' for web"
    echo "   🌐 Web will be available at: http://localhost:19006"
    echo ""
    npm start
else
    echo "🚀 Running: npm $@"
    npm "$@"
fi

