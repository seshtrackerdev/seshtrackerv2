# Authentication API Endpoints Specification

This document defines the authentication API endpoints used between SeshTracker and Kush.Observer.

## Endpoints

### `POST /api/auth/login`

Authenticates a user and returns a JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "rt_a1b2c3d4e5f6...",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "subscription": {
        "status": "active",
        "plan": "premium",
        "expiresAt": "2025-12-31T23:59:59Z"
      }
    }
  }
}
```

### `POST /api/auth/validate-token`

Validates a JWT token and returns user information.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "subscription": {
        "status": "active",
        "plan": "premium",
        "expiresAt": "2025-12-31T23:59:59Z"
      }
    }
  }
}
```

### `POST /api/auth/refresh-token`

Refreshes an expired JWT token using a refresh token.

**Request:**
```json
{
  "refreshToken": "rt_a1b2c3d4e5f6..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "rt_g7h8i9j0k1l2...",
    "expiresIn": 3600
  }
}
```

## Error Responses

All endpoints return the following format for errors:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

Common error codes:
- `INVALID_CREDENTIALS`: Email or password is incorrect
- `INVALID_TOKEN`: The token is invalid or expired
- `INVALID_REFRESH_TOKEN`: The refresh token is invalid or expired

## Implementation Notes

- Tokens expire after 1 hour (3600 seconds)
- Refresh tokens expire after 30 days
- All requests should include `Content-Type: application/json` header
- Token validation should be cached to reduce load (5-minute TTL recommended) 