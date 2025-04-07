# SeshTracker GitHub Save and Push Script (PowerShell)
# This script commits all changes and pushes to GitHub

# Stop on errors
$ErrorActionPreference = "Stop"

Write-Host "🌿 SeshTracker GitHub Save and Push"
Write-Host "=================================="
Write-Host "Starting GitHub process at $(Get-Date)"

# Check if a commit message was provided
if (-not $args[0]) {
    $COMMIT_MESSAGE = "Production deployment update $(Get-Date -Format 'yyyy-MM-dd')"
    Write-Host "No commit message provided. Using default: `"$COMMIT_MESSAGE`""
} else {
    $COMMIT_MESSAGE = $args[0]
    Write-Host "Using commit message: `"$COMMIT_MESSAGE`""
}

# 1. Check git status
Write-Host "`n📊 Current Git Status:"
git status

# 2. Add all files
Write-Host "`n➕ Adding all files to commit..."
git add .

# 3. Commit changes
Write-Host "`n✍️ Committing changes..."
git commit -m "$COMMIT_MESSAGE"

# 4. Push to GitHub
Write-Host "`n⬆️ Pushing to GitHub..."
git push origin main

Write-Host "`n🎉 GitHub push completed at $(Get-Date)"
Write-Host "Your changes are now saved to GitHub."
Write-Host "==================================" 