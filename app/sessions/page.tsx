'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SessionRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/activities/session');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecting to Teaching Activities...</p>
    </div>
  );
};

export default SessionRedirect; 