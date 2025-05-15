'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  profileImage?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; userRole?: string }>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: string, dateOfBirth?: string) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  isAuthenticated: boolean;
  hasRole: (roles: string | string[]) => boolean;
  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  register: async () => false,
  refreshToken: async () => false,
  isAuthenticated: false,
  hasRole: () => false,
  setUser: () => {},
  updateUser: () => {}
});

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Function to check current authentication status
  const checkAuth = async () => {
    setLoading(true);
    try {
      // First check for token in localStorage - we still need the token for API calls
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Verify the token with the API
          const response = await fetch('/api/auth/verify', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include', // Important for cookies
          });
          
          if (response.ok) {
            const data = await response.json();
            // Ensure we're keeping track of the profileImage
            console.log('Received user data with profile:', data.user);
            setUser(data.user);
          } else {
            // Token is invalid
            clearAuthData();
          }
        } catch (apiError) {
          console.error('API auth verification failed:', apiError);
          clearAuthData();
        }
      } else {
        clearAuthData();
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  // Helper to clear auth data
  const clearAuthData = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Register function
  const register = async (
    name: string,
    email: string,
    password: string,
    role: string,
    dateOfBirth?: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      // Call the register API endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role,
          dateOfBirth 
        }),
        credentials: 'include', // Important for cookies
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration failed:', errorData.error);
        return false;
      }
      
      const data = await response.json();
      
      // Store auth token in localStorage
      localStorage.setItem('token', data.token || '');
      
      setUser(data.user);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; userRole?: string }> => {
    setLoading(true);
    try {
      // Call the login API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important for cookies
      });
      
      if (!response.ok) {
        return { success: false };
      }
      
      const data = await response.json();
      
      // Store auth token in localStorage
      localStorage.setItem('token', data.token);
      
      setUser(data.user);
      
      // Return success with the user role
      return {
        success: true, 
        userRole: data.user.role
      };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        console.error('Token refresh failed');
        return false;
      }
      
      const data = await response.json();
      
      // Update localStorage with the new token
      localStorage.setItem('token', data.token);
      
      // If user data has changed, update that too
      if (data.user) {
        setUser(data.user);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API to invalidate server-side session/cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).catch(err => console.error('Logout API error:', err));
    } finally {
      // Always clear local storage regardless of API response
      clearAuthData();
    }
  };

  // Check if user has specific role
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    
    if (typeof roles === 'string') {
      return user.role === roles;
    }
    
    return roles.includes(user.role);
  };

  // Context value
  const value = {
    user,
    loading,
    login,
    logout,
    register,
    refreshToken,
    isAuthenticated: !!user,
    hasRole,
    setUser,
    updateUser: (userData: Partial<User>) => {
      if (user) {
        setUser({ ...user, ...userData });
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
} 