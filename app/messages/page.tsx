'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function MessagesRedirectPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    // Redirect based on user role
    if (user.role === 'mentor') {
      router.push('/mentor/messages');
    } else if (user.role === 'admin') {
      router.push('/admin/messages');
    } else if (user.role === 'student') {
      router.push('/student/messages');
    }
  }, [user, router]);

  // Simple loading state
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
} 