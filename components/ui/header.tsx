'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Moon, Sun, Bell, User, Settings, LogOut, ChevronDown, 
  LayoutDashboard, HelpCircle, Mail, Shield, BookOpen, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';

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
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
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
  
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    // Implement logout logic here
    console.log('Logging out...');
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

  // Show simple header with auth buttons on landing page
  if (pathname === '/') {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex">
            <Link href="/" className="flex items-center space-x-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-blue-600">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M2 5m0 2a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2z" />
                <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                <path d="M9 12h-7" />
                <path d="M15 12h7" />
              </svg>
              <span className="font-semibold text-lg">Practitioner Passport</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/auth/signin"
              className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>
    );
  }

  // Show full header for authenticated pages
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-14 items-center justify-between px-2">
        <div className="flex">
          <Link href="/" className="flex items-center space-x-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-blue-600">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M2 5m0 2a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2z" />
              <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
              <path d="M9 12h-7" />
              <path d="M15 12h7" />
            </svg>
            <span className="font-semibold text-lg">Practitioner Passport</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
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
              <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                JD
              </span>
              <ChevronDown className="ml-1 h-4 w-4" />
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
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 