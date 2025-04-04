#!/usr/bin/env pwsh

# Clean Build Script for SeshTracker

Write-Host "🚀 Starting clean build process..." -ForegroundColor Cyan

# Step 1: Run the cleanup script to organize source files
Write-Host "Step 1: Cleaning up project structure..." -ForegroundColor Green
./cleanup.ps1

# Step 2: Clean node_modules if needed (uncomment if you want to do a full clean)
# Write-Host "Step 2: Cleaning node_modules..." -ForegroundColor Green
# if (Test-Path -Path "node_modules") {
#     Remove-Item -Path "node_modules" -Recurse -Force
# }
# npm install

# Step 3: Make sure public/legacy directory exists
if (-not (Test-Path -Path "public/legacy")) {
    New-Item -Path "public/legacy" -ItemType Directory -Force | Out-Null
}

# Step 4: Make sure vite uses the correct structure
Write-Host "Step 4: Building production version..." -ForegroundColor Green
$env:VITE_USE_LEGACY_PATH = "public/legacy"
npm run build

# Step 5: Verify the build output structure
Write-Host "Step 5: Verifying build structure..." -ForegroundColor Green
if (Test-Path -Path "dist/client/classic" -PathType Container) {
    Write-Host "⚠️ Found duplicate classic directory in build, fixing..." -ForegroundColor Yellow
    if (Test-Path -Path "dist/client/legacy" -PathType Container) {
        # If legacy already exists, just make sure everything is there
        Copy-Item -Path "dist/client/classic/*" -Destination "dist/client/legacy/" -Recurse -Force
    } else {
        # Rename classic to legacy
        Rename-Item -Path "dist/client/classic" -NewName "legacy"
    }
    # Remove the classic directory
    if (Test-Path -Path "dist/client/classic" -PathType Container) {
        Remove-Item -Path "dist/client/classic" -Recurse -Force
    }
}

if (Test-Path -Path "dist/client/oldseshtracker" -PathType Container) {
    Write-Host "⚠️ Found duplicate oldseshtracker directory in build, fixing..." -ForegroundColor Yellow
    if (Test-Path -Path "dist/client/legacy" -PathType Container) {
        # If legacy already exists, just make sure everything is there
        Copy-Item -Path "dist/client/oldseshtracker/*" -Destination "dist/client/legacy/" -Recurse -Force
    } else {
        # Rename oldseshtracker to legacy
        Rename-Item -Path "dist/client/oldseshtracker" -NewName "legacy"
    }
    # Remove the oldseshtracker directory
    if (Test-Path -Path "dist/client/oldseshtracker" -PathType Container) {
        Remove-Item -Path "dist/client/oldseshtracker" -Recurse -Force
    }
}

# Ensure images are in the right place
if (Test-Path -Path "dist/client/legacy/favicon.png" -PathType Leaf) {
    if (-not (Test-Path -Path "dist/client/images" -PathType Container)) {
        New-Item -Path "dist/client/images" -ItemType Directory -Force | Out-Null
    }
    Copy-Item -Path "dist/client/legacy/favicon.png" -Destination "dist/client/images/" -Force
    Copy-Item -Path "dist/client/legacy/logo2.png" -Destination "dist/client/images/" -Force
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host "The optimized build is available in the dist directory" -ForegroundColor Cyan 