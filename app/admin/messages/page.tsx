'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { User, Send, Search, Clock, MessageCircle, Inbox, Filter } from 'lucide-react';

// Card components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// For API data types
interface ContactUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread?: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// Custom CardDescription component since it's not exported from card.tsx
const CardDescription = ({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => (
  <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
);

// Custom CardFooter component since it's not exported from card.tsx
const CardFooter = ({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<ContactUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ContactUser | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [hasAuthChecked, setHasAuthChecked] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    // Wait until user data is loaded before checking role
    if (user === null) return;
    
    setHasAuthChecked(true);
    
    // Only redirect if we have confirmed user is not an admin
    if (user && user.role !== 'admin') {
      if (user.role === 'mentor') {
        router.push('/mentor');
      } else if (user.role === 'student') {
        router.push('/dashboard');
      }
      return;
    }
    
    // Only fetch data if user is an admin
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all users as admin
      const response = await fetch('/api/admin/users');
      
      if (response.ok) {
        const data = await response.json();
        
        // Get conversation data to find latest messages and unread counts
        const conversationsResponse = await fetch('/api/messages');
        if (conversationsResponse.ok) {
          const conversationsData = await conversationsResponse.json();
          const conversations = conversationsData.conversations || [];
          
          // Map user data with conversation data
          const usersWithMessageInfo = data.users.map((userData: any) => {
            // Find the conversation with this user
            const conversation = conversations.find(
              (c: any) => c.otherUserId === userData.id
            );
            
            return {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              lastMessage: conversation ? conversation.content : 'No messages yet',
              lastMessageTime: conversation ? conversation.timestamp : userData.created_at,
              unread: conversation ? conversation.unreadCount : 0
            };
          });
          
          setUsers(usersWithMessageInfo);
        } else {
          // If conversations cannot be fetched, still show users without message data
          setUsers(data.users.map((userData: any) => ({
            ...userData,
            lastMessage: 'No messages yet',
            lastMessageTime: userData.created_at,
            unread: 0
          })));
        }
      } else {
        console.error('Failed to fetch users');
        setUsers([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
      setUsers([]);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/messages?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        
        // Mark messages as read in the user list
        const updatedUsers = users.map(userItem => 
          userItem.id === userId 
            ? { ...userItem, unread: 0 } 
            : userItem
        );
        setUsers(updatedUsers);
      } else {
        console.error('Failed to fetch messages');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };
  
  const handleUserSelect = (userItem: ContactUser) => {
    setSelectedUser(userItem);
    fetchMessages(userItem.id);
  };
  
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedUser || sendingMessage) return;
    
    try {
      setSendingMessage(true);
      
      // Send the message via API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          content: messageText,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Add new message to the messages list
        setMessages([...messages, data.message]);
        
        // Update last message in user list
        const updatedUsers = users.map(userItem => 
          userItem.id === selectedUser.id 
            ? { 
                ...userItem, 
                lastMessage: messageText,
                lastMessageTime: data.message.timestamp
              } 
            : userItem
        );
        setUsers(updatedUsers);
        
        // Clear input
        setMessageText('');
      } else {
        const errorData = await response.json();
        console.error('Failed to send message:', errorData.error);
        // You might want to show an error toast here
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // You might want to show an error toast here
    } finally {
      setSendingMessage(false);
    }
  };
  
  const filteredUsers = users.filter(userItem => 
    (roleFilter === 'all' || userItem.role === roleFilter) &&
    (userItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     userItem.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Format time to show in a readable format
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 1) {
      return `${diffDays}d ago`;
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours >= 1) {
      return `${diffHours}h ago`;
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes < 1 ? 'Just now' : `${diffMinutes}m ago`;
  };
  
  // Get role label with capitalized first letter
  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };
  
  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'mentor': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading spinner when:
  // 1. Initial load before auth check
  // 2. User is authenticated as admin but data is still loading
  if (!hasAuthChecked || (user?.role === 'admin' && loading)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If we've checked auth and user is not an admin, they should be redirected already
  if (hasAuthChecked && user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Communicate with mentors and students</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* User List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold">Users</CardTitle>
              <div className="relative mt-2">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              {/* Role filter */}
              <div className="flex items-center mt-3">
                <Filter className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500 mr-2">Filter:</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setRoleFilter('all')}
                    className={`px-3 py-1 text-xs rounded-full ${
                      roleFilter === 'all' 
                        ? 'bg-gray-800 text-white' 
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setRoleFilter('student')}
                    className={`px-3 py-1 text-xs rounded-full ${
                      roleFilter === 'student' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    Students
                  </button>
                  <button 
                    onClick={() => setRoleFilter('mentor')}
                    className={`px-3 py-1 text-xs rounded-full ${
                      roleFilter === 'mentor' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    Mentors
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[55vh] overflow-y-auto">
              <div className="space-y-2">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((userItem) => (
                    <div 
                      key={userItem.id} 
                      onClick={() => handleUserSelect(userItem)}
                      className={`p-3 rounded-md cursor-pointer ${
                        selectedUser?.id === userItem.id 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                          {userItem.unread && userItem.unread > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white">{userItem.unread}</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{userItem.name}</p>
                              <div className="flex items-center">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(userItem.role)}`}>
                                  {getRoleLabel(userItem.role)}
                                </span>
                              </div>
                            </div>
                            {userItem.lastMessageTime && (
                              <span className="text-xs text-gray-500">
                                {formatTime(userItem.lastMessageTime)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate mt-1">{userItem.lastMessage}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 p-6 text-center">
                    <Inbox className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-gray-500">No users match your search</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Message Area */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            {selectedUser ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <CardTitle>{selectedUser.name}</CardTitle>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                          {getRoleLabel(selectedUser.role)}
                        </span>
                      </div>
                      <CardDescription>{selectedUser.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-[50vh] overflow-y-auto p-6">
                  <div className="space-y-4">
                    {messages.length > 0 ? (
                      messages.map((message) => {
                        const isMine = message.senderId === user?.id;
                        return (
                          <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div 
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isMine 
                                  ? 'bg-blue-500 text-white rounded-br-none' 
                                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
                              }`}
                            >
                              <p>{message.content}</p>
                              <div className={`text-xs mt-1 flex items-center ${isMine ? 'text-blue-200' : 'text-gray-500'}`}>
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 p-6 text-center">
                        <MessageCircle className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-gray-500">No messages yet. Send a message to start the conversation.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4">
                  <div className="flex w-full">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={sendingMessage}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendingMessage}
                      className="p-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {sendingMessage ? (
                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </CardFooter>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[65vh] p-6 text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Select a user to message</h3>
                <p className="text-gray-500 max-w-md">
                  Choose a user from the list to start messaging. As an admin, you can message any user in the system.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 