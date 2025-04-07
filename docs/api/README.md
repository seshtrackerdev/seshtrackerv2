# SeshTracker API Documentation

This document provides an overview of the SeshTracker API endpoints, which are implemented using Cloudflare Workers and the Hono framework.

## Authentication

All API endpoints require authentication via a JWT token provided by Kush.Observer.

**Header Format:**
```
Authorization: Bearer <token>
```

## Base URL

- Production: `https://sesh-tracker.com/api`
- Staging: `https://staging.sesh-tracker.com/api`
- Development: `https://dev.sesh-tracker.com/api`

## Endpoints

### Authentication

- `POST /api/auth/login` - Authenticate with Kush.Observer
- `POST /api/auth/validate-token` - Validate JWT token
- `POST /api/auth/refresh` - Refresh an expiring token

### Sessions

- `GET /api/sessions` - List user's sessions
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions` - Create a new session
- `PUT /api/sessions/:id` - Update session details
- `DELETE /api/sessions/:id` - Delete a session

### Inventory

- `GET /api/inventory` - List user's inventory
- `GET /api/inventory/:id` - Get inventory item details
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Remove inventory item

### User Profile

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "data": { ... },
  "error": "Error message if success is false",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

For detailed information on each endpoint, refer to the relevant section in the documentation. 