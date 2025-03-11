'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Award, BookOpen, Calendar, Plus } from 'lucide-react';
import { QuickActionsModal } from './quick-actions-modal';

export function BottomNav() {
  const pathname = usePathname();
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  
  // Don't show bottom nav on landing page or auth pages
  if (pathname === '/' || pathname.startsWith('/auth')) return null;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="flex justify-around items-center max-w-4xl mx-auto relative">
          <Link href="/" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <Home className="h-6 w-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/qualifications" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <Award className="h-6 w-6" />
            <span className="text-xs">Quals + Experience</span>
          </Link>
          <div className="relative -top-0">
            <button 
              onClick={() => setIsQuickActionsOpen(true)}
              className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
            >
              <Plus className="h-8 w-8" />
            </button>
          </div>
          <Link href="/competencies" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <BookOpen className="h-6 w-6" />
            <span className="text-xs">Role Competency</span>
          </Link>
          <Link href="/sessions" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <Calendar className="h-6 w-6" />
            <span className="text-xs">Session Library</span>
          </Link>
        </div>
      </nav>

      <QuickActionsModal 
        isOpen={isQuickActionsOpen} 
        onClose={() => setIsQuickActionsOpen(false)} 
      />
    </>
  );
} 