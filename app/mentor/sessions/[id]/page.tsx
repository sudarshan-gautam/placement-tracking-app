'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { 
  Calendar, 
  MapPin, 
  User,
  ArrowLeft,
  Edit
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
  approvalStatus?: string;
}

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch session details from API
        const response = await fetch(`/api/mentor/sessions/${params.id}`, {
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
      } catch (error) {
        console.error('Error fetching session details:', error);
        setError('Failed to load session details. Please try again later.');
        
        // For demo purposes, create sample data if API fails
        if (params.id) {
          const sampleSession: Session = {
            id: params.id,
            displayId: 1,
            title: 'Sample Session',
            description: 'This is a sample session description.',
            date: '2023-10-15',
            location: 'Virtual Classroom',
            status: 'planned',
            student: { id: 1, name: 'John Doe' },
            approvalStatus: 'pending'
          };
          setSession(sampleSession);
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
  
  // Approval status badge style
  const getApprovalStatusBadgeStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
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
            onClick={() => router.push('/mentor/sessions')}
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
            onClick={() => router.push('/mentor/sessions')}
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
          href="/mentor/sessions" 
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
            href={`/mentor/sessions/${session.id}/edit`}
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
              {session.approvalStatus && (
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getApprovalStatusBadgeStyle(session.approvalStatus)}`}>
                  {session.approvalStatus.charAt(0).toUpperCase() + session.approvalStatus.slice(1)}
                </span>
              )}
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
                  <p>{formatDate(session.date)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <p>{session.location}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Student</h3>
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <p>{session.student.name}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{session.description}</p>
            </div>

            {session.approvalStatus === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-red-800 mb-1">Rejection Reason</h3>
                <p className="text-red-700">This session was rejected by an administrator. Please edit the details and resubmit.</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 flex justify-end">
          <Link
            href={`/mentor/sessions/${session.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit Session
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 