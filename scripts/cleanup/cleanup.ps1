#!/usr/bin/env pwsh

# SeshTracker Cleanup Script - Updated April 2025
# --------------------------------------------------
# This script cleans build artifacts and temporary files
# while safely backing up database files.

Write-Host "🧹 Starting SeshTracker cleanup process..." -ForegroundColor Cyan

# Create backup directory if it doesn't exist
$backupDir = "backups/$(Get-Date -Format 'yyyy-MM-dd')"
if (-not (Test-Path -Path $backupDir)) {
    Write-Host "Creating backup directory: $backupDir" -ForegroundColor Green
    New-Item -Path $backupDir -ItemType Directory -Force | Out-Null
}

# Backup D1 database files before cleaning
Write-Host "Backing up database files..." -ForegroundColor Green
if (Test-Path -Path ".wrangler/state/d1") {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    Get-ChildItem -Path ".wrangler/state/d1" -Filter "*.sqlite" | ForEach-Object {
        $destination = Join-Path -Path $backupDir -ChildPath "$($_.BaseName)-$timestamp$($_.Extension)"
        Copy-Item -Path $_.FullName -Destination $destination -Force
        Write-Host "  Backed up $($_.Name) to $destination" -ForegroundColor Yellow
    }
}

# Ask for confirmation before proceeding with deletion
$confirmation = Read-Host "Are you sure you want to cleanup build artifacts? (y/n)"
if ($confirmation -ne 'y') {
    Write-Host "Cleanup cancelled." -ForegroundColor Yellow
    exit 0
}

# Clean build artifacts
Write-Host "Removing build artifacts..." -ForegroundColor Red
$directories = @("dist", ".wrangler")

foreach ($dir in $directories) {
    if (Test-Path -Path $dir) {
        Write-Host "  Removing $dir..." -ForegroundColor Yellow
        Remove-Item -Path $dir -Recurse -Force
    }
}

# Clean temporary files (uncommenting will remove node_modules - use with caution)
# Write-Host "Removing node_modules (uncomment if needed)..." -ForegroundColor Red
# if (Test-Path -Path "node_modules") {
#     Remove-Item -Path "node_modules" -Recurse -Force
# }

# Optionally clean cached D1 data
if (Test-Path -Path ".d1") {
    $cleanD1 = Read-Host "Do you want to clean D1 cache? (y/n)"
    if ($cleanD1 -eq 'y') {
        Write-Host "Removing D1 cache..." -ForegroundColor Yellow
        Remove-Item -Path ".d1" -Recurse -Force
    }
}

Write-Host "✅ Cleanup completed!" -ForegroundColor Green
Write-Host "Database backups are available in: $backupDir" -ForegroundColor Cyan 