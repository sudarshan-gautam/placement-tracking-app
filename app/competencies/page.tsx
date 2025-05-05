'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CompetenciesRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/activities');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecting to Activities...</p>
    </div>
  );
};

export default CompetenciesRedirect; 