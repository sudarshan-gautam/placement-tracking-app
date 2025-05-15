'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { User, Send, Search, Clock, MessageCircle, Inbox } from 'lucide-react';
import { messageNotificationManager } from '@/components/layout/message-notification';

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
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [recipientSearchQuery, setRecipientSearchQuery] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<Mentor | null>(null);
  const [newMessageRecipients, setNewMessageRecipients] = useState<Mentor[]>([]);

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
      
      // Try to get student ID directly (using a student user for this example)
      const studentId = '3f7dea92698c531dd7bcc8a0f79d44c9'; // Default student user ID
      
      // Use direct API endpoint to get assigned mentors
      const response = await fetch(`/api/student-direct/mentors?studentId=${studentId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Student mentors data received:', data);
        
        // Get conversation data for each mentor to find latest messages and unread counts
        const conversationsResponse = await fetch(`/api/student-direct/conversations?studentId=${studentId}`);
        if (conversationsResponse.ok) {
          const conversationsData = await conversationsResponse.json();
          const conversations = conversationsData.conversations || [];
          console.log('Student conversations data received:', conversations);
          
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
      console.log(`Fetching messages for mentor ID: ${mentorId}`);
      
      // Try to get student ID directly (using a student user for this example)
      const studentId = '3f7dea92698c531dd7bcc8a0f79d44c9'; // Default student user ID
      
      // Use direct API endpoint
      const response = await fetch(`/api/student-direct/messages?studentId=${studentId}&mentorId=${mentorId}`);
      
      console.log('Direct messages fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Direct messages fetch: Found ${data.messages?.length || 0} messages`);
        setMessages(data.messages || []);
        
        // Mark messages as read in the mentor list
        const updatedMentors = mentors.map(mentor => 
          mentor.id === mentorId 
            ? { ...mentor, unread: 0 } 
            : mentor
        );
        setMentors(updatedMentors);
        
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
      
      // Try to get student ID directly (using a student user for this example)
      const studentId = '3f7dea92698c531dd7bcc8a0f79d44c9'; // Default student user ID
      
      // Use direct API endpoint for sending messages
      const response = await fetch('/api/student-direct/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: studentId,
          mentorId: selectedMentor.id,
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
        
        // Notify the message notification component to update
        messageNotificationManager.notifyUpdate();
      } else {
        const errorData = await response.json();
        console.error('Failed to send message:', errorData.error);
        alert('Failed to send message: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. See console for details.');
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

  // Function to start a new conversation
  const handleStartNewConversation = async () => {
    if (!selectedRecipient) return;
    
    // Set the selected mentor and close the modal
    handleMentorSelect(selectedRecipient);
    setShowNewMessageModal(false);
    setSelectedRecipient(null);
    setRecipientSearchQuery('');
  };

  // When New Message button is clicked
  const handleNewMessageClick = () => {
    // Use the existing mentors list
    setNewMessageRecipients(mentors);
    setShowNewMessageModal(true);
  };

  // Filter recipients by search query
  const filteredRecipients = newMessageRecipients.filter(mentor => 
    mentor.name.toLowerCase().includes(recipientSearchQuery.toLowerCase()) ||
    mentor.email.toLowerCase().includes(recipientSearchQuery.toLowerCase())
  );

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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with your mentors</p>
        </div>
        <button
          onClick={handleNewMessageClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <MessageCircle className="h-5 w-5" />
          New Message
        </button>
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

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">New Message</h3>
              <p className="text-gray-500 text-sm">Select a mentor to start a conversation</p>
            </div>
            
            <div className="p-6 border-b">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search mentors..."
                  value={recipientSearchQuery}
                  onChange={(e) => setRecipientSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div className="overflow-y-auto flex-grow">
              <div className="p-2 space-y-1">
                {filteredRecipients.length > 0 ? (
                  filteredRecipients.map((mentor) => (
                    <div 
                      key={mentor.id} 
                      onClick={() => setSelectedRecipient(mentor)}
                      className={`p-3 rounded-md cursor-pointer ${
                        selectedRecipient?.id === mentor.id 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-gray-900">{mentor.name}</p>
                          <p className="text-sm text-gray-500">{mentor.email}</p>
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