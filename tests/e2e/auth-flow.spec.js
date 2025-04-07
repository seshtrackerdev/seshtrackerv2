/**
 * SeshTracker Authentication Flow Integration Test
 * 
 * This test verifies the authentication flow between Sesh-Tracker.com and Kush.Observer
 * Testing with Playwright to simulate real user interactions
 */

const { test, expect } = require('@playwright/test');

// Test user credentials (test-only account)
const TEST_USER = {
  email: 'test@sesh-tracker.com',
  password: 'Testing123!',
  name: 'Test User'
};

// API endpoints
const KUSH_API = process.env.KUSH_OBSERVER_URL || 'https://kush.observer/api';
const SESH_APP = process.env.SESH_TRACKER_URL || 'http://localhost:3000';

// Test the complete authentication flow
test.describe('Authentication Flow', () => {
  
  test('should register a new test user', async ({ page, request }) => {
    // First, delete test user if it exists
    try {
      await request.delete(`${KUSH_API}/testing/users?email=${TEST_USER.email}`);
    } catch (error) {
      // Ignore errors, test user might not exist yet
    }

    // Now navigate to the registration page
    await page.goto(`${SESH_APP}/register`);
    
    // Fill out the registration form
    await page.fill('input[name="name"]', TEST_USER.name);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.fill('input[name="confirmPassword"]', TEST_USER.password);
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to login page or dashboard
    await page.waitForURL(/login|dashboard/);
    
    // Verify success message
    const successMessage = await page.locator('.toast-success').textContent();
    expect(successMessage).toContain('registered');
  });
  
  test('should login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto(`${SESH_APP}/login`);
    
    // Fill login form
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Wait for dashboard redirect
    await page.waitForURL(/dashboard/);
    
    // Verify authentication state
    const userName = await page.locator('[data-testid="user-name"]').textContent();
    expect(userName).toContain(TEST_USER.name);
    
    // Verify JWT token was stored
    const jwtToken = await page.evaluate(() => localStorage.getItem('sesh_jwt'));
    expect(jwtToken).toBeTruthy();
  });
  
  test('should maintain authentication across page navigation', async ({ page }) => {
    // Login first
    await page.goto(`${SESH_APP}/login`);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    
    // Navigate to another page
    await page.click('a[href="/sessions"]');
    await page.waitForURL(/sessions/);
    
    // Verify still authenticated
    const userName = await page.locator('[data-testid="user-name"]').textContent();
    expect(userName).toContain(TEST_USER.name);
    
    // Check token validity by making an authenticated request
    const isAuthorized = await page.evaluate(async () => {
      const response = await fetch(`${KUSH_API}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sesh_jwt')}`
        }
      });
      const data = await response.json();
      return data.success;
    });
    
    expect(isAuthorized).toBe(true);
  });
  
  test('should logout and clear authentication state', async ({ page }) => {
    // Login first
    await page.goto(`${SESH_APP}/login`);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    
    // Click logout button
    await page.click('button[data-testid="logout-button"]');
    
    // Wait for redirect to login or home page
    await page.waitForURL(/login|^\/?$/);
    
    // Verify JWT token was removed
    const jwtToken = await page.evaluate(() => localStorage.getItem('sesh_jwt'));
    expect(jwtToken).toBeFalsy();
    
    // Verify cannot access protected route
    await page.goto(`${SESH_APP}/dashboard`);
    await page.waitForURL(/login/); // Should redirect to login
  });

  test('should refresh token when expired', async ({ page }) => {
    // Login first
    await page.goto(`${SESH_APP}/login`);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    
    // Get initial token
    const initialToken = await page.evaluate(() => localStorage.getItem('sesh_jwt'));
    
    // Simulate token expiration (force token refresh)
    await page.evaluate(() => {
      // Mock the isTokenExpired function to always return true
      window.originalIsTokenExpired = window.isTokenExpired;
      window.isTokenExpired = () => true;
      
      // Trigger a check for token expiration
      document.dispatchEvent(new Event('visibilitychange'));
    });
    
    // Wait for token refresh to complete
    await page.waitForTimeout(1000);
    
    // Get new token
    const newToken = await page.evaluate(() => localStorage.getItem('sesh_jwt'));
    
    // Restore original function
    await page.evaluate(() => {
      window.isTokenExpired = window.originalIsTokenExpired;
    });
    
    // Verify token changed
    expect(newToken).toBeTruthy();
    expect(newToken).not.toBe(initialToken);
    
    // Verify can still access protected route with new token
    await page.goto(`${SESH_APP}/dashboard`);
    const userName = await page.locator('[data-testid="user-name"]').textContent();
    expect(userName).toContain(TEST_USER.name);
  });

  test('should block access with invalid token', async ({ page, request }) => {
    // Try to access a protected route with invalid token
    await page.goto(`${SESH_APP}/login`);
    
    // Set an invalid JWT token
    await page.evaluate(() => {
      localStorage.setItem('sesh_jwt', 'invalid.token.signature');
    });
    
    // Try to access protected route
    await page.goto(`${SESH_APP}/dashboard`);
    
    // Should redirect to login
    await page.waitForURL(/login/);
    
    // Verify error message
    const errorMessage = await page.locator('.toast-error').textContent();
    expect(errorMessage).toContain('authentication');
  });
  
  // Clean up test data
  test.afterAll(async ({ request }) => {
    try {
      // Delete test user
      await request.delete(`${KUSH_API}/testing/users?email=${TEST_USER.email}`);
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  });
}); 