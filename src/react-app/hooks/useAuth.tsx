import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

interface UserData {
  id: string;
  email: string;
  name?: string;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

// Define the expected success response structure from our /api/auth/login
interface LoginSuccessResponse {
    success: boolean;
    userId: string;
    token: string; // Expect the token here now
}

// Define the expected error response structure
interface AuthErrorResponse {
    success: boolean;
    error: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null); // Store token in state as well

  useEffect(() => {
    // Check for existing auth token and user data in localStorage
    // WARNING: Storing tokens in localStorage is vulnerable to XSS.
    // Consider using HttpOnly cookies managed by the backend for better security.
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUserDataString = localStorage.getItem(USER_DATA_KEY);

    if (storedToken && storedUserDataString) {
      try {
        const storedUserData = JSON.parse(storedUserDataString) as UserData;
        // Basic validation: Does the stored data look like user data?
        if (storedUserData && typeof storedUserData.id === 'string' && typeof storedUserData.email === 'string') {
           // In a real app, you might want to verify the token with the backend here
           // before setting the user state, but for now, we trust localStorage.
           setUser(storedUserData);
           setToken(storedToken);
        } else {
            // Invalid user data format, clear storage
            console.warn('Invalid user data format found in localStorage. Clearing auth state.');
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(USER_DATA_KEY);
        }
      } catch (error) {
        console.error('Failed to parse user data from localStorage:', error);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
      }
    } else {
       // If either token or user data is missing, clear both to be safe
       if (storedToken || storedUserDataString) {
           localStorage.removeItem(AUTH_TOKEN_KEY);
           localStorage.removeItem(USER_DATA_KEY);
       }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); // Parse JSON once

      if (!response.ok) {
        const errorMsg = (data as AuthErrorResponse)?.error || response.statusText;
        console.error('Login failed:', errorMsg);
        return false;
      }

      // Check if the response indicates success and includes the token
      if (data && data.success === true && typeof data.userId === 'string' && typeof data.token === 'string') {
        const loginData = data as LoginSuccessResponse;
        const loggedInUser: UserData = { id: loginData.userId, email: email }; // Assuming email isn't returned, use the input one

        // Store token and user data
        // WARNING: Storing tokens in localStorage is vulnerable to XSS.
        localStorage.setItem(AUTH_TOKEN_KEY, loginData.token);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(loggedInUser));

        // Update state
        setUser(loggedInUser);
        setToken(loginData.token);
        return true;
      } else {
        const errorMsg = (data as AuthErrorResponse)?.error || 'Login failed: Unexpected response format or missing token.';
        console.error('Login failed:', errorMsg);
        // Clear potentially partial storage if login failed after response.ok
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        setUser(null);
        setToken(null);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      // Clear storage on fetch error
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      setUser(null);
      setToken(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/register', {
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
          // Don't clear token/user here, as login() handles its own state on failure
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
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    setUser(null);
    setToken(null); // Clear token state
  };

  const getToken = (): string | null => {
      // Prioritize state, fallback to localStorage (though they should be in sync)
      return token || localStorage.getItem(AUTH_TOKEN_KEY);
  };

  // Helper function for making authenticated API calls
  const fetchProtected = async (url: string, options: RequestInit = {}) => {
    const currentToken = getToken();
    if (!currentToken) {
      // Handle case where token is missing - maybe logout user or throw error
      console.error('Attempted to make protected API call without a token.');
      logout(); // Log out the user if token is missing when needed
      throw new Error('No authentication token available.');
    }

    const headers = new Headers(options.headers);
    headers.append('Authorization', `Bearer ${currentToken}`);
    // Ensure Content-Type is set for relevant methods (e.g., POST, PUT)
    if (options.body && !headers.has('Content-Type')) {
        // Default to JSON if not specified, adjust if needed
        headers.append('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Optional: Add global handling for 401 Unauthorized responses
    if (response.status === 401) {
        console.error('Received 401 Unauthorized from protected route. Logging out.');
        logout();
        // Optionally redirect to login page or throw a specific error
        throw new Error('Unauthorized');
    }

    // You might add more response handling here (e.g., parsing JSON by default)
    return response;
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      // Ensure we check for success property explicitly
      return data?.success === true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!token, // Authenticated if user AND token exist
        isLoading,
        login,
        register,
        logout,
        resetPassword,
        getToken, // Provide the getToken function
        fetchProtected // Provide the fetchProtected function
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