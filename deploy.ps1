# SeshTracker Production Deployment Script

Write-Host "Starting SeshTracker deployment process..." -ForegroundColor Cyan

# 1. Set environment variables
$env:VITE_AUTH_API_URL = "https://api.kushobserver.com"
$env:VITE_APP_ENV = "production"
$env:VITE_APP_NAME = "SeshTracker"
$env:VITE_APP_VERSION = "2.0"

# 2. Clean the build directory
Write-Host "Cleaning previous build..." -ForegroundColor Yellow
Remove-Item -Path ".\dist" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Build the application
Write-Host "Building application..." -ForegroundColor Yellow
npm run build

# 4. Deploy to Cloudflare Workers
Write-Host "Deploying to Cloudflare Workers..." -ForegroundColor Yellow
wrangler deploy

Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "Your application should now be live at https://sesh-tracker.com" -ForegroundColor Cyan

Write-Host "`nRemember to set up your DNS records in Cloudflare to point to your Worker!" -ForegroundColor Yellow 