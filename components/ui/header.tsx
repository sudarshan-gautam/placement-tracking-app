'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Settings, LogOut, ChevronDown, 
  LayoutDashboard, HelpCircle, Mail, Shield, BookOpen, AlertCircle, FileText, Briefcase, UserCog, ArrowLeft, File } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Image from 'next/image';
import UserSwitcher from '@/components/user-switcher';

// Client-side only component for the return button
function ClientSideReturnButton() {
  const [originalUser, setOriginalUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  
  // Only run after component is mounted in the browser
  useEffect(() => {
    setMounted(true);
    
    try {
      const storedOriginalUser = localStorage.getItem('original_user');
      if (storedOriginalUser) {
        const parsedUser = JSON.parse(storedOriginalUser);
        setOriginalUser(parsedUser);
      }
    } catch (error) {
      console.error('Error parsing original user:', error);
    }
  }, []);
  
  // Don't render anything during SSR
  if (!mounted) return null;
  
  // Don't render if there's no original user
  if (!localStorage.getItem('original_user')) return null;
  
  const handleReturnToOriginal = () => {
    try {
      const storedOriginalUser = localStorage.getItem('original_user');
      if (!storedOriginalUser) {
        return;
      }
      
      const originalUser = JSON.parse(storedOriginalUser);
      
      // Restore original user
      localStorage.setItem('user', JSON.stringify(originalUser));
      
      // Clear temporary flags
      localStorage.removeItem('original_user');
      localStorage.removeItem('is_temporary_user');
      
      // Redirect to appropriate dashboard based on the original user's role
      if (originalUser.role === 'admin') {
        // If the admin was in the user management section, return there
        const currentPath = window.location.pathname;
        if (currentPath.includes('/admin/users')) {
          window.location.href = '/admin/users';
        } else {
          window.location.href = '/admin';
        }
      } else if (originalUser.role === 'mentor') {
        window.location.href = '/mentor';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Error returning to original user:', error);
    }
  };
  
  return (
    <>
      <div className="border-t border-gray-200 my-1"></div>
      <button 
        onClick={handleReturnToOriginal}
        className="flex w-full items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Return to {originalUser?.name || 'Original User'}
      </button>
    </>
  );
}

interface Notification {
  id: number;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  time: string;
  read: boolean;
}

interface SearchResult {
  id: number;
  type: 'page' | 'activity' | 'session';
  title: string;
  link: string;
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'info',
      message: 'New activity framework available',
      time: '5 mins ago',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      message: 'Activity review pending',
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
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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
          title: 'Role Activity',
          link: '/activities'
        },
        {
          id: 2,
          type: 'session' as const,
          title: 'Recent Teaching Activity',
          link: '/activities/session'
        },
        {
          id: 3,
          type: 'activity' as const,
          title: 'Classroom Management',
          link: '/activities#classroom-management'
        }
      ].filter(result => 
        result.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Debug: Log the user object to see if profile image is loaded
  useEffect(() => {
    if (user) {
      console.log('User in header:', user);
      console.log('Profile image:', user.profileImage);
    }
  }, [user]);

  // Force refresh when localStorage changes
  useEffect(() => {
    // Create a function to refresh user data from localStorage
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser && isAuthenticated) {
        try {
          const userData = JSON.parse(storedUser);
          // Update user state if there are changes
          if (JSON.stringify(userData) !== JSON.stringify(user)) {
            console.log('User data changed in localStorage, refreshing...');
            window.location.reload(); // Force page reload to update all components
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    };

    // Set up storage event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, isAuthenticated]);
  
  // Listen for user-updated event
  useEffect(() => {
    const handleUserUpdate = () => {
      console.log('User updated event received in header');
      // Simply force re-render by getting the latest user data
      const storedUser = localStorage.getItem('user');
      if (storedUser && isAuthenticated) {
        try {
          const userData = JSON.parse(storedUser);
          // No need to check if different, we know it was updated
          window.location.reload(); // Force page reload to update all components
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    };

    // Add event listener
    window.addEventListener('user-updated', handleUserUpdate);
    
    // Clean up
    return () => {
      window.removeEventListener('user-updated', handleUserUpdate);
    };
  }, [isAuthenticated]);

  // Check if the user is impersonating another user
  useEffect(() => {
    const checkImpersonating = () => {
      if (typeof window !== 'undefined') {
        const hasOriginalUser = localStorage.getItem('original_user') !== null;
        setIsImpersonating(hasOriginalUser);
      }
    };
    
    checkImpersonating();
    
    // Also listen for storage events
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', checkImpersonating);
      
      return () => {
        window.removeEventListener('storage', checkImpersonating);
      };
    }
  }, []);

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

  // Add a function to handle logout properly
  const handleLogout = () => {
    // Check if user is impersonating someone
    if (typeof window !== 'undefined' && localStorage.getItem('original_user')) {
      // If impersonating, restore the original user instead of logging out completely
      const originalUser = JSON.parse(localStorage.getItem('original_user') || '{}');
      
      // Restore original user
      localStorage.setItem('user', JSON.stringify(originalUser));
      
      // Clear temporary flags
      localStorage.removeItem('original_user');
      localStorage.removeItem('is_temporary_user');
      
      // Redirect to appropriate dashboard based on role
      if (originalUser.role === 'admin') {
        window.location.href = '/admin';
      } else if (originalUser.role === 'mentor') {
        window.location.href = '/mentor';
      } else {
        window.location.href = '/dashboard';
      }
      
      // Force reload to ensure state is refreshed
      window.location.reload();
    } else {
      // Normal logout if not impersonating
      logout();
    }
  };

  // Show simple header with auth buttons on landing page
  if (pathname === '/') {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full px-6 mx-auto">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M2 5m0 2a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2z" />
                    <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                    <path d="M9 12h-7" />
                    <path d="M15 12h7" />
                  </svg>
                  <span className="ml-2 text-xl font-bold text-gray-900">Practitioner Passport</span>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href={user?.role === 'admin' ? '/admin' : user?.role === 'mentor' ? '/mentor' : '/dashboard'}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {user?.role === 'admin' ? 'Admin Dashboard' : user?.role === 'mentor' ? 'Mentor Dashboard' : 'Dashboard'}
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
        <div className="w-full px-6 mx-auto">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M2 5m0 2a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2z" />
                    <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                    <path d="M9 12h-7" />
                    <path d="M15 12h7" />
                  </svg>
                  <span className="ml-2 text-xl font-bold text-gray-900">Practitioner Passport</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // For dashboard and other authenticated pages
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="w-full px-6 mx-auto">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M2 5m0 2a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2z" />
                  <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                  <path d="M9 12h-7" />
                  <path d="M15 12h7" />
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900">Practitioner Passport</span>
              </Link>
            </div>
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
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {user?.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        // If image fails to load, fall back to User icon
                        const target = e.target as HTMLImageElement;
                        if (target) {
                          target.style.display = 'none';
                          // Create and show User icon instead
                          const parent = target.parentElement;
                          if (parent) {
                            // Remove any existing SVG elements to prevent duplication
                            const existingSvgs = parent.querySelectorAll('svg');
                            existingSvgs.forEach(svg => {
                              parent.removeChild(svg);
                            });
                            
                            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                            svg.setAttribute('viewBox', '0 0 24 24');
                            svg.setAttribute('width', '20');
                            svg.setAttribute('height', '20');
                            svg.setAttribute('fill', 'none');
                            svg.setAttribute('stroke', 'currentColor');
                            svg.setAttribute('stroke-width', '2');
                            svg.setAttribute('stroke-linecap', 'round');
                            svg.setAttribute('stroke-linejoin', 'round');
                            svg.classList.add('h-5', 'w-5', 'text-gray-600');
                            
                            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            path1.setAttribute('d', 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2');
                            
                            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                            path2.setAttribute('cx', '12');
                            path2.setAttribute('cy', '7');
                            path2.setAttribute('r', '4');
                            
                            svg.appendChild(path1);
                            svg.appendChild(path2);
                            parent.appendChild(svg);
                          }
                        }
                      }}
                    />
                  ) : (
                    <User className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <span className="ml-2 text-gray-700 hidden md:inline-block">{user?.name}</span>
                <span className="ml-1 text-xs text-gray-500 capitalize hidden md:inline-block">({user?.role})</span>
                <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
              </button>
              
              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg">
                  <div className="py-1">
                    {/* Role-specific dashboard links */}
                    {user?.role === 'admin' ? (
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    ) : user?.role === 'mentor' ? (
                      <Link
                        href="/mentor"
                        className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Mentor Dashboard
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    )}
                    
                    {/* Common navigation items */}
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/activities"
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Activities
                    </Link>
                    {user?.role === 'admin' ? (
                      <Link
                        href="/admin/jobs"
                        className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <Briefcase className="mr-2 h-4 w-4" />
                        Jobs
                      </Link>
                    ) : user?.role === 'mentor' ? (
                      <Link
                        href="/mentor/jobs"
                        className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <Briefcase className="mr-2 h-4 w-4" />
                        Jobs
                      </Link>
                    ) : (
                      <Link
                        href="/jobs"
                        className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <Briefcase className="mr-2 h-4 w-4" />
                        Jobs
                      </Link>
                    )}
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
                    
                    {/* Always include the return button - it will only render on the client if needed */}
                    <ClientSideReturnButton />
                    
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
      </div>
    </header>
  );
} 