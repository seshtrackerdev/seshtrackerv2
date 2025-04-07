# PowerShell script to move components to their new locations
# This is an interactive script that will guide you through moving components

# Ensure directories exist
$components = @('dashboard', 'inventory', 'sessions', 'common', 'layouts')
foreach ($dir in $components) {
    $path = "src/react-app/components/$dir"
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force
        Write-Host "Created directory: $path"
    }
}

# List of components to organize
$componentMap = @{
    "dashboard" = @("Dashboard.tsx", "DashboardPlaceholder.tsx", "AnalyticsPage.tsx")
    "inventory" = @("InventoryPage.tsx")
    "sessions" = @("SessionsPage.tsx")
    "common" = @("Header.tsx", "SettingsMenu.tsx", "BugReport.tsx", "PageTransition.tsx")
    "layouts" = @("ProtectedRoute.tsx")
}

# Function to move a component while showing preview of changes
function Move-Component {
    param (
        [string]$Component,
        [string]$Category
    )
    
    $source = "src/react-app/components/$Component"
    $destination = "src/react-app/components/$Category/$Component"
    
    # Check if source exists
    if (-not (Test-Path $source)) {
        Write-Host "Source file not found: $source" -ForegroundColor Red
        return
    }
    
    # Check if component has CSS file
    $cssFile = $Component -replace "\.tsx$", ".css"
    $cssSource = "src/react-app/components/$cssFile"
    $cssDestination = "src/react-app/components/$Category/$cssFile"
    
    # Preview the move
    Write-Host "`nMoving component: $Component" -ForegroundColor Cyan
    Write-Host "From: $source" -ForegroundColor Yellow
    Write-Host "To: $destination" -ForegroundColor Green
    
    if (Test-Path $cssSource) {
        Write-Host "Also moving CSS: $cssFile" -ForegroundColor Cyan
        Write-Host "From: $cssSource" -ForegroundColor Yellow
        Write-Host "To: $cssDestination" -ForegroundColor Green
    }
    
    # Ask for confirmation
    $confirm = Read-Host "Proceed with move? (Y/N)"
    if ($confirm -eq "Y" -or $confirm -eq "y") {
        # Copy the files first (safer than moving directly)
        Copy-Item -Path $source -Destination $destination -Force
        Write-Host "Copied component to new location" -ForegroundColor Green
        
        if (Test-Path $cssSource) {
            Copy-Item -Path $cssSource -Destination $cssDestination -Force
            Write-Host "Copied CSS to new location" -ForegroundColor Green
        }
        
        # Ask if the original should be removed
        $removeOriginal = Read-Host "Remove original files? (Y/N)"
        if ($removeOriginal -eq "Y" -or $removeOriginal -eq "y") {
            Remove-Item -Path $source -Force
            Write-Host "Removed original component file" -ForegroundColor Yellow
            
            if (Test-Path $cssSource) {
                Remove-Item -Path $cssSource -Force
                Write-Host "Removed original CSS file" -ForegroundColor Yellow
            }
        }
    }
    else {
        Write-Host "Skipping this component" -ForegroundColor Yellow
    }
}

# Main script process
Write-Host "SeshTracker Component Organizer" -ForegroundColor Cyan
Write-Host "This script will help you move components to their proper directories." -ForegroundColor Cyan
Write-Host "You will be prompted for each component move." -ForegroundColor Cyan
Write-Host "`nCategories:" -ForegroundColor Yellow
Write-Host "- dashboard: Dashboard components, analytics, summaries" -ForegroundColor White
Write-Host "- inventory: Inventory management components" -ForegroundColor White
Write-Host "- sessions: Session tracking components" -ForegroundColor White
Write-Host "- common: Reusable UI components" -ForegroundColor White
Write-Host "- layouts: Page layouts and structural components" -ForegroundColor White

$runAutomated = Read-Host "`nRun automated moves based on predefined mapping? (Y/N)"

if ($runAutomated -eq "Y" -or $runAutomated -eq "y") {
    # Process automated moves
    foreach ($category in $componentMap.Keys) {
        foreach ($component in $componentMap[$category]) {
            Move-Component -Component $component -Category $category
        }
    }
}
else {
    # Interactive mode
    Write-Host "`nEntering interactive mode." -ForegroundColor Cyan
    $continue = $true
    
    while ($continue) {
        $componentName = Read-Host "`nEnter component filename (e.g., Dashboard.tsx) or 'exit' to quit"
        
        if ($componentName -eq "exit") {
            $continue = $false
            continue
        }
        
        $category = Read-Host "Enter category (dashboard, inventory, sessions, common, layouts)"
        
        if (-not $components.Contains($category)) {
            Write-Host "Invalid category. Please choose from: $($components -join ', ')" -ForegroundColor Red
            continue
        }
        
        Move-Component -Component $componentName -Category $category
    }
}

Write-Host "`nComponent organization process completed." -ForegroundColor Green
Write-Host "Remember to update import paths in all affected files!" -ForegroundColor Yellow 