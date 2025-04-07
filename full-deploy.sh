#!/bin/bash
# SeshTracker Complete Deployment Script
# This script handles both GitHub push and Cloudflare deployment

# Stop on errors
set -e

echo "🌿 SeshTracker Complete Deployment Process"
echo "=========================================="
echo "Starting deployment process at $(date)"

# Check if a commit message was provided
if [ -z "$1" ]; then
  COMMIT_MESSAGE="Production deployment update $(date +%Y-%m-%d)"
  echo "No commit message provided. Using default: \"$COMMIT_MESSAGE\""
else
  COMMIT_MESSAGE="$1"
  echo "Using commit message: \"$COMMIT_MESSAGE\""
fi

# PART 1: GITHUB SAVE
echo -e "\n📦 PART 1: SAVE TO GITHUB"
echo "------------------------"

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

echo -e "\n✅ GitHub push completed!"

# PART 2: PRODUCTION DEPLOYMENT
echo -e "\n🚀 PART 2: DEPLOY TO PRODUCTION"
echo "----------------------------"

# 5. Install dependencies
echo -e "\n📦 Installing dependencies..."
npm ci --production

# 6. Build the frontend
echo -e "\n🔨 Building frontend assets..."
npm run build

# 7. Run linting and type checks
echo -e "\n🔍 Running linting and type checks..."
npm run lint
npm run typecheck

# 8. Deploy to Cloudflare
echo -e "\n☁️ Deploying to Cloudflare Workers..."
npx wrangler deploy --env production

# 9. Verify deployment
echo -e "\n✅ Verifying deployment..."
if curl -s https://sesh-tracker.com/api/health | grep -q "ok"; then
  echo "✅ API deployment verified!"
else
  echo "⚠️ API verification failed. Please check manually."
fi

echo -e "\n🎉 Complete deployment process finished at $(date)"
echo "Application is now live at https://sesh-tracker.com"
echo "==========================================" 