# SeshTracker Scripts

This directory contains utility scripts for the SeshTracker project.

## Import Management Scripts

These scripts help maintain consistent import paths throughout the codebase, particularly useful after reorganizing components.

### PowerShell Scripts (Windows)

#### Execution Policy

On Windows, you may need to adjust your PowerShell execution policy to run these scripts:

```powershell
# Check current execution policy
Get-ExecutionPolicy -Scope CurrentUser

# Set a policy that allows scripts (choose one)
# - RemoteSigned: Local scripts run, downloaded scripts need digital signature
# - Unrestricted: All scripts run (use with caution)
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

#### `update-imports.ps1`
Updates component imports to use the barrel pattern (`index.ts` files).

```powershell
# Run from the project root
./scripts/update-imports.ps1
```

This script:
- Searches through component files (`.tsx`, `.ts`)
- Updates import paths to use barrel imports (`import { Component } from "../components"`)
- Preserves UI component relative imports
- Handles path updates for hooks, contexts, styles, and types

#### `verify-imports.ps1`
Checks for problematic import patterns that might need fixing.

```powershell
# Run from the project root
./scripts/verify-imports.ps1
```

This script detects:
- Direct imports to component files instead of using index exports
- Deep relative imports (../../../) that could be fragile
- Missing file extensions
- Potentially incorrect CSS imports

#### `fix-css-imports.ps1`
Reorganizes CSS files into the styles directory and updates imports.

```powershell
# Run from the project root
powershell -ExecutionPolicy Bypass -File ./scripts/fix-css-imports.ps1
```

This script:
- Scans all component directories for CSS imports
- Moves CSS files to the central styles directory
- Updates import paths to reference the new locations
- Handles different directory depths appropriately
- Preserves existing files in the styles directory

### Bash Scripts (Linux/macOS)

#### `update-imports.sh`
The Bash equivalent of the PowerShell script.

```bash
# Make the script executable
chmod +x ./scripts/update-imports.sh

# Run from the project root
./scripts/update-imports.sh
```

#### `verify-imports.sh`
The Bash equivalent of the PowerShell verification script.

```bash
# Make the script executable
chmod +x ./scripts/verify-imports.sh

# Run from the project root
./scripts/verify-imports.sh
```

## Recommended Workflow

For the best results, follow this sequence:

1. **Check for import issues**: `./scripts/verify-imports.ps1`
2. **Centralize CSS files**: `./scripts/fix-css-imports.ps1`
3. **Update component imports**: `./scripts/update-imports.ps1`
4. **Verify the changes**: `./scripts/verify-imports.ps1` (run again to ensure issues are fixed)

## Best Practices

1. **Always run verification first**: Use `verify-imports` to check for potential issues before running the update script.
2. **Back up your code**: While the scripts create temporary backups during execution, it's good practice to commit your changes before running them.
3. **Review changes**: After running the update script, check the modified files to ensure the changes are as expected.
4. **Manual fixes**: Some complex imports might need manual adjustment. The scripts will help identify these cases.

## Debugging

If you encounter issues:

- For PowerShell: 
  - Check the console output for error messages
  - If execution is blocked, run: `Set-ExecutionPolicy -Scope Process Bypass` for a one-time bypass
  - Use `-ExecutionPolicy Bypass` parameter: `powershell -ExecutionPolicy Bypass -File ./scripts/update-imports.ps1`

- For Bash: 
  - Enable debug mode with `bash -x ./scripts/script-name.sh`
  - Restore from backups if needed (the scripts create `.bak` files)

## Adding New Scripts

When adding new utility scripts to this directory:

1. Create both PowerShell (`.ps1`) and Bash (`.sh`) versions when possible
2. Update this README with usage instructions
3. Ensure scripts are well-commented and include error handling 