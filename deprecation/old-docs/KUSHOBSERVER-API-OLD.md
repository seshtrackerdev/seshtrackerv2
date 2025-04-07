# KushObserver API Integration for SeshTracker

This document outlines the integration between SeshTracker and the KushObserver API.

## Overview

SeshTracker uses the KushObserver API for authentication, user management, and data storage. The integration is proxied through our server-side API to ensure proper handling of authentication tokens and CORS issues.

## API Environments

- **Production API**: `https://kush.observer`
- **Development API**: `https://kush.observer`

The environment is configured in `src/config/auth.ts`.

## Authentication

### JWT Authentication

All authenticated endpoints use JWT tokens with the following characteristics:
- Tokens expire after 2 hours
- Token refresh is available via the refresh token endpoint
- Tokens must be included in all authenticated requests as: `Authorization: Bearer <token>`

### Authentication Flow

1. **Login**: User submits credentials to `/api/auth/login`
2. **Token Storage**: JWT token is stored in localStorage
3. **Token Refresh**: Silent refresh occurs before token expiration
4. **Logout**: Removes token from localStorage

## API Endpoints

The application proxies requests to KushObserver through a set of corresponding endpoints:

### Authentication Endpoints

- **Login**: `POST /api/auth/login`
- **Register**: `POST /api/auth/register`
- **Refresh Token**: `POST /api/auth/refresh`
- **Reset Password**: `POST /api/auth/reset-password`
- **Complete Reset**: `POST /api/auth/complete-password-reset`

### Profile Management

- **Get Profile**: `GET /api/profile`
- **Update Profile**: `PATCH /api/profile`
- **Get Preferences**: `GET /api/preferences`
- **Update Preferences**: `PUT /api/preferences`
- **Get Advanced Preferences**: `GET /api/advanced-preferences`
- **Update Advanced Preferences**: `PUT /api/advanced-preferences`

### Session Management

- **Get Sessions**: `GET /api/sessions`
- **Get Session**: `GET /api/sessions/:id`
- **Create Session**: `POST /api/sessions`
- **Update Session**: `PUT /api/sessions/:id`
- **Delete Session**: `DELETE /api/sessions/:id`

### Inventory Management

- **Get Inventory**: `GET /api/inventory`
- **Get Inventory Item**: `GET /api/inventory/:id`
- **Create Inventory Item**: `POST /api/inventory`
- **Update Inventory Item**: `PUT /api/inventory/:id`
- **Delete Inventory Item**: `DELETE /api/inventory/:id`

### Strain Management

- **Get Strains**: `GET /api/strains`
- **Get Strain**: `GET /api/strains/:id`
- **Create Strain**: `POST /api/strains`
- **Update Strain**: `PUT /api/strains/:id`

### Testing Endpoints

- **Create Sandbox User**: `POST /api/testing/create-sandbox-user`
- **Reset Sandbox Data**: `POST /api/testing/reset-sandbox`

## CORS Configuration

The KushObserver API allows requests from the following origins:
- http://localhost:3000
- http://localhost:5173
- https://sesh-tracker.com
- https://www.sesh-tracker.com
- https://dev.sesh-tracker.com
- https://staging.sesh-tracker.com

When debugging CORS issues, use the `/api/cors-test` endpoint to verify headers.

## Error Handling

All API endpoints follow a consistent error pattern:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Rate Limiting

The KushObserver API has a rate limit of 120 requests per minute per IP. The headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` are included in responses.

## Integration Test Account

For testing purposes, use:
- **Email:** tester@email.com
- **Password:** Superbowl9-Veggie0-Credit4-Watch1

## Troubleshooting

If you encounter issues:
1. Check the browser console for errors
2. Verify CORS headers using the `/api/cors-test` endpoint
3. Check token expiration and refresh behavior
4. Ensure proper rate limit handling 