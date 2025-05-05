'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function ResetLoginPage() {
  const router = useRouter();
  const { enableAutoLogin } = useAuth();
  const [message, setMessage] = useState('Resetting auto-login settings...');
  
  useEffect(() => {
    // Clear the disable_auto_login flag
    localStorage.removeItem('disable_auto_login');
    
    // Also use the context method
    enableAutoLogin();
    
    setMessage('Auto-login has been re-enabled. Redirecting to home...');
    
    // Redirect after a short delay
    const timeout = setTimeout(() => {
      router.push('/');
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [router, enableAutoLogin]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <h1 className="text-2xl font-bold mb-4">Login Settings Reset</h1>
      <p className="text-gray-600 mb-4">{message}</p>
      <button 
        onClick={() => router.push('/')}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Return Home
      </button>
    </div>
  );
} 