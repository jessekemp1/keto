#!/bin/bash

# Force Sync Worktree Script
# Completely overwrites worktree with source files
# Run this whenever Cursor can't apply changes

set -e  # Exit on error

SOURCE_DIR="/Users/jesse.kemp/Dev/keto-tracker"
WORKTREE_DIR="/Users/jesse.kemp/.cursor/worktrees/Dev__Workspace_/hco/keto-tracker"

echo "=========================================="
echo "FORCE SYNC WORKTREE SCRIPT"
echo "=========================================="
echo ""
echo "Source: $SOURCE_DIR"
echo "Worktree: $WORKTREE_DIR"
echo ""

# Step 1: Verify source exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ ERROR: Source directory does not exist: $SOURCE_DIR"
    exit 1
fi

# Step 2: Create worktree directory if it doesn't exist
mkdir -p "$WORKTREE_DIR"
echo "✅ Worktree directory ready"

# Step 3: Remove existing .git in worktree (we'll recreate it)
if [ -d "$WORKTREE_DIR/.git" ]; then
    echo "⚠️  Removing existing .git in worktree..."
    rm -rf "$WORKTREE_DIR/.git"
fi

# Step 4: Force copy ALL files from source to worktree
echo ""
echo "📦 Copying ALL files from source to worktree..."
rsync -av --delete \
    --exclude 'node_modules' \
    --exclude '.expo' \
    --exclude 'venv' \
    --exclude '__pycache__' \
    --exclude '*.backup*' \
    --exclude '.DS_Store' \
    --exclude 'web-build' \
    "$SOURCE_DIR/" "$WORKTREE_DIR/"

echo "✅ Files copied"

# Step 5: Initialize git in worktree
echo ""
echo "🔧 Initializing git repository in worktree..."
cd "$WORKTREE_DIR"

# Initialize git
git init

# Set remote
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/jessekemp1/keto.git

# Fetch from remote
echo "📥 Fetching from remote..."
git fetch origin --depth=100 2>&1 | tail -3

# Get source branch
cd "$SOURCE_DIR"
SOURCE_BRANCH=$(git branch --show-current)
SOURCE_COMMIT=$(git rev-parse HEAD)

echo ""
echo "Source branch: $SOURCE_BRANCH"
echo "Source commit: $SOURCE_COMMIT"

# Set worktree to match source
cd "$WORKTREE_DIR"

# Try to checkout the branch
if git show-ref --verify --quiet "refs/remotes/origin/$SOURCE_BRANCH"; then
    echo "✅ Branch $SOURCE_BRANCH exists in remote"
    git checkout -b "$SOURCE_BRANCH" "origin/$SOURCE_BRANCH" 2>&1 || git checkout "$SOURCE_BRANCH" 2>&1
else
    echo "⚠️  Branch not in remote, creating local branch"
    git checkout -b "$SOURCE_BRANCH" 2>&1 || git checkout "$SOURCE_BRANCH" 2>&1
fi

# Try to reset to source commit, fallback to origin/main
if git cat-file -e "$SOURCE_COMMIT" 2>/dev/null; then
    echo "✅ Resetting to source commit: $SOURCE_COMMIT"
    git reset --hard "$SOURCE_COMMIT" 2>&1
else
    echo "⚠️  Source commit not available, using origin/main"
    git reset --hard origin/main 2>&1 || true
fi

# Step 6: Restore files again (rsync overwrote them, but we need current state)
echo ""
echo "🔄 Restoring current file state..."
rsync -av \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.expo' \
    --exclude 'venv' \
    --exclude '__pycache__' \
    --exclude '*.backup*' \
    --exclude '.DS_Store' \
    --exclude 'web-build' \
    "$SOURCE_DIR/" "$WORKTREE_DIR/"

echo "✅ Files restored"

# Step 7: Final verification
echo ""
echo "=========================================="
echo "VERIFICATION"
echo "=========================================="

# Check .git exists
if [ -d "$WORKTREE_DIR/.git" ]; then
    echo "✅ .git directory exists"
else
    echo "❌ .git directory MISSING"
fi

# Check remote
cd "$WORKTREE_DIR"
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "NOT SET")
if [[ "$REMOTE_URL" == *"keto.git"* ]]; then
    echo "✅ Remote configured: $REMOTE_URL"
else
    echo "❌ Remote not configured correctly: $REMOTE_URL"
fi

# Check branch
BRANCH=$(git branch --show-current 2>/dev/null || echo "NOT SET")
echo "✅ Branch: $BRANCH"

# Check critical files
echo ""
echo "Critical files:"
for file in FIREBASE_QUICK_SETUP.md App.js package.json src/screens/SettingsScreen.js src/contexts/ThemeContext.js; do
    if [ -f "$WORKTREE_DIR/$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file MISSING"
    fi
done

# Git status
echo ""
echo "Git status:"
git status --short 2>&1 | head -5
MODIFIED_COUNT=$(git status --short 2>&1 | wc -l | tr -d ' ')
echo "Modified files: $MODIFIED_COUNT"

echo ""
echo "=========================================="
echo "✅ FORCE SYNC COMPLETE!"
echo "=========================================="
echo ""
echo "Worktree location: $WORKTREE_DIR"
echo ""
echo "If you still get errors, try:"
echo "  1. Close and reopen Cursor"
echo "  2. Run this script again"
echo "  3. Check Cursor's worktree settings"
echo ""
