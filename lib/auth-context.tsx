'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from './db';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; userData?: User }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };
    
    initAuth();
  }, []);

  // Sync localStorage with state changes
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error syncing auth state with localStorage:', error);
    }
  }, [user, isInitialized]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; userData?: User }> => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return { success: false };
      }

      const data = await response.json();
      const userData = data.user;
      
      // Update state
      setUser(userData);
      
      // Return success with user data
      return { success: true, userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    } finally {
      // Ensure loading state is updated
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    
    try {
      // Clear user state
      setUser(null);
      
      // Return a resolved promise
      return Promise.resolve();
    } catch (error) {
      console.error('Logout error:', error);
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  }, [user]);

  const contextValue = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 