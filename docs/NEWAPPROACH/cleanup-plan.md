# 🔧 Cleanup Plan for SeshTracker Scripts (Final)

This document outlines which utility scripts should be **kept**, **merged**, or **removed** to align with the new system architecture defined in NEWPROCESS.md.

---

## ✅ Scripts to Keep

| Script                     | Reason                                                  |
|----------------------------|---------------------------------------------------------|
| `setup-structure.sh`       | Core scaffold for directory and configuration structure |
| `test-connection.js`       | Verifies API connectivity and token flow                |
| `apply-migration.js`       | Automates D1 schema updates locally and remotely        |
| `update-imports.sh/ps1`    | Rewrites imports to barrel-style structure              |
| `verify-imports.sh/ps1`    | Flags broken or non-standard imports                    |

---

## 🔁 Scripts to Merge or Replace

| Script                  | Action                     | Reason                                                             |
|-------------------------|-----------------------------|--------------------------------------------------------------------|
| `fix-css-imports.ps1`   | Merge into update-imports   | CSS centralization is deprecated; use local/module styles instead  |
| `move-components.ps1`   | Remove                      | No longer needed post structure standardization                    |
| `validate-naming.ps1`   | Remove or convert to linter | Replace with ESLint rules if needed                                |
| `clean-duplicates.ps1`  | Keep if documented use      | Useful only if managing known dev/test DB cleanup workflows        |

---

## 🗑 Scripts to Remove

- `fix-css-imports.ps1`
- `move-components.ps1`
- `validate-naming.ps1`
- `fix-auth-css.ps1`

---

## 🏗 Recommended Structure

```
scripts/
├── setup-structure.sh
├── apply-migration.js
├── test-connection.js
├── update-imports.sh
├── verify-imports.sh
└── (Optional) unified Node CLI
```

---

## 📌 Next Steps

1. Move retained scripts into `scripts/`
2. Delete deprecated scripts from version control
3. Document any temporary/one-off scripts if retained
4. (Optional) Convert import tools to Node-based CLI for better cross-platform support
