'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface MessageNotificationProps {
  className?: string;
}

// Create a singleton instance for message notification state management
class MessageNotificationManager {
  private static instance: MessageNotificationManager;
  private callbacks: Set<() => void> = new Set();
  
  private constructor() {}
  
  public static getInstance(): MessageNotificationManager {
    if (!MessageNotificationManager.instance) {
      MessageNotificationManager.instance = new MessageNotificationManager();
    }
    return MessageNotificationManager.instance;
  }
  
  public addUpdateCallback(callback: () => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }
  
  public notifyUpdate(): void {
    this.callbacks.forEach(callback => callback());
  }
}

// Export the manager for use in other components
export const messageNotificationManager = MessageNotificationManager.getInstance();

export function MessageNotification({ className = '' }: MessageNotificationProps) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/messages/unread', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.totalUnread || 0);
      }
    } catch (error) {
      console.error('Error fetching unread message count:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    // Fetch immediately
    fetchUnreadCount();
    
    // Then set up polling
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
    
    // Add callback to the notification manager
    const unsubscribe = messageNotificationManager.addUpdateCallback(fetchUnreadCount);
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [user, fetchUnreadCount]);

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