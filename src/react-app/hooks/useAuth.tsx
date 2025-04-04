import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
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

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token in localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Validate the token or fetch user data
      // This could be expanded to verify the token with your server
      const userData = JSON.parse(localStorage.getItem('user_data') || 'null');
      if (userData) {
        setUser(userData);
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed:', errorData?.error || response.statusText);
        return false;
      }

      const data: any = await response.json();

      if (data && data.success === true && typeof data.userId === 'string') {
        const loggedInUser: UserData = { id: data.userId, email: email };
        localStorage.setItem('user_data', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        return true;
      } else {
        console.error('Login failed (unexpected response format):', data?.error || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
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
        // Registration itself was successful (e.g., 201 Created)
        // Now attempt auto-login
        const loginSuccess = await login(userData.email, userData.password);
        if (loginSuccess) {
          return { success: true };
        } else {
          // Auto-login failed after successful registration
          // Return success=true but indicate login issue?
          // Or treat as overall failure for simplicity?
          // Let's treat as overall failure for now, user can login manually.
          console.error('Auto-login failed after registration.');
          return { success: false, error: 'Registration succeeded, but auto-login failed. Please log in manually.' };
        }
      } else {
        // Registration failed, parse error message
        let errorMessage = 'Registration failed. Please try again.';
        try {
           const errorData = await response.json();
           if (errorData && typeof errorData.error === 'string') {
               errorMessage = errorData.error; // Use specific error from API
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
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
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
      return data.success;
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
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
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