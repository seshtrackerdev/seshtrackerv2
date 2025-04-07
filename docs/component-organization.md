# SeshTracker Component Organization

## Overview

SeshTracker follows a modular, feature-based component organization. All React components are organized by feature domain in the `src/react-app/components` directory. This organization makes it easy to locate components, maintain the codebase, and keep related functionality together.

## Directory Structure

```
src/
└── react-app/
    └── components/
        ├── index.ts                # Master export file
        ├── auth/                   # Authentication components
        │   ├── index.ts            # Auth component exports
        │   ├── LoginForm.tsx
        │   ├── RegisterForm.tsx
        │   └── ...
        ├── common/                 # Shared components
        │   ├── index.ts            # Common component exports
        │   ├── Header.tsx
        │   ├── SettingsMenu.tsx
        │   └── ...
        ├── dashboard/              # Dashboard components
        │   ├── index.ts            # Dashboard component exports
        │   ├── Dashboard.tsx
        │   ├── AnalyticsPage.tsx
        │   └── ...
        ├── inventory/              # Inventory components
        │   ├── index.ts            # Inventory component exports
        │   ├── InventoryPage.tsx
        │   └── ...
        ├── sessions/               # Session tracking components
        │   ├── index.ts            # Sessions component exports
        │   ├── SessionsPage.tsx
        │   └── ...
        ├── layouts/                # Layout components
        │   ├── index.ts            # Layout component exports
        │   ├── ProtectedRoute.tsx
        │   └── ...
        ├── profile/                # User profile components
        │   ├── index.ts            # Profile component exports
        │   ├── ProfilePage.tsx
        │   └── ...
        ├── ui/                     # Reusable UI components
        │   ├── index.ts            # UI component exports
        │   ├── Button.tsx
        │   ├── Card.tsx
        │   └── ...
        ├── landing/                # Landing page components
        │   ├── index.ts            # Landing component exports
        │   ├── LandingPage.tsx
        │   └── ...
        └── test/                   # Testing components
            ├── index.ts            # Test component exports
            ├── TestPage.tsx
            └── ...
```

## Import Structure

We use a barrel pattern for exports, which simplifies imports throughout the application:

1. Each component directory has an `index.ts` file that exports all components in that directory
2. The root `components/index.ts` file re-exports everything from all feature directories
3. This allows you to import any component from a single location:

```typescript
// Before: Multiple import sources
import Dashboard from '../components/dashboard/Dashboard';
import InventoryPage from '../components/inventory/InventoryPage';
import Header from '../components/common/Header';

// After: Single import source
import { Dashboard, InventoryPage, Header } from '../components';
```

## Index Files

Each feature directory has an index file with the following pattern:

```typescript
/**
 * Feature Components Exports
 */

export { default as ComponentName } from './ComponentName';
export { default as AnotherComponent } from './AnotherComponent';
```

The root `components/index.ts` file re-exports all feature directories:

```typescript
/**
 * Components Master Export File
 */

// Re-export components by category
export * from './dashboard';
export * from './inventory';
// ...other feature directories

// Special case for UI components
export * from './ui';
```

## Import Scripts

To help maintain clean imports and avoid import path issues, we've created utility scripts:

### PowerShell Scripts

1. `scripts/update-imports.ps1`: Updates component imports across the codebase to use the barrel pattern
2. `scripts/verify-imports.ps1`: Checks for potentially problematic import patterns

### Bash Scripts

1. `scripts/update-imports.sh`: Bash equivalent of the PowerShell update script
2. `scripts/verify-imports.sh`: Bash equivalent of the PowerShell verify script

### Usage

#### Windows

```powershell
# Update imports
./scripts/update-imports.ps1

# Verify imports
./scripts/verify-imports.ps1
```

#### Mac/Linux

```bash
# Ensure scripts are executable
chmod +x scripts/update-imports.sh scripts/verify-imports.sh

# Update imports
./scripts/update-imports.sh

# Verify imports
./scripts/verify-imports.sh
```

## Best Practices

1. **Always add new components to the appropriate index file** - When creating a new component, add it to the directory's index.ts file
2. **Prefer importing from the barrel** - Use `import { Component } from '../components'` rather than direct imports
3. **Keep UI components separate** - UI components are standalone and should not depend on other app components
4. **Run the verification script before commits** - This helps identify potential import issues
5. **Update the import scripts when adding new directories** - If you add a new feature directory, update the import scripts accordingly

## Troubleshooting

If you encounter issues with imports:

1. Run the verification script to identify problematic imports
2. For CSS imports, ensure they're imported from the correct relative path
3. For deeply nested imports, consider refactoring to use the barrel pattern
4. For UI components, preserve their direct imports to maintain specificity

By following these guidelines, we maintain a clean, organized component structure that scales well as the application grows. 