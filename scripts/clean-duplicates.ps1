# PowerShell script to clean up duplicate component files
# This script removes files from the src/react-app/components directory that have been moved to subdirectories

$filesToRemove = @(
    # Dashboard components
    "src/react-app/components/Dashboard.tsx",
    "src/react-app/components/Dashboard.css",
    "src/react-app/components/DashboardPlaceholder.tsx",
    "src/react-app/components/AnalyticsPage.tsx",
    
    # Inventory components
    "src/react-app/components/InventoryPage.tsx",
    
    # Session components
    "src/react-app/components/SessionsPage.tsx",
    
    # Auth components
    "src/react-app/components/Auth.css",
    "src/react-app/components/AuthDebugger.tsx",
    "src/react-app/components/LoginForm.tsx",
    "src/react-app/components/RegisterForm.tsx",
    "src/react-app/components/ForgotPasswordForm.tsx",
    
    # Profile components
    "src/react-app/components/Profile.css",
    "src/react-app/components/ProfilePage.tsx",
    
    # Test components
    "src/react-app/components/TestPage.css",
    "src/react-app/components/TestPage.tsx",
    "src/react-app/components/ComponentShowcase.tsx",
    "src/react-app/components/DemoProfileSelector.css",
    "src/react-app/components/DemoProfileSelector.tsx",
    
    # Common components
    "src/react-app/components/Header.tsx",
    "src/react-app/components/SettingsMenu.tsx",
    "src/react-app/components/SettingsMenu.css",
    "src/react-app/components/BugReport.tsx",
    "src/react-app/components/PageTransition.tsx",
    
    # Layout components
    "src/react-app/components/ProtectedRoute.tsx"
)

$count = 0

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Write-Host "Removing: $file" -ForegroundColor Yellow
        Remove-Item -Path $file -Force
        $count++
    } else {
        Write-Host "File not found: $file" -ForegroundColor Gray
    }
}

Write-Host "`nCleaned up $count files from the root components directory." -ForegroundColor Green
Write-Host "Component reorganization complete!" -ForegroundColor Cyan 