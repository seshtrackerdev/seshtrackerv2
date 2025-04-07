# 🛠️ Modernization Plan for PowerShell Scripts (build.ps1, deploy.ps1, cleanup.ps1)

These scripts may have originated from an earlier version of the project or a more generic Node/React setup. The current SeshTracker system is deployed using **Cloudflare Workers and D1**, and built via **Vite + Wrangler**.

This document outlines whether these scripts are still useful and how to modernize or replace them.

---

## 🧾 build.ps1

### Current Status: 🔄 MAY BE REDUNDANT

If this script runs `vite build` or sets up precompiled assets, it can be replaced with:

```bash
npm run build
# or, for D1 worker-only build:
npx wrangler deploy --dry-run
```

### ✅ If You Want to Keep It:
- Ensure it runs `vite build` for the frontend
- Ensure it builds the `dist/worker.js` via Wrangler for backend
- Add logging and error handling
- Use environment variables instead of hardcoding paths

---

## 🚀 deploy.ps1

### Current Status: 🔄 USEFUL IF MODIFIED

This may be used to deploy to Cloudflare. If so, it should be updated to:

```powershell
# Set environment
$env:ENVIRONMENT = "production"

# Run deployment
npx wrangler deploy
```

### ✅ Recommended Additions:
- Read `.env.production` or `.env.staging` to configure environment
- Add optional `--env` flag if using environments in wrangler.toml
- Log version/hash info after deploy

---

## 🧹 cleanup.ps1

### Current Status: ✅ POTENTIALLY USEFUL

If it deletes stale `dist/`, `.wrangler/`, or `.d1/` directories:
- Keep it, but improve logging
- Allow interactive confirmation
- Back up any `.sqlite` file before deletion

### ✅ Improvements:
```powershell
Write-Host "Cleaning local build artifacts..."

# Optional backup
Copy-Item "path/to/db.sqlite" "backup/db-$(Get-Date -Format yyyyMMdd-HHmmss).sqlite"

# Cleanup
Remove-Item -Recurse -Force dist, .wrangler, .d1
Write-Host "Cleanup complete."
```

---

## 📦 Recommendation Summary

| Script        | Keep? | Update Strategy |
|---------------|-------|------------------|
| `build.ps1`   | ❌ Remove if it's just `npm run build` — otherwise, keep and clarify |
| `deploy.ps1`  | ✅ Keep, add Cloudflare context, use `wrangler deploy` with env handling |
| `cleanup.ps1` | ✅ Keep, add backup logic for `.sqlite` files, improve UX |

---

## 📁 Suggested Replacement

Migrate PowerShell to `scripts/` folder and replace with:

```
scripts/
├── build.sh / .ps1
├── deploy.sh / .ps1
├── cleanup.sh / .ps1
├── migrate-data.js
```

Use consistent naming and comment headers.

