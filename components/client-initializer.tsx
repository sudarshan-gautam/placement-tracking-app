'use client';

import { useEffect } from 'react';
import { initJobsData, getJobsForUser } from '@/lib/jobs-service';
import { useAuth } from '@/lib/auth-context';
import { User, UserRole, UserStatus } from '@/types/user';

/**
 * This component is responsible for initializing client-side data
 * when the app loads
 */
export function ClientInitializer() {
  const { user, setUser } = useAuth();
  
  useEffect(() => {
    // First check if storage is available (might be in incognito mode)
    try {
      const testKey = 'test_storage_access';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
    } catch (error) {
      console.log('Storage not accessible - likely in incognito mode');
      return;
    }
    
    // Initialize jobs data in localStorage
    initJobsData();
    
    // Get current URL path to check context
    const currentPath = window.location.pathname;
    const isProtectedRoute = 
      currentPath.startsWith('/admin') || 
      currentPath.startsWith('/dashboard') || 
      currentPath.startsWith('/mentor') ||
      currentPath.startsWith('/profile');
      
    // Don't continue processing if on a protected route - auth-context will handle it
    if (isProtectedRoute) {
      console.log('On protected route - not initializing demo user');
      return;
    }
    
    // Check if we're on login page (don't initialize demo user here)
    const isLoginPage = 
      currentPath === '/' || 
      currentPath === '/login' || 
      currentPath.startsWith('/register');
      
    if (isLoginPage) {
      console.log('On login page - not initializing demo user');
      return;
    }
    
    console.log('Client data initialized');
  }, [setUser]);
  
  // When user changes, load personalized job data
  useEffect(() => {
    if (user?.id) {
      console.log(`Loading personalized jobs for user ${user.id}...`);
      // Ensure user.id is treated as a number
      const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
      getJobsForUser(userId);
    }
  }, [user?.id]);
  
  // This component doesn't render anything
  return null;
} 