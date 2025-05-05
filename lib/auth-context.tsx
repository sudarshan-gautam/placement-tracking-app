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
    // Check if user is stored in localStorage on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
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
          
          // If still no profile image, check profileData directly
          if (!userData.profileImage) {
            const profileData = localStorage.getItem(`profileData-${userData.email}`);
            if (profileData) {
              try {
                const parsedData = JSON.parse(profileData);
                if (parsedData && parsedData.profileImage) {
                  userData.profileImage = parsedData.profileImage;
                }
              } catch (error) {
                console.error('Error parsing profile data:', error);
              }
            }
          }
          
          // If still no profile image after all checks, set a default one
          if (!userData.profileImage) {
            userData.profileImage = '/placeholder-profile.jpg';
          }
          
          // Restore verification status
          const persistentVerificationStatus = localStorage.getItem(`persistentVerificationStatus-${userData.email}`);
          if (persistentVerificationStatus) {
            localStorage.setItem(`verificationStatus-${userData.email}`, persistentVerificationStatus);
          } else if (userData.role === 'admin') {
            // Ensure admin users are always verified
            localStorage.setItem(`verificationStatus-${userData.email}`, 'verified');
          }
        }
        
        // Update the user in localStorage with possibly updated profile image
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        
        // Check current path to avoid unnecessary redirects
        const currentPath = window.location.pathname;
        
        // Redirect based on user role if not on the correct dashboard already
        if (userData.role === 'admin' && !currentPath.startsWith('/admin')) {
          router.push('/admin');
        } else if (userData.role === 'mentor' && !currentPath.startsWith('/mentor')) {
          router.push('/mentor');
        } else if (userData.role === 'student' && currentPath === '/') {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, [router]);

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

  const logout = () => {
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
    
    // Clear all user session data
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('original_user');
    localStorage.removeItem('is_temporary_user');
    
    // Set a flag to prevent auto-login in localStorage so it persists
    localStorage.setItem('disable_auto_login', 'true');
    
    // Force redirect to home page to ensure a complete reset
    window.location.href = '/';
  };

  const enableAutoLogin = () => {
    localStorage.removeItem('disable_auto_login');
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