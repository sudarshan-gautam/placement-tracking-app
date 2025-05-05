'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { 
  Calendar, 
  MapPin, 
  Check, 
  ArrowLeft,
  Loader2
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
  studentId: number;
  approvalStatus?: string;
}

interface Student {
  id: number;
  name: string;
}

export default function EditSessionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState<Session>({
    id: params.id,
    title: '',
    description: '',
    date: '',
    location: '',
    status: 'planned',
    studentId: 0,
    approvalStatus: 'pending'
  });

  useEffect(() => {
    const fetchSessionAndStudents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch session details from API
        const sessionResponse = await fetch(`/api/mentor/sessions/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!sessionResponse.ok) {
          throw new Error('Failed to fetch session details');
        }
        
        const sessionData = await sessionResponse.json();
        
        // Fetch students list
        const studentsResponse = await fetch('/api/mentor/students', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!studentsResponse.ok) {
          throw new Error('Failed to fetch students list');
        }
        
        const studentsData = await studentsResponse.json();
        setStudents(studentsData.students || []);
        
        // Set form data from session data
        setFormData({
          id: sessionData.session.id,
          title: sessionData.session.title,
          description: sessionData.session.description || '',
          date: sessionData.session.date,
          location: sessionData.session.location || '',
          status: sessionData.session.status,
          studentId: sessionData.session.student?.id || 0,
          approvalStatus: 'pending' // Reset to pending on edit
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load session details. Please try again later.');
        
        // For demo purposes, create sample data if API fails
        const sampleStudents = [
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Smith' },
          { id: 3, name: 'Alice Johnson' },
        ];
        setStudents(sampleStudents);
        
        const sampleSession = {
          id: params.id,
          title: 'Sample Session',
          description: 'This is a sample session description.',
          date: '2023-10-15',
          location: 'Virtual Classroom',
          status: 'planned',
          studentId: 1,
          approvalStatus: 'pending'
        };
        setFormData(sampleSession);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessionAndStudents();
  }, [params.id, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form
      if (!formData.title || !formData.studentId || !formData.date) {
        throw new Error('Please fill in all required fields');
      }

      // Send update request to API
      const response = await fetch(`/api/mentor/sessions/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          approvalStatus: 'pending' // Reset to pending on edit
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update session');
      }
      
      toast({
        title: 'Success',
        description: 'Session has been updated and is pending approval',
        variant: 'default',
      });
      
      // Redirect back to session details
      router.push(`/mentor/sessions/${params.id}`);
    } catch (error) {
      console.error('Error updating session:', error);
      setError(error instanceof Error ? error.message : 'Failed to update session');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update session',
        variant: 'destructive',
      });
      
      // For demo purposes, simulate successful update
      if (process.env.NODE_ENV !== 'production') {
        setTimeout(() => {
          toast({
            title: 'Demo Mode',
            description: 'Session has been updated (simulated)',
            variant: 'default',
          });
          router.push(`/mentor/sessions/${params.id}`);
        }, 1000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link 
          href={`/mentor/sessions/${params.id}`} 
          className="inline-flex items-center text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Session Details
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Session</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
          {formData.approvalStatus === 'pending' && (
            <p className="text-sm text-yellow-600 mt-1">
              This session will need to be approved by an administrator after editing.
            </p>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
                <p>{error}</p>
              </div>
            )}
            
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Math Workshop for Grade 5"
                  required
                />
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide details about the session content, objectives, etc."
                />
              </div>
              
              {/* Student Assignment */}
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Student *
                </label>
                <select
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Room 101, Computer Lab"
                    />
                  </div>
                </div>
              </div>
              
              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="planned">Planned</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link
              href={`/mentor/sessions/${params.id}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </span>
              )}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 