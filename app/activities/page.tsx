'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Plus,
  FileText,
  Clock,
  Calendar,
  Check,
  X,
  Filter,
  Search,
  MoreVertical,
  CheckCircle,
  AlarmClock,
  XCircle,
  User
} from 'lucide-react';
import Link from 'next/link';

// Sample activity data
const activitiesData = [
  {
    id: 1,
    title: 'Primary School Teaching Session',
    date: '2023-07-15',
    duration: '2 hours',
    type: 'Teaching',
    status: 'verified' as 'verified' | 'pending' | 'rejected',
    reflectionCompleted: true,
    mentor: 'Dr. Jane Smith',
  },
  {
    id: 2,
    title: 'Curriculum Planning Meeting',
    date: '2023-07-20',
    duration: '1.5 hours',
    type: 'Planning',
    status: 'pending' as 'verified' | 'pending' | 'rejected',
    reflectionCompleted: false,
    mentor: 'Prof. Michael Johnson',
  },
  {
    id: 3,
    title: 'Parent-Teacher Conference',
    date: '2023-07-25',
    duration: '1 hour',
    type: 'Communication',
    status: 'verified' as 'verified' | 'pending' | 'rejected',
    reflectionCompleted: true,
    mentor: 'Dr. Jane Smith',
  },
  {
    id: 4,
    title: 'Resource Development Workshop',
    date: '2023-07-28',
    duration: '3 hours',
    type: 'Development',
    status: 'rejected' as 'verified' | 'pending' | 'rejected',
    reflectionCompleted: true,
    mentor: 'Prof. Michael Johnson',
    rejectionReason: 'Insufficient detail in evidence provided',
  },
  {
    id: 5,
    title: 'Secondary School Observation',
    date: '2023-08-02',
    duration: '4 hours',
    type: 'Observation',
    status: 'pending' as 'verified' | 'pending' | 'rejected',
    reflectionCompleted: true,
    mentor: 'Dr. Jane Smith',
  },
];

// Activity type options
const activityTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'Teaching', label: 'Teaching' },
  { value: 'Planning', label: 'Planning' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Development', label: 'Development' },
  { value: 'Observation', label: 'Observation' },
];

// Status filter options
const statusFilters = [
  { value: 'all', label: 'All Status' },
  { value: 'verified', label: 'Verified' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
];

export default function ActivitiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Filter activities based on search and filter criteria
  const filteredActivities = activitiesData.filter((activity) => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          activity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          activity.mentor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
    const matchesType = typeFilter === 'all' || activity.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Function to handle status badge color and text
  const getStatusBadge = (status: 'verified' | 'pending' | 'rejected') => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlarmClock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
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
          <h1 className="text-3xl font-bold text-gray-900">My Activities</h1>
          <p className="text-gray-600">Track and manage your professional activities</p>
        </div>
        <Link 
          href="/activities/new" 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Activity
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          {/* Status Filter */}
          <div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {statusFilters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Type Filter */}
          <div>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {activityTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow transition-shadow duration-200">
              <div className="p-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  <div className="mb-2 sm:mb-0">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900 mr-3">{activity.title}</h3>
                      {getStatusBadge(activity.status)}
                    </div>
                    <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(activity.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        {activity.duration}
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1 text-gray-400" />
                        {activity.type}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        {activity.mentor}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {activity.status === 'rejected' && (
                      <div className="mr-4 text-red-600 text-sm">
                        <div className="font-medium">Reason:</div>
                        <div>{activity.rejectionReason}</div>
                      </div>
                    )}
                    <Link 
                      href={`/activities/${activity.id}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
                
                {activity.status === 'pending' && !activity.reflectionCompleted && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-100 rounded-md p-3">
                    <p className="text-sm text-yellow-700">
                      You need to complete your reflection for this activity.
                      <Link href={`/activities/${activity.id}/reflect`} className="ml-2 font-medium hover:text-yellow-900">
                        Add Reflection
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <FileText className="h-full w-full" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No activities found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'Try changing your search filters to find activities.' 
                : 'Start by adding a new activity to your portfolio.'}
            </p>
            <div className="mt-6">
              <Link
                href="/activities/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Activity
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Stats Card */}
      {filteredActivities.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Activity Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Total Activities</p>
                <p className="text-2xl font-bold text-gray-900">{activitiesData.length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-600">Verified</p>
                <p className="text-2xl font-bold text-green-900">
                  {activitiesData.filter(a => a.status === 'verified').length}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {activitiesData.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-red-600">Rejected</p>
                <p className="text-2xl font-bold text-red-900">
                  {activitiesData.filter(a => a.status === 'rejected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 