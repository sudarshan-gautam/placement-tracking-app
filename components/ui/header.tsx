'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Moon, Sun, Bell, User, Settings, LogOut, ChevronDown, 
  LayoutDashboard, HelpCircle, Mail, Shield, BookOpen, AlertCircle, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface Notification {
  id: number;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  time: string;
  read: boolean;
}

interface SearchResult {
  id: number;
  type: 'page' | 'competency' | 'session';
  title: string;
  link: string;
}

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'info',
      message: 'New competency framework available',
      time: '5 mins ago',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      message: 'Session review pending',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      type: 'success',
      message: 'Qualification verified successfully',
      time: '2 hours ago',
      read: true
    }
  ]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Handle logout with proper navigation
  const handleLogout = async () => {
    await logout();
    // Navigate to home page after logout
    router.push('/');
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate unread notifications
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Live search functionality
  useEffect(() => {
    if (searchQuery.length > 0) {
      // Simulated search results - in a real app, this would call an API
      const results = [
        {
          id: 1,
          type: 'page' as const,
          title: 'Role Competency',
          link: '/competencies'
        },
        {
          id: 2,
          type: 'session' as const,
          title: 'Recent Teaching Session',
          link: '/sessions'
        },
        {
          id: 3,
          type: 'competency' as const,
          title: 'Classroom Management',
          link: '/competencies#classroom-management'
        }
      ].filter(result => 
        result.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <Shield className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    router.push(path);
  };

  // Show simple header with auth buttons on landing page
  if (pathname === '/') {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full">
          <div className="flex justify-between items-center h-16 px-4">
            <div className="flex items-center ml-1">
              <Link href="/" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M2 5m0 2a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2z" />
                  <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                  <path d="M9 12h-7" />
                  <path d="M15 12h7" />
                </svg>
                <span className="ml-2 text-lg font-bold text-gray-900">Practitioner Passport</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3 justify-end">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // For auth pages, show minimal header
  if (pathname.startsWith('/auth/')) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full">
          <div className="flex justify-between items-center h-16 px-4">
            <div className="flex items-center ml-0">
              <Link href="/" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M2 5m0 2a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2z" />
                  <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                  <path d="M9 12h-7" />
                  <path d="M15 12h7" />
                </svg>
                <span className="ml-2 text-lg font-bold text-gray-900">Practitioner Passport</span>
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // For dashboard and other authenticated pages
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="w-full">
        <div className="flex justify-between items-center h-16 px-4">
          <div className="flex items-center ml-2">
            <Link href="/" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M2 5m0 2a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2z" />
                <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                <path d="M9 12h-7" />
                <path d="M15 12h7" />
              </svg>
              <span className="ml-2 text-lg font-bold text-gray-900">Practitioner Passport</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-3 justify-end">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-200 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-100 h-9 w-9"
              >
                <Search className="h-5 w-5" />
              </button>

              {showSearch && (
                <div className="absolute right-0 mt-2 w-96 rounded-md bg-white shadow-lg">
                  <div className="p-4">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    {searchResults.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {searchResults.map((result) => (
                          <Link 
                            key={result.id}
                            href={result.link}
                            className="block rounded-md p-2 hover:bg-gray-100"
                          >
                            <div className="text-sm font-medium">{result.title}</div>
                            <div className="text-xs text-gray-500">{result.type}</div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-200 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-100 h-9 w-9"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 rounded-md bg-white shadow-lg">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Notifications</h3>
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start space-x-4 p-3 rounded-md ${
                            notification.read ? 'opacity-75' : 'bg-gray-50'
                          }`}
                        >
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-200 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-100 h-9 px-2 py-2"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <span className="ml-2 text-gray-700 hidden md:inline-block">{user?.name}</span>
                <span className="ml-1 text-xs text-gray-500 capitalize hidden md:inline-block">({user?.role})</span>
                <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg">
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                    <Link
                      href="/help"
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Help & Support
                    </Link>
                    <div className="border-t border-gray-200"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/dashboard"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/dashboard')
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              Dashboard
            </Link>
            
            <Link
              href="/competencies"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/competencies')
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              Competencies
            </Link>
            
            <Link
              href="/qualifications"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/qualifications')
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              Qualifications
            </Link>
            
            <Link
              href="/jobs"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/jobs')
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              Jobs
            </Link>
            
            <Link
              href="/activities"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/activities')
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              Activities
            </Link>
            
            <Link
              href="/profile"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/profile')
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              Profile
            </Link>
            
            {/* Admin-only link */}
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/admin')
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                Admin
              </Link>
            )}
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.name}</div>
                <div className="text-sm font-medium text-gray-500 capitalize">{user?.role}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 