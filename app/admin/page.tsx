'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  description?: string;
  attachments?: string[];
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
    activeSessions: number;
    pendingVerifications: number;
    highPriorityCount: number;
  };
  chartData: {
    usersByMonth: any[];
  };
  applicationsByStatus: any[];
  recentActivities: Activity[];
  recentUsers: UserData[];
  systemMetrics: {
    id: number;
    name: string;
    value: string;
    status: string;
  }[];
}

// Sample data for charts
const monthlyActivityData = [
  { name: 'Jan', registrations: 65, sessions: 28, verifications: 15 },
  { name: 'Feb', registrations: 59, sessions: 48, verifications: 22 },
  { name: 'Mar', registrations: 80, sessions: 40, verifications: 24 },
  { name: 'Apr', registrations: 81, sessions: 47, verifications: 28 },
  { name: 'May', registrations: 56, sessions: 36, verifications: 20 },
  { name: 'Jun', registrations: 55, sessions: 27, verifications: 15 },
  { name: 'Jul', registrations: 40, sessions: 32, verifications: 17 }
];

const weeklyActivityData = [
  { name: 'Week 1', registrations: 25, sessions: 18, verifications: 8 },
  { name: 'Week 2', registrations: 32, sessions: 22, verifications: 10 },
  { name: 'Week 3', registrations: 28, sessions: 20, verifications: 12 },
  { name: 'Week 4', registrations: 35, sessions: 25, verifications: 15 }
];

const dailyActivityData = [
  { name: 'Mon', registrations: 8, sessions: 6, verifications: 3 },
  { name: 'Tue', registrations: 10, sessions: 8, verifications: 4 },
  { name: 'Wed', registrations: 12, sessions: 7, verifications: 5 },
  { name: 'Thu', registrations: 9, sessions: 5, verifications: 3 },
  { name: 'Fri', registrations: 11, sessions: 9, verifications: 4 },
  { name: 'Sat', registrations: 6, sessions: 4, verifications: 2 },
  { name: 'Sun', registrations: 4, sessions: 3, verifications: 1 }
];

// Sample verification requests
const verificationRequests: VerificationRequest[] = [
  { 
    id: 1, 
    type: 'Qualification', 
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
    type: 'Competency', 
    title: 'Classroom Management', 
    user: 'John Doe', 
    date: '2023-07-14', 
    priority: 'Medium',
    description: 'Demonstrated effective classroom management skills during student teaching placement at Springfield Elementary.',
    status: 'pending'
  },
  { 
    id: 3, 
    type: 'Session', 
    title: 'Primary School Teaching', 
    user: 'Alice Johnson', 
    date: '2023-07-13', 
    priority: 'Low',
    description: 'Completed a teaching session with 3rd grade students focusing on mathematics fundamentals.',
    status: 'pending'
  },
  { 
    id: 4, 
    type: 'Qualification', 
    title: 'Teaching Degree', 
    user: 'Bob Wilson', 
    date: '2023-07-12', 
    priority: 'High',
    description: 'Bachelor of Education from University of Teaching Excellence, specialized in Secondary Education.',
    attachments: ['TeachingDegree.pdf', 'TranscriptSpring2023.pdf'],
    status: 'pending'
  }
];

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
      activeSessions: 0,
      pendingVerifications: 0,
      highPriorityCount: 0
    },
    chartData: {
      usersByMonth: []
    },
    applicationsByStatus: [],
    recentActivities: [],
    recentUsers: [],
    systemMetrics: []
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/dashboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
        
        // Fetch verifications
        const verificationResponse = await fetch('/api/admin/verifications');
        
        if (!verificationResponse.ok) {
          throw new Error('Failed to fetch verifications');
        }
        
        const verificationData = await verificationResponse.json();
        setVerificationList(verificationData);
        
        // Fetch users
        const userResponse = await fetch('/api/admin/users');
        
        if (!userResponse.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const userData = await userResponse.json();
        setFilteredUsers(userData as UserData[]);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [toast]);

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
    setVerificationFilter(filter.toLowerCase());
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
    return verificationList.filter(request => {
      // Filter by type
      const matchesType = verificationFilter === 'all' || 
                         request.type.toLowerCase() === verificationFilter;
      
      // Filter by status
      const matchesStatus = statusFilter === 'all' || 
                          request.status.toLowerCase() === statusFilter;
      
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
      const response = await fetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
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
      const response = await fetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
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
    if (!userSearchQuery.trim()) {
      // If the search query is empty, reset to the original list
      fetch('/api/admin/users')
        .then(res => res.json())
        .then(data => setFilteredUsers(data as UserData[]))
        .catch(error => {
          console.error('Error fetching users:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch users',
            variant: 'destructive'
          });
        });
      return;
    }
    
    // Filter users by name or email
    const query = userSearchQuery.toLowerCase();
    const filtered = filteredUsers.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query)
    );
    
    setFilteredUsers(filtered);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <h3 className="text-3xl font-bold">{dashboardData.stats.totalUsers}</h3>
                    <p className="text-xs text-gray-500">+15% from last month</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                    <h3 className="text-3xl font-bold">{dashboardData.stats.activeSessions}</h3>
                    <p className="text-xs text-gray-500">+8 today</p>
                  </div>
                  <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Verifications</p>
                    <h3 className="text-3xl font-bold">{dashboardData.stats.pendingVerifications}</h3>
                    <p className="text-xs text-gray-500">{dashboardData.stats.highPriorityCount} high priority</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-50 rounded-full flex items-center justify-center">
                    <ClipboardCheck className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">System Health</p>
                    <h3 className="text-3xl font-bold">Healthy</h3>
                    <p className="text-xs text-gray-500">All systems operational</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center">
                    <Server className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
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
                      dataKey="sessions" 
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        onClick={() => handleVerificationFilterChange('competency')}
                        className={getVerificationButtonStyle('competency')}
                      >
                        Competencies
                      </button>
                      <button 
                        onClick={() => handleVerificationFilterChange('session')}
                        className={getVerificationButtonStyle('session')}
                      >
                        Sessions
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
                        {getFilteredVerifications().slice(0, 4).map((request) => (
                          <tr key={request.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-4 py-3">{request.type}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {request.title}
                            </td>
                            <td className="px-4 py-3">{request.user}</td>
                            <td className="px-4 py-3">
                              {/* Date display removed */}
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
                        ))}
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
              
              {/* System Health Section */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.systemMetrics.map((metric) => (
                      <div key={metric.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`h-3 w-3 rounded-full mr-2 
                            ${metric.status === 'good' 
                              ? 'bg-green-500' 
                              : metric.status === 'warning' 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                            }`}
                          ></div>
                          <span className="text-sm text-gray-700">{metric.name}</span>
                        </div>
                        <span className="text-sm font-medium">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link 
                      href="/admin/system"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center"
                    >
                      View Detailed Report
                    </Link>
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