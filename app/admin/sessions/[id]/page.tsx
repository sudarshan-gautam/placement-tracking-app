'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { 
  Calendar, 
  MapPin, 
  User,
  ArrowLeft,
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

interface Session {
  id: string;
  displayId?: number;
  title: string;
  description: string;
  date: string;
  location: string;
  status: string;
  student: {
    id: number;
    name: string;
  };
  mentor?: {
    id: number;
    name: string;
  };
  enrolledStudents?: Array<{
    id: number;
    name: string;
  }>;
}

export default function AdminSessionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableStudents, setAvailableStudents] = useState<Array<{id: string, name: string}>>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    const fetchSessionDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch session details from API
        const response = await fetch(`/api/admin/sessions/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch session details');
        }
        
        const data = await response.json();
        setSession(data.session);
        
        // Fetch available students
        const studentsResponse = await fetch('/api/admin/students', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json'
          }
        }).catch(err => {
          console.error('Error fetching students:', err);
          return { ok: false, json: () => Promise.resolve({ students: [] }) };
        });
        
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          setAvailableStudents(studentsData.students || []);
        } else {
          // Fallback data
          setAvailableStudents([
            { id: '1', name: 'John Doe' },
            { id: '2', name: 'Jane Smith' },
            { id: '3', name: 'Alice Johnson' },
            { id: '4', name: 'Bob Wilson' },
            { id: '5', name: 'Charlie Brown' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching session details:', error);
        setError('Failed to load session details. Please try again later.');
        
        // For demo purposes, create sample data if API fails
        if (params.id) {
          const sampleSession: Session = {
            id: params.id,
            title: 'Sample Session',
            description: 'This is a sample session description.',
            date: '2023-10-15',
            location: 'Virtual Classroom',
            status: 'planned',
            student: { id: 1, name: 'John Doe' },
            mentor: { id: 1, name: 'Jane Smith' },
            enrolledStudents: [
              { id: 1, name: 'John Doe' },
              { id: 2, name: 'Jane Smith' },
              { id: 3, name: 'Alice Johnson' }
            ]
          };
          setSession(sampleSession);
          
          // Sample available students
          setAvailableStudents([
            { id: '1', name: 'John Doe' },
            { id: '2', name: 'Jane Smith' },
            { id: '3', name: 'Alice Johnson' },
            { id: '4', name: 'Bob Wilson' },
            { id: '5', name: 'Charlie Brown' },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionDetail();
  }, [params.id, toast]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle student enrollment
  const handleEnrollStudent = async () => {
    if (!selectedStudentId) {
      toast({
        title: 'Error',
        description: 'Please select a student to enroll',
        variant: 'destructive',
      });
      return;
    }
    
    setIsEnrolling(true);
    
    try {
      // Call API to add enrollment
      const response = await fetch(`/api/admin/sessions/${params.id}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentId: selectedStudentId })
      }).catch(err => {
        console.error('Error enrolling student:', err);
        return { ok: false, json: () => Promise.resolve({ success: false }) };
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update local session state
        setSession(prev => {
          if (!prev) return prev;
          
          const enrolledStudent = availableStudents.find(s => s.id === selectedStudentId);
          const newEnrolledStudents = prev.enrolledStudents || [];
          
          if (enrolledStudent && !newEnrolledStudents.some(s => s.id === Number(enrolledStudent.id))) {
            return {
              ...prev,
              enrolledStudents: [...newEnrolledStudents, { id: Number(enrolledStudent.id), name: enrolledStudent.name }]
            };
          }
          
          return prev;
        });
        
        toast({
          title: 'Success',
          description: 'Student has been enrolled in the session',
          variant: 'default',
        });
        
        setSelectedStudentId('');
      } else {
        throw new Error('Failed to enroll student');
      }
    } catch (error) {
      console.error('Error enrolling student:', error);
      toast({
        title: 'Error',
        description: 'Failed to enroll student',
        variant: 'destructive',
      });
      
      // For demo purposes
      const enrolledStudent = availableStudents.find(s => s.id === selectedStudentId);
      if (enrolledStudent) {
        setSession(prev => {
          if (!prev) return prev;
          const newEnrolledStudents = prev.enrolledStudents || [];
          
          if (!newEnrolledStudents.some(s => s.id === Number(enrolledStudent.id))) {
            return {
              ...prev,
              enrolledStudents: [...newEnrolledStudents, { id: Number(enrolledStudent.id), name: enrolledStudent.name }]
            };
          }
          
          return prev;
        });
        
        toast({
          title: 'Demo Mode',
          description: 'Student has been enrolled (simulated)',
          variant: 'default',
        });
        
        setSelectedStudentId('');
      }
    } finally {
      setIsEnrolling(false);
    }
  };
  
  // Handle removing enrollment
  const handleRemoveEnrollment = async (studentId: number) => {
    setIsRemoving(true);
    
    try {
      // Call API to remove enrollment
      const response = await fetch(`/api/admin/sessions/${params.id}/unenroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentId })
      }).catch(err => {
        console.error('Error removing enrollment:', err);
        return { ok: false, json: () => Promise.resolve({ success: false }) };
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update local session state
        setSession(prev => {
          if (!prev || !prev.enrolledStudents) return prev;
          
          return {
            ...prev,
            enrolledStudents: prev.enrolledStudents.filter(s => s.id !== studentId)
          };
        });
        
        toast({
          title: 'Success',
          description: 'Student has been removed from the session',
          variant: 'default',
        });
      } else {
        throw new Error('Failed to remove enrollment');
      }
    } catch (error) {
      console.error('Error removing enrollment:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove enrollment',
        variant: 'destructive',
      });
      
      // For demo purposes
      setSession(prev => {
        if (!prev || !prev.enrolledStudents) return prev;
        
        return {
          ...prev,
          enrolledStudents: prev.enrolledStudents.filter(s => s.id !== studentId)
        };
      });
      
      toast({
        title: 'Demo Mode',
        description: 'Student has been removed (simulated)',
        variant: 'default',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p>{error}</p>
          <button 
            onClick={() => router.push('/admin/sessions')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Return to Sessions
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
          <p>Session not found.</p>
          <button 
            onClick={() => router.push('/admin/sessions')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Sessions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link 
          href="/admin/sessions" 
          className="inline-flex items-center text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sessions
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold">Session Details</h1>
        <div className="mt-4 md:mt-0">
          <Link 
            href={`/admin/sessions/${session.id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Session
          </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">{session.title}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Session #{session.displayId || 'N/A'}</p>
            </div>
            <div className="flex gap-2">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeStyle(session.status)}`}>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date</h3>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <p>{session.date ? formatDate(session.date) : 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <p>{session.location || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Created For</h3>
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <p>{session.student.name || 'N/A'}</p>
                </div>
              </div>
              
              {session.mentor && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Created By</h3>
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <p>{session.mentor.name}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{session.description || 'No description provided.'}</p>
            </div>

            {/* Student Enrollment Management Section */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-4">
                Student Enrollment Management
                {session.enrolledStudents && (
                  <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-semibold text-white bg-blue-600 rounded-full">
                    {session.enrolledStudents.length}
                  </span>
                )}
              </h3>
              
              {/* Enrolled Students List */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Enrolled Students</h4>
                {session.enrolledStudents && session.enrolledStudents.length > 0 ? (
                  <ul className="space-y-2">
                    {session.enrolledStudents.map(student => (
                      <li key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>{student.name}</span>
                        <button
                          onClick={() => handleRemoveEnrollment(student.id)}
                          disabled={isRemoving}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No students enrolled yet.</p>
                )}
              </div>
              
              {/* Enroll New Student */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Enroll New Student</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a student</option>
                    {availableStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={handleEnrollStudent}
                    disabled={isEnrolling || !selectedStudentId}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEnrolling ? 'Enrolling...' : 'Enroll Student'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 