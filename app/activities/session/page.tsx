'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Users, BookOpen, Filter, Plus, FileText, Award, User, Upload } from 'lucide-react';
import { AGE_GROUPS } from '@/types/session';
import { ClientOnly } from '@/components/ui/client-only';

interface TeachingActivity {
  id: number;
  date: string;
  timeSpent: string;
  ageGroup: string;
  organization: string;
  topic: string;
  positives: string;
  developments: string;
  supervisorFeedback: string;
  status: 'completed' | 'pending';
}

const TeachingActivities = () => {
  const [activities, setActivities] = useState<TeachingActivity[]>([
    {
      id: 1,
      date: '2025-02-13',
      timeSpent: '120',
      ageGroup: 'Primary (7-11)',
      organization: 'Springfield Elementary',
      topic: 'Introduction to Fractions',
      positives: 'Strong student engagement, effective use of visual aids',
      developments: 'Could include more group activities',
      supervisorFeedback: 'Good lesson structure and time management',
      status: 'completed'
    }
  ]);

  const [showNewActivityForm, setShowNewActivityForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowNewActivityForm(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Teaching Activities
        </h1>
        <p className="text-gray-600">Track and manage your teaching activities</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Hours</p>
                <p className="text-2xl font-bold">48.5</p>
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
                <p className="text-2xl font-bold">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <BookOpen className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Total Activities</p>
                <p className="text-2xl font-bold">15</p>
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
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Activity Form */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add New Teaching Activity</CardTitle>
          <button
            onClick={() => setShowNewActivityForm(!showNewActivityForm)}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            {showNewActivityForm ? 'Cancel' : 'Add Activity'}
          </button>
        </CardHeader>
        {showNewActivityForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date/Time</label>
                  <input
                    type="datetime-local"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time Spent (minutes)</label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter time in minutes"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age Group</label>
                  <select 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select age group</option>
                    {AGE_GROUPS.map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Organization</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter organization name"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Topic</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter activity topic"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Positives</label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter key positives from the activity"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Developments</label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter areas for development"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Action Plan</label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter your action plan"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Supporting Evidence</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, Images up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setShowNewActivityForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Activity List */}
      <Card className="mb-28">
        <CardHeader>
          <CardTitle>Teaching Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{activity.topic}</h3>
                    <p className="text-sm text-gray-500">{activity.organization}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activity.status === 'completed' ? 'Completed' : 'Pending Review'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Date</div>
                      <p className="font-medium">{activity.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Duration</div>
                      <p className="font-medium">{activity.timeSpent} mins</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Age Group</div>
                      <p className="font-medium">{activity.ageGroup}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <div className="text-xs text-gray-500">What Went Well</div>
                    <p className="text-sm text-gray-600">{activity.positives}</p>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Areas for Development</div>
                    <p className="text-sm text-gray-600">{activity.developments}</p>
                  </div>
                  {activity.supervisorFeedback && (
                    <div>
                      <div className="text-xs text-gray-500">Supervisor Feedback</div>
                      <p className="text-sm text-gray-600">{activity.supervisorFeedback}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Link 
                    href={`/activities/session/${activity.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View Details
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link 
                    href={`/activities/session/${activity.id}/edit`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer navigation */}
      <div className="fixed bottom-16 inset-x-0 bg-white py-4 border-t border-gray-200 z-40">
        <div className="max-w-4xl mx-auto px-4 flex justify-between">
          <Link href="/activities" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <FileText className="h-6 w-6" />
            <span className="text-xs">Activities</span>
          </Link>
          <Link href="/activities/new" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <Plus className="h-6 w-6" />
            <span className="text-xs">Add New</span>
          </Link>
          <Link href="/activities/session" className="flex flex-col items-center text-blue-600">
            <BookOpen className="h-6 w-6" />
            <span className="text-xs">Teaching Activities</span>
          </Link>
          <Link href="/documents" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <FileText className="h-6 w-6" />
            <span className="text-xs">Documents</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <User className="h-6 w-6" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeachingActivities; 