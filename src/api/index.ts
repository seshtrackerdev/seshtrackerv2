import { Hono } from "hono";
const app = new Hono<{ Bindings: Env }>();

// SeshTracker API - Returns branding information
app.get("/api/", (c) => c.json({ 
  name: "SeshTracker", 
  version: "2.0", 
  emoji: "🌿",
  updated: new Date().toISOString()
}));

app.get("*", (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
