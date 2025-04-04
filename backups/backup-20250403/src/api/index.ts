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
  
  try {
    const response = await fetch("https://kushobserver.workers.dev/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    return c.json(data as Record<string, unknown>);
  } catch (err) {
    console.error("Login error:", err);
    return c.json({ success: false, error: "Authentication service unavailable" }, 500);
  }
});

app.post("/api/auth/register", async (c) => {
  const userData = await c.req.json();
  
  try {
    const response = await fetch("https://kushobserver.workers.dev/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    return c.json(data as Record<string, unknown>);
  } catch (err) {
    console.error("Registration error:", err);
    return c.json({ success: false, error: "Authentication service unavailable" }, 500);
  }
});

app.post("/api/auth/reset-password", async (c) => {
  const { email } = await c.req.json();
  
  try {
    const response = await fetch("https://kushobserver.workers.dev/reset", {
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
