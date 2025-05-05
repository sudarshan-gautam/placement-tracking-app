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
  User,
  Edit,
  Book,
  Award,
  Folder
} from 'lucide-react';
import Link from 'next/link';
import { 
  initActivitiesData, 
  getAllActivities,
  changeActivityStatus,
  Activity,
  getActivityStats
} from '@/lib/activities-service';

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

// Sample student data for admin/mentor filtering
const students = [
  { id: 0, name: 'All Students' },
  { id: 1, name: 'Alice Johnson' },
  { id: 2, name: 'Bob Smith' },
  { id: 3, name: 'Charlie Davis' },
];

export default function ActivitiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState(0); // Default to "All Students"
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    totalActivities: 0,
    pendingActivities: 0,
    verifiedActivities: 0,
    activityTypes: 0
  });
  
  // Create a mock user for demo purposes if none exists
  const mockUser = user || { id: 1, role: 'student', name: 'Student User' };
  
  const isAdmin = mockUser?.role === 'admin';
  const isMentor = mockUser?.role === 'mentor';
  const isStudent = mockUser?.role === 'student';
  const canApprove = isAdmin || isMentor;

  // Initialize activities data from localStorage
  useEffect(() => {
    // Force initialization of activities data in localStorage
    initActivitiesData();
    
    // Force reload of activities from localStorage
    const loadedActivities = getAllActivities();
    setActivities(loadedActivities);
    
    // Update statistics
    const activityStats = getActivityStats();
    setStats(activityStats);
    
    console.log(`Loaded ${loadedActivities.length} activities from localStorage`);
  }, []);

  // Filter activities based on search, filter criteria, and user role
  const filteredActivities = activities.filter((activity) => {
    // If student, only show their activities
    if (isStudent) {
      // For demo purposes, show all activities for student role
      // In a real app, we'd filter by user ID: activity.studentId === mockUser?.id
      console.log(`Student filtering: user ID=${mockUser?.id}, studentId=${activity.studentId}`);
      return true; // Show all activities for now
    }

    // Filter by student for admin/mentor
    if (canApprove && studentFilter !== 0 && activity.studentId !== studentFilter) {
      return false;
    }

    const matchesSearch = 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Function to handle activity approval (for admin/mentor)
  const handleApproveActivity = (id: number) => {
    // Update activity status in localStorage
    const updatedActivity = changeActivityStatus(id, 'verified');
    if (updatedActivity) {
      // Refresh the activities list
      setActivities(getAllActivities());
      
      // Update statistics
      const activityStats = getActivityStats();
      setStats(activityStats);
    }
  };

  // Function to handle activity rejection (for admin/mentor)
  const handleRejectActivity = (id: number) => {
    const reason = prompt('Please enter a reason for rejection:');
    if (reason) {
      // Update activity status in localStorage with rejection reason
      const updatedActivity = changeActivityStatus(id, 'rejected', reason);
      if (updatedActivity) {
        // Refresh the activities list
        setActivities(getAllActivities());
        
        // Update statistics
        const activityStats = getActivityStats();
        setStats(activityStats);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Folder className="h-8 w-8" />
            Professional Activities
          </h1>
          <p className="text-gray-600">
            {canApprove 
              ? 'Manage and approve professional development activities' 
              : 'Track and manage your professional development activities'
            }
          </p>
          <div className="mt-2 flex space-x-2">
            <Link href="/activities" className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium bg-blue-100 text-blue-800">
              Activities
            </Link>
            <Link href="/sessions" className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">
              Teaching Sessions
            </Link>
          </div>
        </div>
        <Link 
          href="/activities/new" 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Activity
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Folder className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Activities</p>
                <p className="text-2xl font-bold">{stats.totalActivities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Verified</p>
                <p className="text-2xl font-bold">{stats.verifiedActivities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Book className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Activity Types</p>
                <p className="text-2xl font-bold">{stats.activityTypes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlarmClock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pendingActivities}</p>
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
              placeholder="Search activities by title, type, mentor..."
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Type Filter */}
          <div>
            <select
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {activityTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
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
              {statusFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>{filter.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {canApprove ? 'All Professional Activities' : 'Your Professional Activities'}
          </h2>
        </div>
        
        {filteredActivities.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{activity.title}</h3>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(activity.status)}
                    <Link href={`/activities/${activity.id}`} className="text-blue-600 hover:text-blue-800">
                      <Edit className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Date: {new Date(activity.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      Duration: {activity.duration}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Book className="h-4 w-4 mr-2 text-gray-400" />
                      Type: {activity.type}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      Student: {activity.student}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                
                {canApprove && activity.status === 'pending' && (
                  <div className="mt-4 flex space-x-2">
                    <button 
                      onClick={() => handleApproveActivity(activity.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejectActivity(activity.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                  </div>
                )}
                
                {activity.status === 'rejected' && activity.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 rounded-md">
                    <p className="text-sm font-medium text-red-800">Rejection reason:</p>
                    <p className="text-sm text-red-700">{activity.rejectionReason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">No activities found. Try adjusting your filters or create a new activity.</p>
          </div>
        )}
      </div>
    </div>
  );
} 