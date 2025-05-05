'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent, ClickableCard } from '@/components/ui/card';
import { User, Settings, Shield, Users, ClipboardCheck, Bell, BarChart2, Server, Plus } from 'lucide-react';
import { LineChart, ResponsiveContainer, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { VerificationReviewModal } from '@/components/ui/verification-review-modal';
import { QuickActionsModal } from '@/components/ui/quick-actions-modal';
import { useToast } from '@/components/ui/use-toast';

// Define verification request type
interface VerificationRequest {
  id: number;
  type: string;
  title: string;
  user: string;
  date: string;
  priority: string;
  description: string;
  attachments: string[];
  status: string;
}

// Define activity type
interface Activity {
  id: number;
  type: string;
  action: string;
  details: string;
  time: string;
}

// Define user type for better type checking
interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
}

// Define dashboard data type
interface DashboardData {
  stats: {
    totalUsers: number;
    sessions: number;
    activities: number;
    pendingVerifications: number;
    highPriorityCount: number;
  };
  chartData: {
    usersByMonth: any[];
  };
  applicationsByStatus: any[];
  recentActivities: Activity[];
  recentUsers: UserData[];
}

// Sample data for charts
const monthlyActivityData = [
  { name: 'Jan', registrations: 65, activities: 28, verifications: 15 },
  { name: 'Feb', registrations: 59, activities: 48, verifications: 22 },
  { name: 'Mar', registrations: 80, activities: 40, verifications: 24 },
  { name: 'Apr', registrations: 81, activities: 47, verifications: 28 },
  { name: 'May', registrations: 56, activities: 36, verifications: 20 },
  { name: 'Jun', registrations: 55, activities: 27, verifications: 15 },
  { name: 'Jul', registrations: 40, activities: 32, verifications: 17 }
];

const weeklyActivityData = [
  { name: 'Week 1', registrations: 25, activities: 18, verifications: 8 },
  { name: 'Week 2', registrations: 32, activities: 22, verifications: 10 },
  { name: 'Week 3', registrations: 28, activities: 20, verifications: 12 },
  { name: 'Week 4', registrations: 35, activities: 25, verifications: 15 }
];

const dailyActivityData = [
  { name: 'Mon', registrations: 8, activities: 6, verifications: 3 },
  { name: 'Tue', registrations: 10, activities: 8, verifications: 4 },
  { name: 'Wed', registrations: 12, activities: 7, verifications: 5 },
  { name: 'Thu', registrations: 9, activities: 5, verifications: 3 },
  { name: 'Fri', registrations: 11, activities: 9, verifications: 4 },
  { name: 'Sat', registrations: 6, activities: 4, verifications: 2 },
  { name: 'Sun', registrations: 4, activities: 3, verifications: 1 }
];

// Function to get sample verifications with type safety - fix TypeScript errors
const getSampleVerifications = (): VerificationRequest[] => {
  const samples: VerificationRequest[] = [
    { 
      id: 1, 
      type: 'qualification', 
      title: 'First Aid Certificate', 
      user: 'Jane Smith', 
      date: '2023-07-15', 
      priority: 'High',
      description: 'Completed a First Aid and CPR training course with Red Cross. Certificate valid for 3 years.',
      attachments: ['FirstAidCert.pdf', 'CPR_Training_Completion.pdf'],
      status: 'pending'
    },
    { 
      id: 2, 
      type: 'activity', 
      title: 'Classroom Management', 
      user: 'John Doe', 
      date: '2023-07-14', 
      priority: 'Medium',
      description: 'Demonstrated effective classroom management skills during student teaching placement at Springfield Elementary.',
      attachments: [],
      status: 'pending'
    },
    { 
      id: 3, 
      type: 'session', 
      title: 'Primary School Teaching', 
      user: 'Alice Johnson', 
      date: '2023-07-13', 
      priority: 'Low',
      description: 'Completed a teaching session with 3rd grade students focusing on mathematics fundamentals.',
      attachments: [],
      status: 'pending'
    },
    { 
      id: 4, 
      type: 'profile', 
      title: 'Profile Verification', 
      user: 'Bob Wilson', 
      date: '2023-07-12', 
      priority: 'High',
      description: 'Student profile information verification request.',
      attachments: ['ID_Proof.pdf', 'Address_Proof.pdf'],
      status: 'pending'
    }
  ];
  return samples;
};

// Sample recent activities
const recentActivities = [
  { id: 1, type: 'User', action: 'New user registered', details: 'Jane Smith (jane.smith@example.com)', time: '2 hours ago' },
  { id: 2, type: 'System', action: 'Backup completed', details: 'Daily backup successful', time: '4 hours ago' },
  { id: 3, type: 'Admin', action: 'Role updated', details: 'Mark Johnson - Changed from Student to Mentor', time: 'Yesterday' },
  { id: 4, type: 'System', action: 'Update deployed', details: 'Version 1.2.3 deployed successfully', time: '3 days ago' }
];

// Sample users
const recentUsers = [
  { id: 1, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'student', status: 'active', joined: '2023-07-15' },
  { id: 2, name: 'John Doe', email: 'john.doe@example.com', role: 'mentor', status: 'active', joined: '2023-07-14' },
  { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', role: 'student', status: 'inactive', joined: '2023-07-10' }
];

// Sample system metrics
const systemMetrics = [
  { id: 1, name: 'Response Time', value: '120ms', status: 'good' },
  { id: 2, name: 'Error Rate', value: '0.5%', status: 'good' },
  { id: 3, name: 'Server Load', value: '42%', status: 'warning' }
];

// Dashboard card data
interface DashboardCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  bgColor: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [verificationList, setVerificationList] = useState<VerificationRequest[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof recentUsers[0] | null>(null);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {
      totalUsers: 0,
      sessions: 0,
      activities: 0,
      pendingVerifications: 0,
      highPriorityCount: 0
    },
    chartData: {
      usersByMonth: []
    },
    applicationsByStatus: [],
    recentActivities: [],
    recentUsers: []
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching admin dashboard data...');
        
        // Fetch verification data from API
        try {
          console.log('Fetching verification data from API');
          const verificationResponse = await fetch('/api/admin/verifications', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!verificationResponse.ok) {
            console.error('Verification API response not ok:', verificationResponse.status);
            throw new Error('Failed to fetch verifications');
          }
          
          const verificationData = await verificationResponse.json();
          console.log('Verification data received:', verificationData);
          
          // Format verification data to match VerificationRequest type
          const formattedVerifications: VerificationRequest[] = verificationData.map((v: any) => ({
            id: Number(v.id),
            type: v.type.toLowerCase(),
            title: v.title,
            user: v.user,
            date: v.date,
            priority: v.priority,
            description: v.description || '',
            attachments: v.attachments || [],
            status: v.status
          }));
          
          setVerificationList(formattedVerifications);
          console.log('Verification list updated with API data:', formattedVerifications.length, 'items');
        } catch (error) {
          console.error('Error fetching verifications from API - using sample data instead:', error);
          const sampleVerifications = getSampleVerifications();
          setVerificationList(sampleVerifications);
          console.log('Using sample verification data instead:', sampleVerifications.length, 'items');
        }
        
        // Fetch dashboard data from API
        try {
          const response = await fetch('/api/admin/dashboard', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            console.error('Dashboard API response not ok:', response.status);
            throw new Error('Failed to fetch dashboard data');
          }
          
          const data = await response.json();
          console.log('Dashboard data received:', data);
          
          // Update state with fetched data
          setDashboardData(data);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching dashboard data from API - using demo data instead:', error);
          // Use default data as fallback if API fails
          setDashboardData({
            stats: {
              totalUsers: 20,
              sessions: 40,
              activities: 42,
              pendingVerifications: 15,
              highPriorityCount: 4
            },
            chartData: {
              usersByMonth: []
            },
            applicationsByStatus: [],
            recentActivities: recentActivities,
            recentUsers: recentUsers
          });
          setIsLoading(false);
          console.log('Using default dashboard data instead');
        }
      } catch (error) {
        console.error('General error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch dashboard data on initial load
  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true);
      
      try {
        // Initial fetch of dashboard data
        await fetchDashboardData();
        
        // If no data was retrieved, fall back to sample data
        if (verificationList.length === 0) {
          console.log('No verification data retrieved, using sample data instead');
          setVerificationList(getSampleVerifications());
        }
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        
        // Fall back to sample data
        console.log('Falling back to sample verification data');
        setVerificationList(getSampleVerifications());
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeDashboard();
  }, []);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  // Determine the correct data based on selected period
  const getActivityData = () => {
    switch(selectedPeriod) {
      case 'weekly':
        return weeklyActivityData;
      case 'daily':
        return dailyActivityData;
      default:
        return monthlyActivityData;
    }
  };
  
  // Get active button style for the selected period
  const getButtonStyle = (period: string) => {
    return period === selectedPeriod 
      ? "px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md" 
      : "px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md";
  };

  // Handle verification filter change
  const handleVerificationFilterChange = (filter: string) => {
    console.log('Setting verification filter to:', filter);
    setVerificationFilter(filter.toLowerCase());
    
    // Force reload sample data when changing filters
    if (verificationList.length === 0) {
      console.log('Reloading sample verification data');
      setVerificationList(getSampleVerifications());
    }
  };

  // Get active button style for verification filters
  const getVerificationButtonStyle = (filter: string) => {
    return verificationFilter === filter.toLowerCase() 
      ? "px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md" 
      : "px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md";
  };

  // Handle status filter change
  const handleStatusFilterChange = (filter: string) => {
    setStatusFilter(filter.toLowerCase());
  };

  // Get active button style for status filters
  const getStatusButtonStyle = (filter: string) => {
    return statusFilter === filter.toLowerCase() 
      ? "px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md" 
      : "px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md";
  };

  // Filter verification requests based on selected filters
  const getFilteredVerifications = () => {
    // Handle empty verification list
    if (!verificationList || verificationList.length === 0) {
      console.log('No verification data available, using sample data');
      // Return sample data directly to ensure we always have something to display
      return getSampleVerifications().filter(request => {
        // Filter by type (case insensitive)
        const matchesType = 
          verificationFilter === 'all' || 
          (request.type && request.type.toLowerCase() === verificationFilter.toLowerCase());
        
        // Filter by status (case insensitive)
        const matchesStatus = 
          statusFilter === 'all' || 
          (request.status && request.status.toLowerCase() === statusFilter.toLowerCase());
        
        return matchesType && matchesStatus;
      });
    }
    
    console.log('Filtering verification list:', verificationList.length, 'items');
    console.log('Current filter - type:', verificationFilter, 'status:', statusFilter);
    
    return verificationList.filter(request => {
      if (!request) return false;
      
      // Filter by type (case insensitive)
      const matchesType = 
        verificationFilter === 'all' || 
        (request.type && request.type.toLowerCase() === verificationFilter.toLowerCase());
      
      // Filter by status (case insensitive)
      const matchesStatus = 
        statusFilter === 'all' || 
        (request.status && request.status.toLowerCase() === statusFilter.toLowerCase());
      
      console.log(`Request ${request.id} - type: ${request.type}, matches type: ${matchesType}, status: ${request.status}, matches status: ${matchesStatus}`);
      return matchesType && matchesStatus;
    });
  };

  // Handle review button click
  const handleReviewClick = (requestId: number) => {
    const verification = verificationList.find(v => v.id === requestId) || null;
    setSelectedVerification(verification);
    setIsReviewModalOpen(true);
  };

  // Handle approve verification
  const handleApproveVerification = async (id: number, feedback: string) => {
    try {
      // Get verification type from current data
      const verification = verificationList.find(v => v.id === id);
      if (!verification) {
        throw new Error(`Verification #${id} not found`);
      }
      
      const response = await fetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          type: verification.type,
          status: 'approved',
          feedback
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve verification');
      }
      
      // Update the verification list
      setVerificationList(prevList => 
        prevList.map(v => v.id === id ? { ...v, status: 'approved' } : v)
      );
      
      setIsReviewModalOpen(false);
      
      toast({
        title: 'Success',
        description: `Verification #${id} has been approved`,
        variant: 'default'
      });
      
      // After updating, refresh the dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error approving verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve verification',
        variant: 'destructive'
      });
    }
  };

  // Handle reject verification
  const handleRejectVerification = async (id: number, reason: string) => {
    try {
      // Get verification type from current data
      const verification = verificationList.find(v => v.id === id);
      if (!verification) {
        throw new Error(`Verification #${id} not found`);
      }
      
      const response = await fetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          type: verification.type,
          status: 'rejected',
          feedback: reason
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject verification');
      }
      
      // Update the verification list
      setVerificationList(prevList => 
        prevList.map(v => v.id === id ? { ...v, status: 'rejected' } : v)
      );
      
      setIsReviewModalOpen(false);
      
      toast({
        title: 'Success',
        description: `Verification #${id} has been rejected`,
        variant: 'default'
      });
      
      // After updating, refresh the dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject verification',
        variant: 'destructive'
      });
    }
  };

  // Handle user search
  const handleUserSearch = () => {
    console.log("Searching for users with query:", userSearchQuery);
    
    // Always fetch fresh data from API first if search empty
    if (!userSearchQuery.trim()) {
      setIsLoading(true);
      fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch users: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log("Fetched all users:", data);
          setFilteredUsers(data as UserData[]);
        })
        .catch(error => {
          console.error('Error fetching users:', error);
          // Fallback to dashboard data users
          setFilteredUsers(dashboardData.recentUsers || []);
          toast({
            title: 'Error',
            description: 'Failed to fetch users. Using cached data instead.',
            variant: 'destructive'
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
      return;
    }
    
    // Filter users by name or email - case insensitive searching
    setIsLoading(true);
    
    // First try to get all users from API so we have a complete list to search
    fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch users: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Fetched all users for search:", data);
        const allUsers = data as UserData[];
        
        // Now perform the search on this complete list
        const query = userSearchQuery.toLowerCase();
        const filtered = allUsers.filter(user => 
          (user.name && user.name.toLowerCase().includes(query)) || 
          (user.email && user.email.toLowerCase().includes(query))
        );
        
        console.log(`Found ${filtered.length} users matching query "${query}"`);
        setFilteredUsers(filtered);
      })
      .catch(error => {
        console.error('Error searching users:', error);
        
        // Fallback to filtering the existing users data we have
        console.log("Falling back to filtering existing user data");
        const query = userSearchQuery.toLowerCase();
        
        // Combine the dashboard recentUsers with the current filteredUsers for wider search
        const combinedUsersList = [...(dashboardData.recentUsers || []), ...filteredUsers];
        
        // Create a map to deduplicate by ID
        const userMap = new Map();
        combinedUsersList.forEach(user => {
          if (user) userMap.set(user.id, user);
        });
        
        // Convert map back to array and filter by search query
        const uniqueUsers = Array.from(userMap.values()) as UserData[];
        const filtered = uniqueUsers.filter(user => 
          (user.name && user.name.toLowerCase().includes(query)) || 
          (user.email && user.email.toLowerCase().includes(query))
        );
        
        console.log(`Found ${filtered.length} users matching query "${query}" in cached data`);
        setFilteredUsers(filtered);
        
        toast({
          title: 'Limited Search',
          description: 'Searching only in cached user data. Some results may be missing.',
          variant: 'default'
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Handle user edit
  const handleUserEdit = (userId: number) => {
    const userToEdit = recentUsers.find(u => u.id === userId);
    setSelectedUser(userToEdit || null);
    setIsUserEditModalOpen(true);
  };

  // Handle close user edit modal
  const handleCloseUserEditModal = () => {
    setIsUserEditModalOpen(false);
    setSelectedUser(null);
  };

  // Also add console logs to help debug on the frontend
  useEffect(() => {
    console.log('Current filters - type:', verificationFilter, 'status:', statusFilter);
    
    // This will force a re-render when filters change
    const filteredResults = getFilteredVerifications();
    console.log('Filtered results:', filteredResults.length);
  }, [verificationFilter, statusFilter]);

  // Create a reusable fetchDashboardData function
  const fetchDashboardData = async () => {
    try {
      console.log('Refreshing dashboard data...');
      // Fetch verification data from API
      try {
        const verificationResponse = await fetch('/api/admin/verifications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (verificationResponse.ok) {
          const verificationData = await verificationResponse.json();
          // Format verification data
          const formattedVerifications: VerificationRequest[] = verificationData.map((v: any) => ({
            id: Number(v.id),
            type: v.type.toLowerCase(),
            title: v.title,
            user: v.user,
            date: v.date,
            priority: v.priority,
            description: v.description || '',
            attachments: v.attachments || [],
            status: v.status
          }));
          
          setVerificationList(formattedVerifications);
        }
      } catch (error) {
        console.error('Error refreshing verification data:', error);
      }
      
      // Try to refresh dashboard stats
      try {
        const response = await fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Error refreshing dashboard data:', error);
      }
    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Display a loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Header Section - Removed */}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <ClickableCard href="/admin/users" className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.totalUsers}</div>
                <div className="absolute bottom-2 right-2 h-24 w-24 opacity-10">
                  <Users className="h-full w-full text-blue-600" />
                </div>
              </CardContent>
            </ClickableCard>
            
            <ClickableCard href="/admin/activities" className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Teaching Sessions</CardTitle>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <ClipboardCheck className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.sessions}</div>
                <div className="absolute bottom-2 right-2 h-24 w-24 opacity-10">
                  <ClipboardCheck className="h-full w-full text-green-600" />
                </div>
              </CardContent>
            </ClickableCard>
            
            <ClickableCard href="/admin/activities" className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Professional Activities</CardTitle>
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <BarChart2 className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.activities}</div>
                <div className="absolute bottom-2 right-2 h-24 w-24 opacity-10">
                  <BarChart2 className="h-full w-full text-purple-600" />
                </div>
              </CardContent>
            </ClickableCard>
            
            <ClickableCard href="/admin/verifications" className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.pendingVerifications}</div>
                <div className="absolute bottom-2 right-2 h-24 w-24 opacity-10">
                  <Shield className="h-full w-full text-amber-600" />
                </div>
              </CardContent>
            </ClickableCard>
          </div>
          
          {/* Chart */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Activity</CardTitle>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handlePeriodChange('daily')}
                  className={getButtonStyle('daily')}
                >
                  Daily
                </button>
                <button 
                  onClick={() => handlePeriodChange('weekly')}
                  className={getButtonStyle('weekly')}
                >
                  Weekly
                </button>
                <button 
                  onClick={() => handlePeriodChange('monthly')}
                  className={getButtonStyle('monthly')}
                >
                  Monthly
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getActivityData()}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="registrations" 
                      stroke="#2563EB" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="activities" 
                      stroke="#10B981" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="verifications" 
                      stroke="#F59E0B" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Verifications Section */}
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Verifications</CardTitle>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleVerificationFilterChange('all')}
                        className={getVerificationButtonStyle('all')}
                      >
                        All
                      </button>
                      <button 
                        onClick={() => handleVerificationFilterChange('qualification')}
                        className={getVerificationButtonStyle('qualification')}
                      >
                        Qualifications
                      </button>
                      <button 
                        onClick={() => handleVerificationFilterChange('session')}
                        className={getVerificationButtonStyle('session')}
                      >
                        Sessions
                      </button>
                      <button 
                        onClick={() => handleVerificationFilterChange('activity')}
                        className={getVerificationButtonStyle('activity')}
                      >
                        Activities
                      </button>
                      <button 
                        onClick={() => handleVerificationFilterChange('profile')}
                        className={getVerificationButtonStyle('profile')}
                      >
                        Profile
                      </button>
                    </div>
                  </div>
                  <div className="flex mt-4 space-x-2">
                    <button 
                      onClick={() => handleStatusFilterChange('all')}
                      className={getStatusButtonStyle('all')}
                    >
                      All Status
                    </button>
                    <button 
                      onClick={() => handleStatusFilterChange('pending')}
                      className={getStatusButtonStyle('pending')}
                    >
                      Pending
                    </button>
                    <button 
                      onClick={() => handleStatusFilterChange('approved')}
                      className={getStatusButtonStyle('approved')}
                    >
                      Approved
                    </button>
                    <button 
                      onClick={() => handleStatusFilterChange('rejected')}
                      className={getStatusButtonStyle('rejected')}
                    >
                      Rejected
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3">Type</th>
                          <th scope="col" className="px-4 py-3">Title</th>
                          <th scope="col" className="px-4 py-3">User</th>
                          <th scope="col" className="px-4 py-3">Date</th>
                          <th scope="col" className="px-4 py-3">Priority</th>
                          <th scope="col" className="px-4 py-3">Status</th>
                          <th scope="col" className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredVerifications().length > 0 ? (
                          getFilteredVerifications().slice(0, 4).map((request) => (
                            <tr key={request.id} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-4 py-3">{request.type}</td>
                              <td className="px-4 py-3 font-medium text-gray-900">
                                {request.title}
                              </td>
                              <td className="px-4 py-3">{request.user}</td>
                              <td className="px-4 py-3">
                                {typeof request.date === 'string' ? new Date(request.date).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-4 py-3">
                                <span 
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                                    ${request.priority === 'High' 
                                      ? 'bg-red-100 text-red-800' 
                                      : request.priority === 'Medium'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}
                                >
                                  {request.priority}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span 
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                                    ${request.status === 'pending' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : request.status === 'approved'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleReviewClick(request.id)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Review
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-white border-b">
                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                              No verifications found matching the selected filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Link href="/admin/verifications" className="text-sm text-blue-600 hover:text-blue-800">
                      View All Verifications →
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Activities Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start pb-4 last:pb-0 border-b last:border-0">
                        <div className={`mr-3 rounded-full p-2 
                          ${activity.type === 'User' 
                            ? 'bg-blue-100 text-blue-500' 
                            : activity.type === 'System' 
                              ? 'bg-green-100 text-green-500' 
                              : 'bg-purple-100 text-purple-500'
                          }`}
                        >
                          {activity.type === 'User' && <User className="h-4 w-4" />}
                          {activity.type === 'System' && <Server className="h-4 w-4" />}
                          {activity.type === 'Admin' && <Shield className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <span className="text-xs text-gray-500">
                              {typeof activity.time === 'string' && activity.time.includes('ago')
                                ? activity.time
                                : new Date(activity.time).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{activity.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <Link href="/admin/activity-log" className="text-sm text-blue-600 hover:text-blue-800">
                      View All Activity →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column */}
            <div>
              {/* User Overview Section */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>User Overview</CardTitle>
                    <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-800">
                      View All
                    </Link>
                  </div>
                  <div className="mt-2">
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="Search users..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUserSearch()}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <button 
                        onClick={handleUserSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-xs rounded"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredUsers.slice(0, 3).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 uppercase font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 text-xs rounded-full 
                            ${user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : user.role === 'mentor' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsUserEditModalOpen(true);
                            }}
                            className="ml-3 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    <Link href="/admin/users" className="flex items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <Users className="h-5 w-5" />
                      <span>Manage Users</span>
                    </Link>
                    <Link href="/admin/verifications" className="flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                      <ClipboardCheck className="h-5 w-5" />
                      <span>Review Verifications</span>
                    </Link>
                    <Link href="/admin/settings" className="flex items-center gap-2 p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
                      <Settings className="h-5 w-5" />
                      <span>System Settings</span>
                    </Link>
                    <button 
                      onClick={() => setIsQuickActionsOpen(true)}
                      className="flex items-center gap-2 p-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                      <span>More Actions</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Add modals */}
          {selectedVerification && (
            <VerificationReviewModal 
              isOpen={isReviewModalOpen}
              onClose={() => setIsReviewModalOpen(false)}
              verification={selectedVerification}
              onApprove={handleApproveVerification}
              onReject={handleRejectVerification}
            />
          )}
        </>
      )}

      {/* Add the QuickActionsModal */}
      <QuickActionsModal 
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
      />
    </div>
  );
} 