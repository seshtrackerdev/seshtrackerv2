#!/usr/bin/env pwsh

# SeshTracker Deployment Script - Updated April 2025
# --------------------------------------------------
# This script deploys the SeshTracker application to Cloudflare Workers.
# It handles environment variables and validates deployment.

Write-Host "🚀 Starting SeshTracker deployment process..." -ForegroundColor Cyan

# 1. Determine environment based on optional parameter
param (
    [string]$Environment = "production"
)

# 2. Set environment variables based on environment
Write-Host "Setting up $Environment environment variables..." -ForegroundColor Yellow

# Load environment-specific variables - adjust paths if needed
$envFile = ".env.$Environment"
if (Test-Path $envFile) {
    Write-Host "Loading environment from $envFile" -ForegroundColor Green
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$name" -Value $value
        }
    }
} else {
    # Default environment variables if no env file exists
    switch ($Environment) {
        "production" {
            $env:VITE_AUTH_API_URL = "https://kush.observer/api/v2"
            $env:VITE_APP_ENV = "production"
        }
        "staging" {
            $env:VITE_AUTH_API_URL = "https://staging.kush.observer/api/v2"
            $env:VITE_APP_ENV = "staging"
        }
        "development" {
            $env:VITE_AUTH_API_URL = "https://dev.kush.observer/api/v2"
            $env:VITE_APP_ENV = "development"
        }
    }
}

# 3. Run the build process
Write-Host "Building application for $Environment..." -ForegroundColor Yellow
npm run build

# 4. Deploy to Cloudflare Workers
Write-Host "Deploying to Cloudflare Workers ($Environment)..." -ForegroundColor Yellow
npx wrangler deploy --env $Environment

# 5. Log deployment completion
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$deployLog = "docs/deployments.log"

# Ensure log directory exists
if (-not (Test-Path -Path (Split-Path -Path $deployLog -Parent))) {
    New-Item -Path (Split-Path -Path $deployLog -Parent) -ItemType Directory | Out-Null
}

# Log deployment
Add-Content -Path $deployLog -Value "$timestamp - Deployed to $Environment environment"

# 6. Display completion message
Write-Host "`n✅ Deployment completed!" -ForegroundColor Green
$domain = if ($Environment -eq "production") { "sesh-tracker.com" } else { "$Environment.sesh-tracker.com" }
Write-Host "Your application should now be live at https://$domain" -ForegroundColor Cyan

Write-Host "`nRemember to set up your DNS records in Cloudflare to point to your Worker!" -ForegroundColor Yellow 