'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  FileText, 
  ChevronLeft, 
  CheckCircle, 
  AlarmClock,
  BookOpen,
  Download,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Separator } from '../../../types/separator';
import { Session } from '@/types/session';
import { getAllSessions } from '@/lib/sessions-service';

export default function StudentSessionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceConfirmed, setAttendanceConfirmed] = useState(false);

  useEffect(() => {
    // Redirect if not a student
    if (user && user.role !== 'student') {
      router.push(`/sessions/${params.id}`);
      return;
    }

    const fetchSessionDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, we would fetch from the API
        // For now, we'll use the localStorage data
        const allSessions = getAllSessions();
        const sessionData = allSessions.find(s => s.id === params.id);
        
        if (!sessionData) {
          setError('Session not found');
          setLoading(false);
          return;
        }
        
        setSession(sessionData);
        // Check if the session is in the past, if so mark attendance as confirmed
        if (new Date(sessionData.date) < new Date()) {
          setAttendanceConfirmed(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching session details:', error);
        setError('Failed to fetch session details');
        setLoading(false);
      }
    };

    fetchSessionDetail();
  }, [user, router, params.id]);

  const handleConfirmAttendance = () => {
    setAttendanceConfirmed(true);
    toast({
      title: "Attendance Confirmed",
      description: "Your attendance has been recorded for this session.",
    });
    // In a real implementation, we would call an API to update the database
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit' 
    });
  };

  // Function to determine status badge
  const getStatusBadge = (status: string, date: string) => {
    const sessionDate = new Date(date);
    const now = new Date();
    
    if (sessionDate < now) {
      if (status === 'completed') {
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
            <CheckCircle className="h-4 w-4 mr-2" />
            Attended
          </span>
        );
      }
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <AlarmClock className="h-4 w-4 mr-2" />
          Upcoming
        </span>
      );
    }
  };

  // Sample materials/resources
  const sessionMaterials = [
    { id: 1, name: 'Session Slides', type: 'PDF', url: '#' },
    { id: 2, name: 'Learning Activity Worksheet', type: 'DOCX', url: '#' },
    { id: 3, name: 'Additional Reading', type: 'Link', url: 'https://example.com/reading' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          <p className="mt-4 text-gray-600">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error || 'Session not found'}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/student/sessions')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 pb-32">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/student/sessions')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Sessions
        </Button>
      </div>

      {/* Session Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{session.topic}</h1>
            <p className="text-gray-600 mt-1">Session ID: {session.displayId || 'N/A'}</p>
          </div>
          <div>
            {getStatusBadge(session.status, session.date)}
          </div>
        </div>
      </div>

      {/* Session Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Session Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h3>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <p>{formatDate(session.date)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Duration</h3>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <p>
                  {parseInt(session.timeSpent || '60') / 60 < 1 
                    ? `${session.timeSpent || '60'} minutes` 
                    : `${(parseInt(session.timeSpent || '60') / 60).toFixed(1)} hours`}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <p>{session.location || 'No location specified'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Mentor</h3>
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <p>{session.mentor?.name || 'Not assigned'}</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Session Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{session.description || 'No description provided.'}</p>
          </div>

          {/* Attendance Confirmation Button */}
          {new Date(session.date) < new Date() && !attendanceConfirmed && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">Confirm Your Attendance</h3>
              <p className="text-blue-600 text-sm mb-4">Please confirm that you attended this session.</p>
              <Button onClick={handleConfirmAttendance}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Attendance
              </Button>
            </div>
          )}

          {attendanceConfirmed && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-medium text-green-800">Attendance Confirmed</h3>
              </div>
              <p className="text-green-600 text-sm mt-1">Your attendance for this session has been recorded.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Materials Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Session Materials</CardTitle>
        </CardHeader>
        <CardContent>
          {sessionMaterials.length > 0 ? (
            <div className="space-y-4">
              {sessionMaterials.map((material) => (
                <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{material.name}</p>
                      <p className="text-sm text-gray-500">{material.type}</p>
                    </div>
                  </div>
                  <a 
                    href={material.url} 
                    className="text-blue-600 hover:text-blue-800"
                    target={material.type === 'Link' ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                  >
                    {material.type === 'Link' ? (
                      <ExternalLink className="h-5 w-5" />
                    ) : (
                      <Download className="h-5 w-5" />
                    )}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No materials available</h3>
              <p className="mt-1 text-sm text-gray-500">No materials have been uploaded for this session yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="flex items-center justify-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message Mentor
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <FileText className="h-4 w-4 mr-2" />
              Add Notes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 