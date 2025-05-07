'use client';

import { useEffect } from 'react';
import { initActivitiesData } from '@/lib/activities-service';
import { initJobsData, getJobsForUser } from '@/lib/jobs-service';
import { useAuth } from '@/lib/auth-context';
import { User, UserRole, UserStatus } from '@/types/user';

/**
 * This component is responsible for initializing client-side data
 * like localStorage activities when the app loads
 */
export function ClientInitializer() {
  const { user, setUser } = useAuth();
  
  useEffect(() => {
    // Initialize activities data in localStorage
    initActivitiesData();
    
    // Initialize jobs data in localStorage
    initJobsData();
    
    // Force disable_auto_login to true to prevent auto-login behavior
    localStorage.setItem('disable_auto_login', 'true');
    
    // Check if there's a stored user but clear it if we're on the login page
    // to prevent automatic login after logout
    const currentPath = window.location.pathname;
    const storedUser = localStorage.getItem('user');

    if (currentPath === '/' || currentPath.startsWith('/auth')) {
      // If we're on the homepage or auth pages, ensure no auto-login happens
      if (storedUser && setUser) {
        console.log('On login/home page - clearing stored user to prevent auto-login');
        localStorage.removeItem('user');
        setUser(null);
      }
    } else {
      console.log('User data found in localStorage:', storedUser ? 'yes' : 'no');
    }
    
    console.log('Client data initialized, auto-login disabled');
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