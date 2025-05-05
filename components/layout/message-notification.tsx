'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface MessageNotificationProps {
  className?: string;
}

export function MessageNotification({ className = '' }: MessageNotificationProps) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/messages/unread');
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.totalUnread || 0);
        }
      } catch (error) {
        console.error('Error fetching unread message count:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch immediately
    fetchUnreadCount();
    
    // Then set up polling
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className={`relative ${className}`}>
      <MessageCircle className="h-6 w-6" />
      {unreadCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </div>
  );
} 