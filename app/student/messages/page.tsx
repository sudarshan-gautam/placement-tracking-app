'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { User, Send, Search, Clock, MessageCircle, Inbox } from 'lucide-react';

// Card components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// For API data types
interface Mentor {
  id: string;
  name: string;
  email: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread?: number;
  assignedDate?: string;
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

export default function StudentMessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasAuthChecked, setHasAuthChecked] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    // Wait until user data is loaded before checking role
    if (user === null) return;
    
    setHasAuthChecked(true);
    
    // Only redirect if we have confirmed user is not a student
    if (user && user.role !== 'student') {
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'mentor') {
        router.push('/mentor');
      }
      return;
    }
    
    // Only fetch data if user is a student
    if (user && user.role === 'student') {
      fetchAssignedMentors();
    }
  }, [user, router]);

  const fetchAssignedMentors = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/student/mentors');
      
      if (response.ok) {
        const data = await response.json();
        
        // Get conversation data for each mentor to find latest messages and unread counts
        const conversationsResponse = await fetch('/api/messages');
        if (conversationsResponse.ok) {
          const conversationsData = await conversationsResponse.json();
          const conversations = conversationsData.conversations || [];
          
          // Map the mentor data with conversation data
          const mentorsWithMessageInfo = data.assignedMentors.map((mentor: any) => {
            // Find the conversation with this mentor
            const conversation = conversations.find(
              (c: any) => c.otherUserId === mentor.id
            );
            
            return {
              id: mentor.id,
              name: mentor.name,
              email: mentor.email,
              assignedDate: mentor.assignedDate,
              lastMessage: conversation ? conversation.content : 'No messages yet',
              lastMessageTime: conversation ? conversation.timestamp : mentor.assignedDate,
              unread: conversation ? conversation.unreadCount : 0
            };
          });
          
          setMentors(mentorsWithMessageInfo);
        } else {
          // If conversations cannot be fetched, still show mentors without message data
          setMentors(data.assignedMentors.map((mentor: any) => ({
            ...mentor,
            lastMessage: 'No messages yet',
            lastMessageTime: mentor.assignedDate,
            unread: 0
          })));
        }
      } else {
        console.error('Failed to fetch assigned mentors');
        setMentors([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assigned mentors:', error);
      setLoading(false);
      setMentors([]);
    }
  };

  const fetchMessages = async (mentorId: string) => {
    try {
      const response = await fetch(`/api/messages?userId=${mentorId}`);
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        
        // Mark messages as read in the mentor list
        const updatedMentors = mentors.map(mentor => 
          mentor.id === mentorId 
            ? { ...mentor, unread: 0 } 
            : mentor
        );
        setMentors(updatedMentors);
      } else {
        console.error('Failed to fetch messages');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };
  
  const handleMentorSelect = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    fetchMessages(mentor.id);
  };
  
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedMentor || sendingMessage) return;
    
    try {
      setSendingMessage(true);
      
      // Send the message via API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: selectedMentor.id,
          content: messageText,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Add new message to the messages list
        setMessages([...messages, data.message]);
        
        // Update last message in mentor list
        const updatedMentors = mentors.map(mentor => 
          mentor.id === selectedMentor.id 
            ? { 
                ...mentor, 
                lastMessage: messageText,
                lastMessageTime: data.message.timestamp
              } 
            : mentor
        );
        setMentors(updatedMentors);
        
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
  
  const filteredMentors = mentors.filter(mentor => 
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.email.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Show loading spinner when:
  // 1. Initial load before auth check
  // 2. User is authenticated as student but data is still loading
  if (!hasAuthChecked || (user?.role === 'student' && loading)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If we've checked auth and user is not a student, they should be redirected already
  if (hasAuthChecked && user?.role !== 'student') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Communicate with your mentors</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Mentor List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold">Mentors</CardTitle>
              <div className="relative mt-2">
                <input
                  type="text"
                  placeholder="Search mentors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                {filteredMentors.length > 0 ? (
                  filteredMentors.map((mentor) => (
                    <div 
                      key={mentor.id} 
                      onClick={() => handleMentorSelect(mentor)}
                      className={`p-3 rounded-md cursor-pointer ${
                        selectedMentor?.id === mentor.id 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                          {mentor.unread && mentor.unread > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white">{mentor.unread}</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-gray-900">{mentor.name}</p>
                            {mentor.lastMessageTime && (
                              <span className="text-xs text-gray-500">
                                {formatTime(mentor.lastMessageTime)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{mentor.lastMessage}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 p-6 text-center">
                    <Inbox className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-gray-500">No mentors match your search</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Message Area */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            {selectedMentor ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <CardTitle>{selectedMentor.name}</CardTitle>
                      <CardDescription>{selectedMentor.email}</CardDescription>
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
                <h3 className="text-xl font-medium text-gray-700 mb-2">Select a mentor to message</h3>
                <p className="text-gray-500 max-w-md">
                  Choose a mentor from the list to start messaging. You can message any mentor who is assigned to you.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 