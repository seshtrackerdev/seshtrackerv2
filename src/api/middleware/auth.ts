import { createMiddleware } from "hono/factory";

interface VerifyResponse {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  error?: string;
}

interface UserData {
  id: string;
  email: string;
  name?: string;
}

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
    const verifyResponse = await fetch("https://kushobserver.tmultidev.workers.dev/verify", {
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