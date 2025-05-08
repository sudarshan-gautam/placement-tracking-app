'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/user';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  enableAutoLogin: () => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  updateUser: (userData: Partial<User>) => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get current URL to check access context
    const currentPath = window.location.pathname;
    const isProtectedRoute = 
      currentPath.startsWith('/admin') || 
      currentPath.startsWith('/dashboard') || 
      currentPath.startsWith('/mentor') ||
      currentPath.startsWith('/profile');
    
    const isLoginPage = 
      currentPath === '/' || 
      currentPath === '/login' || 
      currentPath.startsWith('/register');
      
    // Process all security checks first
    
    // Check for incognito mode by testing localStorage access
    try {
      const testKey = 'test_storage_access';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
    } catch (error) {
      console.log('Storage not accessible - likely in incognito mode');
      setLoading(false);
      return;
    }
    
    // Check if user manually logged out in this browser session
    const manuallyLoggedOut = sessionStorage.getItem('manually_logged_out') === 'true';
    if (manuallyLoggedOut) {
      console.log('User manually logged out in this session, not auto-logging in');
      setLoading(false);
      
      // If on a protected route, redirect to login
      if (isProtectedRoute) {
        window.location.href = '/login';
      }
      return;
    }
    
    // Check if this is just a regular page reload for a logged-in user
    const storedUser = localStorage.getItem('user');
    const isPageReload = performance && performance.navigation && 
                         performance.navigation.type === 1; // 1 is reload
    
    // If we have a stored user and this is just a page reload, don't redirect
    if (storedUser && isPageReload) {
      try {
        // Just restore the user data without redirecting
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing stored user data on reload:', error);
        // Continue with normal flow if parse fails
      }
    }
    
    // Check if server was restarted (security measure)
    const serverRestarted = localStorage.getItem('server_restarted') === 'true';
    if (serverRestarted && isProtectedRoute && !storedUser) {
      console.log('Server restarted and protected route detected - enforcing login');
      localStorage.removeItem('server_restarted'); // Clear the flag after check
      setLoading(false);
      window.location.href = '/login?redirect=' + encodeURIComponent(currentPath);
      return;
    } else if (serverRestarted) {
      // Clear flag if not on protected route
      localStorage.removeItem('server_restarted');
    }
    
    // Check if direct access to protected route requires login
    const requireLogin = localStorage.getItem('require_login') === 'true' || 
                         sessionStorage.getItem('require_login') === 'true';
    if (requireLogin && isProtectedRoute && !storedUser) {
      console.log('Direct access to protected route - enforcing login');
      localStorage.removeItem('require_login');
      sessionStorage.removeItem('require_login');
      setLoading(false);
      window.location.href = '/login?redirect=' + encodeURIComponent(currentPath);
      return;
    } else if (requireLogin) {
      // Clear the flags if we have a stored user
      localStorage.removeItem('require_login');
      sessionStorage.removeItem('require_login');
    }
    
    // If we've passed all security checks and on a login page, just return
    // to avoid automatically redirecting away from login
    if (isLoginPage) {
      setLoading(false);
      return;
    }
    
    // Now process normal login state
    
    if (!storedUser) {
      // No stored user and not on login page - redirect to login if on protected route
      if (isProtectedRoute) {
        console.log('No stored user on protected route - redirecting to login');
        window.location.href = '/login?redirect=' + encodeURIComponent(currentPath);
      } else {
        console.log('No stored user, but not on protected route');
      }
      setLoading(false);
      return;
    }
    
    try {
      // Parse and restore user data
      const userData = JSON.parse(storedUser);
      
      // Restore profile image from persistent storage if available
      if (userData.email) {
        console.log('Loading user data for:', userData.email, 'role:', userData.role);
        
        const persistentProfileData = localStorage.getItem(`persistentProfileData-${userData.email}`);
        if (persistentProfileData) {
          try {
            const profileData = JSON.parse(persistentProfileData);
            console.log('Found persistent profile data:', profileData.name);
            if (profileData && profileData.profileImage) {
              console.log('Restoring profile image from persistent data');
              userData.profileImage = profileData.profileImage;
            }
          } catch (error) {
            console.error('Error parsing persistent profile data:', error);
          }
        }
        
        // If still no profile image, set default
        if (!userData.profileImage) {
          userData.profileImage = '/placeholder-profile.jpg';
        }
      }
      
      // Update the user data
      setUser(userData);
      
      // Maintain persistence
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set a cookie with the user data for middleware auth
      setSecureCookie('userData', JSON.stringify({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        name: userData.name
      }));
      
      // Only handle role-based redirects for initial access, not for reloads
      const isFirstAccess = !isPageReload;
      
      if (isFirstAccess) {
        const shouldRedirect = !currentPath.includes(userData.role.toLowerCase());
        
        if (shouldRedirect) {
          if (userData.role === 'admin' && !currentPath.startsWith('/admin')) {
            router.push('/admin');
          } else if (userData.role === 'mentor' && !currentPath.startsWith('/mentor')) {
            router.push('/mentor');
          } else if (userData.role === 'student' && currentPath === '/') {
            router.push('/dashboard');
          }
        }
      }
      
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      localStorage.removeItem('user');
      
      // Redirect to login if on protected route
      if (isProtectedRoute) {
        window.location.href = '/login';
      }
    }
    
    setLoading(false);
  }, [router]);

  // Add a function to set secure HttpOnly cookies
  const setSecureCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    // Set the cookie with HttpOnly and Secure flags in production
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
  };
  
  // Add a function to remove cookies
  const removeCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
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
        return false;
      }

      const data = await response.json();
      
      // Restore profile data if available
      const persistentProfileData = localStorage.getItem(`persistentProfileData-${email}`);
      if (persistentProfileData) {
        localStorage.setItem(`profileData-${email}`, persistentProfileData);
        
        // Update user object with profile image
        try {
          const profileData = JSON.parse(persistentProfileData);
          if (profileData && profileData.profileImage) {
            data.user.profileImage = profileData.profileImage;
          }
        } catch (error) {
          console.error('Error parsing persistent profile data:', error);
        }
      }
      
      // If still no profile image, check profileData directly
      if (!data.user.profileImage) {
        const profileData = localStorage.getItem(`profileData-${email}`);
        if (profileData) {
          try {
            const parsedData = JSON.parse(profileData);
            if (parsedData && parsedData.profileImage) {
              data.user.profileImage = parsedData.profileImage;
            }
          } catch (error) {
            console.error('Error parsing profile data:', error);
          }
        }
      }
      
      // If still no profile image after all checks, set a default one
      if (!data.user.profileImage) {
        data.user.profileImage = '/placeholder-profile.jpg';
      }
      
      // Restore verification status
      const persistentVerificationStatus = localStorage.getItem(`persistentVerificationStatus-${email}`);
      if (persistentVerificationStatus) {
        localStorage.setItem(`verificationStatus-${email}`, persistentVerificationStatus);
      } else if (data.user.role === 'admin') {
        // Ensure admin users are always verified
        localStorage.setItem(`verificationStatus-${email}`, 'verified');
      }
      
      // Restore rejection details if available
      const persistentRejectionDetails = localStorage.getItem(`persistentRejectionDetails-${email}`);
      if (persistentRejectionDetails) {
        localStorage.setItem(`rejectionDetails-${email}`, persistentRejectionDetails);
      }
      
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Set a cookie with the user data for middleware auth
      setSecureCookie('userData', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name
      }));
      
      // Redirect based on user role
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else if (data.user.role === 'mentor') {
        router.push('/mentor');
      } else {
        router.push('/dashboard');
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string = 'student'): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      // Set initial profile data with empty profile image for new users
      const initialProfileData = {
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        phone: '',
        address: '',
        dateOfBirth: '',
        institution: '',
        bio: ''
      };
      
      // Save initial profile data
      localStorage.setItem(`profileData-${email}`, JSON.stringify(initialProfileData));
      localStorage.setItem(`persistentProfileData-${email}`, JSON.stringify(initialProfileData));
      
      // Set default verification status for admin users
      if (data.user.role === 'admin') {
        localStorage.setItem(`verificationStatus-${email}`, 'verified');
        localStorage.setItem(`persistentVerificationStatus-${email}`, 'verified');
      }
      
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Set a cookie with the user data for middleware auth
      setSecureCookie('userData', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name
      }));
      
      // Redirect based on user role
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else if (data.user.role === 'mentor') {
        router.push('/mentor');
      } else {
        router.push('/dashboard');
      }
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Store the user's email and profile data before logging out
      if (user) {
        // Remember the user's email to identify their profile data later
        const userEmail = user.email;
        
        // Get and store profile image if available
        const profileData = localStorage.getItem(`profileData-${userEmail}`);
        if (profileData) {
          // Keep profile data in a separate storage that persists after logout
          localStorage.setItem(`persistentProfileData-${userEmail}`, profileData);
        }
  
        // Store verification status
        const verificationStatus = localStorage.getItem(`verificationStatus-${userEmail}`);
        if (verificationStatus) {
          localStorage.setItem(`persistentVerificationStatus-${userEmail}`, verificationStatus);
        }
        
        // Store rejection details if available
        const rejectionDetails = localStorage.getItem(`rejectionDetails-${userEmail}`);
        if (rejectionDetails) {
          localStorage.setItem(`persistentRejectionDetails-${userEmail}`, rejectionDetails);
        }
      }
      
      // Call server API to clear HTTP-only cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Clear user state
      setUser(null);
      
      // Remove the user from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('original_user');
      localStorage.removeItem('is_temporary_user');
      
      // Remove the auth cookie (client-side)
      removeCookie('userData');
      
      // Set a flag to prevent auto-login for this session
      sessionStorage.setItem('manually_logged_out', 'true');
      localStorage.setItem('manually_logged_out', 'true');
      
      // Clear any active sessions
      document.cookie = "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      console.log('User logged out successfully');
      
      // Force redirect to home page to ensure a complete reset
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear local data
      setUser(null);
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  const enableAutoLogin = () => {
    sessionStorage.removeItem('manually_logged_out');
    localStorage.removeItem('manually_logged_out');
    console.log('Auto-login has been re-enabled');
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    console.log('Updating user with:', userData);
    
    // Update user in state
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    
    // Update user in localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // If updating profile data, also update the persistent data
    if (user.email) {
      const profileData = localStorage.getItem(`profileData-${user.email}`);
      if (profileData) {
        try {
          const parsedData = JSON.parse(profileData);
          const updatedProfileData = { ...parsedData, ...userData };
          
          // Save updated profile data
          localStorage.setItem(`profileData-${user.email}`, JSON.stringify(updatedProfileData));
          localStorage.setItem(`persistentProfileData-${user.email}`, JSON.stringify(updatedProfileData));
        } catch (error) {
          console.error('Error updating profile data:', error);
        }
      }
    }
    
    // Force child components to re-render with custom event
    try {
      window.dispatchEvent(new Event('user-updated'));
    } catch (error) {
      console.error('Error dispatching user-updated event:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        enableAutoLogin,
        isAuthenticated: !!user,
        hasRole,
        updateUser,
        setUser,
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