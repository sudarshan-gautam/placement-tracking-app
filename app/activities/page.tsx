'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Tag, FileText, Plus, Search, Filter, ChevronDown, ChevronUp, X, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

// Sample activity data
const activitiesData = [
  {
    id: 1,
    title: 'Primary School Teaching Session',
    type: 'Teaching',
    date: '2023-07-15',
    duration: 120,
    description: 'Taught a Year 3 class on basic mathematics concepts including addition, subtraction, and simple multiplication.',
    reflection: 'Students engaged well with the interactive elements. Need to work on pacing for future sessions.',
    status: 'completed',
    verified: true,
  },
  {
    id: 2,
    title: 'Classroom Management Workshop',
    type: 'Professional Development',
    date: '2023-07-10',
    duration: 180,
    description: 'Attended a workshop on effective classroom management techniques for primary school settings.',
    reflection: 'Learned valuable strategies for managing disruptive behavior. Will implement the "quiet signal" technique in my next session.',
    status: 'completed',
    verified: true,
  },
  {
    id: 3,
    title: 'Curriculum Planning Meeting',
    type: 'Planning',
    date: '2023-07-08',
    duration: 90,
    description: 'Participated in a team meeting to plan the science curriculum for the upcoming term.',
    reflection: 'Contributed ideas for hands-on experiments. Need to follow up with resources for the water cycle unit.',
    status: 'completed',
    verified: false,
  },
  {
    id: 4,
    title: 'Parent-Teacher Conference',
    type: 'Communication',
    date: '2023-07-20',
    duration: 30,
    description: 'Scheduled meeting with parents to discuss student progress and address any concerns.',
    reflection: '',
    status: 'planned',
    verified: false,
  },
];

// Activity types for filtering
const activityTypes = [
  'Teaching',
  'Professional Development',
  'Planning',
  'Communication',
  'Assessment',
  'Other',
];

export default function ActivitiesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    verified: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);

  const toggleActivityExpand = (activityId: number) => {
    setExpandedActivity(expandedActivity === activityId ? null : activityId);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      verified: '',
    });
  };

  // Filter activities based on search term and filters
  const filteredActivities = activitiesData.filter(activity => {
    // Search term filter
    if (searchTerm && !activity.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Type filter
    if (filters.type && activity.type !== filters.type) {
      return false;
    }
    
    // Status filter
    if (filters.status && activity.status !== filters.status) {
      return false;
    }
    
    // Verification filter
    if (filters.verified === 'verified' && !activity.verified) {
      return false;
    } else if (filters.verified === 'unverified' && activity.verified) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity Library</h1>
            <p className="text-gray-600">Plan, record, and reflect on your professional activities</p>
          </div>
          <Link
            href="/activities/new"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Activity
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search activities by title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
            {showFilters ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </button>
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Filter Activities</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Types</option>
                  {activityTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="planned">Planned</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification
                </label>
                <select
                  value={filters.verified}
                  onChange={(e) => handleFilterChange('verified', e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Listings */}
      <div className="space-y-6">
        {filteredActivities.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">No activities found matching your criteria.</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <Card key={activity.id} className="overflow-hidden">
              <div 
                className="cursor-pointer"
                onClick={() => toggleActivityExpand(activity.id)}
              >
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl font-bold">{activity.title}</CardTitle>
                    <div className="flex items-center mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        activity.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.status === 'completed' ? 'Completed' : 'Planned'}
                      </span>
                      {activity.verified && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {expandedActivity === activity.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(activity.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {activity.duration} minutes
                    </div>
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      {activity.type}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 line-clamp-2">
                    {activity.description}
                  </p>
                </CardContent>
              </div>

              {/* Expanded activity details */}
              {expandedActivity === activity.id && (
                <div className="border-t border-gray-200 px-6 py-4">
                  {activity.reflection && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Reflection</h3>
                      <p className="text-gray-700">{activity.reflection}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <div className="space-x-2">
                      <Link
                        href={`/activities/${activity.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </Link>
                      {activity.status !== 'completed' && (
                        <Link
                          href={`/activities/${activity.id}/edit`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                    <div className="flex space-x-4">
                      {activity.status === 'planned' && (
                        <button className="flex items-center text-green-600 hover:text-green-800">
                          <FileText className="h-4 w-4 mr-1" />
                          Mark as Completed
                        </button>
                      )}
                      {!activity.verified && activity.status === 'completed' && (
                        <button className="flex items-center text-blue-600 hover:text-blue-800">
                          <FileText className="h-4 w-4 mr-1" />
                          Request Verification
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 