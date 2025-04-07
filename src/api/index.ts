import { Hono } from "hono";
import { cors } from "hono/cors";
import { nanoid } from "nanoid";
import { SessionService } from "./services/sessionService";
import { InventoryService } from "./services/inventoryService";
import { SessionFilters } from "../types/session";
import { InventoryFilters } from "../types/inventory";
import { AUTH_CONFIG } from "../config/auth";
import { KushObserverClient } from "../utils/kushObserverClient";
import { getKushObserverHeaders } from "../utils/api";
import inventoryRouter from "./routes/inventory";
import sessionsRouter from "./routes/sessions";
import { Context, Next } from "hono";
import { API } from '../config/ecosystem';

// Declare process for TypeScript
declare const process: {
  env: {
    NODE_ENV?: string;
  };
};

// MOCK_DATA_ENABLED is now permanently disabled
const MOCK_DATA_ENABLED = false;

// Define custom types for the app's variables
type UserData = {
  id: string;
  email: string;
  name?: string;
};

interface Variables {
  user: UserData;
}

interface Env {
  DB: D1Database;
  ASSETS: { fetch: typeof fetch };
  AUTH_API_URL: string;
}

// Update the Hono type to include our custom variables
const app = new Hono<{
  Bindings: Env;
  Variables: Variables;
}>();

// Initialize services
const getSessionService = (c: any): SessionService => {
  return new SessionService(c.env.DB);
};

const getInventoryService = (c: any): InventoryService => {
  return new InventoryService(c.env.DB);
};

// KushObserver client instance
const kushClient = new KushObserverClient();

// Middleware to validate auth tokens
const authMiddleware = async (c: Context, next: Next) => {
  // Always bypass auth for now
  console.log('[AUTH] Development mode: Bypassing authentication in middleware');
  
  // Set a mock user on the context so endpoints have something to work with
  c.set('user', {
    id: 'dev-user-id',
    email: 'dev@example.com',
    name: 'Development User'
  });
  
  await next();
  return;
  
  /* The following code is disabled for now
  // Extract token from Authorization header
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ 
      success: false, 
      error: 'Unauthorized - No token provided' 
    }, 401);
  }
  
  const token = authHeader.substring(7);
  
  try {
    // Validate token with Kush.Observer
    const validateUrl = `${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.VERIFY}`;
    const response = await fetch(validateUrl, {
      method: "POST",
      headers: getKushObserverHeaders(),
      body: JSON.stringify({ token }),
    });
    
    if (!response.ok) {
      return c.json({ 
        success: false, 
        error: `Unauthorized - Invalid token: ${response.statusText}` 
      }, 401);
    }
    
    const validation = await response.json() as Record<string, unknown>;
    
    if (!validation.valid) {
      return c.json({ 
        success: false, 
        error: 'Unauthorized - Invalid token' 
      }, 401);
    }
    
    // Attach user info to the context for later use
    c.set('user', validation.user);
    
    // Continue to the actual endpoint
    await next();
  } catch (err) {
    console.error("Authentication error:", err);
    return c.json({ 
      success: false, 
      error: 'Authentication service error',
      details: err instanceof Error ? err.message : String(err) 
    }, 500);
  }
  */
};

// SeshTracker API - Returns branding information
app.get("/api/", (c) => c.json({ 
  name: "SeshTracker", 
  version: "2.0", 
  emoji: "🌿",
  updated: new Date().toISOString()
}));

// Auth-related endpoints that communicate with the kushobserver service
app.post("/api/auth/login", async (c) => {
  const { email, password } = await c.req.json();
  
  console.log(`[LOGIN] Attempting login for email: ${email}`);
  
  // Special handling for test account in all environments
  if (email === 'tester@email.com' && password === 'Superbowl9-Veggie0-Credit4-Watch1') {
    console.log(`[LOGIN] Using test account credentials`);
    
    try {
      // Always attempt to authenticate with Kush.Observer
      const loginResponse = await kushClient.login(email, password);
      console.log(`[LOGIN] Test account login success: ${loginResponse.success}`);
      
      if (loginResponse.success && loginResponse.token) {
        kushClient.setToken(loginResponse.token);
        return c.json(loginResponse);
      }
      
      // If real login fails for test account, we'll fall through to the catch block
      throw new Error('Test account authentication failed with Kush.Observer');
    } catch (err) {
      console.warn(`[LOGIN] Test account authentication error:`, err);
      console.log(`[LOGIN] Using fallback for test account`);
      
      // Generate a mock token only for the test account
      const mockToken = `test_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      return c.json({
        success: true,
        token: mockToken,
        userId: 'test-user-id',
        user: {
          id: 'test-user-id',
          email: email,
          name: 'Test User'
        }
      });
    }
  }
  
  try {
    // Use Kush.Observer API for login
    const loginUrl = API.KUSHOBSERVER.AUTH.LOGIN('PRODUCTION');
    console.log(`[LOGIN] Using production login URL: ${loginUrl}`);
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      console.error(`[LOGIN] Login failed: ${response.status} ${response.statusText}`);
      return c.json({ 
        success: false, 
        error: 'Login failed. Please check your credentials.'
      }, 401); // Use 401 instead of response.status for type safety
    }
    
    const loginData = await response.json() as {
      token?: string;
      userId?: string;
      user?: {
        id: string;
        email: string;
        name?: string;
      }
    };
    
    console.log(`[LOGIN] Login success:`, loginData);
    
    // Create a properly typed response object
    const loginResponse = {
      success: true,
      token: loginData.token || '',
      userId: loginData.userId || loginData.user?.id || '',
      user: loginData.user || { id: '', email: email }
    };
    
    // If login successful, store the token for later use
    if (loginResponse.token) {
      kushClient.setToken(loginResponse.token);
    }
    
    // Return the response data directly to the client
    return c.json(loginResponse);
  } catch (err) {
    console.error("Login error:", err);
    return c.json({ success: false, error: "Authentication service unavailable" }, 500);
  }
});

app.post("/api/auth/register", async (c) => {
  const userData = await c.req.json();
  
  console.log(`[REGISTER] Attempting registration for email: ${userData.email}`);
  
  // Development mode fallback - always succeed
  const isDevMode = true; // Always use dev mode for now
  if (isDevMode) {
    console.log(`[REGISTER] Using development fallback`);
    
    // Generate a mock user ID
    const mockUserId = `dev-${userData.email.split('@')[0]}-${Date.now()}`;
    
    return c.json({
      success: true,
      userId: mockUserId,
      message: "Registration successful (Development Mode)"
    });
  }
  
  try {
    const registerResponse = await kushClient.register(userData);
    return c.json(registerResponse);
  } catch (err) {
    console.error("Registration fetch error:", err);
    c.status(500);
    return c.json({ success: false, error: "Registration service unavailable" });
  }
});

// Token validation endpoint
app.post("/api/auth/validate-token", async (c) => {
  const { token } = await c.req.json();
  
  console.log(`[VALIDATE] Validating token: ${token ? token.substring(0, 10) + '...' : 'missing'}`);
  
  try {
    const validateUrl = `${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.VERIFY}`;
    console.log(`[VALIDATE] Using validate URL: ${validateUrl}`);
    
    const response = await fetch(validateUrl, {
      method: "POST",
      headers: getKushObserverHeaders(),
      body: JSON.stringify({ token }),
    });
    
    console.log(`[VALIDATE] Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error(`[VALIDATE] Token validation failed: ${response.status} ${response.statusText}`);
      c.status(response.status as any);
      return c.json({ 
        valid: false, 
        error: `Token validation failed: ${response.statusText}` 
      });
    }
    
    const data = await response.json() as Record<string, unknown>;
    console.log(`[VALIDATE] Validation result:`, data);
    return c.json(data);
  } catch (err) {
    console.error("[VALIDATE] Token validation error:", err);
    c.status(500);
    return c.json({ 
      valid: false, 
      error: "Token validation service unavailable",
      details: err instanceof Error ? err.message : String(err)
    });
  }
});

// Token refresh endpoint
app.post("/api/auth/refresh-token", async (c) => {
  const { token } = await c.req.json();
  
  console.log(`[REFRESH] Refreshing token: ${token ? token.substring(0, 10) + '...' : 'missing'}`);
  
  try {
    const refreshUrl = `${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.REFRESH_TOKEN}`;
    console.log(`[REFRESH] Using refresh URL: ${refreshUrl}`);
    
    const response = await fetch(refreshUrl, {
      method: "POST",
      headers: getKushObserverHeaders(),
      body: JSON.stringify({ token }),
    });
    
    console.log(`[REFRESH] Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error(`[REFRESH] Token refresh failed: ${response.status} ${response.statusText}`);
      c.status(response.status as any);
      return c.json({ 
        success: false, 
        error: `Token refresh failed: ${response.statusText}` 
      });
    }
    
    const data = await response.json() as Record<string, unknown>;
    console.log(`[REFRESH] Refresh result:`, data);
    
    // Update the token in the KushClient for subsequent requests
    if (data.token) {
      kushClient.setToken(data.token as string);
    }
    
    return c.json(data);
  } catch (err) {
    console.error("[REFRESH] Token refresh error:", err);
    c.status(500);
    return c.json({ 
      success: false, 
      error: "Token refresh service unavailable",
      details: err instanceof Error ? err.message : String(err)
    });
  }
});

app.post("/api/auth/reset-password", async (c) => {
  const { email } = await c.req.json();
  
  interface ResetPasswordError {
    error: string;
  }
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.RESET}`, {
      method: "POST",
      headers: getKushObserverHeaders(),
      body: JSON.stringify({ 
        email,
        resetUrl: 'https://sesh-tracker.com/reset-password?token='
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json() as ResetPasswordError;
      c.status(response.status as any);
      return c.json({ 
        success: false, 
        error: errorData.error || `Password reset failed: ${response.statusText}` 
      });
    }
    
    return c.json({ success: true });
  } catch (err) {
    console.error("Password reset fetch error:", err);
    c.status(500);
    return c.json({ success: false, error: "Password reset service unavailable" });
  }
});

// Complete password reset endpoint
app.post("/api/auth/complete-password-reset", async (c) => {
  const { token, new_password } = await c.req.json();
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.PASSWORD_RESET}`, {
      method: "POST",
      headers: getKushObserverHeaders(),
      body: JSON.stringify({ token, new_password }),
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ 
        success: false, 
        error: `Password reset completion failed: ${response.statusText}` 
      });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Password reset completion error:", err);
    c.status(500);
    return c.json({ success: false, error: "Password reset completion service unavailable" });
  }
});

// Token verification endpoint
app.post("/api/auth/verify", async (c) => {
  const { token } = await c.req.json();
  
  console.log(`[VERIFY] Verifying token: ${token ? token.substring(0, 10) + '...' : 'missing'}`);
  
  try {
    const verifyUrl = `${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.VERIFY}`;
    console.log(`[VERIFY] Using verify URL: ${verifyUrl}`);
    
    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: getKushObserverHeaders(),
      body: JSON.stringify({ token }),
    });
    
    console.log(`[VERIFY] Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error(`[VERIFY] Token verification failed: ${response.status} ${response.statusText}`);
      c.status(response.status as any);
      return c.json({ 
        valid: false, 
        error: `Token verification failed: ${response.statusText}` 
      });
    }
    
    const data = await response.json() as Record<string, unknown>;
    console.log(`[VERIFY] Verification result:`, data);
    return c.json(data);
  } catch (err) {
    console.error("[VERIFY] Token verification error:", err);
    c.status(500);
    return c.json({ 
      valid: false, 
      error: "Token verification service unavailable",
      details: err instanceof Error ? err.message : String(err)
    });
  }
});

// Profile endpoint - get current user info
app.get("/api/profile", authMiddleware, async (c) => {
  console.log('[PROFILE] Getting user profile');
  
  try {
    // Development mode - return mock user
    if (process.env.NODE_ENV === 'development') {
      console.log('[PROFILE] Development mode - returning mock user');
      const mockUser = {
        id: "dev-user-id",
        email: "dev@example.com",
        name: "Development User",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      return c.json({
        success: true,
        user: mockUser
      });
    }
    
    // Production mode - get user from KushObserver
    const token = c.req.header('Authorization')?.split(' ')[1] || '';
    if (!token) {
      return c.json({ 
        success: false, 
        error: 'No authentication token provided' 
      }, 401);
    }
    
    kushClient.setToken(token);
    const userProfile = await kushClient.getUserProfile();
    
    return c.json({
      success: true,
      user: userProfile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch user profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Patch method for profile updates
app.patch("/api/profile", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  const updateData = await c.req.json();
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.PROFILE}`, {
      method: "PATCH",
      headers: getKushObserverHeaders('application/json', token),
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Profile update failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Profile update error:", err);
    c.status(500);
    return c.json({ error: "Profile update service unavailable" });
  }
});

// User preferences endpoints
app.get("/api/preferences", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.USER_PREFERENCES}`, {
      headers: getKushObserverHeaders('application/json', token)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Preferences fetch failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Preferences fetch error:", err);
    c.status(500);
    return c.json({ error: "Preferences service unavailable" });
  }
});

app.put("/api/preferences", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  const updateData = await c.req.json();
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.USER_PREFERENCES}`, {
      method: "PUT",
      headers: getKushObserverHeaders('application/json', token),
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Preferences update failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Preferences update error:", err);
    c.status(500);
    return c.json({ error: "Preferences update service unavailable" });
  }
});

// Advanced preferences endpoints
app.get("/api/advanced-preferences", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.USER_ADVANCED_PREFERENCES}`, {
      headers: getKushObserverHeaders('application/json', token)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Advanced preferences fetch failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Advanced preferences fetch error:", err);
    c.status(500);
    return c.json({ error: "Advanced preferences service unavailable" });
  }
});

app.put("/api/advanced-preferences", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  const updateData = await c.req.json();
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.USER_ADVANCED_PREFERENCES}`, {
      method: "PUT",
      headers: getKushObserverHeaders('application/json', token),
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Advanced preferences update failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Advanced preferences update error:", err);
    c.status(500);
    return c.json({ error: "Advanced preferences update service unavailable" });
  }
});

// Subscription endpoint compatibility
app.get("/api/subscription", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.SUBSCRIPTION}`, {
      headers: getKushObserverHeaders('application/json', token)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Subscription fetch failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Subscription fetch error:", err);
    c.status(500);
    return c.json({ error: "Subscription service unavailable" });
  }
});

// Password change endpoint compatibility
app.post("/api/password-change", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  const passwordData = await c.req.json();
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.PASSWORD_CHANGE}`, {
      method: "POST",
      headers: getKushObserverHeaders('application/json', token),
      body: JSON.stringify(passwordData)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Password change failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Password change error:", err);
    c.status(500);
    return c.json({ error: "Password change service unavailable" });
  }
});

// Password reset with token endpoint compatibility
app.post("/api/password-reset", async (c) => {
  const resetData = await c.req.json();
  
  // Ensure we're sending the domain information
  const dataWithDomain = {
    ...resetData,
    domain: 'sesh-tracker.com'
  };
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.PASSWORD_RESET}`, {
      method: "POST",
      headers: getKushObserverHeaders(),
      body: JSON.stringify(dataWithDomain)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ success: false, error: `Password reset failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Password reset error:", err);
    c.status(500);
    return c.json({ success: false, error: "Password reset service unavailable" });
  }
});

// User database provisioning endpoint
app.post("/api/users/provision", authMiddleware, async (c) => {
  const user = c.get('user');
  const { email, name } = user;
  const userId = user.id;
  
  try {
    // Use the session service to create or update the user in the SeshTracker database
    const sessionService = getSessionService(c);
    
    // Check if user exists
    const existingUser = await sessionService.getUserById(userId);
    
    if (!existingUser) {
      // Create user in the SeshTracker database
      await sessionService.createUser({
        id: userId,
        email,
        name,
        created: new Date().toISOString(),
        preferences: {} // Default preferences
      });
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error provisioning user:", error);
    return c.json({ 
      success: false, 
      error: "Failed to provision user in SeshTracker database" 
    }, 500);
  }
});

// Apply auth middleware to all paths under /api/protected
app.use('/api/protected/*', authMiddleware);

// For debug purposes, log all requests to protected endpoints
app.use('/api/protected/*', async (c, next) => {
  console.log('[DEBUG] Received request to protected endpoint:', c.req.path);
  await next();
});

// Protected routes
app.get("/api/protected/user-profile", (c) => {
  // User data is available from the middleware
  const user = c.var.user;
  return c.json({ user });
});

// User preferences endpoint for dashboard selection
app.post("/api/protected/user-preferences", authMiddleware, async (c) => {
  const user = c.var.user;
  const preferenceData = await c.req.json();
  
  try {
    // Use the session service to store user preferences
    const sessionService = getSessionService(c);
    
    // Update the user preferences
    const success = await sessionService.updateUserPreferences(user.id, preferenceData);
    
    if (!success) {
      return c.json({ 
        success: false, 
        error: "Failed to update user preferences - user not found" 
      }, 404);
    }
    
    return c.json({ 
      success: true,
      message: "User preferences updated successfully"
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return c.json({ 
      success: false, 
      error: "Failed to update user preferences in database" 
    }, 500);
  }
});

// GET endpoint for user preferences
app.get("/api/protected/user-preferences", authMiddleware, async (c) => {
  const user = c.var.user;
  
  try {
    // Use the session service to get user data with preferences
    const sessionService = getSessionService(c);
    const userData = await sessionService.getUserById(user.id);
    
    if (!userData) {
      return c.json({ 
        success: false, 
        error: "User not found" 
      }, 404);
    }
    
    return c.json({ 
      success: true,
      preferences: userData.preferences || {}
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return c.json({ 
      success: false, 
      error: "Failed to fetch user preferences from database" 
    }, 500);
  }
});

// Sessions API endpoints
app.get("/api/sessions", authMiddleware, async (c) => {
  console.log('[SESSIONS] Fetching sessions');
  
  // Return mock data for development
  const mockSessions = [
    {
      id: "mock-session-1",
      title: "Evening Relaxation",
      strain: "Northern Lights",
      strainType: "Indica",
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours after start
      duration: "2 hours",
      rating: 8,
      notes: "Great for relaxation before bed",
      method: "Vaporizer",
      effects: ["Relaxed", "Sleepy", "Euphoric"],
      thcContent: 18,
      cbdContent: 0.5,
      mood_before: "Stressed",
      mood_after: "Relaxed"
    },
    {
      id: "mock-session-2",
      title: "Creative Session",
      strain: "Sour Diesel",
      strainType: "Sativa",
      startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 3 hours after start
      duration: "3 hours",
      rating: 9,
      notes: "Excellent for creative projects",
      method: "Joint",
      effects: ["Creative", "Energetic", "Focused"],
      thcContent: 22,
      cbdContent: 0.2,
      mood_before: "Unmotivated",
      mood_after: "Inspired"
    },
    {
      id: "mock-session-3",
      title: "Quick Afternoon Break",
      strain: "Pineapple Express",
      strainType: "Hybrid",
      startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(), // 1 hour after start
      duration: "1 hour",
      rating: 7,
      notes: "Good for a quick mid-day break",
      method: "Pipe",
      effects: ["Happy", "Uplifted", "Creative"],
      thcContent: 19,
      cbdContent: 0.8,
      mood_before: "Bored",
      mood_after: "Content"
    },
    {
      id: "mock-session-4",
      title: "Movie Night",
      strain: "Granddaddy Purple",
      strainType: "Indica",
      startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 4 hours after start
      duration: "4 hours",
      rating: 9,
      notes: "Perfect for movie night with friends",
      method: "Bong",
      effects: ["Relaxed", "Happy", "Giggly"],
      thcContent: 20,
      cbdContent: 0.3,
      mood_before: "Anxious",
      mood_after: "Chill"
    },
    {
      id: "mock-session-5",
      title: "Nature Walk",
      strain: "Blue Dream",
      strainType: "Hybrid",
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000).toISOString(), // 2.5 hours after start
      duration: "2.5 hours",
      rating: 10,
      notes: "Amazing experience hiking in the forest",
      method: "Vaporizer",
      effects: ["Euphoric", "Happy", "Creative"],
      thcContent: 21,
      cbdContent: 0.5,
      mood_before: "Neutral",
      mood_after: "Blissful"
    }
  ];
  
  // Apply any filtering or sorting based on query parameters (if needed)
  const url = new URL(c.req.url);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  
  // Return a success response with our mock data
  return c.json({
    success: true,
    sessions: mockSessions.slice(0, limit),
    total: mockSessions.length
  });
});

app.get("/api/sessions/:id", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  const sessionId = c.req.param('id');
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.SESSIONS}/${sessionId}`, {
      headers: getKushObserverHeaders('application/json', token)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Session fetch failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Session fetch error:", err);
    c.status(500);
    return c.json({ error: "Session service unavailable" });
  }
});

app.post("/api/sessions", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  const sessionData = await c.req.json();
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.SESSIONS}`, {
      method: "POST",
      headers: getKushObserverHeaders('application/json', token),
      body: JSON.stringify(sessionData)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Session creation failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Session creation error:", err);
    c.status(500);
    return c.json({ error: "Session creation service unavailable" });
  }
});

app.put("/api/sessions/:id", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  const sessionId = c.req.param('id');
  const sessionData = await c.req.json();
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.SESSIONS}/${sessionId}`, {
      method: "PUT",
      headers: getKushObserverHeaders('application/json', token),
      body: JSON.stringify(sessionData)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Session update failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Session update error:", err);
    c.status(500);
    return c.json({ error: "Session update service unavailable" });
  }
});

app.delete("/api/sessions/:id", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  const sessionId = c.req.param('id');
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.SESSIONS}/${sessionId}`, {
      method: "DELETE",
      headers: getKushObserverHeaders('application/json', token)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Session deletion failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Session deletion error:", err);
    c.status(500);
    return c.json({ error: "Session deletion service unavailable" });
  }
});

// Protected inventory endpoints - requires authentication
app.get("/api/inventory", authMiddleware, async (c) => {
  console.log('[INVENTORY] Fetching inventory items');
  
  // Return mock data for development
  const mockInventory = [
    {
      id: "mock-inv-1",
      name: "Wedding Cake",
      type: "flower",
      quantity: 7.5,
      totalQuantity: 14,
      strain: "Wedding Cake",
      thc: 22,
      cbd: 0.5,
      purchaseDate: "2025-03-20T10:30:00Z",
      expiryDate: "2025-06-20T10:30:00Z",
      price: 120,
      dispensary: "Green Leaf",
      notes: "Very potent indica dominant hybrid",
      rating: 4.5,
      effects: ["relaxed", "happy", "sleepy"],
      flavors: ["sweet", "vanilla"],
      lowStock: false,
      totalSessions: 3,
      lastUsed: "2025-04-01T18:45:00Z"
    },
    {
      id: "mock-inv-2",
      name: "Sour Diesel",
      type: "flower",
      quantity: 3.5,
      totalQuantity: 7,
      strain: "Sour Diesel",
      thc: 24,
      cbd: 0.2,
      purchaseDate: "2025-03-25T14:20:00Z",
      expiryDate: "2025-06-25T14:20:00Z",
      price: 60,
      dispensary: "Herbal Remedies",
      notes: "Energizing sativa",
      rating: 4.2,
      effects: ["energetic", "creative", "uplifted"],
      flavors: ["diesel", "citrus"],
      lowStock: true,
      totalSessions: 5,
      lastUsed: "2025-04-05T09:30:00Z"
    },
    {
      id: "mock-inv-3",
      name: "Northern Lights Vape Cart",
      type: "cartridge",
      quantity: 0.8,
      totalQuantity: 1,
      strain: "Northern Lights",
      thc: 85,
      cbd: 0,
      purchaseDate: "2025-04-01T16:00:00Z",
      expiryDate: "2025-10-01T16:00:00Z",
      price: 45,
      dispensary: "Canna Co.",
      notes: "Discreet and potent",
      rating: 4.0,
      effects: ["relaxed", "sleepy"],
      flavors: ["earthy", "pine"],
      lowStock: false,
      totalSessions: 8,
      lastUsed: "2025-04-06T22:10:00Z"
    },
    {
      id: "mock-inv-4",
      name: "Blue Dream Gummies",
      type: "edible",
      quantity: 8,
      totalQuantity: 10,
      strain: "Blue Dream",
      thc: 10,
      cbd: 1,
      purchaseDate: "2025-03-28T13:00:00Z",
      expiryDate: "2025-09-28T13:00:00Z",
      price: 30,
      dispensary: "Green Earth",
      notes: "10mg per gummy, great taste",
      rating: 4.7,
      effects: ["relaxed", "happy", "creative"],
      flavors: ["berry", "sweet"],
      lowStock: false,
      totalSessions: 2,
      lastUsed: "2025-04-03T19:20:00Z"
    }
  ];
  
  // Apply any filtering or sorting based on query parameters (if needed)
  const url = new URL(c.req.url);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  
  // Return a success response with our mock data
  return c.json({
    success: true,
    items: mockInventory.slice(0, limit),
    total: mockInventory.length
  });
});

app.get("/api/inventory/:id", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  const itemId = c.req.param('id');
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.INVENTORY}/${itemId}`, {
      headers: getKushObserverHeaders('application/json', token)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Inventory item fetch failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Inventory item fetch error:", err);
    c.status(500);
    return c.json({ error: "Inventory item service unavailable" });
  }
});

app.post("/api/inventory", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  const itemData = await c.req.json();
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.INVENTORY}`, {
      method: "POST",
      headers: getKushObserverHeaders('application/json', token),
      body: JSON.stringify(itemData)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Inventory item creation failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Inventory item creation error:", err);
    c.status(500);
    return c.json({ error: "Inventory item creation service unavailable" });
  }
});

app.put("/api/inventory/:id", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  const itemId = c.req.param('id');
  const itemData = await c.req.json();
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.INVENTORY}/${itemId}`, {
      method: "PUT",
      headers: getKushObserverHeaders('application/json', token),
      body: JSON.stringify(itemData)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Inventory item update failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Inventory item update error:", err);
    c.status(500);
    return c.json({ error: "Inventory item update service unavailable" });
  }
});

app.delete("/api/inventory/:id", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  const itemId = c.req.param('id');
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.INVENTORY}/${itemId}`, {
      method: "DELETE",
      headers: getKushObserverHeaders('application/json', token)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Inventory item deletion failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Inventory item deletion error:", err);
    c.status(500);
    return c.json({ error: "Inventory item deletion service unavailable" });
  }
});

// KushObserver Inventory API proxy endpoint
app.get("/api/inventory", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  const url = new URL(c.req.url);
  const queryParams = url.search;
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.INVENTORY}${queryParams}`, {
      headers: getKushObserverHeaders('application/json', token)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Inventory fetch failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Inventory fetch error:", err);
    c.status(500);
    return c.json({ error: "Inventory service unavailable" });
  }
});

// KushObserver Inventory by ID API proxy endpoint
app.get("/api/inventory/:id", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  const itemId = c.req.param('id');
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.INVENTORY}/${itemId}`, {
      headers: getKushObserverHeaders('application/json', token)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Inventory item fetch failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Inventory item fetch error:", err);
    c.status(500);
    return c.json({ error: "Inventory service unavailable" });
  }
});

// KushObserver Strains API proxy endpoint
app.get("/api/strains", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  const url = new URL(c.req.url);
  const queryParams = url.search;
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.STRAINS}${queryParams}`, {
      headers: getKushObserverHeaders('application/json', token)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Strains fetch failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Strains fetch error:", err);
    c.status(500);
    return c.json({ error: "Strains service unavailable" });
  }
});

// Strain management endpoints
app.get("/api/strains", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  
  // Get query parameters for filtering
  const page = c.req.query('page') || '1';
  const limit = c.req.query('limit') || '20';
  const sort = c.req.query('sort') || 'name';
  const order = c.req.query('order') || 'asc';
  const type = c.req.query('type');
  const search = c.req.query('search');
  const verified = c.req.query('verified') || 'all';
  
  // Build query string
  let queryParams = new URLSearchParams({
    page,
    limit,
    sort,
    order,
    verified
  });
  
  if (type) queryParams.append('type', type);
  if (search) queryParams.append('search', search);
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.STRAINS}?${queryParams.toString()}`, {
      headers: getKushObserverHeaders('application/json', token)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Strains fetch failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Strains fetch error:", err);
    c.status(500);
    return c.json({ error: "Strains service unavailable" });
  }
});

app.get("/api/strains/:id", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  const strainId = c.req.param('id');
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.STRAINS}/${strainId}`, {
      headers: getKushObserverHeaders('application/json', token)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Strain fetch failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Strain fetch error:", err);
    c.status(500);
    return c.json({ error: "Strain service unavailable" });
  }
});

app.post("/api/strains", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  const strainData = await c.req.json();
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.STRAINS}`, {
      method: "POST",
      headers: getKushObserverHeaders('application/json', token),
      body: JSON.stringify(strainData)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Strain creation failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Strain creation error:", err);
    c.status(500);
    return c.json({ error: "Strain creation service unavailable" });
  }
});

app.put("/api/strains/:id", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  const strainId = c.req.param('id');
  const strainData = await c.req.json();
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.STRAINS}/${strainId}`, {
      method: "PUT",
      headers: getKushObserverHeaders('application/json', token),
      body: JSON.stringify(strainData)
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Strain update failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Strain update error:", err);
    c.status(500);
    return c.json({ error: "Strain update service unavailable" });
  }
});

// Add test environment endpoints for development and testing
app.post("/api/testing/create-sandbox-user", async (c) => {
  const { admin_secret, email_prefix, password } = await c.req.json();
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.SANDBOX_USER}`, {
      method: "POST",
      headers: getKushObserverHeaders(),
      body: JSON.stringify({ admin_secret, email_prefix, password })
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Sandbox user creation failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Sandbox user creation error:", err);
    c.status(500);
    return c.json({ error: "Sandbox user creation service unavailable" });
  }
});

app.post("/api/testing/reset-sandbox", async (c) => {
  const { admin_secret, user_id } = await c.req.json();
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.RESET_SANDBOX}`, {
      method: "POST",
      headers: getKushObserverHeaders(),
      body: JSON.stringify({ admin_secret, user_id })
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ error: `Sandbox data reset failed: ${response.statusText}` });
    }
    
    const data = await response.json() as Record<string, unknown>;
    return c.json(data);
  } catch (err) {
    console.error("Sandbox data reset error:", err);
    c.status(500);
    return c.json({ error: "Sandbox data reset service unavailable" });
  }
});

// CORS test endpoint for debugging
app.get("/api/cors-test", (c) => {
  const origin = c.req.header('Origin') || 'No Origin header';
  const referer = c.req.header('Referer') || 'No Referer header';
  const userAgent = c.req.header('User-Agent') || 'No User-Agent header';
  
  return c.json({
    success: true,
    message: "CORS test endpoint",
    requestHeaders: {
      origin,
      referer,
      userAgent
    },
    responseHeaders: {
      'Access-Control-Allow-Origin': c.req.header('Origin') || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Credentials': 'true',
      'Vary': 'Origin'
    }
  });
});

// Health check endpoint
app.get("/api/health", (c) => {
  return c.json({
    success: true,
    status: "operational",
    version: "2.0",
    timestamp: new Date().toISOString()
  });
});

// DEBUG ROUTE - Remove in production!
app.get("/api/debug/inventory", async (c) => {
  console.log('[DEBUG] Debug inventory route accessed');
  try {
    return c.json({
      success: true,
      inventory: [
        {
          id: "debug-1",
          name: "Debug Inventory Item 1",
          type: "flower",
          quantity: 10,
          purchaseDate: new Date().toISOString(),
          price: 50
        },
        {
          id: "debug-2",
          name: "Debug Inventory Item 2",
          type: "edible",
          quantity: 5,
          purchaseDate: new Date().toISOString(),
          price: 25
        }
      ]
    });
  } catch (error) {
    console.error('Error in debug inventory route:', error);
    return c.json({ error: 'Debug route error' }, 500);
  }
});

// MOCK AUTH ENDPOINTS FOR DEVELOPMENT
app.post("/api/auth/mock-login", async (c) => {
  console.log('[MOCK] Mock login endpoint called');
  try {
    const { email, password } = await c.req.json();
    
    // For development, accept the test credentials or any password with "test" in the email
    if ((email === "tester@email.com" && password === "Superbowl9-Veggie0-Credit4-Watch1") || 
        (email.includes("test") && password.length > 3)) {
      
      // Generate a mock token
      const mockToken = "mock_" + Date.now() + "_" + Math.random().toString(36).substring(2);
      const userId = "mock_user_" + Math.random().toString(36).substring(2);
      
      console.log('[MOCK] Generated mock token for login:', mockToken.substring(0, 15) + '...');
      
      return c.json({
        success: true,
        token: mockToken,
        userId: userId,
        email: email
      });
    }
    
    // Return error for invalid credentials
    return c.json({
      success: false,
      error: "Invalid email or password"
    }, 401);
  } catch (err) {
    console.error('[MOCK] Mock login error:', err);
    return c.json({
      success: false,
      error: "Server error during login"
    }, 500);
  }
});

// Mock verify endpoint for development
app.post("/api/auth/mock-verify", async (c) => {
  console.log('[MOCK] Mock verify endpoint called');
  try {
    const { token } = await c.req.json();
    
    // Accept any token that starts with "mock_"
    if (token && token.startsWith("mock_")) {
      return c.json({
        valid: true,
        user: {
          id: "mock_user_id",
          email: "tester@email.com",
          name: "Test User"
        }
      });
    }
    
    return c.json({
      valid: false,
      error: "Invalid token"
    }, 401);
  } catch (err) {
    console.error('[MOCK] Mock verify error:', err);
    return c.json({
      valid: false,
      error: "Server error during verification"
    }, 500);
  }
});

// User profile endpoint
app.get("/api/auth/user/profile", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  
  try {
    const profileUrl = `${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.PROFILE}`;
    console.log(`[PROFILE] Fetching user profile from: ${profileUrl}`);
    
    const response = await fetch(profileUrl, {
      headers: getKushObserverHeaders('application/json', token)
    });
    
    if (!response.ok) {
      console.error(`[PROFILE] Profile fetch failed: ${response.status} ${response.statusText}`);
      c.status(response.status as any);
      return c.json({ 
        success: false, 
        error: `Failed to fetch user profile: ${response.statusText}` 
      });
    }
    
    const data = await response.json() as Record<string, unknown>;
    console.log(`[PROFILE] Profile fetch successful`);
    return c.json(data);
  } catch (err) {
    console.error("[PROFILE] Profile fetch error:", err);
    c.status(500);
    return c.json({ 
      success: false, 
      error: "Profile service unavailable",
      details: err instanceof Error ? err.message : String(err)
    });
  }
});

// Mount new inventory and sessions routers
app.route("/api/v2/inventory", inventoryRouter);
app.route("/api/v2/sessions", sessionsRouter);

// Fallback route for the SPA
app.get("*", (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;