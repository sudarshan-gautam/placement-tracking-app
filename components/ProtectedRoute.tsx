'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/db';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ['admin', 'mentor', 'student'] 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to login page if not authenticated
      router.push('/auth/signin');
      return;
    }

    if (!loading && isAuthenticated && user && allowedRoles.length > 0) {
      // Check if user has the required role
      const hasRequiredRole = hasRole(allowedRoles);
      
      if (!hasRequiredRole) {
        // Redirect to dashboard if user doesn't have the required role
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, loading, router, user, allowedRoles, hasRole]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, don't render children
  if (!isAuthenticated) {
    return null;
  }

  // If roles are specified and user doesn't have the required role, don't render children
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return null;
  }

  // Render children if authenticated and has the required role
  return <>{children}</>;
} 