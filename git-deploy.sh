#!/bin/bash
# SeshTracker GitHub Save and Push Script
# This script commits all changes and pushes to GitHub

# Stop on errors
set -e

echo "🌿 SeshTracker GitHub Save and Push"
echo "=================================="
echo "Starting GitHub process at $(date)"

# Check if a commit message was provided
if [ -z "$1" ]; then
  COMMIT_MESSAGE="Production deployment update $(date +%Y-%m-%d)"
  echo "No commit message provided. Using default: \"$COMMIT_MESSAGE\""
else
  COMMIT_MESSAGE="$1"
  echo "Using commit message: \"$COMMIT_MESSAGE\""
fi

# 1. Check git status
echo -e "\n📊 Current Git Status:"
git status

# 2. Add all files
echo -e "\n➕ Adding all files to commit..."
git add .

# 3. Commit changes
echo -e "\n✍️ Committing changes..."
git commit -m "$COMMIT_MESSAGE"

# 4. Push to GitHub
echo -e "\n⬆️ Pushing to GitHub..."
git push origin main

echo -e "\n🎉 GitHub push completed at $(date)"
echo "Your changes are now saved to GitHub."
echo "==================================" 