'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

/**
 * This component initializes client-side data when the app loads
 */
export function ClientInitializer() {
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      console.log('Client initializer: User logged in');
      // Any user-specific initialization can go here
    } else {
      console.log('Client initializer: No user logged in');
    }
    
    // Global initialization that should happen regardless of user login status
    
  }, [user]);
  
  // This component doesn't render anything
  return null;
} 