'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Plus,
  FileText,
  Clock,
  Calendar,
  Users,
  BookOpen,
  Search,
  Filter,
  CheckCircle,
  AlarmClock,
  XCircle,
  Edit
} from 'lucide-react';
import { Session, AGE_GROUPS } from '@/types/session';
import { getAllSessions, getSessionStats, initSessionsData } from '@/lib/sessions-service';
import { useRouter } from 'next/navigation';

export default function SessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ageGroupFilter, setAgeGroupFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({
    totalHours: '0',
    uniqueAgeGroups: 0,
    totalSessions: 0,
    pendingSessions: 0
  });
  const router = useRouter();

  // Create a mock user for demo purposes if none exists
  const mockUser = user || { id: 1, role: 'student', name: 'Student User' };
  
  const isAdmin = mockUser?.role === 'admin';
  const isMentor = mockUser?.role === 'mentor';
  const isStudent = mockUser?.role === 'student';

  // Redirect students to the student-specific view
  useEffect(() => {
    if (isStudent && typeof window !== 'undefined') {
      router.push('/student/sessions');
    }
  }, [isStudent, router]);

  // Initialize sessions data and load sessions
  useEffect(() => {
    initSessionsData();
    const loadedSessions = getAllSessions();
    setSessions(loadedSessions);
    
    // Update stats
    const sessionStats = getSessionStats();
    setStats(sessionStats);
    
    console.log(`Loaded ${loadedSessions.length} sessions`);
  }, []);

  // Filter sessions based on search and filter criteria
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = 
      session.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.ageGroup.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAgeGroup = !ageGroupFilter || session.ageGroup === ageGroupFilter;
    const matchesStatus = !statusFilter || session.status === statusFilter;
    
    return matchesSearch && matchesAgeGroup && matchesStatus;
  });

  // Function to handle status badge display
  const getStatusBadge = (status: 'completed' | 'pending') => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlarmClock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Teaching Sessions
          </h1>
          <p className="text-gray-600">
            Manage your structured teaching sessions with planning and reflection tools
          </p>
          <div className="mt-2 flex space-x-2">
            <Link href="/activities" className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">
              Activities
            </Link>
            <Link href="/sessions" className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium bg-blue-100 text-blue-800">
              Teaching Sessions
            </Link>
          </div>
        </div>
        <Link 
          href="/sessions/new" 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Hours</p>
                <p className="text-2xl font-bold">{stats.totalHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Age Groups</p>
                <p className="text-2xl font-bold">{stats.uniqueAgeGroups}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <BookOpen className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Total Sessions</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pendingSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search sessions by topic, organization..."
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Age Group Filter */}
          <div>
            <select
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={ageGroupFilter}
              onChange={(e) => setAgeGroupFilter(e.target.value)}
            >
              <option value="">All Age Groups</option>
              {AGE_GROUPS.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          {/* Status Filter */}
          <div>
            <select
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Teaching Sessions</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <div key={session.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{session.topic}</h3>
                  <div className="flex space-x-2">
                    {getStatusBadge(session.status)}
                    <Link 
                      href={`/sessions/${session.id}`} 
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Date: {new Date(session.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      Duration: {parseInt(session.timeSpent) / 60 < 1 
                        ? `${session.timeSpent} mins` 
                        : `${(parseInt(session.timeSpent) / 60).toFixed(1)} hours`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      Age Group: {session.ageGroup}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                      Organization: {session.organization}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">Key Positives:</h4>
                  <p className="text-sm text-gray-600 mt-1">{session.positives}</p>
                </div>
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700">Areas for Development:</h4>
                  <p className="text-sm text-gray-600 mt-1">{session.developments}</p>
                </div>
                {session.supervisorFeedback && session.supervisorFeedback !== 'Pending' && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700">Supervisor Feedback:</h4>
                    <p className="text-sm text-gray-600 mt-1">{session.supervisorFeedback}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">No sessions found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 