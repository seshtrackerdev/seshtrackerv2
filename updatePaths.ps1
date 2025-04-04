#!/usr/bin/env pwsh

# Script to update all path references from classic to legacy

Write-Host "🔄 Updating path references from classic to legacy..." -ForegroundColor Cyan

# Directories to search
$directories = @(
    "src",
    "public"
)

# File extensions to search
$extensions = @(
    "*.ts", 
    "*.tsx", 
    "*.js", 
    "*.jsx", 
    "*.html", 
    "*.css",
    "*.md"
)

# Replacements to make
$replacements = @(
    @{
        Old = "/classic/";
        New = "/legacy/";
    },
    @{
        Old = "classic/index.html";
        New = "legacy/index.html";
    },
    @{
        Old = '"classic"';
        New = '"legacy"';
    },
    @{
        Old = "'classic'";
        New = "'legacy'";
    },
    @{
        Old = "/oldseshtracker/";
        New = "/legacy/";
    }
)

# Find and replace in files
foreach ($dir in $directories) {
    foreach ($ext in $extensions) {
        $files = Get-ChildItem -Path $dir -Filter $ext -Recurse -File
        
        foreach ($file in $files) {
            $content = Get-Content -Path $file.FullName -Raw
            $originalContent = $content
            $changed = $false
            
            foreach ($replacement in $replacements) {
                if ($content -match [regex]::Escape($replacement.Old)) {
                    $content = $content -replace [regex]::Escape($replacement.Old), $replacement.New
                    $changed = $true
                }
            }
            
            if ($changed) {
                Write-Host "  Updated references in $($file.FullName)" -ForegroundColor Green
                Set-Content -Path $file.FullName -Value $content
            }
        }
    }
}

Write-Host "✅ Path reference updates complete!" -ForegroundColor Green 