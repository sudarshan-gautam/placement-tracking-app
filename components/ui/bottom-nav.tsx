'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Award, BookOpen, Calendar, Plus, Settings, Users, ClipboardCheck, Briefcase, FileText, User, BarChart2, MessageCircle, Folder } from 'lucide-react';
import { QuickActionsModal } from './quick-actions-modal';
import { useAuth } from '@/lib/auth-context';
import { MessageNotification } from '../layout/message-notification';

export function BottomNav() {
  const pathname = usePathname();
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const { user } = useAuth();
  
  // Don't show bottom nav on landing page or auth pages
  if (pathname === '/' || pathname.startsWith('/auth')) return null;

  // Admin-specific navigation
  if (user?.role === 'admin') {
    return (
      <>
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <div className="flex justify-around items-center max-w-5xl mx-auto relative">
            <Link href="/admin" className={`flex flex-col items-center ${pathname === '/admin' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
              <Home className="h-6 w-6" />
              <span className="text-xs">Dashboard</span>
            </Link>
            <Link href="/admin/verifications" className={`flex flex-col items-center ${pathname.startsWith('/admin/verifications') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
              <ClipboardCheck className="h-6 w-6" />
              <span className="text-xs">Verify</span>
            </Link>
            <div className="relative -top-0">
              <button 
                onClick={() => setIsQuickActionsOpen(true)}
                className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
              >
                <Plus className="h-8 w-8" />
              </button>
            </div>
            <Link href="/admin/users" className={`flex flex-col items-center ${pathname.startsWith('/admin/users') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
              <Users className="h-6 w-6" />
              <span className="text-xs">Users</span>
            </Link>
            <Link href="/admin/messages" className={`flex flex-col items-center ${pathname.startsWith('/admin/messages') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
              <div className="relative">
                <MessageNotification />
              </div>
              <span className="text-xs">Messages</span>
            </Link>
            <Link href="/profile" className={`flex flex-col items-center ${pathname === '/profile' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
              <User className="h-6 w-6" />
              <span className="text-xs">Profile</span>
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

  // Mentor-specific navigation
  if (user?.role === 'mentor') {
    return (
      <>
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <div className="flex justify-around items-center max-w-5xl mx-auto relative">
            <Link href="/mentor" className={`flex flex-col items-center ${pathname === '/mentor' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
              <Home className="h-6 w-6" />
              <span className="text-xs">Dashboard</span>
            </Link>
            <Link href="/mentor/verifications" className={`flex flex-col items-center ${pathname.startsWith('/mentor/verifications') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
              <ClipboardCheck className="h-6 w-6" />
              <span className="text-xs">Verify</span>
            </Link>
            <div className="relative -top-0">
              <button 
                onClick={() => setIsQuickActionsOpen(true)}
                className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
              >
                <Plus className="h-8 w-8" />
              </button>
            </div>
            <Link href="/mentor/students" className={`flex flex-col items-center ${pathname.startsWith('/mentor/students') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
              <Users className="h-6 w-6" />
              <span className="text-xs">Students</span>
            </Link>
            <Link href="/mentor/messages" className={`flex flex-col items-center ${pathname.startsWith('/mentor/messages') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
              <div className="relative">
                <MessageNotification />
              </div>
              <span className="text-xs">Messages</span>
            </Link>
            <Link href="/profile" className={`flex flex-col items-center ${pathname === '/profile' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
              <User className="h-6 w-6" />
              <span className="text-xs">Profile</span>
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

  // Student navigation
  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="flex justify-around items-center max-w-5xl mx-auto relative">
          <Link href="/dashboard" className={`flex flex-col items-center ${pathname === '/dashboard' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs">Dashboard</span>
          </Link>
          <Link href="/verifications/status" className={`flex flex-col items-center ${pathname.startsWith('/verifications') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
            <ClipboardCheck className="h-6 w-6" />
            <span className="text-xs">Verify</span>
          </Link>
          <div className="relative -top-0">
            <button 
              onClick={() => setIsQuickActionsOpen(true)}
              className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
            >
              <Plus className="h-8 w-8" />
            </button>
          </div>
          <Link href="/jobs" className={`flex flex-col items-center ${pathname.startsWith('/jobs') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
            <Briefcase className="h-6 w-6" />
            <span className="text-xs">Jobs</span>
          </Link>
          <Link href="/student/messages" className={`flex flex-col items-center ${pathname.startsWith('/student/messages') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
            <div className="relative">
              <MessageNotification />
            </div>
            <span className="text-xs">Messages</span>
          </Link>
          <Link href="/profile" className={`flex flex-col items-center ${pathname === '/profile' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
            <User className="h-6 w-6" />
            <span className="text-xs">Profile</span>
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