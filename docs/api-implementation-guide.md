# SeshTracker-KushObserver API Integration Implementation Guide

This document provides technical details and implementation guidelines for the API integration between SeshTracker and KushObserver.

## Architecture Overview

```
┌────────────────┐     ┌───────────────────┐     ┌────────────────────┐
│                │     │                   │     │                    │
│  SeshTracker   │◄───►│  API Middleware   │◄───►│    KushObserver    │
│   Frontend     │     │    (This App)     │     │    Auth Service    │
│                │     │                   │     │                    │
└────────────────┘     └───────────────────┘     └────────────────────┘
                                 ▲
                                 │
                                 ▼
                       ┌───────────────────┐
                       │                   │
                       │   SeshTracker     │
                       │    Database       │
                       │                   │
                       └───────────────────┘
```

The SeshTracker frontend communicates with two backend services:
1. **KushObserver Auth Service** - Handles authentication, user profiles, and subscriptions
2. **SeshTracker API** - Manages session and inventory data

## Integration Implementation

### 1. Configuration

The integration relies on configuration in `src/config/auth.ts`:

```typescript
export const AUTH_CONFIG = {
  API_URL: 'https://kushobserver.tmultidev.workers.dev',
  ENDPOINTS: {
    LOGIN: '/api/direct-login',
    REGISTER: '/api/direct-register',
    VERIFY: '/verify',
    RESET: '/reset',
    PROFILE: '/api/profile',
    SUBSCRIPTION: '/api/subscription',
    PASSWORD_CHANGE: '/api/password-change',
    PASSWORD_RESET: '/api/password-reset'
  },
  STORAGE_KEYS: {
    TOKEN: 'auth_token',
    USER_DATA: 'user_data'
  }
};
```

### 2. Endpoint Redirection

The API middleware in `src/api/index.ts` implements endpoint compatibility by:

1. Accepting requests at SeshTracker's expected paths
2. Extracting the authentication token
3. Forwarding the request to KushObserver
4. Returning the response to the client

Example implementation for profile endpoint:

```typescript
// Profile endpoint compatibility
app.get("/api/profile", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.PROFILE}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Profile fetch failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Profile fetch error:", err);
    c.status(500);
    return c.json({ error: "Profile service unavailable" });
  }
});
```

### 3. Authentication Middleware

The `authMiddleware` in `src/api/middleware/auth.ts` verifies tokens with KushObserver before allowing access to protected endpoints:

```typescript
export const authMiddleware = createMiddleware<{
  Variables: {
    user: UserData;
  }
}>(async (c, next) => {
  // Get the authorization header
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - Missing or invalid token' }, 401);
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    // Verify the token with kushobserver service
    const verifyResponse = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.VERIFY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    
    const result = await verifyResponse.json() as VerifyResponse;
    
    if (!result.valid || !result.user) {
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }
    
    // Add the user data to the context for use in the route handlers
    c.set('user', result.user);
    
    // Continue to the route handler
    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ error: 'Internal server error during authentication' }, 500);
  }
});
```

## Technical Decisions

### 1. Proxy Approach vs. Frontend Configuration

We chose to implement endpoint compatibility through a proxy approach rather than changing frontend configuration for several reasons:

- **API Versioning**: Allows for future API versioning without frontend changes
- **Transformation**: Can transform data between systems if needed
- **Security**: Provides an additional security layer
- **Fallback**: Can implement fallbacks or caching for reliability

### 2. Token Handling

JWT tokens are passed through to KushObserver without modification to maintain security and simplicity.

### 3. Error Handling

A consistent error response format is maintained:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

HTTP status codes are preserved from KushObserver responses.

## Implementation Guidelines for New Features

When implementing new features that interact with KushObserver:

### 1. Adding New API Endpoints

1. Update `AUTH_CONFIG.ENDPOINTS` with the new KushObserver endpoint
2. Implement a proxy route in `src/api/index.ts`
3. Add appropriate error handling
4. Document the new endpoint in `docs/api-integration.md`

Example:

```typescript
// New feature endpoint
app.get("/api/new-feature", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.NEW_FEATURE}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `New feature request failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("New feature request error:", err);
    c.status(500);
    return c.json({ error: "New feature service unavailable" });
  }
});
```

### 2. Updating Existing Endpoints

When KushObserver changes an endpoint:

1. Update `AUTH_CONFIG.ENDPOINTS` with the new path
2. Test the integration to ensure compatibility
3. Update documentation

### 3. Data Transformation

If KushObserver's response format changes and breaks compatibility:

1. Add transformation logic in the proxy route:

```typescript
// With data transformation
app.get("/api/transformed-endpoint", authMiddleware, async (c) => {
  // ... fetch from KushObserver ... 
  
  const kushData = await response.json() as KushObserverResponse;
  
  // Transform data to expected format
  const transformedData = {
    id: kushData.userId,
    name: kushData.displayName,
    // ... other transformations ...
  };
  
  return c.json(transformedData);
});
```

## Best Practices

### 1. Error Logging

Always log detailed error information but return sanitized errors to clients:

```typescript
try {
  // API call
} catch (error) {
  // Log detailed information
  console.error('Detailed error info:', error);
  
  // Return sanitized error to client
  return c.json({ error: "Service unavailable" }, 500);
}
```

### 2. Token Security

- Never log full tokens
- Always use HTTPS for all API calls
- Don't store tokens in code or commit them to version control

### 3. Request Validation

Validate request data before forwarding to KushObserver:

```typescript
// With validation
app.post("/api/validated-endpoint", authMiddleware, async (c) => {
  const data = await c.req.json();
  
  // Validate required fields
  if (!data.requiredField) {
    return c.json({ error: "Required field missing" }, 400);
  }
  
  // ... proceed with API call ...
});
```

### 4. Monitoring and Logging

Add monitoring for KushObserver API calls to track:
- Response times
- Error rates
- Token validation failures

## Troubleshooting Common Issues

### 1. CORS Errors

If encountering CORS errors:
- Verify the `_headers` file has the correct `Access-Control-Allow-*` headers
- Check that the requesting origin matches the allowed origins
- Ensure preflight requests are properly handled

### 2. Authentication Failures

If authentication is failing:
- Verify token format and expiration
- Check KushObserver service availability
- Review token verification endpoint response

### 3. Data Synchronization Issues

If user data is not synchronizing correctly:
- Check provisioning endpoint is called after successful login
- Verify user ID matches between SeshTracker and KushObserver
- Ensure profile update events trigger data synchronization 