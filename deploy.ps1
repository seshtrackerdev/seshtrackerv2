# SeshTracker Production Deployment Script (PowerShell)
# This script handles the complete process of deploying SeshTracker to production

# Stop on errors
$ErrorActionPreference = "Stop"

Write-Host "🌿 SeshTracker Production Deployment"
Write-Host "===================================="
Write-Host "Starting deployment process at $(Get-Date)"

# 1. Ensure we have the latest code
Write-Host "`n📦 Pulling latest changes from GitHub..."
git pull origin main

# 2. Install dependencies
Write-Host "`n📦 Installing dependencies..."
npm ci --production

# 3. Build the frontend
Write-Host "`n🔨 Building frontend assets..."
npm run build

# 4. Run linting and type checks
Write-Host "`n🔍 Running linting and type checks..."
npm run lint
npm run typecheck

# 5. Deploy to Cloudflare
Write-Host "`n☁️ Deploying to Cloudflare Workers..."
npx wrangler deploy --env production

# 6. Verify deployment
Write-Host "`n✅ Verifying deployment..."
try {
    $response = Invoke-WebRequest -Uri "https://sesh-tracker.com/api/health" -UseBasicParsing
    if ($response.Content -like "*ok*") {
        Write-Host "✅ API deployment verified!" -ForegroundColor Green
    } else {
        Write-Host "❌ API verification failed!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ API verification failed! Error: $_" -ForegroundColor Red
}

Write-Host "`n🎉 Deployment completed at $(Get-Date)"
Write-Host "SeshTracker is now live at https://sesh-tracker.com"
Write-Host "====================================" 