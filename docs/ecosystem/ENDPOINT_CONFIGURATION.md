# SeshTracker Ecosystem URL Configuration

This document explains the URL standardization system used across the SeshTracker ecosystem to ensure consistent domain usage and integration.

## Overview

The SeshTracker ecosystem consists of three main components:

1. **Sesh-Tracker.com** - The main application for tracking sessions and inventory
2. **Kush.Observer** - Authentication and user management system
3. **My-Cannabis-Tracker.com** - Administrative dashboard and reporting

To maintain consistency across all code and ensure proper integration, we've created a centralized configuration system in `src/config/ecosystem.ts`.

## 🌐 Standardized Domains

All code should reference these standardized domains:

| System | Production URL | Staging URL | Development URL |
|--------|---------------|-------------|----------------|
| SeshTracker | `https://sesh-tracker.com` | `https://staging.sesh-tracker.com` | `https://dev.sesh-tracker.com` |
| Kush.Observer | `https://kush.observer` | `https://staging.kush.observer` | `https://dev.kush.observer` |
| My-Cannabis-Tracker | `https://my-cannabis-tracker.com` | `https://staging.my-cannabis-tracker.com` | `https://dev.my-cannabis-tracker.com` |

## 📋 Using the Configuration

### Importing the Configuration

```typescript
import { API, ENDPOINTS, getEnvironment } from '../../config/ecosystem';
```

### Getting the Base URL for a System

```typescript
// Get URL based on current environment
const kushUrl = ENDPOINTS.KUSHOBSERVER[getEnvironment()];

// Explicitly specify environment
const stagingUrl = ENDPOINTS.SESHTRACKER.STAGING;
```

### Using API Endpoints

```typescript
// Authentication API
const loginUrl = API.KUSHOBSERVER.AUTH.LOGIN();
const validateUrl = API.KUSHOBSERVER.AUTH.VALIDATE();

// SeshTracker API
const sessionsUrl = API.SESHTRACKER.SESSIONS();
const inventoryUrl = API.SESHTRACKER.INVENTORY();

// Admin API
const adminUserReport = API.MYCANNABIS.ADMIN.USER_REPORT('PRODUCTION', 'user_123');
```

### Environment-Specific URLs

```typescript
// Production URL
const prodUrl = API.KUSHOBSERVER.PROFILE('PRODUCTION');

// Staging URL
const stagingUrl = API.KUSHOBSERVER.PROFILE('STAGING');

// Development URL
const devUrl = API.KUSHOBSERVER.PROFILE('DEVELOPMENT');
```

## 🔄 Database and KV Bindings

The configuration also includes standardized database and KV namespace bindings:

```typescript
// Database binding
const dbBinding = DATABASE_BINDINGS.SESHTRACKER.BINDING; // 'DB'

// KV namespace
const userCacheKV = KV_BINDINGS.SESHTRACKER.USER_CACHE; // 'USER_CACHE'
```

## 🚨 Legacy/Development URLs

For backward compatibility, legacy development URLs are included but should be phased out:

```typescript
// Legacy URL - DO NOT USE in new code
const legacyDevUrl = ENDPOINTS.KUSHOBSERVER.LEGACY_DEV; // 'https://kushobserver.tmultidev.workers.dev'
```

## 📌 Best Practices

1. **Never hardcode URLs** in application code
2. **Always use the ecosystem configuration** for any URL or API endpoint
3. **Use environment-specific URLs** for proper testing across environments
4. **Keep the configuration updated** when new endpoints are added

## 🔧 Example Usage

See `src/react-app/components/common/ApiExample.tsx` for a complete example of proper usage in React components. 