# PowerShell script to update component imports

# Define the import patterns to replace
$importReplacements = @(
    # From components root to category folders
    @{
        Pattern = 'import \{? ?(.+?) ?\}? from ["'']\.\/components\/([^"'']+)["''];'
        Replacement = 'import { $1 } from "./components";'
    },
    @{
        Pattern = 'import \{? ?(.+?) ?\}? from ["'']\.\.\/components\/([^"'']+)["''];'
        Replacement = 'import { $1 } from "../components";'
    },
    @{
        Pattern = 'import \{? ?(.+?) ?\}? from ["'']\.\.\/\.\.\/components\/([^"'']+)["''];'
        Replacement = 'import { $1 } from "../../components";'
    },
    
    # Updating relative path imports in nested components
    @{
        Pattern = 'import \{? ?(.+?) ?\}? from ["'']\.\.\/hooks["''];'
        Replacement = 'import { $1 } from "../../hooks";'
    },
    @{
        Pattern = 'import \{? ?(.+?) ?\}? from ["'']\.\.\/contexts["''];'
        Replacement = 'import { $1 } from "../../contexts";'
    },
    @{
        Pattern = 'import \{? ?(.+?) ?\}? from ["'']\.\.\/styles\/([^"'']+)["''];'
        Replacement = 'import { $1 } from "../../styles/$2";'
    },
    @{
        Pattern = 'import ["'']\.\.\/styles\/([^"'']+)["''];'
        Replacement = 'import "../../styles/$1";'
    },
    
    # Update types imports
    @{
        Pattern = 'import \{? ?(.+?) ?\}? from ["'']\.\.\/types\/([^"'']+)["''];'
        Replacement = 'import { $1 } from "../../types";'
    },
    @{
        Pattern = 'import \{? ?(.+?) ?\}? from ["'']\.\.\/\.\.\/types\/([^"'']+)["''];'
        Replacement = 'import { $1 } from "../../types";'
    }
)

# UI component special cases (these need to be preserved)
$uiComponentPattern = 'import \{? ?(.+?) ?\}? from ["'']\.\/ui\/([^"'']+)["''];'
$uiComponentReplacement = 'import { $1 } from "../ui/$2";'

# Files to process (React components)
$filesToProcess = Get-ChildItem -Path "src/react-app/components" -Recurse -Include "*.tsx", "*.ts" -Exclude "*.d.ts", "index.ts"

# Process each file
foreach ($file in $filesToProcess) {
    Write-Host "Processing $($file.FullName)" -ForegroundColor Cyan
    
    # Get file content
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Apply each replacement
    foreach ($replacement in $importReplacements) {
        $content = $content -replace $replacement.Pattern, $replacement.Replacement
    }
    
    # Handle UI component imports specially (these are relative)
    if ($file.Directory.Name -ne "ui") {
        $content = $content -replace $uiComponentPattern, $uiComponentReplacement
    }
    
    # If content changed, write back to file
    if ($content -ne $originalContent) {
        Write-Host "  Updated imports" -ForegroundColor Green
        Set-Content -Path $file.FullName -Value $content
    } else {
        Write-Host "  No changes needed" -ForegroundColor Gray
    }
}

Write-Host "`nImport paths updated successfully!" -ForegroundColor Green
Write-Host "Remember to check for any specific imports that might need manual fixing." -ForegroundColor Yellow 