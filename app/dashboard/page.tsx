'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, ResponsiveContainer, Line, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { User, Calendar, Award, BookOpen, Briefcase, CheckCircle, Clock, BookOpenCheck, FileText } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { QualificationModal } from '@/components/qualification-modal';
import { toast } from '@/components/ui/use-toast';
import { competencyData, activityChartData } from '@/lib/sample-data';

// Define types for our data
interface Activity {
  id: number;
  type: string;
  title: string;
  date: string;
  status: string;
}

interface Qualification {
  id: number;
  title: string;
  issuer: string;
  date: string;
  expiry: string | null;
}

interface Session {
  id: number;
  title: string;
  date: string;
  duration: number;
  type: string;
}

interface Competency {
  subject: string;
  self: number;
  benchmark: number;
}

interface Deadline {
  id: number;
  title: string;
  due: string;
}

interface DashboardData {
  activities: Activity[];
  qualifications: Qualification[];
  sessions: Session[];
  competencies: Competency[];
}

const DashboardPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [showQualificationModal, setShowQualificationModal] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    activities: [],
    qualifications: [],
    sessions: [],
    competencies: []
  });
  
  // Redirect admin and mentor users to their specific dashboards
  useEffect(() => {
    if (user) {
      // Only redirect if not already on the correct dashboard
      if (user.role === 'admin' && !pathname.startsWith('/admin')) {
        router.push('/admin');
      } else if (user.role === 'mentor' && !pathname.startsWith('/mentor')) {
        router.push('/mentor');
      }
    }
  }, [user, router, pathname]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Simulate API calls - in a real app, these would be actual API endpoints
        // const activitiesRes = await fetch('/api/student/activities');
        // const qualificationsRes = await fetch('/api/student/qualifications');
        // const sessionsRes = await fetch('/api/student/sessions');
        // const competenciesRes = await fetch('/api/student/competencies');
        
        // For now, using sample data
        setDashboardData({
          activities: sampleRecentActivities,
          qualifications: sampleQualifications,
          sessions: sampleSessions,
          competencies: sampleCompetencyData
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  // Use imported activity chart data
  const activityData = activityChartData;

  // Sample recent activities
  const sampleRecentActivities: Activity[] = [
    { id: 1, type: 'Session', title: 'Primary School Teaching', date: '2025-02-13', status: 'Completed' },
    { id: 2, type: 'Qualification', title: 'First Aid Certificate', date: '2025-02-12', status: 'Verified' },
    { id: 3, type: 'Competency', title: 'Leadership Assessment', date: '2025-02-11', status: 'In Progress' },
    { id: 4, type: 'Session', title: 'Special Needs Support', date: '2025-02-10', status: 'Planned' }
  ];

  // Sample qualifications
  const sampleQualifications: Qualification[] = [
    { id: 1, title: 'Bachelor of Education', issuer: 'University of Education', date: '2024-05-30', expiry: null },
    { id: 2, title: 'First Aid Certificate', issuer: 'Red Cross', date: '2025-01-15', expiry: '2026-01-15' }
  ];

  // Sample sessions
  const sampleSessions: Session[] = [
    { id: 1, title: 'Primary School Teaching', date: '2025-02-13', duration: 120, type: 'Classroom' },
    { id: 2, title: 'Special Needs Support', date: '2025-02-20', duration: 90, type: 'One-on-one' }
  ];

  // Use imported competency data
  const sampleCompetencyData: Competency[] = competencyData;

  // Sample upcoming deadlines
  const upcomingDeadlines: Deadline[] = [
    { id: 1, title: 'Submit Session Reflection', due: '2025-02-20' },
    { id: 2, title: 'Complete GDPR Training', due: '2025-03-01' },
    { id: 3, title: 'Certification Renewal', due: '2025-03-15' }
  ];

  // Add qualification handler
  const handleSaveQualification = (qualificationData: {
    name: string;
    issuingOrganization: string;
    dateCompleted: string;
    expiryDate?: string;
    certificateFile?: File;
  }) => {
    // Here you would normally send this data to your API
    console.log('Saving qualification:', qualificationData);
    
    // Show success message
    toast({
      title: "Qualification Added",
      description: "Your qualification has been submitted for verification"
    });
    
    setShowQualificationModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-40 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Practitioner Passport</h1>
        <p className="text-gray-600">Welcome back, {user?.name || 'Educator'}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <Award className="h-8 w-8 text-blue-600 mb-2" />
              <p className="text-2xl font-bold">{dashboardData.qualifications.length}</p>
              <p className="text-xs text-gray-500">Qualifications</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <Calendar className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-2xl font-bold">{dashboardData.sessions.length}</p>
              <p className="text-xs text-gray-500">Sessions</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{dashboardData.competencies.length}</p>
              <p className="text-xs text-gray-500">Competencies</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <Briefcase className="h-8 w-8 text-amber-600 mb-2" />
              <p className="text-2xl font-bold">86%</p>
              <p className="text-xs text-gray-500">Job Readiness</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Information Card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Development Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Course</p>
              <p className="font-medium">Bachelor of Education</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Graduation Year</p>
              <p className="font-medium">2025</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Specialization</p>
              <p className="font-medium">Primary Education</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Profile Completion</p>
              <p className="font-medium">85%</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Professional Development Goals</h4>
              <Link href="/action-plan" className="text-xs text-blue-600 hover:underline">
                View Plan
              </Link>
            </div>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Complete 10 teaching sessions</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-amber-500 mr-2" />
                <span className="text-sm">Obtain TESOL certification</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-amber-500 mr-2" />
                <span className="text-sm">Develop classroom management skills</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Development Progress */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Activity Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Development Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="sessions" stroke="#4F46E5" strokeWidth={2} />
                  <Line type="monotone" dataKey="competencies" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Competency Radar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Competency Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={sampleCompetencyData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} />
                  <Radar name="Self Assessment" dataKey="self" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.6} />
                  <Radar name="Benchmark" dataKey="benchmark" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and Upcoming Deadlines */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sampleRecentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <div className="flex items-center">
                      <p className="text-xs text-gray-500 mr-2">{activity.type}</p>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        activity.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        activity.status === 'Verified' ? 'bg-blue-100 text-blue-800' :
                        activity.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{activity.date}</p>
                </div>
              ))}
            </div>
            <Link href="/activities" className="mt-4 text-sm text-blue-600 hover:underline flex justify-end">
              View all activities
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-amber-500 mr-2" />
                    <p className="font-medium">{deadline.title}</p>
                  </div>
                  <p className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Due: {deadline.due}
                  </p>
                </div>
              ))}
            </div>
            <Link href="/action-plan" className="mt-4 text-sm text-blue-600 hover:underline flex justify-end">
              View full calendar
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Card */}
      <Card className="mb-28">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/sessions/new" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <Calendar className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm text-center">Record Session</span>
            </Link>
            <button 
              onClick={() => setShowQualificationModal(true)}
              className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 w-full"
            >
              <Award className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm text-center">Add Qualification</span>
            </button>
            <Link href="/competencies/assess" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <BookOpenCheck className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm text-center">Self-Assessment</span>
            </Link>
            <Link href="/documents" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm text-center">Documents</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Menu */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
        <div className="flex justify-around max-w-4xl mx-auto">
          <Link href="/dashboard" className="flex flex-col items-center text-blue-600">
            <User className="h-6 w-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/sessions" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <Calendar className="h-6 w-6" />
            <span className="text-xs">Sessions</span>
          </Link>
          <Link href="/qualifications" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <Award className="h-6 w-6" />
            <span className="text-xs">Qualifications</span>
          </Link>
          <Link href="/competencies" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <BookOpen className="h-6 w-6" />
            <span className="text-xs">Competencies</span>
          </Link>
        </div>
      </nav>
      
      {/* Add the QualificationModal */}
      <QualificationModal 
        isOpen={showQualificationModal}
        onClose={() => setShowQualificationModal(false)}
        onSave={handleSaveQualification}
      />
    </div>
  );
};

export default DashboardPage; 