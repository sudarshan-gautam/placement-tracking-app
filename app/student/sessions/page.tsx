'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  FileText,
  Clock,
  Calendar,
  Users,
  BookOpen,
  Search,
  CheckCircle,
  AlarmClock,
  Info,
  School,
  GraduationCap,
  MapPin,
  ChevronRight,
  Clock4
} from 'lucide-react';
import { Session } from '@/types/session';
import { getAllSessions, getSessionStats, initSessionsData } from '@/lib/sessions-service';
import { useToast } from '@/components/ui/use-toast';

export default function StudentSessionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [pastSessions, setPastSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState({
    totalHours: '0',
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0
  });

  useEffect(() => {
    // Redirect if not a student
    if (user && user.role !== 'student') {
      router.push('/sessions');
      return;
    }

    const fetchSessions = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would fetch from API based on student ID
        // For now, we'll use the localStorage data and filter it
        initSessionsData();
        const allSessions = getAllSessions();
        
        // Filter for sessions where the student is enrolled
        // This is a placeholder implementation - in a real app you would filter by student ID
        const studentSessions = allSessions.filter(session => {
          return session.enrolledStudents?.some(student => student.id === user?.id) || true; // For demo purposes, show all
        });
        
        setSessions(studentSessions);
        
        // Split sessions into upcoming and past
        const now = new Date();
        const upcoming = studentSessions.filter(s => new Date(s.date) > now);
        const past = studentSessions.filter(s => new Date(s.date) <= now);
        
        setUpcomingSessions(upcoming);
        setPastSessions(past);
        
        // Calculate student-specific stats
        setStats({
          totalHours: studentSessions.reduce((total, session) => total + (parseInt(session.timeSpent || '0') / 60), 0).toFixed(1),
          totalSessions: studentSessions.length,
          completedSessions: past.length,
          upcomingSessions: upcoming.length
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching student sessions:', error);
        toast({
          title: "Error",
          description: "Failed to load your sessions. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user, router, toast]);

  // Filter sessions based on search and filter criteria
  const filteredUpcomingSessions = upcomingSessions.filter((session) => {
    const matchesSearch = 
      session.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || session.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredPastSessions = pastSessions.filter((session) => {
    const matchesSearch = 
      session.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || session.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Format date in a user-friendly way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to handle status badge display
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      case 'pending':
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <AlarmClock className="h-3 w-3 mr-1" />
            Upcoming
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlarmClock className="h-3 w-3 mr-1" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          <p className="mt-4 text-gray-600">Loading your sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 pb-32">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <School className="h-7 w-7 text-blue-600" />
          My Learning Sessions
        </h1>
        <p className="text-gray-600 mt-1">
          View your upcoming and past learning sessions
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">Total Hours</p>
                <p className="text-lg md:text-xl font-bold">{stats.totalHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">Upcoming</p>
                <p className="text-lg md:text-xl font-bold">{stats.upcomingSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">Completed</p>
                <p className="text-lg md:text-xl font-bold">{stats.completedSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-amber-600" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">Total Sessions</p>
                <p className="text-lg md:text-xl font-bold">{stats.totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search sessions by topic, location..."
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Upcoming Sessions */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold flex items-center">
              <AlarmClock className="mr-2 h-5 w-5 text-blue-600" />
              Upcoming Sessions
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUpcomingSessions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredUpcomingSessions.map((session) => (
                <Link 
                  key={session.id} 
                  href={`/student/sessions/${session.id}`}
                  className="block hover:bg-gray-50 transition-colors rounded-md"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{session.topic}</h3>
                      {getStatusBadge(session.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(session.date)}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {session.location || "Location TBD"}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock4 className="h-4 w-4 mr-2 text-gray-400" />
                        Duration: {parseInt(session.timeSpent || '60') / 60 < 1 
                          ? `${session.timeSpent || '60'} mins` 
                          : `${(parseInt(session.timeSpent || '60') / 60).toFixed(1)} hours`}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Info className="h-4 w-4 mr-2 text-gray-400" />
                        {session.mentor?.name ? `Mentor: ${session.mentor.name}` : "No mentor assigned"}
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-2">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming sessions</h3>
              <p className="mt-1 text-sm text-gray-500">You don't have any upcoming sessions scheduled.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Sessions */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
              Past Sessions
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPastSessions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredPastSessions.map((session) => (
                <Link 
                  key={session.id} 
                  href={`/student/sessions/${session.id}`}
                  className="block hover:bg-gray-50 transition-colors rounded-md"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{session.topic}</h3>
                      {getStatusBadge(session.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(session.date)}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {session.location || "No location specified"}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock4 className="h-4 w-4 mr-2 text-gray-400" />
                        Duration: {parseInt(session.timeSpent || '60') / 60 < 1 
                          ? `${session.timeSpent || '60'} mins` 
                          : `${(parseInt(session.timeSpent || '60') / 60).toFixed(1)} hours`}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Info className="h-4 w-4 mr-2 text-gray-400" />
                        {session.mentor?.name ? `Mentor: ${session.mentor.name}` : "No mentor assigned"}
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-2">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No past sessions</h3>
              <p className="mt-1 text-sm text-gray-500">You haven't attended any sessions yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 