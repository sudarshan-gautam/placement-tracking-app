'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  Calendar, 
  FileText, 
  BarChart2, 
  MessageSquare, 
  ArrowRight,
  User,
  Search,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';

// Define TypeScript interface for verification data
interface Verification {
  id: number | string;
  student: string;
  activity: string;
  date: string;
  type?: string;
  priority?: string;
  description?: string;
}

// Define TypeScript interface for student activity data
interface StudentActivity {
  id: number | string;
  student: string;
  recent?: string;
  completed?: number;
  pending?: number;
}

// Define TypeScript interface for event data
interface Event {
  id: number | string;
  title: string;
  date: string;
  time?: string;
}

export default function MentorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingVerifications, setPendingVerifications] = useState<Verification[]>([]);
  const [studentActivities, setStudentActivities] = useState<StudentActivity[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedVerification, setExpandedVerification] = useState<number | string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated or not a mentor
    if (!user) {
      router.push('/');
    } else if (user.role !== 'mentor') {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pending verifications
        const verificationRes = await fetch('/api/mentor/verifications');
        if (verificationRes.ok) {
          const verificationData = await verificationRes.json();
          setPendingVerifications(Array.isArray(verificationData.pendingVerifications) ? verificationData.pendingVerifications : []);
        } else {
          console.error('Failed to fetch verifications');
          setPendingVerifications([]);
        }

        // Fetch student activities
        const activitiesRes = await fetch('/api/mentor/student-activities');
        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json();
          setStudentActivities(Array.isArray(activitiesData.studentActivities) ? activitiesData.studentActivities : []);
        } else {
          console.error('Failed to fetch student activities');
          setStudentActivities([]);
        }

        // Fetch upcoming events
        const eventsRes = await fetch('/api/mentor/events');
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setUpcomingEvents(Array.isArray(eventsData.events) ? eventsData.events : []);
        } else {
          console.error('Failed to fetch events');
          setUpcomingEvents([]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
        // Set empty arrays for all data to avoid null/undefined issues
        setPendingVerifications([]);
        setStudentActivities([]);
        setUpcomingEvents([]);
      }
    };

    if (user && user.role === 'mentor') {
      fetchData();
    }
  }, [user]);

  if (!user || user.role !== 'mentor' || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name || 'Mentor'}</h1>
        <p className="text-gray-600">Here's what's happening with your students today</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                <p className="text-2xl font-bold text-gray-900">{pendingVerifications.length}</p>
              </div>
            </div>
            <div className="mt-2">
              <Link href="/mentor/verifications" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                View all verifications
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Assigned Students</p>
                <p className="text-2xl font-bold text-gray-900">{studentActivities.length}</p>
              </div>
            </div>
            <div className="mt-2">
              <Link href="/mentor/students" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                View all students
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
              </div>
            </div>
            <div className="mt-2">
              <Link href="/mentor/sessions" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                View sessions
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Verifications */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl font-bold">Recent Verifications</CardTitle>
                <p className="text-sm text-gray-500">Review and manage verification requests</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/mentor/verifications" className="text-sm text-blue-600 hover:text-blue-800">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {/* Verifications List */}
              <div className="space-y-4">
                {pendingVerifications.length > 0 ? (
                  pendingVerifications.slice(0, 5).map((verification) => (
                    <div 
                      key={verification.id} 
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div 
                        className="p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => setExpandedVerification(expandedVerification === verification.id ? null : verification.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{verification.student}</h3>
                              <p className="text-sm text-gray-500">{verification.activity}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              {verification.priority || 'Low'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(verification.date).toLocaleDateString()}
                            </span>
                            <ChevronDown 
                              className={`h-5 w-5 text-gray-400 transition-transform ${
                                expandedVerification === verification.id ? 'transform rotate-180' : ''
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded View */}
                      {expandedVerification === verification.id && (
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Description</h4>
                              <p className="mt-1 text-sm text-gray-600">
                                {verification.description || `This is a ${verification.type || 'verification'} request.`}
                              </p>
                            </div>
                            <div className="flex justify-end space-x-3">
                              <Link
                                href={`/activities/${verification.id}`}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                              >
                                Review Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No pending verifications found</p>
                  </div>
                )}
              </div>

              {/* View All Link */}
              {pendingVerifications.length > 5 && (
                <div className="mt-4 text-center">
                  <Link 
                    href="/mentor/verifications" 
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                  >
                    View all {pendingVerifications.length} verifications
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Activities */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">Student Activities</CardTitle>
              <Link href="/mentor/students" className="text-sm text-blue-600 hover:text-blue-800">
                View All
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentActivities.length > 0 ? (
                  studentActivities.map((student) => (
                    <div key={student.id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.student}</p>
                          <p className="text-xs text-gray-500">Recent: {student.recent || 'No recent activity'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{student.completed || 0}</p>
                          <p className="text-xs text-gray-500">Completed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{student.pending || 0}</p>
                          <p className="text-xs text-gray-500">Pending</p>
                        </div>
                        <Link href={`/mentor/students/${student.id}`} className="ml-4">
                          <ArrowRight className="h-5 w-5 text-gray-400 hover:text-blue-600" />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No student activities found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">Upcoming Events</CardTitle>
              <Link href="/mentor/sessions" className="text-sm text-blue-600 hover:text-blue-800">
                View Sessions
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-md mr-4">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.date}</p>
                        <p className="text-xs text-gray-500">{event.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4">
                    <p className="text-gray-500">No upcoming events</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/activities" className="flex items-center p-3 bg-blue-50 rounded-md text-blue-700 hover:bg-blue-100">
                  <FileText className="h-5 w-5 mr-3" />
                  <span>Activities</span>
                </Link>
                <Link href="/mentor/verifications" className="flex items-center p-3 bg-green-50 rounded-md text-green-700 hover:bg-green-100">
                  <CheckCircle className="h-5 w-5 mr-3" />
                  <span>Review Verifications</span>
                </Link>
                <Link href="/mentor/students" className="flex items-center p-3 bg-purple-50 rounded-md text-purple-700 hover:bg-purple-100">
                  <Users className="h-5 w-5 mr-3" />
                  <span>View Students</span>
                </Link>
                <Link href="/mentor/messages" className="flex items-center p-3 bg-yellow-50 rounded-md text-yellow-700 hover:bg-yellow-100">
                  <MessageSquare className="h-5 w-5 mr-3" />
                  <span>Message Students</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 