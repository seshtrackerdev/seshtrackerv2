#!/usr/bin/env pwsh

# SeshTracker Build Script - Updated April 2025
# ------------------------------------------------
# This script builds both the React frontend and Cloudflare Worker backend
# for the SeshTracker application

Write-Host "🚀 Starting SeshTracker build process..." -ForegroundColor Cyan

# Step 1: Clean existing build artifacts
Write-Host "Step 1: Cleaning previous build artifacts..." -ForegroundColor Green
if (Test-Path -Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
}

# Step 2: Set up environment variables
Write-Host "Step 2: Setting up environment variables..." -ForegroundColor Green
$env:VITE_APP_VERSION = "3.0"
$env:VITE_AUTH_API_URL = "https://kush.observer/api/v2"

# Step 3: Build the frontend with Vite
Write-Host "Step 3: Building frontend with Vite..." -ForegroundColor Green
npm run build

# Step 4: Verify build output structure
Write-Host "Step 4: Verifying build structure..." -ForegroundColor Green
if (-not (Test-Path -Path "dist")) {
    Write-Host "❌ Build failed: dist directory not created" -ForegroundColor Red
    exit 1
}

# Step 5: Perform a dry-run of the Cloudflare Worker deployment to validate
Write-Host "Step 5: Validating Worker build..." -ForegroundColor Green
npx wrangler deploy --dry-run

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host "The optimized build is available in the dist directory" -ForegroundColor Cyan
Write-Host "To deploy, run 'npm run deploy' or './deploy.ps1'" -ForegroundColor Yellow 