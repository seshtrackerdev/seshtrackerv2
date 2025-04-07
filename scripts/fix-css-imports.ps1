# PowerShell script to fix CSS imports across the codebase

# Configuration
$reactAppDir = "src\react-app"
$componentsDir = "$reactAppDir\components"
$stylesDir = "$reactAppDir\styles"

# Create styles directory if it doesn't exist
if (-not (Test-Path $stylesDir)) {
    New-Item -ItemType Directory -Path $stylesDir -Force | Out-Null
    Write-Host "Created styles directory: $stylesDir" -ForegroundColor Cyan
}

# Function to process CSS imports in a directory
function Process-Directory {
    param (
        [string]$directory,
        [string]$componentType
    )
    
    Write-Host "`nProcessing $componentType components in $directory" -ForegroundColor Cyan
    
    # Get all TSX files
    $files = Get-ChildItem -Path $directory -Include "*.tsx" -Exclude "index.ts" -Recurse
    
    # Track processed files
    $processedCount = 0
    $updatedCount = 0
    
    foreach ($file in $files) {
        $processedCount++
        $relativePath = $file.FullName.Substring($PWD.Path.Length + 1)
        Write-Host "  Checking $relativePath" -ForegroundColor Gray
        
        # Get file content
        $content = Get-Content -Path $file.FullName -Raw
        $originalContent = $content
        
        # Extract directory name for component
        $componentDir = Split-Path -Leaf (Split-Path -Parent $file.FullName)
        $componentName = $file.BaseName
        
        # Check for CSS import
        if ($content -match 'import\s+[''"]\.\/([^''"/]+)\.css[''"];') {
            $cssFileName = $matches[1]
            $sourceCssPath = Join-Path -Path (Split-Path -Parent $file.FullName) -ChildPath "$cssFileName.css"
            $destinationCssPath = Join-Path -Path $stylesDir -ChildPath "$cssFileName.css"
            
            # If CSS file exists
            if (Test-Path $sourceCssPath) {
                # Copy CSS file to styles directory if it doesn't exist there
                if (-not (Test-Path $destinationCssPath)) {
                    Copy-Item -Path $sourceCssPath -Destination $destinationCssPath
                    Write-Host "    Copied $cssFileName.css to styles directory" -ForegroundColor Green
                }
                
                # Determine the relative path from the component to the styles directory
                $relativePathToStyles = "../../styles"
                if ($file.FullName -match "\\ui\\[^\\]+\\") {
                    $relativePathToStyles = "../../../styles"
                }
                
                # Update the import statement
                $updatedContent = $content -replace 'import\s+[''"]\.\/([^''"/]+)\.css[''"];', "import `"$relativePathToStyles/$1.css`";"
                
                # Save the updated content
                if ($updatedContent -ne $originalContent) {
                    Set-Content -Path $file.FullName -Value $updatedContent
                    Write-Host "    Updated CSS import to $relativePathToStyles/$cssFileName.css" -ForegroundColor Green
                    $updatedCount++
                }
            } else {
                Write-Host "    Warning: Referenced CSS file not found: $sourceCssPath" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host "  Processed $processedCount files, updated $updatedCount CSS imports" -ForegroundColor Cyan
    return @($processedCount, $updatedCount)
}

# Track overall counts
$totalProcessed = 0
$totalUpdated = 0

# Process each component type directory
Get-ChildItem -Path $componentsDir -Directory | ForEach-Object {
    $componentType = $_.Name
    $results = Process-Directory -directory $_.FullName -componentType $componentType
    $totalProcessed += $results[0]
    $totalUpdated += $results[1]
}

# Check the pages directory if it exists
$pagesDir = "$reactAppDir\pages"
if (Test-Path $pagesDir) {
    $results = Process-Directory -directory $pagesDir -componentType "pages"
    $totalProcessed += $results[0]
    $totalUpdated += $results[1]
}

# Check root files like App.tsx for CSS imports
$rootFiles = Get-ChildItem -Path $reactAppDir -Filter "*.tsx" | Where-Object { $_.Name -ne "index.tsx" }
if ($rootFiles.Count -gt 0) {
    Write-Host "`nProcessing root files in $reactAppDir" -ForegroundColor Cyan
    $rootProcessed = 0
    $rootUpdated = 0
    
    foreach ($file in $rootFiles) {
        $rootProcessed++
        Write-Host "  Checking $($file.Name)" -ForegroundColor Gray
        
        # Get file content
        $content = Get-Content -Path $file.FullName -Raw
        $originalContent = $content
        
        # Check for CSS import
        if ($content -match 'import\s+["'']\.\/([^''"/]+)\.css["''];') {
            $cssFileName = $matches[1]
            $sourceCssPath = Join-Path -Path (Split-Path -Parent $file.FullName) -ChildPath "$cssFileName.css"
            $destinationCssPath = Join-Path -Path $stylesDir -ChildPath "$cssFileName.css"
            
            # If CSS file exists
            if (Test-Path $sourceCssPath) {
                # Copy CSS file to styles directory if it doesn't exist there
                if (-not (Test-Path $destinationCssPath)) {
                    Copy-Item -Path $sourceCssPath -Destination $destinationCssPath
                    Write-Host "    Copied $cssFileName.css to styles directory" -ForegroundColor Green
                }
                
                # Update the import statement
                $updatedContent = $content -replace 'import\s+["'']\.\/([^''"/]+)\.css["''];', "import `"./styles/$1.css`";"
                
                # Save the updated content
                if ($updatedContent -ne $originalContent) {
                    Set-Content -Path $file.FullName -Value $updatedContent
                    Write-Host "    Updated CSS import to ./styles/$cssFileName.css" -ForegroundColor Green
                    $rootUpdated++
                }
            } else {
                Write-Host "    Warning: Referenced CSS file not found: $sourceCssPath" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host "  Processed $rootProcessed root files, updated $rootUpdated CSS imports" -ForegroundColor Cyan
    $totalProcessed += $rootProcessed
    $totalUpdated += $rootUpdated
}

Write-Host "`nCSS Import Reorganization Complete!" -ForegroundColor Green
Write-Host "Total files processed: $totalProcessed" -ForegroundColor Cyan
Write-Host "Total CSS imports updated: $totalUpdated" -ForegroundColor Cyan
Write-Host "CSS files are now centralized in: $stylesDir" -ForegroundColor Yellow 