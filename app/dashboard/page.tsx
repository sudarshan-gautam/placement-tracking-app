'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, ResponsiveContainer, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { User, Calendar, Award, BookOpen } from 'lucide-react';
import { ClientOnly } from '@/components/ui/client-only';

const DashboardPage = () => {
  // Sample data for the activity chart
  const activityData = [
    { name: 'Week 1', sessions: 3 },
    { name: 'Week 2', sessions: 5 },
    { name: 'Week 3', sessions: 4 },
    { name: 'Week 4', sessions: 6 }
  ];

  // Sample recent activities
  const recentActivities = [
    { id: 1, type: 'Session', title: 'Primary School Teaching', date: '2025-02-13' },
    { id: 2, type: 'Qualification', title: 'First Aid Certificate', date: '2025-02-12' },
    { id: 3, type: 'Competency', title: 'Leadership Assessment', date: '2025-02-11' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Practitioner Passport</h1>
        <p className="text-gray-600">Welcome back, John Doe</p>
      </div>

      {/* User Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">John Doe</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">15 March 1998</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Course</p>
              <p className="font-medium">Education Studies</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Level</p>
              <p className="font-medium">Year 3</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#4F46E5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="mb-28">
        <CardHeader>
          <CardTitle>Latest Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.type}</p>
                </div>
                <p className="text-sm text-gray-500">{activity.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Menu */}
      <ClientOnly>
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex justify-around max-w-4xl mx-auto">
            <Link href="/dashboard" className="flex flex-col items-center text-blue-600">
              <User className="h-6 w-6" />
              <span className="text-xs">Home</span>
            </Link>
            <Link href="/qualifications" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
              <Award className="h-6 w-6" />
              <span className="text-xs">Qualifications</span>
            </Link>
            <Link href="/competencies" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
              <BookOpen className="h-6 w-6" />
              <span className="text-xs">Competencies</span>
            </Link>
            <Link href="/sessions" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
              <Calendar className="h-6 w-6" />
              <span className="text-xs">Sessions</span>
            </Link>
          </div>
        </nav>
      </ClientOnly>
    </div>
  );
};

export default DashboardPage; 