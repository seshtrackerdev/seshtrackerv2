# 📋 Development Tasks & Requirements – SeshTracker

This file tracks active development priorities, features in progress, bugs, and technical goals aligned with the new architecture.

---

## ✅ Current Sprint Goal

> **Goal:** Complete migration to the new Kush.Observer-based auth system and finalize D1-backed session + inventory APIs.

---

## 🚧 Current Sprint Tasks

- **Task ID:** [TASK-003]
  - **Description:** Proxy all `/api/auth/*` and `/api/profile` requests to Kush.Observer
  - **Status:** In Progress
  - **Priority:** High
  - **Assignee:** —
  - **Notes:** Validate via `authMiddleware.ts` and test `verify-token`. Covered in `IMPLEMENTATION.md`.

- **Task ID:** [TASK-004]
  - **Description:** Apply migration `0002_sessions_inventory_schema.sql` locally and remotely
  - **Status:** To Do
  - **Priority:** High
  - **Assignee:** —
  - **Notes:** Use `apply-migration.js`. Confirm table creation with `.schema` query.

- **Task ID:** [TASK-005]
  - **Description:** Refactor all component imports to use barrel exports
  - **Status:** To Do
  - **Priority:** Medium
  - **Notes:** Use `update-imports.sh` and validate with `verify-imports.sh`

- **Task ID:** [TASK-006]
  - **Description:** Finalize Tailwind + variable-based dark mode theming
  - **Status:** In Progress
  - **Priority:** Medium
  - **Notes:** Use `themes.css`, align with `mobile-first-theme.md`

---

## 🌱 Feature Backlog

- **Feature:** Inventory depletion analytics widget
  - **Requirements:** Pull D1 inventory + session data, chart time-based usage
- **Feature:** Ad-hoc SQL query dashboard
  - **Requirements:** Read-only SQL interface to D1, scoped by `user_id`, secured via JWT
- **Feature:** Admin subscription audit tools (My-Cannabis-Tracker)
  - **Requirements:** View user roles, subscription expiry, last activity

---

## 🐞 Bug Log

*(Only add here if not using GitHub Issues)*

- **Bug ID:** [BUG-001]
  - **Description:** Profile update doesn't reflect immediately in UI
  - **Status:** Open
  - **Priority:** Low
  - **Reported by:** Internal QA
  - **Steps to Reproduce:** Edit display name → Save → Observe stale UI until page refresh

---

## ⏳ Blocked Tasks

- **Task ID:** [BLOCKED-001]
  - **Description:** Final integration testing for `/api/auth/validate-token`
  - **Blocked By:** Awaiting endpoint deployment on Kush.Observer staging
  - **Notes:** Check API health using `test-connection.js`

---

## 🧪 Deployment + Testing

- Confirm migration schema via:
  ```bash
  npx wrangler d1 execute seshtracker-db --command ".schema"
  ```

- Run integration tests:
  ```bash
  node test-connection.js
  ```

---

Update this file as new tasks are added or transitioned. Use it as a lightweight alternative to a full ticketing system when needed.
