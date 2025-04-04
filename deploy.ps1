# SeshTracker Deployment Script for Windows

Write-Host "🌿 Starting SeshTracker deployment..." -ForegroundColor Green

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Run the clean build script
Write-Host "🔨 Building application with optimized structure..." -ForegroundColor Yellow
./build.ps1

# Deploy to Cloudflare
Write-Host "🚀 Deploying to Cloudflare..." -ForegroundColor Yellow
npx wrangler deploy

Write-Host "✅ Deployment complete! Your site should be available at https://sesh-tracker.com" -ForegroundColor Green
Write-Host "  - Classic version: https://sesh-tracker.com/legacy/" -ForegroundColor Cyan
Write-Host "  - Classic redirect: https://sesh-tracker.com/classic.html" -ForegroundColor Cyan

Write-Host "`nRemember to set up your DNS records in Cloudflare to point to your Worker!" -ForegroundColor Yellow 