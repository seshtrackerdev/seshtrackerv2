import { Hono } from "hono";
import { authMiddleware } from "./middleware/auth";

// Define custom types for the app's variables
type UserData = {
  id: string;
  email: string;
  name?: string;
};

interface Variables {
  user: UserData;
}

// Update the Hono type to include our custom variables
const app = new Hono<{
  Bindings: Env;
  Variables: Variables;
}>();

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
  
  // Re-use the error interface
  interface KushObserverError {
      success: boolean;
      error: string;
  }

  try {
    const response = await fetch("https://kushobserver.tmultidev.workers.dev/api/direct-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
        console.error(`KushObserver login failed: ${response.status} ${response.statusText}`);
        let errorJson: KushObserverError = { success: false, error: `Login service error: ${response.statusText}` };
        try {
            const errorBody = await response.json<KushObserverError>();
            if (errorBody && typeof errorBody.error === 'string') {
                 errorJson.error = errorBody.error;
            }
        } catch (parseError) {
            console.error("Could not parse error JSON from KushObserver login:", parseError);
        }
        c.status(response.status as any);
        return c.json(errorJson);
    }

    const data = await response.json();
    c.status(response.status as any);
    return c.json(data as Record<string, unknown>);

  } catch (err) {
    console.error("Login fetch error:", err);
    c.status(500);
    return c.json({ success: false, error: "Authentication service unavailable" });
  }
});

app.post("/api/auth/register", async (c) => {
  const userData = await c.req.json();
  
  // Define expected error structure from kushobserver
  interface KushObserverError {
      success: boolean;
      error: string;
  }

  try {
    const response = await fetch("https://kushobserver.tmultidev.workers.dev/api/direct-register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
        console.error(`KushObserver registration failed: ${response.status} ${response.statusText}`);
        let errorJson: KushObserverError = { success: false, error: `Registration service error: ${response.statusText}` };
        try {
            // Try to parse the specific error message from kushobserver's response body
            const errorBody = await response.json<KushObserverError>(); // Use the interface here
            // Use kushobserver's error message if available and is the correct type
            if (errorBody && typeof errorBody.error === 'string') {
                 errorJson.error = errorBody.error;
            }
        } catch (parseError) {
            console.error("Could not parse error JSON from KushObserver:", parseError);
            // Stick with the generic status text error if JSON parsing fails
        }
        c.status(response.status as any);
        return c.json(errorJson);
    }

    const data = await response.json();
    c.status(response.status as any);
    return c.json(data as Record<string, unknown>);

  } catch (err) {
    console.error("Registration fetch error:", err);
    return c.json({ success: false, error: "Authentication service unavailable" }, 500);
  }
});

app.post("/api/auth/reset-password", async (c) => {
  const { email } = await c.req.json();
  
  try {
    const response = await fetch("https://kushobserver.tmultidev.workers.dev/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    return c.json(data as Record<string, unknown>);
  } catch (err) {
    console.error("Password reset error:", err);
    return c.json({ success: false, error: "Authentication service unavailable" }, 500);
  }
});

// Apply auth middleware to all paths under /api/protected
app.use('/api/protected/*', authMiddleware);

// Protected routes
app.get("/api/protected/user-profile", (c) => {
  // User data is available from the middleware
  const user = c.var.user;
  return c.json({ user });
});

app.get("/api/protected/sessions", (c) => {
  // In a real app, you would fetch user's sessions from a database
  const userId = c.var.user.id;
  return c.json({ 
    userId,
    sessions: [
      { id: "1", name: "Morning Session", date: "2025-04-03", duration: 30 },
      { id: "2", name: "Evening Chill", date: "2025-04-02", duration: 45 }
    ] 
  });
});

// Fallback route for the SPA
app.get("*", (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
