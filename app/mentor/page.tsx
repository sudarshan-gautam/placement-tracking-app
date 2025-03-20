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
  User
} from 'lucide-react';
import Link from 'next/link';

// Sample data
const pendingVerifications = [
  {
    id: 1,
    student: 'John Smith',
    activity: 'Primary School Teaching Session',
    date: '2023-07-15',
    type: 'Teaching',
  },
  {
    id: 2,
    student: 'Emma Johnson',
    activity: 'Curriculum Planning Meeting',
    date: '2023-07-08',
    type: 'Planning',
  },
  {
    id: 3,
    student: 'Michael Wong',
    activity: 'Parent-Teacher Conference',
    date: '2023-07-20',
    type: 'Communication',
  },
];

const studentActivities = [
  {
    id: 1,
    student: 'John Smith',
    completed: 15,
    pending: 3,
    recent: 'Secondary Science Lesson',
  },
  {
    id: 2,
    student: 'Emma Johnson',
    completed: 12,
    pending: 2,
    recent: 'Professional Development Workshop',
  },
  {
    id: 3,
    student: 'Michael Wong',
    completed: 8,
    pending: 5,
    recent: 'Team Planning Session',
  },
  {
    id: 4,
    student: 'Sarah Taylor',
    completed: 20,
    pending: 1,
    recent: 'Assessment Review',
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: 'Student Progress Review',
    date: '2023-08-05',
    time: '10:00 AM - 12:00 PM',
  },
  {
    id: 2,
    title: 'Training Webinar',
    date: '2023-08-10',
    time: '2:00 PM - 3:30 PM',
  },
  {
    id: 3,
    title: 'Mentorship Program Meeting',
    date: '2023-08-15',
    time: '9:30 AM - 11:00 AM',
  },
];

export default function MentorDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated or not a mentor
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'mentor') {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  if (!user || user.role !== 'mentor') {
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
              <Link href="/mentor/calendar" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                View calendar
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
              <CardTitle className="text-xl font-bold">Pending Verifications</CardTitle>
              <Link href="/mentor/verifications" className="text-sm text-blue-600 hover:text-blue-800">
                View All
              </Link>
            </CardHeader>
            <CardContent>
              {pendingVerifications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Student</th>
                        <th className="px-6 py-3">Activity</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingVerifications.map((verification) => (
                        <tr key={verification.id} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {verification.student}
                          </td>
                          <td className="px-6 py-4">
                            {verification.activity}
                          </td>
                          <td className="px-6 py-4">
                            {new Date(verification.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            {verification.type}
                          </td>
                          <td className="px-6 py-4">
                            <Link href={`/activities/${verification.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                              Review
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6">No pending verifications to review.</p>
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
                {studentActivities.map((student) => (
                  <div key={student.id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                        <User className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.student}</p>
                        <p className="text-xs text-gray-500">Recent: {student.recent}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{student.completed}</p>
                        <p className="text-xs text-gray-500">Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{student.pending}</p>
                        <p className="text-xs text-gray-500">Pending</p>
                      </div>
                      <Link href={`/mentor/students/${student.id}`} className="ml-4">
                        <ArrowRight className="h-5 w-5 text-gray-400 hover:text-blue-600" />
                      </Link>
                    </div>
                  </div>
                ))}
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
              <Link href="/mentor/calendar" className="text-sm text-blue-600 hover:text-blue-800">
                View Calendar
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
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
                ))}
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
                <Link href="/activities/new" className="flex items-center p-3 bg-blue-50 rounded-md text-blue-700 hover:bg-blue-100">
                  <FileText className="h-5 w-5 mr-3" />
                  <span>Create New Activity</span>
                </Link>
                <Link href="/mentor/verifications" className="flex items-center p-3 bg-green-50 rounded-md text-green-700 hover:bg-green-100">
                  <CheckCircle className="h-5 w-5 mr-3" />
                  <span>Review Verifications</span>
                </Link>
                <Link href="/reports" className="flex items-center p-3 bg-purple-50 rounded-md text-purple-700 hover:bg-purple-100">
                  <BarChart2 className="h-5 w-5 mr-3" />
                  <span>Generate Reports</span>
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