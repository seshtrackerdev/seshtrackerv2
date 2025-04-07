import { AUTH_CONFIG } from "../../config/auth";
import { Context, Next, createMiddleware } from "hono";
import { env } from "hono/adapter";
import { API, ENDPOINTS } from "../../config/ecosystem";

/**
 * Authentication middleware options
 */
interface AuthMiddlewareOptions {
  /** Whether to enable development mode (accept any token) */
  devMode?: boolean;
  /** Whether to bypass authentication entirely */
  bypassAuth?: boolean;
}

/**
 * Middleware to authenticate requests using JWT token from Kush.Observer
 */
export const authMiddleware = createMiddleware<{
  Variables: { userId?: string };
  Options: AuthMiddlewareOptions;
}>(async (c, next, options) => {
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

  // Allow bypass in development mode if specified in options
  if (process.env.NODE_ENV === 'development' && options?.devMode) {
    // This will accept any token and create a mock user
    const mockUserId = 'dev_user_123';
    console.log('[AUTH] Setting mock user for development');
    c.set('userId', mockUserId);
    await next();
    return;
  }

  try {
    // Verify with Kush.Observer in production
    const userId = await verifyAuthToken(c);
    if (userId) {
      c.set('userId', userId);
      await next();
    } else {
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }
  } catch (error) {
    console.error('[AUTH] Error during authentication:', error);
    return c.json({
      error: 'Internal server error during authentication',
    }, 500);
  }
});

/**
 * Verify an authentication token with Kush.Observer
 * @param c Hono Context object
 * @returns User ID if valid, null if invalid
 */
export async function verifyAuthToken(c: Context): Promise<string | null> {
  // Extract token from Authorization header
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return null;
  }

  try {
    // Verify token with Kush.observer
    // Use the ecosystem config for the endpoint, falling back to environment variable
    const nodeEnv = process.env.NODE_ENV || 'production';
    const environment = nodeEnv === 'production' ? 'PRODUCTION' : 
                        nodeEnv === 'staging' ? 'STAGING' : 'DEVELOPMENT';
    
    // Get the AUTH_API_URL from environment variable or fall back to our config
    const authApiUrl = env(c).AUTH_API_URL || API.KUSHOBSERVER.AUTH.VALIDATE(environment);
    
    const validationResponse = await fetch(authApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    });

    if (!validationResponse.ok) {
      return null;
    }

    const validationData = await validationResponse.json();
    if (validationData?.success && validationData?.data?.user) {
      // Return the user ID
      return validationData.data.user.id;
    }

    return null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Helper function to require authentication for a route
 * @param c Hono Context object
 * @returns Whether the user is authenticated
 */
export async function requireAuth(c: Context): Promise<boolean> {
  const userId = await verifyAuthToken(c);
  if (!userId) {
    c.json({ success: false, error: 'Unauthorized' }, 401);
    return false;
  }
  
  c.set('userId', userId);
  return true;
} 