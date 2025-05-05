'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { initJobsData, isJobsInitialized, getJobsForUser } from '@/lib/jobs-service';

/**
 * JobsInitializer component - handles initializing job data on app startup
 * This component doesn't render anything visible but handles the data initialization
 */
export default function JobsInitializer() {
  const { user } = useAuth();
  
  useEffect(() => {
    // Initialize jobs data if not already initialized
    if (!isJobsInitialized()) {
      console.log('Initializing jobs data...');
      initJobsData();
    } else if (user?.id) {
      // If user is logged in, get personalized jobs for this user
      console.log(`Loading personalized jobs for user ${user.id}...`);
      // Ensure user.id is treated as a number
      getJobsForUser(Number(user.id));
    }
  }, [user?.id]);
  
  // This component doesn't render anything visible
  return null;
} 