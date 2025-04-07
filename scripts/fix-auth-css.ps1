# PowerShell script to fix Auth CSS imports

# Define the auth components directory - using correct path
$authDir = "src\react-app\components\auth"

# Find all auth component files
$authFiles = Get-ChildItem -Path $authDir -Include "*.tsx" -Exclude "index.ts"

Write-Host "Fixing Auth CSS imports in $($authFiles.Count) files..." -ForegroundColor Cyan

# Process each file
foreach ($file in $authFiles) {
    Write-Host "Processing $($file.Name)..." -ForegroundColor Gray
    
    # Get file content
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Replace the CSS import with proper path
    $updatedContent = $content -replace 'import [''"]\.\/Auth\.css[''"];', 'import "../../styles/Auth.css";'
    
    # If content changed, write back to file
    if ($updatedContent -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $updatedContent
        Write-Host "  Updated CSS import" -ForegroundColor Green
    } else {
        Write-Host "  No CSS import found or already correct" -ForegroundColor Yellow
    }
}

Write-Host "`nFixing complete!" -ForegroundColor Green
Write-Host "Make sure the Auth.css file exists in src/react-app/styles/ directory." -ForegroundColor Yellow

# Check if we need to create the Auth.css file
$destinationCssPath = "src\react-app\styles\Auth.css"
$sourceCssPath = "$authDir\Auth.css"

if (Test-Path $sourceCssPath) {
    if (-not (Test-Path $destinationCssPath)) {
        # Create the styles directory if it doesn't exist
        $stylesDir = Split-Path -Parent $destinationCssPath
        if (-not (Test-Path $stylesDir)) {
            New-Item -ItemType Directory -Path $stylesDir -Force | Out-Null
            Write-Host "Created styles directory: $stylesDir" -ForegroundColor Cyan
        }
        
        # Copy the file
        Copy-Item -Path $sourceCssPath -Destination $destinationCssPath
        Write-Host "Copied Auth.css to styles directory" -ForegroundColor Green
    } else {
        Write-Host "Auth.css already exists in styles directory" -ForegroundColor Yellow
    }
} else {
    Write-Host "Warning: Auth.css not found in auth components directory" -ForegroundColor Red
    Write-Host "You'll need to create $destinationCssPath manually" -ForegroundColor Yellow
} 