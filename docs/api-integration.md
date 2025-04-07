# SeshTracker - KushObserver API Integration

This document describes the integration between SeshTracker frontend and KushObserver authentication backend services.

## Overview

SeshTracker relies on KushObserver for user authentication, profile management, and subscription handling. The integration is designed to ensure seamless data flow between both systems while maintaining compatibility as both evolve.

## API Endpoint Compatibility

SeshTracker frontend expects certain API endpoints that are now provided by KushObserver through endpoint redirects:

| SeshTracker Expected Endpoint | KushObserver Endpoint | Method | Purpose |
|-------------------------------|------------------------|--------|---------|
| `/api/profile` | `/api/user/profile` | GET/PATCH | Fetch and update user profile |
| `/api/subscription` | `/api/user/subscription` | GET | Retrieve user subscription details |
| `/api/password-change` | `/api/user/change-password` | POST | Change user password (requires auth) |
| `/api/password-reset` | - | POST | Token-based password reset |

## Authentication Flow

1. **Login**: User logs in via SeshTracker frontend, which communicates with KushObserver's `/api/direct-login` endpoint
2. **Token Storage**: JWT token (48-hour validity) is stored in the frontend
3. **API Requests**: All subsequent requests include the JWT token in the Authorization header
4. **Token Verification**: Token is verified on each request using KushObserver's `/verify` endpoint

## Data Synchronization

### User Data

- User profile data is stored in KushObserver's backend
- SeshTracker database provisions a local copy of essential user data for performance
- Any profile updates are immediately synchronized with KushObserver's backend

### Session & Inventory Data

- Session and inventory data are stored in SeshTracker's database
- This data is associated with the user ID provided by KushObserver
- KushObserver is not responsible for storing this application-specific data

## CORS Configuration

The following origins are explicitly allowed for cross-origin requests:

- `https://www.sesh-tracker.com`
- `https://sesh-tracker.com`

All authenticated endpoints accept the following headers:
- `Authorization`
- `Content-Type`
- `Accept`

## Error Handling

All API endpoints follow consistent error handling:

- HTTP status codes reflect the nature of the error
- Error responses include a `success: false` field and an `error` message
- Sensitive error details are not exposed to the client

## Implementation Details

### Endpoint Redirect Implementation

SeshTracker implements API endpoint compatibility by:

1. Accepting requests at the expected endpoint paths
2. Forwarding these requests to the corresponding KushObserver endpoints
3. Passing along all headers, including authentication tokens
4. Returning the response directly to the client

This proxy approach ensures that:
- Frontend code doesn't need to change
- Future KushObserver API changes can be accommodated with minimal adjustments
- Additional processing/validation can be added if needed

## Testing the Integration

To verify the integration is working correctly:

1. Test user registration, login, and password reset flows
2. Verify profile data can be retrieved and updated
3. Confirm subscription information is correctly displayed
4. Ensure password changes work properly
5. Validate that auth token expiration and renewal function as expected

## Future Improvements

- Implement refresh token mechanism for longer sessions
- Add rate limiting for authentication endpoints
- Enhance error reporting and logging for troubleshooting
- Create monitoring for integration health 