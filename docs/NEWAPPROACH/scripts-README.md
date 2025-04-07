# 🛠 SeshTracker Scripts

This directory contains vetted, modern utility scripts used in the SeshTracker ecosystem.

---

## ✅ Scripts

### `setup-structure.sh`
Initializes directory layout, `.env.example`, and stub files for new projects.

### `test-connection.js`
Performs a multi-step test against Kush.Observer and SeshTracker:
- Health check on both APIs
- Login test with test credentials
- Token validation
- Inventory access with auth

### `apply-migration.js`
Applies a SQL schema file to the D1 database both locally and remotely using Wrangler.

### `update-imports.sh` / `update-imports.ps1`
Normalizes imports to use `index.ts` barrel-style paths. Cleans up fragile relative imports and improves consistency.

### `verify-imports.sh` / `verify-imports.ps1`
Analyzes all React files for:
- Deep relative imports
- Missing extensions
- Direct component file usage

---

## ⚠️ Conditionally Retained

| Script                  | Reason                       |
|-------------------------|------------------------------|
| `clean-duplicates.ps1`  | Retain only if documented    |

---

## 🗑 Deprecated Scripts

| Script                  | Reason for Deprecation              |
|-------------------------|-------------------------------------|
| `fix-css-imports.ps1`   | CSS centralization no longer used   |
| `move-components.ps1`   | Structure is now standardized       |
| `validate-naming.ps1`   | Redundant; enforce via linter       |
| `fix-auth-css.ps1`      | Likely addresses old CSS concerns   |

---

## 🔄 Suggested Improvements

- Convert to a Node-based CLI for cross-platform support
- Add CI integration (e.g., GitHub Actions) using `test-connection.js`
- Migrate import rules into ESLint config
