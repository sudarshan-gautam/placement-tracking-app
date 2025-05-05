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
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { 
  initActivitiesData, 
  getAllActivities,
  changeActivityStatus,
  Activity
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
    
    console.log(`Loaded ${loadedActivities.length} activities from localStorage`);
    console.log('Current user:', mockUser);
    console.log('User role:', mockUser?.role);
    console.log('Is student:', isStudent);
    console.log('Sample of loaded activities:', loadedActivities.slice(0, 2));
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
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {canApprove ? 'Activities Management' : 'My Activities'}
          </h1>
          <p className="text-gray-600">
            {canApprove 
              ? 'Manage and approve student activities' 
              : 'Track and manage your professional activities'}
          </p>
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
          
          {/* Type Filter or Student Filter (depending on role) */}
          <div>
            <div className="relative">
              {canApprove ? (
                <select
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(Number(e.target.value))}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              ) : (
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
              )}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Type Filter for Admin/Mentor */}
        {canApprove && (
          <div className="mt-4">
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
        )}
      </div>

      {/* Activity Statistics */}
      <div className="mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Activity Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Total Activities</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isStudent 
                    ? filteredActivities.length 
                    : activities.filter(a => studentFilter === 0 || a.studentId === studentFilter).length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-600 text-sm">Verified</p>
                <p className="text-3xl font-bold text-green-600">
                  {isStudent 
                    ? filteredActivities.filter(a => a.status === 'verified').length
                    : activities.filter(a => (studentFilter === 0 || a.studentId === studentFilter) && a.status === 'verified').length}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {isStudent 
                    ? filteredActivities.filter(a => a.status === 'pending').length
                    : activities.filter(a => (studentFilter === 0 || a.studentId === studentFilter) && a.status === 'pending').length}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-600 text-sm">Rejected</p>
                <p className="text-3xl font-bold text-red-600">
                  {isStudent 
                    ? filteredActivities.filter(a => a.status === 'rejected').length
                    : activities.filter(a => (studentFilter === 0 || a.studentId === studentFilter) && a.status === 'rejected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activities List */}
      <div className="space-y-6">
        {filteredActivities.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-1">No activities found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || (canApprove && studentFilter !== 0)
                ? 'Try adjusting your filters or search term'
                : 'Start by creating your first activity'}
            </p>
            {!(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || (canApprove && studentFilter !== 0)) && (
              <Link
                href="/activities/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Activity
              </Link>
            )}
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div key={activity.id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-1">
                    {activity.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {activity.date}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {activity.duration}
                    </span>
                    <span className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      {activity.type}
                    </span>
                    {canApprove && (
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {activity.student}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {getStatusBadge(activity.status)}
                  {!activity.reflectionCompleted && (
                    <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Reflection Needed
                    </span>
                  )}
                </div>
              </div>
              
              {activity.status === 'rejected' && (
                <div className="mb-4 p-3 bg-red-50 rounded-md text-sm text-red-700">
                  <p className="font-medium">Rejection Reason:</p>
                  <p>{activity.rejectionReason}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <Link 
                  href={`/activities/${activity.id}`} 
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  View Details
                </Link>
                
                {/* Admin/Mentor Actions */}
                {canApprove && activity.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveActivity(activity.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectActivity(activity.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                  </div>
                )}
                
                {/* Student Actions */}
                {isStudent && activity.status === 'pending' && !activity.reflectionCompleted && (
                  <Link 
                    href={`/activities/${activity.id}/reflection`} 
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Add Reflection
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 