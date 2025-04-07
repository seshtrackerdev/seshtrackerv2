import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { AUTH_CONFIG } from '../../config/auth';

// Define consistent API URLs
const AUTH_API_URL = AUTH_CONFIG.API_URL;
const BASE_API_URL = '/api'; // Local API proxy endpoint

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  getToken: () => string | null;
  fetchProtected: (url: string, options?: RequestInit) => Promise<Response>;
  updateProfile: (data: Partial<UserData>) => Promise<boolean>;
  getUserSubscription: () => Promise<SubscriptionData | null>;
}

interface UserData {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
  lastLogin?: string;
}

interface SubscriptionData {
  plan: string;
  status: string;
  expiresAt?: string;
  features?: string[];
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

// Define the expected success response structure from login
interface LoginSuccessResponse {
    success: boolean;
    userId: string;
    token: string;
}

// Define the expected error response structure
interface AuthErrorResponse {
    success: boolean;
    error: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Use constants from centralized config
const { TOKEN, USER_DATA } = AUTH_CONFIG.STORAGE_KEYS;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to parse JWT and get expiration
  const getTokenExpiration = (token: string): number | null => {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return null;
      
      const payload = JSON.parse(atob(tokenParts[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (e) {
      console.error('Error parsing token:', e);
      return null;
    }
  };

  // Setup session timer with auto refresh
  const setupSessionTimer = (jwtToken: string) => {
    const REFRESH_BEFORE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes before expiry
    const WARN_BEFORE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes before expiry
    
    const expiryTime = getTokenExpiration(jwtToken);
    if (!expiryTime) return;
    
    const refreshTime = expiryTime - REFRESH_BEFORE_EXPIRY_MS;
    const warningTime = expiryTime - WARN_BEFORE_EXPIRY_MS;
    
    const now = Date.now();

    // Schedule token refresh
    if (refreshTime > now) {
      setTimeout(async () => {
        // Silent token refresh
        const refreshed = await verifyToken(jwtToken);
        if (!refreshed && !refreshAttempted) {
          // Only show warning if refresh fails
          setRefreshAttempted(true);
          
          // Schedule warning notification
          if (warningTime > now) {
            setTimeout(() => {
              const shouldRefresh = window.confirm('Your session will expire soon. Would you like to refresh your session?');
              if (shouldRefresh) {
                // Manual refresh attempt on user confirmation
                verifyToken(jwtToken).then(userData => {
                  if (!userData) {
                    logout();
                    window.location.href = '/login';
                  } else {
                    setRefreshAttempted(false); // Reset after successful manual refresh
                  }
                });
              }
            }, warningTime - now);
          }
        } else {
          setRefreshAttempted(false);
        }
      }, refreshTime - now);
    } else if (expiryTime <= now) {
      // Token already expired
      logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  };

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN);
      const storedUserDataString = localStorage.getItem(USER_DATA);

      if (storedToken) {
        try {
          // In dev environment, skip token verification
          let userData: UserData;
          
          if (storedUserDataString) {
            userData = JSON.parse(storedUserDataString);
          } else {
            userData = { 
              id: 'test-user-id', 
              email: 'tester@email.com' 
            };
            localStorage.setItem(USER_DATA, JSON.stringify(userData));
          }
          
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem(TOKEN);
          localStorage.removeItem(USER_DATA);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[LOGIN] Attempting login with email:', email);
      const response = await fetch(`${BASE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('[LOGIN] Login response status:', response.status);
      
      if (!response.ok) {
        console.error('[LOGIN] Login failed with status:', response.status);
        if (response.status === 401) {
          setError('Invalid email or password');
        } else {
          setError('Error during login. Please try again later.');
        }
        return false;
      }
      
      const data = await response.json();
      console.log('[LOGIN] Login response success:', data.success);
      
      if (data.success && data.token) {
        console.log('[LOGIN] Login successful, storing token');
        // Store the token and refresh token if provided
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN, data.token);
        if (data.refreshToken) {
          localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
        }
        
        // Store user data
        const userData = {
          id: data.userId,
          email: email
        };
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        
        setUser(userData);
        setToken(data.token);
        
        console.log('[LOGIN] Authentication completed');
        return true;
      } else {
        console.error('[LOGIN] Login response did not contain success or token:', data);
        setError(data.error || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const loginSuccess = await login(userData.email, userData.password);
        if (loginSuccess) {
          return { success: true };
        } else {
          console.error('Auto-login failed after registration.');
          return { success: false, error: 'Registration succeeded, but auto-login failed. Please log in manually.' };
        }
      } else {
        let errorMessage = 'Registration failed. Please try again.';
        try {
           const errorData = await response.json();
           if (errorData && typeof errorData.error === 'string') {
               errorMessage = errorData.error;
           }
        } catch (jsonError) {
            console.error('Could not parse registration error JSON:', jsonError);
        }
        console.error('Registration failed API response:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Registration fetch error:', error);
      return { success: false, error: 'An unexpected error occurred during registration.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    setUser(null);
    setToken(null);
    setRefreshAttempted(false);
  };

  const getToken = (): string | null => {
    return token || localStorage.getItem(TOKEN);
  };

  // Fetch helper that automatically attaches auth token
  const fetchProtected = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = getToken();
    console.log('[FETCH] Protected fetch to:', url);
    
    if (!token) {
      // For development, generate a temporary token if none exists
      const tempToken = 'dev_' + Date.now();
      console.log('[FETCH] Generated temporary dev token');
      localStorage.setItem(TOKEN, tempToken);
      setToken(tempToken);
      
      // Create headers with authorization
      const headers = new Headers(options.headers || {});
      headers.set('Authorization', `Bearer ${tempToken}`);
      headers.set('Content-Type', 'application/json');
      
      // Create the request
      const request = new Request(url, {
        ...options,
        headers,
      });
      
      console.log('[FETCH] Making request with temp token');
      return fetch(request);
    }
    
    // Create headers with authorization
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');
    
    // Create the request
    const request = new Request(url, {
      ...options,
      headers,
    });
    
    // Log the request details for debugging
    console.log('[FETCH] Request headers:', Array.from(headers.entries()));
    
    try {
      // Make the initial request
      console.log('[FETCH] Making request to:', url);
      return fetch(request);
    } catch (error) {
      console.error('[FETCH] Error during fetch:', error);
      throw error;
    }
  };

  // Verify token with KushObserver
  const verifyToken = async (tokenToVerify: string): Promise<UserData | null> => {
    try {
      console.log('[VERIFY] Verifying token starting with:', tokenToVerify.substring(0, 20) + '...');
      const response = await fetch(`${BASE_API_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenToVerify }),
      });

      console.log('[VERIFY] Verification response status:', response.status);
      const data = await response.json();
      console.log('[VERIFY] Verification response data:', data);
      
      if (!response.ok || !data.valid) {
        console.error('[VERIFY] Token verification failed:', data.error || response.statusText);
        return null;
      }

      // If verification returned a new token, update it
      if (data.newToken) {
        console.log('[VERIFY] Updating token with new one from verification');
        localStorage.setItem(TOKEN, data.newToken);
        setToken(data.newToken);
        setupSessionTimer(data.newToken);
      }

      return data.user;
    } catch (error) {
      console.error('[VERIFY] Token verification error:', error);
      return null;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_API_URL}/auth/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Password reset failed:', data.error || 'Unknown error');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<UserData>): Promise<boolean> => {
    try {
      const currentToken = getToken();
      if (!currentToken) return false;

      const response = await fetch(`${BASE_API_URL}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        return false;
      }

      // Update local user data
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem(USER_DATA, JSON.stringify(updatedUser));
      }

      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  // Get user subscription
  const getUserSubscription = async (): Promise<SubscriptionData | null> => {
    try {
      const currentToken = getToken();
      if (!currentToken) return null;

      const response = await fetch(`${BASE_API_URL}/subscription`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.subscription || null;
    } catch (error) {
      console.error('Subscription fetch error:', error);
      return null;
    }
  };

  // Fetch user data function
  const fetchUserData = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
      if (!token) return false;

      const response = await fetch(`${BASE_API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      
      if (userData && userData.user) {
        // Set both the token and user in state
        setToken(token);
        setUser(userData.user);
        
        // Store the user data in localStorage
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData.user));
        
        // Setup token expiration timer
        setupSessionTimer(token);
        
        console.log('User authentication successful:', userData.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return false;
    }
  };

  // Add token refresh functionality
  const refreshToken = async (): Promise<boolean> => {
    const currentToken = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
    
    if (!currentToken) {
      console.error('No token to refresh');
      return false;
    }
    
    try {
      // Call the new API refresh endpoint
      const response = await fetch(`${BASE_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: currentToken }),
      });
      
      if (!response.ok) {
        console.error('Token refresh failed:', response.statusText);
        return false;
      }
      
      const data = await response.json();
      
      if (data.success && data.token) {
        // Store the new token
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN, data.token);
        
        // Setup token expiration and refresh
        setupSessionTimer(data.token);
        
        return true;
      } else {
        console.error('Token refresh failed:', data.error || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
        getToken,
        fetchProtected,
        updateProfile,
        getUserSubscription
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 