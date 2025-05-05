'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { User, Send, Search, Clock, MessageCircle, Inbox } from 'lucide-react';
import Link from 'next/link';

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
      
      const response = await fetch('/api/mentor/students');
      
      if (response.ok) {
        const data = await response.json();
        
        // Get conversation data for each student to find latest messages and unread counts
        const conversationsResponse = await fetch('/api/messages');
        if (conversationsResponse.ok) {
          const conversationsData = await conversationsResponse.json();
          const conversations = conversationsData.conversations || [];
          
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
      const response = await fetch(`/api/messages?userId=${studentId}`);
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        
        // Mark messages as read in the student list
        const updatedStudents = assignedStudents.map(student => 
          student.id === studentId 
            ? { ...student, unread: 0 } 
            : student
        );
        setAssignedStudents(updatedStudents);
      } else {
        console.error('Failed to fetch messages');
        setMessages([]);
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
      
      // Send the message via API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: selectedStudent.id,
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Communicate with your assigned students</p>
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
    </div>
  );
} 