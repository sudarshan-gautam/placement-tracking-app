'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/use-toast';

export default function NewActivityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Effect to redirect users
  useEffect(() => {
    // Check user role and redirect
    if (user) {
      if (user.role === 'mentor') {
        router.push('/mentor/activities/new');
      } else if (user.role === 'admin') {
        router.push('/admin/activities/new');
      } else if (user.role === 'student') {
        // Show toast message and redirect to activities list
        toast({
          title: "Permission Denied",
          description: "Students can no longer create activities. Activities are now assigned by mentors and administrators.",
          variant: "destructive"
        });
        router.push('/student/activities');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router, toast]);

  // This page shouldn't render anything as we always redirect
  return null;
} 