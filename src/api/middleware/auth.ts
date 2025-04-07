import { createMiddleware } from "hono/factory";
import { AUTH_CONFIG } from "../../config/auth";

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
  console.log('[AUTH] Request path:', c.req.path);
  console.log('[AUTH] Authorization header present:', !!authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[AUTH] Missing or invalid Authorization header');
    return c.json({ error: 'Unauthorized - Missing or invalid token' }, 401);
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  console.log('[AUTH] Token length:', token.length);
  
  // TEMPORARY FIX: Skip actual verification for development
  // This will accept any token and create a mock user
  try {
    console.log('[AUTH] Setting mock user for development');
    c.set('user', {
      id: 'test-user-id',
      email: 'tester@email.com',
      name: 'Test User'
    });
    
    // Continue to the route handler
    await next();
  } catch (error) {
    console.error('[AUTH] Error during authentication:', error);
    return c.json({ 
      error: 'Internal server error during authentication',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
}); 