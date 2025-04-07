# 🧠 SeshTracker Repo Review & Cleanup Request – April 2025

Hi Cursor,

I’ve made a number of **manual file deletions, moves, and refactors** throughout the SeshTracker project. I need you to do a full **comprehensive structural audit** and **apply updated conventions** based on the new architecture and folder structure.

---

## 🔍 Tasks

### 1. Full Filesystem Analysis

- Recursively scan all folders:
  - `/src/`, `/scripts/`, `/docs/`, `/public/`, `/migrations/`, `/deprecation/`, `/internal/`
- Identify:
  - Orphaned/unused files or folders
  - Duplicate or legacy files not referenced anywhere
  - Broken imports or outdated `require` statements

### 2. Architecture Alignment

- Ensure structure and implementation align with the current stack:
  - **Cloudflare Workers + D1**
  - **React 18 + TailwindCSS**
  - **Hono backend (via Worker)**
- Confirm modular usage of:
  - Components (`src/react-app/components`)
  - Feature folders (`src/features`)
  - API and middleware (`src/api`)
- Validate that only one set of entry points exists (`main.tsx`, `index.ts`)

### 3. Apply Recent Cleanup Conventions

- Delete:
  - `legacy-backup.html`
  - `sesh-config.json` (migrate into `wrangler.toml` or move to `docs/config/`)
- Move:
  - `kushobserver-verification.md` → `docs/testing/integration-kushobserver-verify.md`
  - `response-to-kushobserver.md` → `.internal/responses/response-to-kushobserver.md`
  - `ORGANIZATION-RULES.md` → `docs/planning/org-rules.md`
  - `SeshTracker-Ecosystem-Organization.md` → merge into `docs/architecture/SeshTracker_Architecture_and_Integration.md`

### 4. Validate Tooling and Config Files

- Review `package.json` and scripts (e.g., `dev`, `build`, `deploy`, `clean`)
- Confirm `.tsconfig.*.json`, `vite.config.ts`, `postcss.config.js` are accurate
- Ensure `.ps1` scripts are documented, scoped, or replaced
- Remove any stale shell scripts or batch files unless actively used

---

## 📁 Mandatory Review Target

### ✅ `/docs/NEWAPPROACH/`

Review everything in the `/docs/NEWAPPROACH/` folder. Ensure:
- It matches the implemented folder structure
- No outdated notes or code examples are lingering
- It is represented in `docs/architecture/SeshTracker_Architecture_and_Integration.md` if appropriate

---

## ✅ Outcomes Expected

1. Updated and refactored folder structure if needed
2. Broken imports removed or fixed
3. All deprecated references marked or deleted
4. New/retained files moved to appropriate canonical locations
5. A detailed commit log or `docs/CHANGELOG.md` entry created:

```
## 🔄 Repo Cleanup & Structural Audit – April 2025
- Removed legacy/deprecated files
- Merged duplicated architecture docs
- Standardized config, middleware, and scripts
- Verified /NEWAPPROACH guidance applied
```

---

## 🛠️ Tools Available

- You can use the `scripts/cleanup_and_reorganize.sh` as a reference
- Wrangler is installed and ready via `wrangler.toml` and CLI
- TypeScript, Tailwind, and Vite are configured
- All test data and API mocks are available in `tests/_fixtures/`

---

Let me know if anything in the integration flow needs rework or if you find untracked legacy logic.

Thanks!
