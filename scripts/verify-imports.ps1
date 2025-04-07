# PowerShell script to verify component imports

# Define problematic import patterns
$problematicPatterns = @(
    # Direct imports to component files rather than using the index
    @{
        Pattern = 'from ["'']\.\.\/components\/([^/]+)\/[^"'']+["''];'
        Description = "Direct import to component file instead of using index"
    },
    # Potentially broken relative paths
    @{
        Pattern = 'from ["'']\.\.\/\.\.\/\.\.\/[^"'']+["''];'
        Description = "Deep relative import (../../../) may be fragile"
    },
    # Missing file extensions
    @{
        Pattern = 'from ["'']\.\.\/[^"'']+\/index["''];'
        Description = "Missing file extension in import (.js/.ts)"
    },
    # CSS imports that haven't been moved to styles
    @{
        Pattern = 'import ["'']\.\/([^"'']+)\.css["''];'
        Description = "CSS import with local path (./) - should use styles directory"
    },
    # CSS imports that might need path adjustment
    @{
        Pattern = 'import ["''](?!\.\.\/styles\/|\.\/styles\/)([^"'']+)\.css["''];'
        Description = "CSS import not referencing styles directory"
    }
)

# Files to check
$filesToCheck = Get-ChildItem -Path "src/react-app" -Recurse -Include "*.tsx", "*.ts" -Exclude "*.d.ts"

# Track issues
$issuesFound = 0

# Check each file
foreach ($file in $filesToCheck) {
    Write-Host "Checking $($file.FullName)" -ForegroundColor Cyan
    
    # Get file content
    $content = Get-Content -Path $file.FullName -Raw
    $lines = Get-Content -Path $file.FullName
    $lineNumber = 0
    $fileHasIssues = $false
    
    # Check each pattern
    foreach ($pattern in $problematicPatterns) {
        if ($content -match $pattern.Pattern) {
            if (-not $fileHasIssues) {
                Write-Host "  Issues found:" -ForegroundColor Yellow
                $fileHasIssues = $true
            }
            
            # Find the specific lines with the issue
            $lineNumber = 0
            foreach ($line in $lines) {
                $lineNumber++
                if ($line -match $pattern.Pattern) {
                    Write-Host "    Line $lineNumber`: $line" -ForegroundColor Red
                    Write-Host "      Issue: $($pattern.Description)" -ForegroundColor Yellow
                    $issuesFound++
                }
            }
        }
    }
    
    if (-not $fileHasIssues) {
        Write-Host "  No issues found" -ForegroundColor Green
    }
}

Write-Host "`nImport verification complete!" -ForegroundColor Cyan
if ($issuesFound -gt 0) {
    Write-Host "Found $issuesFound potential import issues that may need fixing." -ForegroundColor Yellow
} else {
    Write-Host "No import issues found." -ForegroundColor Green
} 