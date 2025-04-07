#!/bin/bash
# SeshTracker Production Deployment Script
# This script handles the complete process of deploying SeshTracker to production

# Stop on errors
set -e

echo "🌿 SeshTracker Production Deployment"
echo "===================================="
echo "Starting deployment process at $(date)"

# 1. Ensure we have the latest code
echo "\n📦 Pulling latest changes from GitHub..."
git pull origin main

# 2. Install dependencies
echo "\n📦 Installing dependencies..."
npm ci --production

# 3. Build the frontend
echo "\n🔨 Building frontend assets..."
npm run build

# 4. Run linting and type checks
echo "\n🔍 Running linting and type checks..."
npm run lint
npm run typecheck

# 5. Deploy to Cloudflare
echo "\n☁️ Deploying to Cloudflare Workers..."
npx wrangler deploy --env production

# 6. Verify deployment
echo "\n✅ Verifying deployment..."
curl -s https://sesh-tracker.com/api/health | grep -q "ok" && \
  echo "✅ API deployment verified!" || \
  echo "❌ API verification failed!"

echo "\n🎉 Deployment completed at $(date)"
echo "SeshTracker is now live at https://sesh-tracker.com"
echo "====================================" 