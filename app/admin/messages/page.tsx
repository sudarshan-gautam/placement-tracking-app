'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { User, Send, Search, Clock, MessageCircle, Inbox, Filter } from 'lucide-react';
import { messageNotificationManager } from '@/components/layout/message-notification';

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
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageRecipients, setNewMessageRecipients] = useState<ContactUser[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<ContactUser | null>(null);
  const [recipientSearchQuery, setRecipientSearchQuery] = useState('');
  const [recipientRoleFilter, setRecipientRoleFilter] = useState<string>('all');

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

  // Use useEffect to log token on component mount
  useEffect(() => {
    if (user?.role === 'admin') {
      const token = localStorage.getItem('token');
      console.log('Current token in localStorage:', token ? `${token.substring(0, 10)}...` : 'None');
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      console.log('Auth token available:', !!token);
      
      // First, test the authentication
      try {
        const testResponse = await fetch('/api/admin/users/test', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const testData = await testResponse.json();
        console.log('Auth test response:', testData);
      } catch (testError) {
        console.error('Auth test error:', testError);
      }
      
      // Direct database access for users (bypass authentication for debugging)
      const directResponse = await fetch('/api/admin/users-direct');
      
      console.log('Direct user fetch response status:', directResponse.status);
      
      if (directResponse.ok) {
        const directData = await directResponse.json();
        console.log('Direct user data received:', directData);
        
        // Extract users array from the response 
        // Note: API now returns array directly, not wrapped in users property
        const usersData = Array.isArray(directData) ? directData : [];
        
        if (usersData.length === 0) {
          console.warn('No users found in direct database response');
          setUsers([]);
          setLoading(false);
          return;
        }
        
        // Get conversation data directly (bypass authentication)
        const directConversationsResponse = await fetch('/api/messages-direct');
        console.log('Direct conversations response status:', directConversationsResponse.status);
        
        if (directConversationsResponse.ok) {
          const conversationsData = await directConversationsResponse.json();
          console.log('Direct conversations data received:', conversationsData);
          const conversations = conversationsData.conversations || [];
          
          // Map user data with conversation data
          const usersWithMessageInfo = usersData.map((userData: any) => {
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
          
          console.log('Setting users with message info:', usersWithMessageInfo.length);
          setUsers(usersWithMessageInfo);
        } else {
          // If conversations cannot be fetched, still show users without message data
          console.log('Direct conversations fetch failed, using users only');
          setUsers(usersData.map((userData: any) => ({
            ...userData,
            lastMessage: 'No messages yet',
            lastMessageTime: userData.created_at,
            unread: 0
          })));
        }
      } else {
        console.error('Failed to fetch users directly, status:', directResponse.status);
        try {
          const errorData = await directResponse.json();
          console.error('Error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
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
      console.log(`Fetching messages for user ID: ${userId}`);
      
      // Try direct API first
      const directResponse = await fetch(`/api/messages-direct?userId=${userId}`);
      
      console.log('Direct messages fetch response status:', directResponse.status);
      
      if (directResponse.ok) {
        const data = await directResponse.json();
        console.log(`Direct messages fetch: Found ${data.messages?.length || 0} messages`);
        setMessages(data.messages || []);
        
        // Mark messages as read in the user list
        const updatedUsers = users.map(userItem => 
          userItem.id === userId 
            ? { ...userItem, unread: 0 } 
            : userItem
        );
        setUsers(updatedUsers);
        
        // Notify the message notification component to update
        messageNotificationManager.notifyUpdate();
        return;
      }
      
      // Fall back to authenticated API if direct one fails
      console.warn('Direct messages fetch failed, falling back to authenticated API');
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/messages?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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
        
        // Notify the message notification component to update
        messageNotificationManager.notifyUpdate();
      } else {
        console.error('Failed to fetch messages');
        setMessages([]);
        alert('Failed to fetch messages. See console for details.');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
      alert('Error fetching messages. See console for details.');
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
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      // Try using the direct API for sending messages first
      const directResponse = await fetch('/api/messages-direct/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          content: messageText,
          senderIsAdmin: true // Tell the API this is from the admin
        }),
      });
      
      if (directResponse.ok) {
        const data = await directResponse.json();
        
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
        
        // Notify the message notification component to update
        messageNotificationManager.notifyUpdate();
        
        // Refresh messages
        fetchMessages(selectedUser.id);
      } else {
        // Fallback to standard API if direct one fails
        console.warn('Direct message send failed, trying authenticated API');
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
          
          // Notify the message notification component to update
          messageNotificationManager.notifyUpdate();
        } else {
          const errorData = await response.json();
          console.error('Failed to send message:', errorData.error);
          alert('Failed to send message: ' + (errorData.error || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. See console for details.');
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

  // Function to start a new conversation
  const handleStartNewConversation = async () => {
    if (!selectedRecipient) return;
    
    // Set the selected user and close the modal
    handleUserSelect(selectedRecipient);
    setShowNewMessageModal(false);
    setSelectedRecipient(null);
    setRecipientSearchQuery('');
  };

  // When New Message button is clicked
  const handleNewMessageClick = () => {
    // Use the existing users list for recipients
    setNewMessageRecipients(users);
    setShowNewMessageModal(true);
  };

  // Filter recipients by search query and role
  const filteredRecipients = newMessageRecipients.filter(recipient => 
    (recipientRoleFilter === 'all' || recipient.role === recipientRoleFilter) &&
    (recipient.name.toLowerCase().includes(recipientSearchQuery.toLowerCase()) ||
     recipient.email.toLowerCase().includes(recipientSearchQuery.toLowerCase()))
  );

  // Debug function to check the current token and refresh the page
  const handleDebugToken = async () => {
    const token = localStorage.getItem('token');
    console.log('Current token in localStorage:', token ? `${token.substring(0, 10)}...` : 'None');
    
    // Check all possible authentication sources
    try {
      // 1. Test the auth debug endpoint
      const debugResponse = await fetch('/api/debug/auth');
      const debugData = await debugResponse.json();
      console.log('Auth debug info:', debugData);
      
      // 2. Test the users endpoint
      const usersResponse = await fetch('/api/admin/users/test', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const usersData = await usersResponse.json();
      console.log('Users test endpoint result:', usersData);
      
      // Show alert with status
      alert(`
Auth Debug:
Token in localStorage: ${token ? 'YES' : 'NO'}
NextAuth Session: ${debugData.hasSession ? 'YES' : 'NO'}
Token Auth Working: ${debugData.tokenUserFound ? 'YES' : 'NO'}
Found User: ${debugData.tokenUser?.name || 'None'}
Role: ${debugData.tokenUser?.role || 'None'}

Click OK to ${token ? 'refresh the page' : 'set a fallback token and refresh'}.
      `);
    } catch (error) {
      console.error('Error checking auth status:', error);
      alert('Error checking auth status. See console for details.');
    }
    
    if (!token) {
      console.error('No token found in localStorage!');
      // Try to use the user.id as token as a fallback
      if (user?.id) {
        console.log('Setting token to user.id as fallback:', user.id);
        localStorage.setItem('token', user.id);
        alert(`Set fallback token to user.id: ${user.id}`);
      }
    }
    
    // Refresh the page to reload with the token
    window.location.reload();
  };

  // Show loading spinner when:
  // 1. Initial load before auth check
  // 2. User is authenticated as admin but data is still loading
  if (!hasAuthChecked || (user?.role === 'admin' && loading)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Loading messages...</p>
      </div>
    );
  }

  // If we've checked auth and user is not an admin, they should be redirected already
  if (hasAuthChecked && user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with mentors and students</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleDebugToken}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center gap-2 text-sm"
          >
            <span className="h-5 w-5 flex items-center justify-center">🔑</span>
            Debug Token
          </button>
          <button
            onClick={handleNewMessageClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            New Message
          </button>
        </div>
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
              {users.length > 0 ? (
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
              ) : (
                <div className="flex flex-col items-center justify-center h-40 p-6 text-center">
                  <Inbox className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-gray-500">No users were found</p>
                  <button 
                    onClick={() => fetchUsers()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Retry Loading Users
                  </button>
                </div>
              )}
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

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">New Message</h3>
              <p className="text-gray-500 text-sm">Select a recipient to start a conversation</p>
            </div>
            
            <div className="p-6 border-b">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={recipientSearchQuery}
                  onChange={(e) => setRecipientSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              {/* Role filter */}
              <div className="flex items-center mb-4">
                <Filter className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500 mr-2">Filter:</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setRecipientRoleFilter('all')}
                    className={`px-3 py-1 text-xs rounded-full ${
                      recipientRoleFilter === 'all' 
                        ? 'bg-gray-800 text-white' 
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setRecipientRoleFilter('student')}
                    className={`px-3 py-1 text-xs rounded-full ${
                      recipientRoleFilter === 'student' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    Students
                  </button>
                  <button 
                    onClick={() => setRecipientRoleFilter('mentor')}
                    className={`px-3 py-1 text-xs rounded-full ${
                      recipientRoleFilter === 'mentor' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    Mentors
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-grow">
              <div className="p-2 space-y-1">
                {filteredRecipients.length > 0 ? (
                  filteredRecipients.map((recipient) => (
                    <div 
                      key={recipient.id} 
                      onClick={() => setSelectedRecipient(recipient)}
                      className={`p-3 rounded-md cursor-pointer ${
                        selectedRecipient?.id === recipient.id 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <p className="font-medium text-gray-900">{recipient.name}</p>
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(recipient.role)}`}>
                              {getRoleLabel(recipient.role)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{recipient.email}</p>
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
            </div>
            
            <div className="p-4 border-t flex justify-end space-x-2">
              <button 
                onClick={() => {
                  setShowNewMessageModal(false);
                  setSelectedRecipient(null);
                  setRecipientSearchQuery('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStartNewConversation}
                disabled={!selectedRecipient}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
              >
                Start Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 