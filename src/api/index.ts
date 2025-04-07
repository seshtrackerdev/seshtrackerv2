import { Hono } from "hono";
import { authMiddleware } from "./middleware/auth";
import { nanoid } from "nanoid";
import { SessionService } from "./services/sessionService";
import { InventoryService } from "./services/inventoryService";
import { SessionFilters } from "../types/session";
import { InventoryFilters } from "../types/inventory";
import { AUTH_CONFIG } from "../config/auth";
import { KushObserverClient } from "../utils/kushObserverClient";
import { getKushObserverHeaders } from "../utils/api";

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
  
  try {
    const loginResponse = await kushClient.login(email, password);
    console.log(`[LOGIN] Login success: ${loginResponse.success}`);
    
    // If login successful, store the token for later use
    if (loginResponse.success && loginResponse.token) {
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
  
  try {
    const registerResponse = await kushClient.register(userData);
    return c.json(registerResponse);
  } catch (err) {
    console.error("Registration fetch error:", err);
    c.status(500);
    return c.json({ success: false, error: "Registration service unavailable" });
  }
});

// Implement token refresh endpoint based on API documentation
app.post("/api/auth/refresh", async (c) => {
  const { token } = await c.req.json();
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.REFRESH_TOKEN}`, {
      method: "POST",
      headers: getKushObserverHeaders(),
      body: JSON.stringify({ token }),
    });
    
    if (!response.ok) {
      c.status(response.status as any);
      return c.json({ 
        success: false, 
        error: `Token refresh failed: ${response.statusText}` 
      });
    }
    
    const data = await response.json() as Record<string, unknown>;
    
    // If refresh successful, update the token
    if (data.success && data.token) {
      kushClient.setToken(data.token as string);
    }
    
    return c.json(data);
  } catch (err) {
    console.error("Token refresh error:", err);
    c.status(500);
    return c.json({ success: false, error: "Token refresh service unavailable" });
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

// SeshTracker compatibility API endpoint aliases for KushObserver
// Forward requests to the appropriate KushObserver endpoints

// Profile endpoint compatibility - redirects to KushObserver's user profile endpoint
app.get("/api/profile", authMiddleware, async (c) => {
  const token = c.req.header('Authorization')?.substring(7) || '';
  
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.PROFILE}`, {
      headers: getKushObserverHeaders('application/json', token)
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

// Sessions API endpoints
app.get("/api/protected/sessions", async (c) => {
  const user = c.var.user;
  
  // Get the auth token from the request
  const token = c.req.header('Authorization')?.substring(7) || '';
  
  // Parse query parameters for filtering
  const url = new URL(c.req.url);
  const filters: SessionFilters = {};
  
  // Convert our API query params to KushObserver format
  const page = '1';
  const limit = url.searchParams.get('limit') || '20';
  const sort = 'start_time';
  const order = url.searchParams.get('sortDirection') || 'desc';
  const start_date = url.searchParams.get('startDate');
  const end_date = url.searchParams.get('endDate');
  const method = url.searchParams.get('methods');
  const search = url.searchParams.get('search');
  
  // Build query string for KushObserver API
  let queryParams = new URLSearchParams({
    page,
    limit,
    sort,
    order
  });
  
  if (start_date) queryParams.append('start_date', start_date);
  if (end_date) queryParams.append('end_date', end_date);
  if (method) queryParams.append('method', method);
  if (search) queryParams.append('search', search);
  
  try {
    // Use the KushObserver API directly
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.SESSIONS}?${queryParams.toString()}`, {
      headers: getKushObserverHeaders('application/json', token)
    });
    
    if (!response.ok) {
      console.error(`[SESSIONS] Error fetching from KushObserver: ${response.status} ${response.statusText}`);
      c.status(response.status as any);
      return c.json({ error: `Sessions fetch failed: ${response.statusText}` });
    }
    
    // Get the data from KushObserver
    const data = await response.json() as Record<string, any>;
    console.log(`[SESSIONS] Successfully fetched ${data.sessions?.length || 0} sessions from KushObserver`);
    
    // Return sessions in our format
    return c.json({ sessions: data.sessions || [] });
  } catch (error) {
    console.error('Error fetching sessions from KushObserver:', error);
    return c.json({ error: 'Failed to fetch sessions from remote service' }, 500);
  }
});

app.post("/api/protected/sessions", async (c) => {
  const user = c.var.user;
  const sessionData = await c.req.json();
  
  // Original implementation follows
  const sessionService = getSessionService(c);
  
  try {
    const session = await sessionService.createSession(user.id, sessionData);
    return c.json({ session }, 201);
  } catch (error) {
    console.error('Error creating session:', error);
    return c.json({ error: 'Failed to create session' }, 500);
  }
});

app.get("/api/protected/sessions/:id", async (c) => {
  const user = c.var.user;
  const sessionId = c.req.param('id');
  
  // Get the auth token from the request
  const token = c.req.header('Authorization')?.substring(7) || '';
  
  try {
    // Use the KushObserver API directly
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.SESSIONS}/${sessionId}`, {
      headers: getKushObserverHeaders('application/json', token)
    });
    
    if (!response.ok) {
      console.error(`[SESSION] Error fetching from KushObserver: ${response.status} ${response.statusText}`);
      if (response.status === 404) {
        return c.json({ error: 'Session not found' }, 404);
      }
      c.status(response.status as any);
      return c.json({ error: `Session fetch failed: ${response.statusText}` });
    }
    
    // Get the data from KushObserver
    const data = await response.json() as Record<string, any>;
    console.log(`[SESSION] Successfully fetched session ${sessionId} from KushObserver`);
    
    // Return session in our format
    return c.json({ session: data.session || {} });
  } catch (error) {
    console.error('Error fetching session from KushObserver:', error);
    return c.json({ error: 'Failed to fetch session from remote service' }, 500);
  }
});

app.put("/api/protected/sessions/:id", async (c) => {
  const user = c.var.user;
  const sessionId = c.req.param('id');
  const updateData = await c.req.json();
  
  // Original implementation follows
  const sessionService = getSessionService(c);
  
  try {
    const updatedSession = await sessionService.updateSession(user.id, sessionId, updateData);
    
    if (!updatedSession) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    return c.json({ session: updatedSession });
  } catch (error) {
    console.error('Error updating session:', error);
    return c.json({ error: 'Failed to update session' }, 500);
  }
});

app.delete("/api/protected/sessions/:id", async (c) => {
  const user = c.var.user;
  const sessionId = c.req.param('id');
  
  // Original implementation follows
  const sessionService = getSessionService(c);
  
  try {
    const success = await sessionService.deleteSession(user.id, sessionId);
    
    if (!success) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return c.json({ error: 'Failed to delete session' }, 500);
  }
});

// Inventory API endpoints
app.get("/api/protected/inventory", async (c) => {
  console.log('[DEBUG] Inventory request received');
  try {
    const { user } = c.var;
    console.log('[DEBUG] User in inventory request:', user);
    
    // Extract query parameters
    const url = new URL(c.req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const sortBy = url.searchParams.get('sortBy') || 'purchaseDate';
    const sortDirection = url.searchParams.get('sortDirection') || 'desc';
    console.log('[DEBUG] Inventory query params:', { limit, offset, sortBy, sortDirection });
    
    // Return mock inventory data for development
    return c.json({
      success: true,
      items: [
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
      ]
    });
  } catch (error) {
    console.error('Error generating mock inventory:', error);
    return c.json({ error: 'Failed to fetch inventory' }, 500);
  }
});

app.post("/api/protected/inventory", async (c) => {
  const user = c.var.user;
  const itemData = await c.req.json();
  
  // Original implementation follows
  const inventoryService = getInventoryService(c);
  
  try {
    const inventoryItem = await inventoryService.createInventoryItem(user.id, itemData);
    return c.json({ inventoryItem }, 201);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return c.json({ error: 'Failed to create inventory item' }, 500);
  }
});

app.get("/api/protected/inventory/:id", async (c) => {
  const user = c.var.user;
  const itemId = c.req.param('id');
  
  // Get the auth token from the request
  const token = c.req.header('Authorization')?.substring(7) || '';
  
  try {
    // Use the KushObserver API directly
    const response = await fetch(`${AUTH_CONFIG.API_URL}${AUTH_CONFIG.ENDPOINTS.INVENTORY}/${itemId}`, {
      headers: getKushObserverHeaders('application/json', token)
    });
    
    if (!response.ok) {
      console.error(`[INVENTORY] Error fetching item from KushObserver: ${response.status} ${response.statusText}`);
      if (response.status === 404) {
        return c.json({ error: 'Inventory item not found' }, 404);
      }
      c.status(response.status as any);
      return c.json({ error: `Inventory item fetch failed: ${response.statusText}` });
    }
    
    // Get the data from KushObserver
    const data = await response.json() as Record<string, any>;
    console.log(`[INVENTORY] Successfully fetched inventory item ${itemId} from KushObserver`);
    
    // Return inventory item in our format
    return c.json({ inventoryItem: data.item || {} });
  } catch (error) {
    console.error('Error fetching inventory item from KushObserver:', error);
    return c.json({ error: 'Failed to fetch inventory item from remote service' }, 500);
  }
});

app.put("/api/protected/inventory/:id", async (c) => {
  const user = c.var.user;
  const itemId = c.req.param('id');
  const updateData = await c.req.json();
  
  // Original implementation follows
  const inventoryService = getInventoryService(c);
  
  try {
    const updatedItem = await inventoryService.updateInventoryItem(user.id, itemId, {
      id: itemId,
      ...updateData
    });
    
    if (!updatedItem) {
      return c.json({ error: 'Inventory item not found' }, 404);
    }
    
    return c.json({ inventoryItem: updatedItem });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return c.json({ error: 'Failed to update inventory item' }, 500);
  }
});

app.delete("/api/protected/inventory/:id", async (c) => {
  const user = c.var.user;
  const itemId = c.req.param('id');
  
  // Original implementation follows
  const inventoryService = getInventoryService(c);
  
  try {
    const success = await inventoryService.deleteInventoryItem(user.id, itemId);
    
    if (!success) {
      return c.json({ error: 'Inventory item not found' }, 404);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return c.json({ error: 'Failed to delete inventory item' }, 500);
  }
});

// Session-Inventory Integration
app.post("/api/protected/sessions/:sessionId/consume-inventory", async (c) => {
  const user = c.var.user;
  const sessionId = c.req.param('sessionId');
  const { inventoryItemId, amountUsed } = await c.req.json();
  
  // Original implementation follows
  const sessionService = getSessionService(c);
  const inventoryService = getInventoryService(c);
  
  try {
    // Verify session exists and belongs to user
    const session = await sessionService.getSession(user.id, sessionId);
    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    // Fetch the current inventory item to get its current quantity
    const inventoryItem = await inventoryService.getInventoryItem(user.id, inventoryItemId);
    if (!inventoryItem) {
      return c.json({ error: 'Inventory item not found' }, 404);
    }
    
    // Calculate remaining amount as service expects it
    const remainingAmount = Math.max(0, inventoryItem.currentQuantity - amountUsed);
    
    // Record consumption
    const consumption = await inventoryService.consumeInventory(user.id, {
      inventoryItemId,
      sessionId,
      amountUsed,
      remainingAmount,
      timestamp: new Date().toISOString()
    });
    
    if (!consumption) {
      return c.json({ error: 'Inventory item not found' }, 404);
    }
    
    return c.json({ consumption });
  } catch (error) {
    console.error('Error consuming inventory:', error);
    return c.json({ error: 'Failed to consume inventory' }, 500);
  }
});

app.get("/api/protected/inventory/:id/consumption-history", async (c) => {
  const user = c.var.user;
  const itemId = c.req.param('id');
  
  // Original implementation follows
  const inventoryService = getInventoryService(c);
  
  try {
    const history = await inventoryService.getItemConsumptionHistory(user.id, itemId);
    return c.json({ history });
  } catch (error) {
    console.error('Error fetching consumption history:', error);
    return c.json({ error: 'Failed to fetch consumption history' }, 500);
  }
});

// Analytics endpoints
app.get("/api/protected/analytics/consumption", async (c) => {
  const user = c.var.user;
  
  // In a real implementation, you would calculate consumption analytics
  // This is a placeholder that would be replaced with actual database queries
  return c.json({
    totalSessions: 0,
    consumptionByMethod: {},
    consumptionByTimeOfDay: {},
    topStrains: [],
    averageRating: 0
  });
});

// Protected session endpoints - requires authentication
app.get("/api/sessions", authMiddleware, async (c) => {
  const userId = c.get('user').id;
  const { limit, offset, sortBy, sortDirection } = c.req.query();
  
  try {
    // Set the token for the request
    kushClient.setToken(c.req.header('Authorization')?.split(' ')[1] || '');
    
    // Parse pagination parameters
    const paginationParams: { 
      limit: number; 
      offset: number; 
      sortBy: string;
      sortDirection: 'asc' | 'desc';
    } = {
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
      sortBy: sortBy || 'start_time',
      sortDirection: (sortDirection === 'asc') ? 'asc' : 'desc'
    };
    
    // Fetch sessions from KushObserver API
    const response = await kushClient.getSessions(paginationParams);
    
    return c.json(response);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return c.json({ 
      error: 'Failed to fetch sessions', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
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
  const userId = c.get('user').id;
  const { limit, offset, sortBy, sortDirection } = c.req.query();
  
  try {
    // Set the token for the request
    kushClient.setToken(c.req.header('Authorization')?.split(' ')[1] || '');
    
    // Parse pagination parameters
    const paginationParams: { 
      limit: number; 
      offset: number; 
      sortBy: string;
      sortDirection: 'asc' | 'desc';
    } = {
      limit: limit ? parseInt(limit, 10) : 25,
      offset: offset ? parseInt(offset, 10) : 0,
      sortBy: sortBy || 'purchase_date',
      sortDirection: (sortDirection === 'asc') ? 'asc' : 'desc'
    };
    
    // Fetch inventory items from KushObserver API
    const response = await kushClient.getInventoryItems(paginationParams);
    
    return c.json(response);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return c.json({ 
      error: 'Failed to fetch inventory', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
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
app.get("/api/user-profile", authMiddleware, async (c) => {
  try {
    // Set the token for the request
    kushClient.setToken(c.req.header('Authorization')?.split(' ')[1] || '');
    
    // Fetch user profile from KushObserver API
    const profileData = await kushClient.getUserProfile();
    
    return c.json(profileData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return c.json({ 
      error: 'Failed to fetch user profile', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Fallback route for the SPA
app.get("*", (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;