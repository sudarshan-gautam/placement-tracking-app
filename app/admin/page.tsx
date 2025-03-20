'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User, Settings, Shield, Users, ClipboardCheck, Bell, BarChart2, Server, Plus } from 'lucide-react';
import { LineChart, ResponsiveContainer, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Link from 'next/link';
import { useState } from 'react';
import { VerificationReviewModal } from '@/components/ui/verification-review-modal';

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
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [verificationList, setVerificationList] = useState<VerificationRequest[]>(() => {
    // Check if we have saved verification data in localStorage
    const savedVerifications = typeof window !== 'undefined' ? localStorage.getItem('verificationList') : null;
    
    // If we have saved data, use it; otherwise use the default
    return savedVerifications ? JSON.parse(savedVerifications) : verificationRequests;
  });

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
  const handleApproveVerification = (id: number, feedback: string) => {
    // Update the verification status
    const updatedList = verificationList.map(v => 
      v.id === id ? { ...v, status: 'approved' } : v
    );
    
    // Update state and save to localStorage
    setVerificationList(updatedList);
    localStorage.setItem('verificationList', JSON.stringify(updatedList));
    
    setIsReviewModalOpen(false);
    
    // Show success message
    if (feedback) {
      alert(`Verification #${id} has been approved\nFeedback: ${feedback}`);
    } else {
      alert(`Verification #${id} has been approved`);
    }
  };

  // Handle reject verification
  const handleRejectVerification = (id: number, reason: string) => {
    // Update the verification status
    const updatedList = verificationList.map(v => 
      v.id === id ? { ...v, status: 'rejected' } : v
    );
    
    // Update state and save to localStorage
    setVerificationList(updatedList);
    localStorage.setItem('verificationList', JSON.stringify(updatedList));
    
    setIsReviewModalOpen(false);
    
    // Show rejection message
    alert(`Verification #${id} has been rejected\nReason: ${reason}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* 1. HEADER SECTION */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user?.name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-gray-600" />
              )}
            </div>
            <div>
              <p className="text-xl font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OVERVIEW METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <User className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120</div>
            <p className="text-xs text-gray-500">+15% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <BarChart2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-gray-500">+8 today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-gray-500">6 high priority</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Server className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Healthy</div>
            <p className="text-xs text-gray-500">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. USER ACTIVITY CHART */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">User Activity</h2>
          <div className="flex space-x-2">
            <button className={getButtonStyle('monthly')} onClick={() => handlePeriodChange('monthly')}>Monthly</button>
            <button className={getButtonStyle('weekly')} onClick={() => handlePeriodChange('weekly')}>Weekly</button>
            <button className={getButtonStyle('daily')} onClick={() => handlePeriodChange('daily')}>Daily</button>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getActivityData()}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="registrations" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="verifications" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. VERIFICATION QUEUE */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Verifications</h2>
          <div className="flex space-x-2">
            <button className={getVerificationButtonStyle('all')} onClick={() => handleVerificationFilterChange('all')}>All</button>
            <button className={getVerificationButtonStyle('qualification')} onClick={() => handleVerificationFilterChange('qualification')}>Qualifications</button>
            <button className={getVerificationButtonStyle('competency')} onClick={() => handleVerificationFilterChange('competency')}>Competencies</button>
            <button className={getVerificationButtonStyle('session')} onClick={() => handleVerificationFilterChange('session')}>Sessions</button>
          </div>
        </div>
        
        {getFilteredVerifications().length === 0 ? (
          <div className="text-center py-8">
            <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No verifications</h3>
            <p className="mt-1 text-sm text-gray-500">There are no pending verifications in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredVerifications().map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.user}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${request.priority === 'High' ? 'bg-red-100 text-red-800' : 
                          request.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {request.status === 'pending' ? 'Pending' : 
                        request.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.status === 'pending' ? (
                        <button 
                          className="text-blue-600 hover:text-blue-900" 
                          onClick={() => handleReviewClick(request.id)}
                        >
                          Review
                        </button>
                      ) : (
                        <button 
                          className="text-blue-600 hover:text-blue-900" 
                          onClick={() => handleReviewClick(request.id)}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Review Modal */}
        <VerificationReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          verification={selectedVerification}
          onApprove={handleApproveVerification}
          onReject={handleRejectVerification}
        />
      </div>

      {/* 5 & 6. RECENT ACTIVITIES AND USER MANAGEMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* RECENT ACTIVITIES */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Recent Activities</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-md hover:bg-gray-50">
                <div className={`p-2 rounded-full 
                  ${activity.type === 'User' ? 'bg-blue-100 text-blue-600' : 
                    activity.type === 'System' ? 'bg-green-100 text-green-600' : 
                    'bg-purple-100 text-purple-600'}`}>
                  {activity.type === 'User' ? <User className="h-5 w-5" /> : 
                   activity.type === 'System' ? <Server className="h-5 w-5" /> : 
                   <Shield className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.details}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* USER MANAGEMENT */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">User Overview</h2>
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Search users..." 
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">Search</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.joined}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-900">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 7 & 8. SYSTEM HEALTH AND QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SYSTEM HEALTH */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-6">System Health</h2>
          <div className="space-y-4">
            {systemMetrics.map((metric) => (
              <div key={metric.id} className="flex items-center justify-between p-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full mr-3 
                    ${metric.status === 'good' ? 'bg-green-500' : 
                      metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">{metric.name}</span>
                </div>
                <span className="text-sm text-gray-500">{metric.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200">
              View Detailed Report
            </button>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/users/new" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                <span>Add User</span>
              </div>
            </Link>
            
            <Link href="/admin/roles" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-500" />
                <span>Modify Roles</span>
              </div>
            </Link>
            
            <Link href="/admin/reset-password" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
              <div className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-500" />
                <span>Reset Credentials</span>
              </div>
            </Link>
            
            <Link href="/admin/resources" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
              <div className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-green-500" />
                <span>Update Resources</span>
              </div>
            </Link>
            
            <Link href="/admin/templates" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
              <div className="flex items-center">
                <ClipboardCheck className="h-5 w-5 mr-2 text-green-500" />
                <span>Manage Templates</span>
              </div>
            </Link>
            
            <Link href="/admin/reports" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
              <div className="flex items-center">
                <Server className="h-5 w-5 mr-2 text-green-500" />
                <span>Generate Reports</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 