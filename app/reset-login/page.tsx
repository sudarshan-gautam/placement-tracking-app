'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function ResetLoginPage() {
  const router = useRouter();
  const { enableAutoLogin, setUser } = useAuth();
  const [message, setMessage] = useState('Resetting authentication settings...');
  const [resetComplete, setResetComplete] = useState(false);
  
  useEffect(() => {
    // Clear ALL authentication related data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('original_user');
    localStorage.removeItem('is_temporary_user');
    localStorage.removeItem('disable_auto_login');
    
    // Clear any other potential auth tokens
    const keysToCheck = Object.keys(localStorage);
    keysToCheck.forEach(key => {
      if (key.includes('token') || key.includes('auth') || key.includes('session')) {
        localStorage.removeItem(key);
      }
    });
    
    // Update auth context
    if (setUser) {
      setUser(null);
    }
    
    // Enable auto-login if needed in the future
    enableAutoLogin();
    
    setMessage('Authentication data has been cleared. You can now return to the home page.');
    setResetComplete(true);
  }, [router, enableAutoLogin, setUser]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication Reset</h1>
      <p className="text-gray-600 mb-6">{message}</p>
      
      {resetComplete && (
        <div className="flex flex-col space-y-4 w-full max-w-md">
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Return to Home Page
          </button>
          
          <button 
            onClick={() => router.push('/auth/signin')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
          >
            Go to Login Page
          </button>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>If you continue to experience login issues, please try:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Clearing browser cookies and cache</li>
              <li>Using a different browser</li>
              <li>Contacting support if problems persist</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 