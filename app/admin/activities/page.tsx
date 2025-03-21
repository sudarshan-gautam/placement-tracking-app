'use client';

import { useState } from 'react';
import { User, Settings, Shield, Users, ClipboardCheck, Bell, BarChart2, Server, Plus, Search, Filter, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';

// Sample recent activities data (expanded with more entries)
const allActivities = [
  { id: 1, type: 'User', action: 'New user registered', details: 'Jane Smith (jane.smith@example.com)', time: '2 hours ago' },
  { id: 2, type: 'System', action: 'Backup completed', details: 'Daily backup successful', time: '4 hours ago' },
  { id: 3, type: 'Admin', action: 'Role updated', details: 'Mark Johnson - Changed from Student to Mentor', time: 'Yesterday' },
  { id: 4, type: 'System', action: 'Update deployed', details: 'Version 1.2.3 deployed successfully', time: '3 days ago' },
  { id: 5, type: 'Verification', action: 'Verification approved', details: 'First Aid Certificate - Jane Smith', time: '3 days ago' },
  { id: 6, type: 'User', action: 'Profile updated', details: 'John Doe updated contact information', time: '4 days ago' },
  { id: 7, type: 'Admin', action: 'Setting modified', details: 'Email notification settings updated', time: '5 days ago' },
  { id: 8, type: 'System', action: 'Error reported', details: 'Database connection error (resolved)', time: '1 week ago' },
  { id: 9, type: 'Verification', action: 'Verification rejected', details: 'Teaching Certificate - Alice Johnson', time: '1 week ago' },
  { id: 10, type: 'User', action: 'Password reset', details: 'Bob Wilson requested password reset', time: '1 week ago' },
  { id: 11, type: 'Admin', action: 'User deactivated', details: 'Carol Brown - Account deactivated', time: '2 weeks ago' },
  { id: 12, type: 'System', action: 'Maintenance completed', details: 'System maintenance and updates', time: '2 weeks ago' },
  { id: 13, type: 'Verification', action: 'New verification request', details: 'Teaching Degree - David Miller', time: '2 weeks ago' },
  { id: 14, type: 'User', action: 'New session created', details: 'Elementary Math - Eve Wilson', time: '3 weeks ago' },
  { id: 15, type: 'Admin', action: 'Template updated', details: 'Verification template modified', time: '3 weeks ago' },
];

export default function ActivitiesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const itemsPerPage = 10;

  // Filter activities based on search query and type
  const filteredActivities = allActivities.filter(activity => {
    const matchesSearch = 
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
      activity.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = 
      filterType === 'all' || 
      activity.type.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentActivities = filteredActivities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  // Handle page navigation
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle filter changes
  const handleFilterChange = (type: string) => {
    setFilterType(type);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Get active button style for the filter
  const getFilterButtonStyle = (type: string) => {
    return type === filterType 
      ? "px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md" 
      : "px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Activity Log</h1>
              <p className="text-gray-500">View and filter all system activities</p>
            </div>
            <Link href="/admin" className="flex items-center px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search activities..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500 mr-1" />
              <button className={getFilterButtonStyle('all')} onClick={() => handleFilterChange('all')}>All</button>
              <button className={getFilterButtonStyle('user')} onClick={() => handleFilterChange('user')}>User</button>
              <button className={getFilterButtonStyle('admin')} onClick={() => handleFilterChange('admin')}>Admin</button>
              <button className={getFilterButtonStyle('system')} onClick={() => handleFilterChange('system')}>System</button>
              <button className={getFilterButtonStyle('verification')} onClick={() => handleFilterChange('verification')}>Verification</button>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          {currentActivities.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-md hover:bg-gray-50 border-b border-gray-100 last:border-0">
                  <div className={`p-3 rounded-full 
                    ${activity.type === 'User' ? 'bg-blue-100 text-blue-600' : 
                      activity.type === 'System' ? 'bg-green-100 text-green-600' : 
                      activity.type === 'Admin' ? 'bg-purple-100 text-purple-600' :
                      'bg-amber-100 text-amber-600'}`}>
                    {activity.type === 'User' ? <User className="h-5 w-5" /> : 
                     activity.type === 'System' ? <Server className="h-5 w-5" /> : 
                     activity.type === 'Admin' ? <Shield className="h-5 w-5" /> :
                     <ClipboardCheck className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{activity.details}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {activity.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredActivities.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredActivities.length)} of {filteredActivities.length} results
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700">
                {currentPage} of {totalPages}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 