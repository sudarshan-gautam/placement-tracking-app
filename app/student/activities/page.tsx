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
  Search,
  Filter,
  CheckCircle,
  AlarmClock,
  XCircle,
  Book,
  Award,
  Folder,
  PieChart,
  ChevronRight,
  BarChart,
  CheckSquare,
  User
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  getAllActivities,
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

export default function StudentActivitiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalActivities: 0,
    pendingActivities: 0,
    verifiedActivities: 0,
    activityTypes: 0,
    totalHours: 0
  });

  useEffect(() => {
    // Redirect if not a student
    if (user && user.role !== 'student') {
      if (user.role === 'mentor') {
        router.push('/mentor/activities');
      } else if (user.role === 'admin') {
        router.push('/admin/activities');
      } else {
        router.push('/');
      }
      return;
    }

    const fetchActivities = async () => {
      try {
        setLoading(true);
        
        // Fetch activities from API
        const studentActivities = await getAllActivities();
        setActivities(studentActivities);
        
        // Calculate hours from duration which could be string or number
        const totalHours = studentActivities.reduce((sum, activity) => {
          if (typeof activity.duration === 'number') {
            return sum + activity.duration;
          } else if (typeof activity.duration === 'string') {
            // Try to extract hours from strings like "2 hours" or "2h"
            const hours = parseInt(activity.duration.replace(/[^0-9]/g, ''));
            return sum + (isNaN(hours) ? 0 : hours);
          }
          return sum;
        }, 0);
        
        // Get activity stats and combine with total hours
        const activityStats = await getActivityStats(studentActivities);
        setStats({
          totalActivities: activityStats.totalActivities,
          pendingActivities: activityStats.pendingActivities,
          verifiedActivities: activityStats.verifiedActivities,
          activityTypes: activityStats.activityTypes,
          totalHours
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching activities:', error);
        toast({
          title: "Error",
          description: "Failed to load your activities. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user, router, toast]);

  // Filter activities based on search and filter criteria
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.type || activity.activity_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const activityStatus = activity.verification_status || activity.status;
    const activityType = activity.type || activity.activity_type;
    
    const matchesStatus = statusFilter === 'all' || activityStatus === statusFilter;
    const matchesType = typeFilter === 'all' || activityType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Function to handle status badge color and text
  const getStatusBadge = (activity: Activity) => {
    const status = activity.verification_status || activity.status;
    
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

  // Get activity type distribution for the pie chart
  const getActivityTypeCounts = () => {
    const typeCounts: { [key: string]: number } = {};
    activities.forEach(activity => {
      typeCounts[activity.type] = (typeCounts[activity.type] || 0) + 1;
    });
    return typeCounts;
  };

  const activityTypeCounts = getActivityTypeCounts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          <p className="mt-4 text-gray-600">Loading your activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Folder className="h-7 w-7 text-indigo-600" />
            My Professional Activities
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage your professional development activities
          </p>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">Total Activities</p>
                <p className="text-lg md:text-xl font-bold">{stats.totalActivities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">Verified</p>
                <p className="text-lg md:text-xl font-bold">{stats.verifiedActivities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <AlarmClock className="h-6 w-6 text-amber-600" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">Pending</p>
                <p className="text-lg md:text-xl font-bold">{stats.pendingActivities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">Total Hours</p>
                <p className="text-lg md:text-xl font-bold">{stats.totalHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Type Distribution */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">My Activity Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            {/* Basic visualization of activity types */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {Object.entries(activityTypeCounts).map(([type, count]) => (
                <div key={type} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div 
                    className="h-4 w-4 rounded-full mr-3"
                    style={{
                      backgroundColor: 
                        type === 'Teaching' ? '#3b82f6' :
                        type === 'Planning' ? '#10b981' :
                        type === 'Communication' ? '#f59e0b' :
                        type === 'Development' ? '#8b5cf6' :
                        type === 'Observation' ? '#ec4899' : '#6b7280'
                    }}
                  />
                  <div className="flex flex-1 justify-between">
                    <span className="font-medium">{type}</span>
                    <span className="text-gray-500">{count} activities</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col items-center">
              <PieChart className="h-24 w-24 text-indigo-500 mb-2" />
              <p className="text-sm text-gray-500">Activity Distribution</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center">
              View Detailed Analytics
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {/* Search */}
            <div className="sm:col-span-3 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search activities..."
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Type Filter */}
            <div className="relative">
              <select
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {activityTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <select
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusFilters.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">My Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActivities.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredActivities.map((activity) => (
                <Link 
                  key={activity.id} 
                  href={`/student/activities/${activity.id}`}
                  className="block hover:bg-gray-50 transition-colors rounded-md"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium text-gray-900">{activity.title}</h3>
                      <div className="flex items-center">
                        {getStatusBadge(activity)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-sm">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(activity.date || activity.date_completed).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        Duration: {typeof activity.duration_minutes !== 'undefined'
                          ? `${activity.duration_minutes} mins`
                          : activity.duration
                        }
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Book className="h-4 w-4 mr-2 text-gray-400" />
                        Type: {activity.type || activity.activity_type}
                      </div>
                      {(activity.status === 'verified' || activity.verification_status === 'verified') && (
                        <div className="flex items-center text-gray-500">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          Mentor: {
                            activity.verified_by_name || 
                            (typeof activity.mentor === 'string' 
                              ? activity.mentor 
                              : activity.mentor?.name || 'Unassigned')
                          }
                        </div>
                      )}
                    </div>
                    
                    {activity.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {activity.description}
                      </p>
                    )}
                    
                    <div className="flex justify-end">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? "Try adjusting your search filters."
                  : "Your activities will appear here when your mentors or admins assign them to you."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 