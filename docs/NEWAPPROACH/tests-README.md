# 🧪 SeshTracker Testing Suite

This directory provides automated testing coverage for the SeshTracker application, including:

- ✅ End-to-end user flows (auth, session navigation)
- ✅ API-level validation
- ✅ Mock data fixtures for local tests

---

## 📁 Directory Overview

| Folder           | Description                                       |
|------------------|---------------------------------------------------|
| `unit/`          | Unit tests for React components, utils, hooks    |
| `integration/`   | Tests for backend API endpoints and auth proxy   |
| `e2e/`           | Playwright tests for full user interaction flows |
| `_fixtures/`     | Static JSON for inventory, session, and strain data |

---

## 🎭 End-to-End Testing (Playwright)

Located in `e2e/auth-flow.spec.js`

### ✅ Covered Scenarios

- User registration with Kush.Observer
- User login → redirect to dashboard
- Auth persistence across pages
- Token refresh behavior
- Logout + redirect
- Invalid token access prevention

### 📍 Configuration

Environment variables used:
```bash
KUSH_OBSERVER_URL=https://kush.observer/api
SESH_TRACKER_URL=http://localhost:3000
```

To run Playwright:
```bash
npx playwright test e2e/auth-flow.spec.js
```

---

## 📦 Test Fixtures

Fixtures stored under `_fixtures/` include:

- `mock-inventory.json`: Rich inventory object set with THC, CBD, cost, notes
- `mock-sessions.json`: Full session logs with effects, timestamps, dosage
- `mock-strains.json`: All known strains, effects, terpenes, descriptions

Fixtures are used in:
- Component mocking
- State snapshots
- API mock handlers

---

## 🔄 Token Verification Mock

Playwright tests mock and validate JWT behavior against the live Kush.Observer verify endpoint.

```ts
fetch('/auth/verify', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})
```

---

## ✅ Best Practices

- Test auth first (it gates all protected behavior)
- Use Playwright UI debugger when tests fail: `npx playwright test --debug`
- Reset mocks between tests to avoid leakage
- Clean up test users using `KUSH_API/testing/users`

---

## 🔚 Summary

This test suite provides critical confidence that the new Kush.Observer + D1 architecture operates as expected end-to-end. Expand testing coverage as new features are added (dashboard widgets, analytics, etc).
