'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    // Check if user is stored in localStorage on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; userData?: User }> => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setLoading(false);
        return { success: false };
      }

      const data = await response.json();
      const userData = data.user;
      
      // Store user data in localStorage first
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set user state and ensure it's completed before returning
      return new Promise((resolve) => {
        setUser(userData);
        // Small timeout to ensure state is updated before navigation
        setTimeout(() => {
          setLoading(false);
          resolve({ success: true, userData });
        }, 200);
      });
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return { success: false };
    }
  };

  const logout = () => {
    // First clear the user state
    setUser(null);
    // Then remove from localStorage
    localStorage.removeItem('user');
    // Return a promise to ensure state is cleared before navigation
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
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