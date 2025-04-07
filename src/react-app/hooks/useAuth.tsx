import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { AUTH_CONFIG } from '../../config/auth';

// Define consistent API URLs
const AUTH_API_URL = AUTH_CONFIG.API_URL;
const BASE_API_URL = '/api'; // Local API proxy endpoint

// Define AuthUser type
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
  lastLogin?: string;
}

// Auth context type
interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: AuthUser | null;
  setToken: (token: string) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  fetchProtected: (url: string, options?: RequestInit) => Promise<any>;
  getUser: () => Promise<AuthUser | null>;
  refreshToken: () => Promise<string | null>;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  user: null,
  setToken: () => {},
  login: async () => ({ success: false }),
  logout: () => {},
  fetchProtected: async () => ({}),
  getUser: async () => null,
  refreshToken: async () => null
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Set token and update authentication state
  const setToken = (newToken: string) => {
    console.log("[AUTH] Setting token:", newToken ? 'Token exists' : 'No token');
    setTokenState(newToken);
    localStorage.setItem('authToken', newToken);
    setIsAuthenticated(!!newToken);
  };

  // Initialize authentication on load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      console.log("[AUTH] Found stored token");
      setToken(storedToken);
      
      // Load user profile if we have a token
      getUser().then(userProfile => {
        if (userProfile) {
          setUser(userProfile);
        } else if (process.env.NODE_ENV !== 'development') {
          // In production, clear token if user profile couldn't be fetched
          logout();
        }
      });
    }
  }, []);
  
  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log("[AUTH] Attempting login for:", email);
      
      // In production mode, use the Kush.Observer endpoint directly
      // In development mode, use the local API proxy
      const loginEndpoint = process.env.NODE_ENV === 'production' 
        ? `${AUTH_API_URL}${AUTH_CONFIG.ENDPOINTS.LOGIN}`
        : `/api/auth/login`;
        
      console.log("[AUTH] Using login endpoint:", loginEndpoint);
      
      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        console.log("[AUTH] Login successful, token received");
        setToken(data.token);
        
        // Try to fetch user details after login
        const userProfile = await getUser();
        if (userProfile) {
          setUser(userProfile);
        }
        
        return { success: true };
      } else {
        console.error("[AUTH] Login failed:", data.message || "Unknown error");
        return { 
          success: false, 
          message: data.message || "Login failed. Please check your credentials."
        };
      }
    } catch (error) {
      console.error("[AUTH] Login error:", error);
      return { 
        success: false, 
        message: "An error occurred during login. Please try again."
      };
    }
  };
  
  // Logout function
  const logout = () => {
    console.log("[AUTH] Logging out");
    setToken('');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    navigate('/login');
  };
  
  // Refresh token function
  const refreshToken = async (): Promise<string | null> => {
    console.log("[AUTH] Refreshing token...");
    
    // If no token exists, return null
    if (!token) {
      console.log("[AUTH] No token to refresh");
      return null;
    }
    
    try {
      // Determine the endpoint based on environment
      const refreshEndpoint = process.env.NODE_ENV === 'production'
        ? `${AUTH_API_URL}${AUTH_CONFIG.ENDPOINTS.REFRESH_TOKEN}`
        : `/api/auth/refresh-token`;
        
      console.log("[AUTH] Using refresh endpoint:", refreshEndpoint);
      
      const response = await fetch(refreshEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        console.log("[AUTH] Token refreshed successfully");
        setToken(data.token);
        return data.token;
      } else {
        console.error("[AUTH] Token refresh failed");
        // If refresh fails in production mode, log out
        if (process.env.NODE_ENV === 'production') {
          logout();
        }
        return null;
      }
    } catch (error) {
      console.error("[AUTH] Error refreshing token:", error);
      return null;
    }
  };

  // Helper function to parse JWT and get expiration
  const getTokenExpiration = (token: string): number | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return payload.exp ? payload.exp * 1000 : null;
    } catch (error) {
      console.error('Failed to parse token:', error);
      return null;
    }
  };

  // Fetch function for protected API endpoints
  const fetchProtected = async (url: string, options: RequestInit = {}) => {
    // Fix URL paths - remove /protected/ from the URL
    // From: /api/protected/sessions -> To: /api/sessions
    let fixedUrl = url;
    console.log('[FETCH] Original URL:', url);
    
    // Check if the URL contains /api/protected/ and replace it
    if (url.includes('/api/protected/')) {
      fixedUrl = url.replace('/api/protected/', '/api/');
      console.log('[FETCH] Fixed URL to:', fixedUrl);
    }
    
    // Development mode only
    // Generate temporary token in dev mode if none exists
    if (process.env.NODE_ENV === 'development' && !token) {
      const tempToken = 'dev-mode-jwt-token-' + Math.random().toString(36).substring(2, 15);
      console.log('[FETCH] Development mode: Using temporary token', tempToken);
      setToken(tempToken);
      localStorage.setItem('authToken', tempToken);
    }
    
    // Create authorization header with token
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && !options.body) {
      headers.set('Content-Type', 'application/json');
    }
    
    const requestOptions: RequestInit = {
      ...options,
      headers
    };
    
    console.log(`[FETCH] Sending request to ${fixedUrl}`, { headers: Object.fromEntries(headers.entries()) });
    
    try {
      const response = await fetch(fixedUrl, requestOptions);
      
      if (!response.ok) {
        console.error(`[FETCH] Error: ${response.status} ${response.statusText}`);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('[FETCH] Fetch error:', error);
      throw error;
    }
  };

  // Get user profile from API
  const getUser = async (): Promise<AuthUser | null> => {
    try {
      console.log("[AUTH] Fetching user profile...");
      
      // Determine the endpoint based on environment
      const profileEndpoint = process.env.NODE_ENV === 'production'
        ? `${AUTH_API_URL}${AUTH_CONFIG.ENDPOINTS.PROFILE}`
        : `/api/profile`;
        
      console.log("[AUTH] Using profile endpoint:", profileEndpoint);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(profileEndpoint, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        console.error("[AUTH] Failed to fetch user profile: HTTP", response.status);
        return null;
      }
      
      const data = await response.json();
      
      if (data.success && data.user) {
        console.log("[AUTH] User profile fetched successfully", data.user);
        return data.user;
      } else {
        console.error("[AUTH] Failed to fetch user profile", data);
        return null;
      }
    } catch (error) {
      console.error("[AUTH] Error fetching user profile:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        token,
        setToken,
        login,
        logout,
        fetchProtected,
        getUser,
        refreshToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth; 