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
    
    // Check if auto-login is disabled
    const autoLoginDisabled = localStorage.getItem('disable_auto_login') === 'true';
    
    // Setup a demo student user ONLY if none exists AND auto-login isn't disabled
    const storedUser = localStorage.getItem('user');
    if (!storedUser && !autoLoginDisabled) {
      console.log('Creating demo user - auto login not disabled');
      // Use one of our sample user profiles for the demo
      const demoUser: User = {
        id: 1, // Emma Wilson - Primary Education student
        name: 'Emma Wilson',
        email: 'emma.wilson@student.edu',
        role: 'student' as UserRole,
        status: 'active' as UserStatus,
        profileImage: '/placeholder-profile.jpg'
      };
      localStorage.setItem('user', JSON.stringify(demoUser));
      console.log('Demo student user initialized');
      
      // Update auth context
      if (setUser) {
        setUser(demoUser);
      }
    } else if (autoLoginDisabled) {
      console.log('Auto-login is disabled - not creating demo user');
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