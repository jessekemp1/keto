# Quick Start Guide

## Starting the App

### Method 1: Use the Start Script (Recommended)
```bash
./start.sh
```

This script automatically:
- Loads nvm if available
- Uses the Node.js version from `.nvmrc`
- Starts the Expo development server

### Method 2: Manual Start
```bash
# First, ensure nvm is loaded
source ~/.nvm/nvm.sh

# Then start the app
npm start
```

### Method 3: Using direnv (Auto-loads nvm)
If you have `direnv` installed:
```bash
# Allow direnv in this directory (one-time)
direnv allow

# Now nvm will auto-load when you cd into this directory
npm start
```

## Platform-Specific Starts

### Web
```bash
./start.sh start -- --web
# or
npm start -- --web
```

### Android
```bash
./start.sh start -- --android
# or
npm start -- --android
```

### iOS
```bash
./start.sh start -- --ios
# or
npm start -- --ios
```

## Troubleshooting

### "npm: command not found"
The start script should handle this automatically. If you still get this error:
1. Make sure nvm is installed: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash`
2. Restart your terminal
3. Use `./start.sh` instead of `npm start` directly

### Node Version Issues
The project uses Node.js v22.18.0 (specified in `.nvmrc`). The start script will automatically use this version if nvm is available.
