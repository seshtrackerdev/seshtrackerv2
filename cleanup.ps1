#!/usr/bin/env pwsh

# Project cleanup script

Write-Host "⚙️ Starting project cleanup..." -ForegroundColor Cyan

# Create proper directory structure if it doesn't exist
if (-not (Test-Path -Path "public/legacy")) {
    Write-Host "Creating public/legacy directory..." -ForegroundColor Green
    New-Item -Path "public/legacy" -ItemType Directory -Force | Out-Null
}

if (-not (Test-Path -Path "public/images")) {
    Write-Host "Creating public/images directory..." -ForegroundColor Green
    New-Item -Path "public/images" -ItemType Directory -Force | Out-Null
}

# Move images to central location
Write-Host "Moving images to central location..." -ForegroundColor Green
if (Test-Path -Path ".oldseshtracker/logo2.png") {
    Copy-Item -Path ".oldseshtracker/logo2.png" -Destination "public/images/" -Force
}
if (Test-Path -Path ".oldseshtracker/favicon.png") {
    Copy-Item -Path ".oldseshtracker/favicon.png" -Destination "public/images/" -Force
}

# Move legacy code to public/legacy
Write-Host "Moving legacy code to public/legacy..." -ForegroundColor Green
if (Test-Path -Path ".oldseshtracker") {
    Copy-Item -Path ".oldseshtracker/*" -Destination "public/legacy/" -Recurse -Force
}
if (Test-Path -Path "public/classic") {
    Copy-Item -Path "public/classic/*" -Destination "public/legacy/" -Recurse -Force
}
if (Test-Path -Path "public/oldseshtracker") {
    Copy-Item -Path "public/oldseshtracker/*" -Destination "public/legacy/" -Recurse -Force
}

# Remove duplicate directories after copying
Write-Host "Removing duplicate directories..." -ForegroundColor Red
if (Test-Path -Path ".oldseshtracker") {
    Remove-Item -Path ".oldseshtracker" -Recurse -Force
}
if (Test-Path -Path "public/classic") {
    Remove-Item -Path "public/classic" -Recurse -Force
}
if (Test-Path -Path "public/oldseshtracker") {
    Remove-Item -Path "public/oldseshtracker" -Recurse -Force
}

# Update references in files
Write-Host "Updating file references..." -ForegroundColor Green
if (Test-Path -Path "public/classic.html") {
    (Get-Content -Path "public/classic.html" -Raw) -replace "classic/", "legacy/" | Set-Content -Path "public/classic.html"
}

# Clean dist directory
Write-Host "Cleaning distribution directory..." -ForegroundColor Green
if (Test-Path -Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
}

# Remove any test files
if (Test-Path -Path "src/react-app/components/test.js") {
    Remove-Item -Path "src/react-app/components/test.js" -Force
}

Write-Host "✅ Cleanup complete! Your project structure is now organized." -ForegroundColor Green
Write-Host "Remember to update any code references to match the new file paths." -ForegroundColor Yellow 