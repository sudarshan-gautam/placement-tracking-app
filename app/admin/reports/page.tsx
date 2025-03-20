'use client';

import { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { 
  FileSpreadsheet, Download, Calendar, RefreshCw, Filter
} from 'lucide-react';

// Sample data for reports
const userRegistrationData = [
  { month: 'Jan', students: 15, mentors: 3 },
  { month: 'Feb', students: 28, mentors: 5 },
  { month: 'Mar', students: 32, mentors: 7 },
  { month: 'Apr', students: 41, mentors: 6 },
  { month: 'May', students: 35, mentors: 4 },
  { month: 'Jun', students: 29, mentors: 3 },
  { month: 'Jul', students: 25, mentors: 2 },
  { month: 'Aug', students: 38, mentors: 5 },
  { month: 'Sep', students: 42, mentors: 8 },
  { month: 'Oct', students: 49, mentors: 9 },
  { month: 'Nov', students: 55, mentors: 11 },
  { month: 'Dec', students: 48, mentors: 8 },
];

const activityCompletionData = [
  { month: 'Jan', completed: 42, verified: 38 },
  { month: 'Feb', completed: 55, verified: 49 },
  { month: 'Mar', completed: 67, verified: 61 },
  { month: 'Apr', completed: 73, verified: 65 },
  { month: 'May', completed: 62, verified: 58 },
  { month: 'Jun', completed: 58, verified: 51 },
  { month: 'Jul', completed: 49, verified: 45 },
  { month: 'Aug', completed: 65, verified: 59 },
  { month: 'Sep', completed: 71, verified: 64 },
  { month: 'Oct', completed: 83, verified: 76 },
  { month: 'Nov', completed: 91, verified: 82 },
  { month: 'Dec', completed: 79, verified: 71 },
];

const userStatusData = [
  { name: 'Active', value: 320, color: '#4ade80' },
  { name: 'Pending', value: 45, color: '#facc15' },
  { name: 'Inactive', value: 75, color: '#94a3b8' },
];

const userRoleData = [
  { name: 'Students', value: 380, color: '#60a5fa' },
  { name: 'Mentors', value: 48, color: '#818cf8' },
  { name: 'Admins', value: 12, color: '#f43f5e' },
];

const activityTypeData = [
  { name: 'Project', value: 128, color: '#2dd4bf' },
  { name: 'Internship', value: 86, color: '#f97316' },
  { name: 'Course', value: 104, color: '#a78bfa' },
  { name: 'Certification', value: 92, color: '#ec4899' },
  { name: 'Hackathon', value: 45, color: '#facc15' },
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function AdminReportsPage() {
  const [timeRange, setTimeRange] = useState('year');
  const [loading, setLoading] = useState(false);

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  // Handle download
  const handleDownload = (reportType: string) => {
    alert(`Downloading ${reportType} report...`);
    // In a real app, this would generate and download a CSV/Excel file
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Reports & Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Comprehensive data analysis and statistics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <select
            className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <button
            className="flex items-center justify-center px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleRefresh()}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            className="flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
            onClick={() => handleDownload('combined')}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export All
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registrations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">User Registrations</h2>
            <button
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => handleDownload('registrations')}
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={userRegistrationData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" name="Students" fill="#60a5fa" />
                <Bar dataKey="mentors" name="Mentors" fill="#818cf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Completion */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Activity Completion</h2>
            <button
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => handleDownload('activities')}
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activityCompletionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" name="Completed" stroke="#4ade80" strokeWidth={2} />
                <Line type="monotone" dataKey="verified" name="Verified" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">User Status Distribution</h2>
            <button
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => handleDownload('user-status')}
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Role Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">User Role Distribution</h2>
            <button
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => handleDownload('user-roles')}
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Type Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Activity Type Distribution</h2>
            <button
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => handleDownload('activity-types')}
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activityTypeData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Activities">
                  {activityTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-lg font-medium mb-4">Custom Report Generation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Report Type</label>
            <select
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="user">User Report</option>
              <option value="activity">Activity Report</option>
              <option value="verification">Verification Report</option>
              <option value="performance">Performance Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time Period</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="Start Date"
              />
              <input
                type="date"
                className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="End Date"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Format</label>
            <div className="flex items-end gap-2 h-full">
              <select
                className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="excel">Excel (.xlsx)</option>
                <option value="csv">CSV File</option>
                <option value="pdf">PDF Document</option>
              </select>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                onClick={() => alert('Generating custom report...')}
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 