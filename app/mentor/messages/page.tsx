'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { User, Send, Search, Clock, MessageCircle, Inbox } from 'lucide-react';
import Link from 'next/link';
import { messageNotificationManager } from '@/components/layout/message-notification';

// Card components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// For API data types
interface Student {
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

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasAuthChecked, setHasAuthChecked] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [recipientSearchQuery, setRecipientSearchQuery] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<Student | null>(null);
  const [newMessageRecipients, setNewMessageRecipients] = useState<Student[]>([]);

  useEffect(() => {
    // Wait until user data is loaded before checking role
    if (user === null) return;
    
    setHasAuthChecked(true);
    
    // Only redirect if we have confirmed user is not a mentor
    if (user && user.role !== 'mentor') {
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'student') {
        router.push('/dashboard');
      }
      return;
    }
    
    // Only fetch data if user is a mentor
    if (user && user.role === 'mentor') {
      fetchAssignedStudents();
    }
  }, [user, router]);

  const fetchAssignedStudents = async () => {
    try {
      setLoading(true);
      
      // Get auth token from localStorage (keep for fallback)
      const token = localStorage.getItem('token');
      console.log('Auth token available:', !!token);
      
      // Try to get mentor ID directly (using a mentor user for this example)
      const mentorId = '2ac58f490d76ac1f49b42a714e742167'; // Default mentor user ID
      
      // Use direct API endpoint to get assigned students
      const response = await fetch(`/api/mentor-direct/students?mentorId=${mentorId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Mentor students data received:', data);
        
        // Get conversation data for each student to find latest messages and unread counts
        const conversationsResponse = await fetch(`/api/mentor-direct/conversations?mentorId=${mentorId}`);
        if (conversationsResponse.ok) {
          const conversationsData = await conversationsResponse.json();
          const conversations = conversationsData.conversations || [];
          console.log('Mentor conversations data received:', conversations);
          
          // Map the student data with conversation data
          const studentsWithMessageInfo = data.assignedStudents.map((student: any) => {
            // Find the conversation with this student
            const conversation = conversations.find(
              (c: any) => c.otherUserId === student.id
            );
            
            return {
              id: student.id,
              name: student.name,
              email: student.email,
              assignedDate: student.assignedDate,
              lastMessage: conversation ? conversation.content : 'No messages yet',
              lastMessageTime: conversation ? conversation.timestamp : student.assignedDate,
              unread: conversation ? conversation.unreadCount : 0
            };
          });
          
          setAssignedStudents(studentsWithMessageInfo);
        } else {
          // If conversations cannot be fetched, still show students without message data
          setAssignedStudents(data.assignedStudents.map((student: any) => ({
            ...student,
            lastMessage: 'No messages yet',
            lastMessageTime: student.assignedDate,
            unread: 0
          })));
        }
      } else {
        console.error('Failed to fetch assigned students');
        setAssignedStudents([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assigned students:', error);
      setLoading(false);
      setAssignedStudents([]);
    }
  };

  const fetchMessages = async (studentId: string) => {
    try {
      console.log(`Fetching messages for student ID: ${studentId}`);
      
      // Try to get mentor ID directly (using a mentor user for this example)
      const mentorId = '2ac58f490d76ac1f49b42a714e742167'; // Default mentor user ID
      
      // Use direct API endpoint
      const response = await fetch(`/api/mentor-direct/messages?mentorId=${mentorId}&studentId=${studentId}`);
      
      console.log('Direct messages fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Direct messages fetch: Found ${data.messages?.length || 0} messages`);
        setMessages(data.messages || []);
        
        // Mark messages as read in the student list
        const updatedStudents = assignedStudents.map(student => 
          student.id === studentId 
            ? { ...student, unread: 0 } 
            : student
        );
        setAssignedStudents(updatedStudents);
        
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
  
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    fetchMessages(student.id);
  };
  
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedStudent || sendingMessage) return;
    
    try {
      setSendingMessage(true);
      
      // Try to get mentor ID directly (using a mentor user for this example)
      const mentorId = '2ac58f490d76ac1f49b42a714e742167'; // Default mentor user ID
      
      // Use direct API endpoint for sending messages
      const response = await fetch('/api/mentor-direct/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mentorId: mentorId,
          studentId: selectedStudent.id,
          content: messageText,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Add new message to the messages list
        setMessages([...messages, data.message]);
        
        // Update last message in student list
        const updatedStudents = assignedStudents.map(student => 
          student.id === selectedStudent.id 
            ? { 
                ...student, 
                lastMessage: messageText,
                lastMessageTime: data.message.timestamp
              } 
            : student
        );
        setAssignedStudents(updatedStudents);
        
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
  
  const filteredStudents = assignedStudents.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
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
    
    // Set the selected student and close the modal
    handleStudentSelect(selectedRecipient);
    setShowNewMessageModal(false);
    setSelectedRecipient(null);
    setRecipientSearchQuery('');
  };

  // When New Message button is clicked
  const handleNewMessageClick = () => {
    // Use the existing assigned students list
    setNewMessageRecipients(assignedStudents);
    setShowNewMessageModal(true);
  };

  // Filter recipients by search query
  const filteredRecipients = newMessageRecipients.filter(student => 
    student.name.toLowerCase().includes(recipientSearchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(recipientSearchQuery.toLowerCase())
  );

  // Show loading spinner when:
  // 1. Initial load before auth check
  // 2. User is authenticated as mentor but data is still loading
  if (!hasAuthChecked || (user?.role === 'mentor' && loading)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If we've checked auth and user is not a mentor, they should be redirected already
  if (hasAuthChecked && user?.role !== 'mentor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with your assigned students</p>
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
        {/* Student List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold">Students</CardTitle>
              <div className="relative mt-2">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <div 
                      key={student.id} 
                      onClick={() => handleStudentSelect(student)}
                      className={`p-3 rounded-md cursor-pointer ${
                        selectedStudent?.id === student.id 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                          {student.unread && student.unread > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white">{student.unread}</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-gray-900">{student.name}</p>
                            {student.lastMessageTime && (
                              <span className="text-xs text-gray-500">
                                {formatTime(student.lastMessageTime)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{student.lastMessage}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 p-6 text-center">
                    <Inbox className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-gray-500">No students match your search</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Message Area */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            {selectedStudent ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <CardTitle>{selectedStudent.name}</CardTitle>
                      <CardDescription>{selectedStudent.email}</CardDescription>
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
                <h3 className="text-xl font-medium text-gray-700 mb-2">Select a student to message</h3>
                <p className="text-gray-500 max-w-md">
                  Choose a student from the list to start messaging. You can only message students who are assigned to you.
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
              <p className="text-gray-500 text-sm">Select a student to start a conversation</p>
            </div>
            
            <div className="p-6 border-b">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search students..."
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
                  filteredRecipients.map((student) => (
                    <div 
                      key={student.id} 
                      onClick={() => setSelectedRecipient(student)}
                      className={`p-3 rounded-md cursor-pointer ${
                        selectedRecipient?.id === student.id 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 p-6 text-center">
                    <Inbox className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-gray-500">No students match your search</p>
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