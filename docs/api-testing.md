# SeshTracker-KushObserver API Integration Testing Guide

This document provides instructions for testing the API integration between SeshTracker and KushObserver to ensure all endpoints are functioning correctly.

## Prerequisites

- Access to a development/testing environment
- A test user account with known credentials
- [Postman](https://www.postman.com/) or similar API testing tool
- Access to browser developer tools

## Test Cases

### 1. Authentication Flow Testing

#### 1.1 User Registration

1. Make a POST request to `/api/auth/register` with:
   ```json
   {
     "email": "test@example.com",
     "password": "securePassword123",
     "name": "Test User"
   }
   ```
2. Verify you receive a success response with a user ID
3. Confirm the user is created in both KushObserver and SeshTracker databases

#### 1.2 User Login

1. Make a POST request to `/api/auth/login` with:
   ```json
   {
     "email": "test@example.com",
     "password": "securePassword123"
   }
   ```
2. Verify you receive a success response with a token
3. Save this token for subsequent tests

#### 1.3 Password Reset Request

1. Make a POST request to `/api/auth/reset-password` with:
   ```json
   {
     "email": "test@example.com"
   }
   ```
2. Verify you receive a success response
3. Check the test email account for a reset email (if email sending is configured)

### 2. Endpoint Compatibility Testing

These tests verify that the new compatibility endpoints correctly forward requests to KushObserver.

#### 2.1 Profile Endpoint

1. Make a GET request to `/api/profile` with the Authorization header:
   ```
   Authorization: Bearer <your-token>
   ```
2. Verify you receive the user's profile data
3. Make a PATCH request to `/api/profile` with:
   ```json
   {
     "name": "Updated Test User"
   }
   ```
4. Verify the name is updated in the response
5. Make another GET request to confirm the change persisted

#### 2.2 Subscription Endpoint

1. Make a GET request to `/api/subscription` with the Authorization header
2. Verify you receive the user's subscription information

#### 2.3 Password Change Endpoint

1. Make a POST request to `/api/password-change` with:
   ```json
   {
     "currentPassword": "securePassword123",
     "newPassword": "evenMoreSecure456"
   }
   ```
2. Verify you receive a success response
3. Try logging in with the new password to confirm the change

#### 2.4 Password Reset Endpoint

1. Request a password reset as in step 1.3
2. Obtain the reset token (from email or database)
3. Make a POST request to `/api/password-reset` with:
   ```json
   {
     "token": "<reset-token>",
     "password": "newSecurePassword789"
   }
   ```
4. Verify you receive a success response
5. Try logging in with the new password to confirm the change

### 3. Integration Testing

These tests verify that the full user flow works correctly in the SeshTracker frontend.

#### 3.1 Frontend Authentication

1. Open the SeshTracker frontend application
2. Register a new user or log in with existing credentials
3. Verify you're successfully logged in and can access protected areas

#### 3.2 Profile Management

1. Navigate to the profile settings page
2. Update your profile information
3. Refresh the page and verify the changes persisted

#### 3.3 Session with Profile Integration

1. Create a new session in SeshTracker
2. Verify the session is associated with your user ID
3. Check that any user-specific preferences are applied

### 4. Error Handling Verification

#### 4.1 Invalid Token

1. Make a request to `/api/profile` with an invalid token
2. Verify you receive a 401 Unauthorized response

#### 4.2 Invalid Request Format

1. Make a PATCH request to `/api/profile` with invalid data
2. Verify you receive a 400 Bad Request response with a meaningful error message

### 5. Performance Testing

#### 5.1 Response Time

1. Use browser developer tools or Postman to measure response times for:
   - Login request
   - Profile fetch
   - Subscription fetch
2. Verify all responses are completed within acceptable time limits (< 1000ms)

## Troubleshooting

If you encounter issues during testing:

1. Check browser network tab for detailed error responses
2. Verify that CORS headers are correctly set
3. Ensure all endpoint URLs match expected patterns
4. Confirm authentication tokens haven't expired
5. Review server logs for backend errors

## Reporting Issues

When reporting integration issues, include:

1. The specific endpoint that failed
2. Request data (with sensitive information redacted)
3. Full error response
4. Steps to reproduce the issue
5. Browser/environment information 