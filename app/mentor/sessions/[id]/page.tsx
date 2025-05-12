'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  MapPin, 
  User,
  ArrowLeft,
  Edit,
  Award,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/lib/auth-context';

interface Session {
  id: string;
  displayId?: number;
  title: string;
  description: string;
  date: string;
  location: string;
  status: string;
  student: {
    id: number | string;
    name: string;
  };
  verification_status?: string;
  feedback?: string;
  verified_by_name?: string | null;
}

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
        
        // Set initial feedback if available
        if (data.session.feedback) {
          setFeedback(data.session.feedback);
        }
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
            verification_status: 'pending'
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
  
  // Render verification status badge
  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
          <CheckCircle className="h-3 w-3 mr-1" />Verified
        </Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
          <XCircle className="h-3 w-3 mr-1" />Rejected
        </Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
          <AlertCircle className="h-3 w-3 mr-1" />Pending
        </Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
          Not Submitted
        </Badge>;
    }
  };

  // Handle verification
  const handleVerification = async (status: 'verified' | 'rejected') => {
    if (!user || !session) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Prepare auth header and request body
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };
      
      const body = JSON.stringify({
        session_id: session.id,
        verification_status: status,
        feedback: feedback.trim() || undefined
      });
      
      // Submit verification
      const response = await fetch('/api/verifications/sessions', {
        method: 'POST',
        headers,
        body
      });
      
      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status} ${response.statusText}`);
      }
      
      // Update local state
      const updatedSession = { 
        ...session, 
        verification_status: status, 
        feedback: feedback,
        verified_by_name: user.name
      };
      
      setSession(updatedSession);
      
      // Show success message
      toast({
        title: status === 'verified' ? "Session Verified" : "Session Rejected",
        description: status === 'verified' 
          ? "The session has been successfully verified." 
          : "The session has been rejected with feedback.",
        variant: "default"
      });
      
    } catch (error) {
      console.error("Verification error:", error);
      setError("Failed to submit verification. Please try again.");
      
      toast({
        title: "Verification Error",
        description: "There was a problem submitting your verification.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/mentor/sessions')}
          className="flex items-center space-x-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sessions</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Session Main Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">{session.title}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {renderStatusBadge(session.verification_status)}
                  </p>
                </div>
                <Badge variant="secondary">
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-muted-foreground mt-1">{session.description || "No description provided."}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Date: {formatDate(session.date)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Location: {session.location}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Student: {session.student.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Verification Section */}
          <Card>
            <CardHeader>
              <CardTitle>Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea 
                    id="feedback"
                    placeholder="Provide feedback for the student about this session..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="mt-1"
                    rows={4}
                    disabled={session.verification_status === 'verified' || session.verification_status === 'rejected'}
                  />
                </div>
                
                {session.verification_status === 'pending' && (
                  <div className="flex space-x-2 justify-end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={submitting}>
                          {submitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Session?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reject this session? The student will be notified and will need to make changes based on your feedback.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleVerification('rejected')}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Reject
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="default" disabled={submitting}>
                          {submitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Verify
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Verify Session?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to verify this session? This action confirms that the student completed this session as described.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleVerification('verified')}
                          >
                            Verify
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
                
                {session.verification_status !== 'pending' && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">
                        {session.verification_status === 'verified' ? 'Verified' : 'Rejected'} by: {session.verified_by_name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push(`/mentor/sessions/${session.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Session
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push(`/mentor/students/${session.student.id}`)}
              >
                <User className="mr-2 h-4 w-4" />
                View Student Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 